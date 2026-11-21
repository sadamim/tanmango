import { NextResponse } from "next/server";
import { loadSnap } from "@/lib/db";
import { deny, requireAdmin } from "@/lib/admin";
import { publicUser, statsByUser } from "@/lib/adminData";

export async function GET() {
  if (!(await requireAdmin())) return deny();
  const db = await loadSnap(["sales", "mangoes"], { sessions: true });
  const stats = statsByUser(db);
  const users = db.users.map((u) => publicUser(db, u, stats)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ users });
}
