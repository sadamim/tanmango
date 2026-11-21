import { NextResponse } from "next/server";
import { store } from "@/lib/db";

/** Click tracking for links in emails. Only links that were actually in the message can be followed (no open redirect). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = new URL(req.url).searchParams.get("u") || "";
  const m = await store.get("msgLog", id);
  if (!m || !Array.isArray(m.links) || !(m.links as string[]).includes(u) || !/^https?:\/\//.test(u)) return NextResponse.redirect(new URL("/", req.url));
  const patch: Record<string, string> = { clickedAt: String(m.clickedAt || new Date().toISOString()) };
  if (!m.openedAt) patch.openedAt = patch.clickedAt;
  await store.write([{ type: "update", coll: "msgLog", id, patch }]).catch(() => {});
  return NextResponse.redirect(u);
}
