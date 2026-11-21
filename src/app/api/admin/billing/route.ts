import { NextResponse } from "next/server";
import { loadSnap } from "@/lib/db";
import { deny, isAdminEmail, requireAdmin } from "@/lib/admin";
import { invoiceView, PLAN_PRICE, planOf, rowsOf } from "@/lib/adminData";
import { PLAN_ORDER } from "@/components/dash/nav";

/** Plan subscriptions & invoices across the platform. */
export async function GET() {
  if (!(await requireAdmin())) return deny();
  const db = await loadSnap(["invoices"]);
  const creators = db.users.filter((u) => !isAdminEmail(u.email));
  const invoices = rowsOf(db, "invoices").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 2000).map((i) => invoiceView(db, i));
  const plans = PLAN_ORDER.map((plan) => ({ plan, price: PLAN_PRICE[plan], count: creators.filter((u) => planOf(u) === plan).length }));
  return NextResponse.json({
    invoices,
    plans,
    mrr: plans.reduce((a, p) => a + p.price * p.count, 0),
    invoiced: invoices.filter((i) => i.status.startsWith("Paid")).reduce((a, i) => a + i.amount, 0),
    freedom: creators.filter((u) => u.whiteLabel).length,
  });
}
