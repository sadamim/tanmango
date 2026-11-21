import { NextResponse } from "next/server";
import { id as newId, now, store } from "@/lib/db";
import { deny, requireAdmin } from "@/lib/admin";

/** Delete an announcement and pull it out of every creator's notification list. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return deny();
  const { id } = await params;
  const a = await store.get("announcements", id);
  if (!a) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  const notes = await store.find("notifications", [["announcementId", id]]);
  await store.write([
    ...notes.map((n) => ({ type: "delete" as const, coll: "notifications", id: n.id })),
    { type: "delete", coll: "announcements", id },
    { type: "set", coll: "audit", id: newId(), data: { userId: admin.id, createdAt: now(), admin: admin.email, action: "announcement.delete", target: String(a.title), detail: "retracted from all notification lists" } },
  ]);
  return NextResponse.json({ ok: true });
}
