import "server-only";
import type { Reader } from "./store";
import { rateFor } from "./plans";
import type { User } from "./db";

/** Hours before a sale's earnings can be withdrawn (payment-gateway settlement). */
export const settlementHours = () => {
  const n = Number(process.env.SETTLEMENT_HOURS);
  return Number.isFinite(n) && process.env.SETTLEMENT_HOURS !== undefined && process.env.SETTLEMENT_HOURS !== "" ? n : 72;
};

/** Server-side source of truth for what a creator can withdraw (same maths as the dashboard). */
export async function balanceOf(r: Reader, user: Pick<User, "id" | "plan">) {
  const [sales, wds] = await Promise.all([r.find("sales", [["userId", user.id]]), r.find("withdrawals", [["userId", user.id]])]);
  const rate = rateFor(user);
  const cutoff = Date.now() - settlementHours() * 3600e3;
  let earned = 0;
  let settled = 0;
  for (const s of sales) {
    if (s.status !== "Success") continue;
    const net = Number(s.amount || 0) * (1 - rate);
    earned += net;
    if (new Date(String(s.createdAt)).getTime() <= cutoff) settled += net;
  }
  const withdrawn = wds.filter((w) => w.status !== "Rejected").reduce((a, w) => a + Number(w.amount || 0), 0);
  return { earned, settled, withdrawn, total: earned - withdrawn, withdrawable: Math.max(0, Math.floor((settled - withdrawn) * 100) / 100) };
}
