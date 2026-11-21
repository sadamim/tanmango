import { NextResponse } from "next/server";
import { id as newId, now, store } from "@/lib/db";
import { appUrl, getGrowth } from "@/lib/growth/core";

/** Tracked link: counts the click, then sends the visitor on with `?src=<code>` so the lead's source is saved. */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [l] = await store.find("trackedLinks", [["code", code.slice(0, 40)]], { limit: 1 });
  if (!l) return NextResponse.redirect(new URL("/", req.url));
  const g = await getGrowth(String(l.userId));
  const slug = g?.slug || "";
  const dest: Record<string, string> = { quiz: `/q/${slug}`, masterclass: `/m/${slug}`, call: `/call/${slug}`, bio: `/l/${slug}` };
  const target = String(l.target || "quiz");
  const base = appUrl();
  let url: URL;
  try {
    url = target === "custom" ? new URL(String(l.url || "/"), base) : new URL(dest[target] || "/", base);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (!/^https?:$/.test(url.protocol)) return NextResponse.redirect(new URL("/", req.url));
  if (url.origin === new URL(base).origin) url.searchParams.set("src", code);
  await store.tx(async (t) => {
    const cur = await t.get("trackedLinks", l.id);
    if (cur) t.update("trackedLinks", l.id, { clicks: Number(cur.clicks || 0) + 1 });
    t.set("linkClicks", newId(), { userId: l.userId, createdAt: now(), linkId: l.id, platform: l.platform, campaign: l.campaign });
  }).catch(() => {});
  return NextResponse.redirect(url);
}
