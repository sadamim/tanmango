import { NextResponse } from "next/server";
import { id, now, store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";

/** Record a page view on a public creator page (feeds Analytics → Checkout Page / Page Views). */
export async function POST(req: Request) {
  if (await rateLimited("view", 120)) return NextResponse.json({ ok: false }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const kind = ["checkout", "page", "store", "site"].includes(body.kind) ? (body.kind as string) : null;
  if (!kind || typeof body.ref !== "string" || body.ref.length > 100) return NextResponse.json({ ok: false }, { status: 400 });
  const coll = kind === "checkout" ? "mangoes" : kind === "page" ? "pages" : kind === "site" ? "sites" : null;
  let owner: string | undefined;
  let target: Record<string, unknown> | null = null;
  if (coll) {
    target = await store.get(coll, body.ref);
    if (!target && coll !== "mangoes") [target = null] = await store.find(coll, [["slug", body.ref]], { limit: 1 });
    owner = target ? String(target.userId) : undefined;
  } else owner = (await store.get("users", body.ref))?.id;
  if (!owner) return NextResponse.json({ ok: true });
  await store.write([{ type: "set", coll: "views", id: id(), data: { userId: owner, createdAt: now(), kind, ref: target?.id || body.ref, mango: kind === "checkout" ? target?.title : target?.mango } }]);
  return NextResponse.json({ ok: true });
}
