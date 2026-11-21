import { NextResponse } from "next/server";
import { loadSnap } from "@/lib/db";
import { deny, requireAdmin } from "@/lib/admin";
import { orderView, rowsOf } from "@/lib/adminData";

/** Every order on the platform, newest first (capped at 5,000). */
export async function GET() {
  if (!(await requireAdmin())) return deny();
  const db = await loadSnap(["sales"]);
  const sales = rowsOf(db, "sales").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5000);
  const orders = sales.map((s) => orderView(db, s));
  const seen = new Map<string, string>();
  for (const o of orders) seen.set(o.creatorId, o.creator);
  return NextResponse.json({ orders, creators: [...seen].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)) });
}
