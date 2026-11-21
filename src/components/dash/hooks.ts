"use client";
import { useCollection, useMe, type Row } from "@/lib/client";
import { COMMISSION } from "./nav";

export function useMangoTitles() {
  const m = useCollection("mangoes");
  return m.rows.map((r) => String(r.title));
}

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  mango: string;
  cycle: string;
  lastTx: string;
  expires: string | null;
  status: "Active" | "Expired" | "Revoked";
  source: "purchase" | "manual";
  rowId?: string;
};

/** Customers = one entry per buyer per mango (from orders + manually added customers), with revoke state. */
export function useCustomers() {
  const sales = useCollection("sales");
  const manual = useCollection("customers");
  const map = new Map<string, Customer>();
  const ok = sales.rows.filter((s) => s.status === "Success").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const s of ok) {
    const key = `${s.email}|${s.mango}`;
    map.set(key, {
      id: key,
      name: String(s.customer),
      email: String(s.email),
      phone: String(s.phone || ""),
      mango: String(s.mango),
      cycle: String(s.cycle || "One-time"),
      lastTx: s.createdAt,
      expires: (s.expires as string) || null,
      status: s.expires && new Date(String(s.expires)).getTime() < Date.now() ? "Expired" : "Active",
      source: "purchase",
    });
  }
  for (const m of manual.rows) {
    const key = `${m.email}|${m.mango}`;
    if (m.revoked) {
      const c = map.get(key);
      if (c) c.status = "Revoked";
      else map.set(key, { id: key, name: String(m.name), email: String(m.email), phone: String(m.phone || ""), mango: String(m.mango), cycle: "Manual", lastTx: m.createdAt, expires: null, status: "Revoked", source: "manual", rowId: m.id });
      if (map.get(key)) map.get(key)!.rowId = m.id;
      continue;
    }
    if (!map.has(key)) map.set(key, { id: key, name: String(m.name), email: String(m.email), phone: String(m.phone || ""), mango: String(m.mango), cycle: "Manual", lastTx: m.createdAt, expires: (m.expires as string) || null, status: "Active", source: "manual", rowId: m.id });
  }
  return { list: [...map.values()].sort((a, b) => b.lastTx.localeCompare(a.lastTx)), loading: sales.loading || manual.loading, sales, manual };
}

/** Money: earnings after the plan's commission, withdrawable after 72h, minus withdrawals. */
export function useMoney() {
  const { me } = useMe();
  const sales = useCollection("sales");
  const withdrawals = useCollection("withdrawals");
  const rate = COMMISSION[me.plan] ?? 0.1;
  const ok = sales.rows.filter((s) => s.status === "Success");
  const net = (s: Row) => Number(s.amount || 0) * (1 - rate);
  const earned = ok.reduce((a, s) => a + net(s), 0);
  const settled = ok.filter((s) => Date.now() - new Date(s.createdAt).getTime() > 72 * 3600e3).reduce((a, s) => a + net(s), 0);
  const withdrawn = withdrawals.rows.filter((w) => w.status !== "Rejected").reduce((a, w) => a + Number(w.amount || 0), 0);
  return { rate, sales, withdrawals, ok, net, earned, total: earned - withdrawn, withdrawable: Math.max(0, settled - withdrawn), withdrawn };
}

export const lastNDays = (n: number) => {
  const to = new Date();
  const from = new Date(Date.now() - (n - 1) * 864e5);
  const f = (d: Date) => d.toISOString().slice(0, 10);
  return [f(from), f(to)] as const;
};

export const inRange = (iso: string, from: string, to: string) => {
  const d = iso.slice(0, 10);
  return (!from || d >= from) && (!to || d <= to);
};
