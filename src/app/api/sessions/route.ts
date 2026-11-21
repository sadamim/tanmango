import { NextResponse } from "next/server";
import { store, sha, type Session } from "@/lib/db";
import { currentToken, currentUser, publicSessionId } from "@/lib/auth";

/** List the signed-in creator's login sessions (Manage Login Sessions page). */
export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const token = await currentToken();
  const mine = (await store.find("sessions", [["userId", me.id]])) as unknown as Session[];
  const sessions = mine
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((s) => ({ id: publicSessionId(s.id), userAgent: s.userAgent || "Unknown device", ip: s.ip || "-", createdAt: s.createdAt, current: token ? s.id === sha(token) : false }));
  return NextResponse.json({ sessions });
}

/** Log out one session (?id=) or every other session (?others=1). */
export async function DELETE(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const token = await currentToken();
  const cur = token ? sha(token) : "";
  const url = new URL(req.url);
  const target = url.searchParams.get("id");
  const others = url.searchParams.get("others") === "1";
  const mine = await store.find("sessions", [["userId", me.id]]);
  const doomed = mine.filter((s) => s.id !== cur && (others || (target && publicSessionId(s.id) === target)));
  await store.write(doomed.map((s) => ({ type: "delete" as const, coll: "sessions", id: s.id })));
  return NextResponse.json({ ok: true, removed: doomed.length });
}
