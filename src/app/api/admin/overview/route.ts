import { NextResponse } from "next/server";
import { loadSnap, type Row } from "@/lib/db";
import { deny, isAdminEmail, requireAdmin } from "@/lib/admin";
import { DAY, planOf, rowsOf, statsByUser } from "@/lib/adminData";
import type { AOverview } from "@/lib/adminTypes";
import { PLAN_ORDER } from "@/components/dash/nav";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export async function GET() {
  if (!(await requireAdmin())) return deny();
  const db = await loadSnap(["sales", "withdrawals", "reports", "invoices", "mangoes"]);
  const asc = <T extends { createdAt: string }>(a: T, b: T) => a.createdAt.localeCompare(b.createdAt);
  db.users.sort(asc);
  for (const k of ["withdrawals", "reports"]) db.rows[k].sort(asc);
  const stats = statsByUser(db);
  const creators = db.users.filter((u) => !isAdminEmail(u.email));
  const byId = new Map(db.users.map((u) => [u.id, u]));
  const now = Date.now();
  const since30 = now - 30 * DAY;

  const ok = rowsOf(db, "sales").filter((s) => s.status === "Success");
  const ok30 = ok.filter((s) => new Date(s.createdAt).getTime() >= since30);
  const amt = (s: Row) => Number(s.amount || 0);

  const labels = Array.from({ length: 30 }, (_, i) => new Date(now - (29 - i) * DAY).toISOString().slice(0, 10));
  const idx = new Map(labels.map((l, i) => [l, i]));
  const gmv = labels.map(() => 0);
  const orders = labels.map(() => 0);
  const signups = labels.map(() => 0);
  for (const s of ok30) {
    const i = idx.get(s.createdAt.slice(0, 10));
    if (i !== undefined) {
      gmv[i] += amt(s);
      orders[i]++;
    }
  }
  for (const u of creators) {
    const i = idx.get(u.createdAt.slice(0, 10));
    if (i !== undefined) signups[i]++;
  }

  const withdrawals = rowsOf(db, "withdrawals");
  const pendingW = withdrawals.filter((w) => (w.status || "Processing") === "Processing");
  const openReports = rowsOf(db, "reports").filter((r) => !r.resolved);

  const activity: AOverview["activity"] = [
    ...creators.slice(-10).map((u) => ({ type: "signup" as const, at: u.createdAt, text: `${u.name} joined on the ${planOf(u)} plan` })),
    ...[...ok].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10).map((s) => ({ type: "order" as const, at: s.createdAt, text: `${s.customer} bought “${s.mango}” from ${byId.get(s.userId)?.name || "a creator"} · ₹${amt(s).toLocaleString("en-IN")}` })),
    ...withdrawals.slice(-10).map((w) => ({ type: "withdrawal" as const, at: w.createdAt, text: `${byId.get(w.userId)?.name || "A creator"} requested a withdrawal of ₹${amt(w).toLocaleString("en-IN")}` })),
    ...openReports.slice(-10).map((r) => ({ type: "report" as const, at: r.createdAt, text: `New ${String(r.kind)} report from ${String(r.reporter)}` })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 12);

  const out: AOverview = {
    creators: {
      total: creators.length,
      new30: creators.filter((u) => new Date(u.createdAt).getTime() >= since30).length,
      active: creators.filter((u) => (stats.get(u.id)?.orders || 0) > 0).length,
      suspended: creators.filter((u) => u.suspended).length,
      kycDone: creators.filter((u) => u.kycDone).length,
    },
    money: {
      gmvAll: sum(ok.map(amt)),
      gmv30: sum(ok30.map(amt)),
      orders30: ok30.length,
      refunds30: rowsOf(db, "sales").filter((s) => s.status === "Refunded" && new Date(s.createdAt).getTime() >= since30).length,
      commission: sum([...stats.values()].map((s) => s.commission)),
      subscriptions: sum(rowsOf(db, "invoices").filter((i) => String(i.status).startsWith("Paid")).map(amt)),
    },
    pending: {
      withdrawals: pendingW.length,
      withdrawalAmount: sum(pendingW.map(amt)),
      reports: openReports.length,
      paidOut: sum(withdrawals.filter((w) => w.status === "Paid").map(amt)),
    },
    series: { labels, gmv, orders, signups },
    plans: PLAN_ORDER.map((plan) => ({ plan, count: creators.filter((u) => planOf(u) === plan).length })),
    top: creators
      .map((u) => ({ id: u.id, name: u.name, email: u.email, plan: planOf(u), gmv: stats.get(u.id)?.gmv || 0, orders: stats.get(u.id)?.orders || 0 }))
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, 5),
    activity,
  };
  return NextResponse.json(out);
}
