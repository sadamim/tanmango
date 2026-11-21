import { NextResponse } from "next/server";
import { loadSnap } from "@/lib/db";
import { deny, requireAdmin } from "@/lib/admin";
import { rowsOf } from "@/lib/adminData";
import type { AReport } from "@/lib/adminTypes";

/** Content reports from every creator's community. */
export async function GET() {
  if (!(await requireAdmin())) return deny();
  const db = await loadSnap(["reports"]);
  const reports: AReport[] = rowsOf(db, "reports")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      kind: String(r.kind || "post"),
      creatorId: r.userId,
      creator: db.users.find((u) => u.id === r.userId)?.name || "(deleted)",
      reporter: String(r.reporter || ""),
      author: String(r.author || ""),
      content: String(r.content || ""),
      resolved: r.resolved ? String(r.resolved) : undefined,
    }));
  return NextResponse.json({ reports });
}
