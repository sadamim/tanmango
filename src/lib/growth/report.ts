import "server-only";
import { store } from "../db";
import { alertCoach, appUrl, getGrowth } from "./core";
import { computeFunnel, type ClickRow, type Lead } from "./model";

/** Monday 00:00 IST of the week containing `d`, as YYYY-MM-DD. */
export function weekStart(d = new Date()) {
  const ist = new Date(d.getTime() + 5.5 * 3600e3);
  const dow = (ist.getUTCDay() + 6) % 7; // Monday = 0
  ist.setUTCDate(ist.getUTCDate() - dow);
  return ist.toISOString().slice(0, 10);
}
const toIso = (ymd: string, plusDays = 0) => new Date(new Date(`${ymd}T00:00:00+05:30`).getTime() + plusDays * 864e5).toISOString();

export const MONETISATION = {
  YouTube: [{ key: "followers", label: "Subscribers", target: 1000 }, { key: "watchTime", label: "Watch hours (12 months)", target: 4000 }],
  Instagram: [{ key: "followers", label: "Followers", target: 10000 }],
} as const;

/** Weekly report data: social numbers per platform plus the funnel for the same 7 days. */
export async function buildReport(userId: string, week: string) {
  const from = toIso(week);
  const to = toIso(week, 7);
  const [leads, clicks, social] = await Promise.all([store.find("crm", [["userId", userId]]), store.find("linkClicks", [["userId", userId]]), store.find("socialStats", [["userId", userId]])]);
  const funnel = computeFunnel(leads as unknown as Lead[], clicks as unknown as ClickRow[], from, to);
  const platforms = [...new Set(social.map((s) => String(s.platform)))];
  const rows = platforms.map((p) => {
    const list = social.filter((s) => s.platform === p).sort((a, b) => String(b.weekStart).localeCompare(String(a.weekStart)));
    return { platform: p, this: list.find((s) => s.weekStart === week) || null, latest: list[0] || null, previous: list.find((s) => String(s.weekStart) < week) || null };
  });
  const testimonials = (await store.find("testimonials", [["userId", userId]])).filter((t) => String(t.createdAt) >= from && String(t.createdAt) < to).length;
  return { week, from, to, funnel, social: rows, testimonials };
}

export async function reportEmailText(userId: string, week: string) {
  const r = await buildReport(userId, week);
  const lines = [`Weekly report, week of ${week}`, "", "FUNNEL"];
  for (const s of r.funnel.steps) lines.push(`${s.label}: ${s.entered} in, ${s.left} moved on (${s.dropPct}% dropped) — ${s.extra.map((e) => `${e.label} ${e.value}`).join(", ")}`);
  lines.push(`Testimonials collected: ${r.testimonials}`, "", "SOCIAL");
  for (const p of r.social) {
    const t = p.this as Record<string, unknown> | null;
    lines.push(t ? `${p.platform}: followers ${t.followers ?? "—"}, reach ${t.reach ?? "—"}, saves ${t.saves ?? "—"}, shares ${t.shares ?? "—"}, watch time ${t.watchTime ?? "—"}, DMs ${t.dms ?? "—"}, leads ${t.leads ?? "—"}` : `${p.platform}: no numbers entered this week`);
  }
  lines.push("", `Full report: ${appUrl()}/web/dashboard/growth-report`);
  return lines.join("\n");
}

/** Called by the scheduler: on Monday (IST) email each coach last week's report, once. */
export async function runWeeklyReports() {
  const nowIst = new Date(Date.now() + 5.5 * 3600e3);
  if (nowIst.getUTCDay() !== 1) return 0;
  const thisWeek = weekStart();
  const last = weekStart(new Date(Date.now() - 7 * 864e5));
  let n = 0;
  for (const g of await store.find("growth")) {
    if (g.lastReportWeek === thisWeek) continue;
    await store.write([{ type: "update", coll: "growth", id: g.id, patch: { lastReportWeek: thisWeek } }]);
    const text = await reportEmailText(String(g.userId), last);
    await alertCoach(String(g.userId), `Weekly report ready\n\n${text}`);
    n++;
  }
  void getGrowth;
  return n;
}
