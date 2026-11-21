import { NextResponse } from "next/server";
import { loadSnap } from "@/lib/db";
import { deny, requireAdmin } from "@/lib/admin";
import { rowsOf, withdrawalView } from "@/lib/adminData";

export async function GET() {
  if (!(await requireAdmin())) return deny();
  const db = await loadSnap(["withdrawals"]);
  const withdrawals = rowsOf(db, "withdrawals").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((w) => withdrawalView(db, w));
  return NextResponse.json({ withdrawals });
}
