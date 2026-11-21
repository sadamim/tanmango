import { NextResponse } from "next/server";
import { loadSnap } from "@/lib/db";
import { deny, requireAdmin } from "@/lib/admin";
import { rowsOf } from "@/lib/adminData";

/** Small badge counts for the admin sidebar. */
export async function GET() {
  if (!(await requireAdmin())) return deny();
  const db = await loadSnap(["withdrawals", "reports"]);
  return NextResponse.json({
    withdrawals: rowsOf(db, "withdrawals").filter((w) => (w.status || "Processing") === "Processing").length,
    reports: rowsOf(db, "reports").filter((r) => !r.resolved).length,
  });
}
