import { NextResponse } from "next/server";
import { asRows, asUser, id as newId, now, PLANS, store } from "@/lib/db";
import { deny, isAdminEmail, requireAdmin } from "@/lib/admin";
import { planOf } from "@/lib/adminData";
import type { AAnnouncement } from "@/lib/adminTypes";

export async function GET() {
  if (!(await requireAdmin())) return deny();
  const announcements: AAnnouncement[] = asRows(await store.find("announcements"))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((a) => ({ id: a.id, createdAt: a.createdAt, title: String(a.title), body: String(a.body), audience: String(a.audience), recipients: Number(a.recipients || 0), admin: String(a.admin || "") }));
  return NextResponse.json({ announcements });
}

/** Send an announcement to every creator (or one plan). It lands in their notification bell. */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return deny();
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const text = String(body.body || "").trim();
  const audience = String(body.audience || "all");
  if (title.length < 3 || title.length > 80) return NextResponse.json({ error: "Title must be 3–80 characters" }, { status: 400 });
  if (text.length < 5 || text.length > 500) return NextResponse.json({ error: "Message must be 5–500 characters" }, { status: 400 });
  if (audience !== "all" && !(PLANS as readonly string[]).includes(audience)) return NextResponse.json({ error: "Unknown audience" }, { status: 400 });
  try {
    const targets = (await store.find("users")).map(asUser).filter((u) => !isAdminEmail(u.email) && !u.suspended && (audience === "all" || planOf(u) === audience));
    if (!targets.length) throw new Error("No creators match that audience");
    const aid = newId();
    const at = now();
    const ops = [
      { type: "set" as const, coll: "announcements", id: aid, data: { userId: admin.id, createdAt: at, title, body: text, audience, recipients: targets.length, admin: admin.email } },
      ...targets.map((u) => ({ type: "set" as const, coll: "notifications", id: newId(), data: { userId: u.id, createdAt: at, read: false, text: `📢 ${title} — ${text}`, announcementId: aid } })),
      { type: "set" as const, coll: "audit", id: newId(), data: { userId: admin.id, createdAt: at, admin: admin.email, action: "announcement.send", target: title, detail: `to ${audience === "all" ? "all creators" : `${audience} plan`} (${targets.length})` } },
    ];
    await store.write(ops);
    return NextResponse.json({ ok: true, recipients: targets.length }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
