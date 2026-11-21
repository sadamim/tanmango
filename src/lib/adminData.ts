import "server-only";
import { COMMISSION, type Plan } from "@/components/dash/nav";
import { isAdminEmail } from "./admin";
import type { Row, Snap, User } from "./db";
import type { AStats, AUser } from "./adminTypes";

export type Db = Snap;

export const DAY = 864e5;
export const PLAN_PRICE: Record<Plan, number> = { basic: 0, pro: 5000, advanced: 15000, ultimate: 35000 };
export const rowsOf = (db: Db, k: string): Row[] => db.rows[k] || [];
export const planOf = (u: User): Plan => u.plan || "basic";
export const rateOf = (u: User | undefined) => (u ? COMMISSION[planOf(u)] ?? 0.1 : 0.1);

export const emptyStats = (): AStats => ({ orders: 0, gmv: 0, refunded: 0, commission: 0, mangoes: 0, lastOrder: null });

/** Per-creator order totals. Commission is an estimate using the creator's current plan rate. */
export function statsByUser(db: Db) {
  const users = new Map(db.users.map((u) => [u.id, u]));
  const m = new Map<string, AStats>();
  const get = (id: string) => {
    let e = m.get(id);
    if (!e) m.set(id, (e = emptyStats()));
    return e;
  };
  for (const s of rowsOf(db, "sales")) {
    const e = get(s.userId);
    const amt = Number(s.amount || 0);
    if (s.status === "Success") {
      e.orders++;
      e.gmv += amt;
      e.commission += amt * rateOf(users.get(s.userId));
      if (!e.lastOrder || s.createdAt > e.lastOrder) e.lastOrder = s.createdAt;
    } else if (s.status === "Refunded") e.refunded++;
  }
  for (const mg of rowsOf(db, "mangoes")) get(mg.userId).mangoes++;
  return m;
}

export function publicUser(db: Db, u: User, stats: Map<string, AStats>): AUser {
  const lastLogin = db.sessions.filter((s) => s.userId === u.id).map((s) => s.createdAt).sort().pop() || null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    plan: planOf(u),
    kycDone: Boolean(u.kycDone),
    kycStatus: u.kyc?.status,
    hasBank: Boolean(u.bank),
    bankLast4: u.bank?.account.slice(-4),
    whiteLabel: Boolean(u.whiteLabel),
    suspended: Boolean(u.suspended),
    suspendReason: u.suspendReason || "",
    adminNote: u.adminNote || "",
    category: u.about?.category || "",
    createdAt: u.createdAt,
    lastLogin,
    isAdmin: isAdminEmail(u.email),
    stats: stats.get(u.id) || emptyStats(),
  };
}

export function orderView(db: Db, s: Row) {
  const u = db.users.find((x) => x.id === s.userId);
  return {
    id: s.id,
    createdAt: s.createdAt,
    creatorId: s.userId,
    creator: u?.name || "(deleted)",
    creatorEmail: u?.email || "",
    customer: String(s.customer || ""),
    email: String(s.email || ""),
    mango: String(s.mango || ""),
    amount: Number(s.amount || 0),
    fee: Number(s.amount || 0) * rateOf(u),
    status: String(s.status || ""),
    coupon: s.coupon ? String(s.coupon) : undefined,
    cycle: s.cycle ? String(s.cycle) : undefined,
    method: s.method ? String(s.method) : undefined,
  };
}

export function withdrawalView(db: Db, w: Row) {
  const u = db.users.find((x) => x.id === w.userId);
  return {
    id: w.id,
    createdAt: w.createdAt,
    creatorId: w.userId,
    creator: u?.name || "(deleted)",
    creatorEmail: u?.email || "",
    kycDone: Boolean(u?.kycDone),
    amount: Number(w.amount || 0),
    account: String(w.account || u?.bank?.account || ""),
    holder: u?.bank?.holder || "",
    ifsc: u?.bank?.ifsc || "",
    status: String(w.status || "Processing"),
    adminNote: w.adminNote ? String(w.adminNote) : undefined,
    processedAt: w.processedAt ? String(w.processedAt) : undefined,
  };
}

export function invoiceView(db: Db, i: Row) {
  const u = db.users.find((x) => x.id === i.userId);
  return { id: i.id, createdAt: i.createdAt, creatorId: i.userId, creator: u?.name || "(deleted)", creatorEmail: u?.email || "", number: String(i.number || ""), product: String(i.product || ""), amount: Number(i.amount || 0), status: String(i.status || "") };
}
