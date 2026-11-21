import { NextResponse } from "next/server";
import { id as newId, now, store } from "@/lib/db";
import { growthBySlug } from "@/lib/growth/core";

/** Link-in-bio button click: counted per button, then redirected. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; bid: string }> }) {
  const { slug, bid } = await params;
  const g = await growthBySlug(slug);
  const b = g?.bio?.buttons?.find((x) => x.id === bid);
  if (!g || !b) return NextResponse.redirect(new URL("/", req.url));
  let url: URL;
  try {
    url = new URL(b.url, req.url);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (!/^https?:$/.test(url.protocol)) return NextResponse.redirect(new URL("/", req.url));
  if (url.origin === new URL(req.url).origin) url.searchParams.set("src", "bio");
  await store.write([{ type: "set", coll: "linkClicks", id: newId(), data: { userId: g.userId, createdAt: now(), linkId: `bio:${bid}`, platform: "Link-in-bio", campaign: b.label } }]).catch(() => {});
  return NextResponse.redirect(url);
}
