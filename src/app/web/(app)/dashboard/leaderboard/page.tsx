"use client";
import { useMemo, useState } from "react";
import { useCollection, useMe } from "@/lib/client";
import { DataTable, EmptySearch, Gate, Panel, Segmented, Title, type Col } from "@/components/dash/kit";
import { useCustomers } from "@/components/dash/hooks";

type Entry = { id: string; name: string; email: string; points: number; badge?: string };

/** Points are computed from real activity in this clone: purchases, workshop bookings and course access. */
function Board() {
  const { me } = useMe();
  const { list, sales } = useCustomers();
  const bookings = useCollection("bookings");
  const badges = useCollection("badges");
  const [period, setPeriod] = useState<"All Time" | "Month" | "Week">("All Time");
  const rules = (me.settings?.points || {}) as Record<string, { pts: number; on: boolean }>;
  const pts = (k: string, d: number) => (rules[k]?.on === false ? 0 : rules[k]?.pts ?? d);

  const rows = useMemo(() => {
    const since = period === "Week" ? Date.now() - 7 * 864e5 : period === "Month" ? Date.now() - 30 * 864e5 : 0;
    const map = new Map<string, Entry>();
    const add = (email: string, name: string, p: number) => {
      const e = map.get(email) || { id: email, name, email, points: 0 };
      e.points += p;
      map.set(email, e);
    };
    for (const s of sales.rows) if (s.status === "Success" && new Date(s.createdAt).getTime() >= since) add(String(s.email), String(s.customer), pts("Purchase a mango", 20));
    for (const b of bookings.rows) if (b.status !== "Cancelled" && new Date(b.createdAt).getTime() >= since) add(String(b.email), String(b.name), pts("Attend a workshop", 25));
    for (const c of list) if (!map.has(c.email) && since === 0) add(c.email, c.name, 0);
    const sortedBadges = [...badges.rows].sort((a, b) => Number(b.threshold) - Number(a.threshold));
    return [...map.values()].map((e): Entry => ({ ...e, badge: sortedBadges.find((b) => e.points >= Number(b.threshold)) ? `${sortedBadges.find((b) => e.points >= Number(b.threshold))!.icon} ${sortedBadges.find((b) => e.points >= Number(b.threshold))!.name}` : undefined })).sort((a, b) => b.points - a.points);
  }, [sales.rows, bookings.rows, list, badges.rows, period, rules]); // eslint-disable-line react-hooks/exhaustive-deps

  const cols: Col<Entry>[] = [
    { key: "rank", label: "Rank", render: (r) => { const i = rows.indexOf(r); return <span className={`grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold ${i === 0 ? "bg-[#ffd666]" : i === 1 ? "bg-[#d9d9d9]" : i === 2 ? "bg-[#ffbb96]" : "bg-[#f2f2f2]"}`}>{i + 1}</span>; } },
    { key: "name", label: "Member", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-[12px] text-[#6b6b7b]">{r.email}</p></div> },
    { key: "badge", label: "Badge", render: (r) => r.badge || "-" },
    { key: "points", label: "Points", render: (r) => <b className="text-[#f2962c]">{r.points}</b> },
  ];

  return (
    <Panel className="p-5">
      <Title sub="Points from purchases and workshop bookings, using your Points settings." right={<Segmented options={["All Time", "Month", "Week"]} value={period} onChange={setPeriod} />}>Leaderboard</Title>
      <div className="mt-3"><DataTable cols={cols} rows={rows} loading={sales.loading} empty={<EmptySearch title="No members on the leaderboard yet" />} /></div>
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="leaderboard" title="Leaderboard"><Board /></Gate>;
}
