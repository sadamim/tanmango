import "server-only";
import { store } from "./db";

export type ActiveCustomer = { name: string; email: string; mango: string };

/** Active customers of a creator: successful, unexpired purchases plus manually added customers, minus revoked/blocked/unsubscribed. */
export async function activeCustomers(userId: string, mangoes: string[] = []): Promise<ActiveCustomer[]> {
  const [sales, manual, unsub, blocked] = await Promise.all([
    store.find("sales", [["userId", userId]]),
    store.find("customers", [["userId", userId]]),
    store.find("unsubscribed", [["userId", userId]]),
    store.find("blocked", [["userId", userId]]),
  ]);
  const skip = new Set([...unsub, ...blocked].map((r) => String(r.email).toLowerCase()));
  const revoked = new Set(manual.filter((m) => m.revoked).map((m) => `${String(m.email).toLowerCase()}|${m.mango}`));
  const map = new Map<string, ActiveCustomer>();
  const t = Date.now();
  for (const s of sales) {
    if (s.status !== "Success" || (s.expires && new Date(String(s.expires)).getTime() < t)) continue;
    map.set(`${String(s.email).toLowerCase()}|${s.mango}`, { name: String(s.customer || ""), email: String(s.email).toLowerCase(), mango: String(s.mango) });
  }
  for (const m of manual) {
    if (m.revoked || (m.expires && new Date(String(m.expires)).getTime() < t)) continue;
    map.set(`${String(m.email).toLowerCase()}|${m.mango}`, { name: String(m.name || ""), email: String(m.email).toLowerCase(), mango: String(m.mango) });
  }
  const seen = new Set<string>();
  const out: ActiveCustomer[] = [];
  for (const [k, c] of map) {
    if (revoked.has(k) || skip.has(c.email) || seen.has(c.email)) continue;
    if (mangoes.length && !mangoes.includes(c.mango)) continue;
    seen.add(c.email);
    out.push(c);
  }
  return out;
}
