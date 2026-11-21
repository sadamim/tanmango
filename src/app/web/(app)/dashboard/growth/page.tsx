"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { DateRange, Note, Panel, StatCard, Title } from "@/components/dash/kit";
import { Bar, Section } from "@/components/growth/shared";
import { dash } from "@/components/dash/nav";
import type { Funnel } from "@/lib/growth/model";

type Overview = { funnel: Funnel; clicksByPlatform: Record<string, number>; groups: { key: string; label: string }[] };

export default function GrowthFunnel() {
  const [data, setData] = useState<Overview | null>(null);
  const [range, setRange] = useState<[string, string]>(["", ""]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const q = new URLSearchParams({ q: "overview" });
    if (range[0]) q.set("from", range[0]);
    if (range[1]) q.set("to", range[1]);
    api<Overview>(`/api/growth?${q}`).then(setData).catch((e) => setErr(e.message));
  }, [range]);

  if (err) return <Note tone="yellow">{err}</Note>;
  if (!data) return <div className="h-40 animate-pulse rounded-lg bg-white" />;
  const { funnel } = data;
  const top = Math.max(1, ...funnel.steps.map((s) => s.entered));

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <Title sub="Every person is tracked through all 5 steps on one lead record." right={<DateRange from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />}>Customer funnel</Title>
        <div className="mt-5 space-y-4">
          {funnel.steps.map((s, i) => (
            <div key={s.key} className="rounded-lg border border-[#ededed] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold">{s.label}</p>
                  <p className="text-[12px] text-[#6b6b7b]">{s.sub}</p>
                </div>
                <p className="text-[13px] text-[#4a4a59]">
                  <b className="text-[20px] text-[#0f0f0f]">{s.entered}</b> in · <b>{s.left}</b> moved on
                  {i < funnel.steps.length - 1 && <span className="ml-2 rounded-full bg-[#fff1f0] px-2 py-0.5 text-[12px] font-medium text-[#cf1322]">{s.dropPct}% dropped</span>}
                </p>
              </div>
              <div className="mt-2"><Bar pct={(s.entered / top) * 100} /></div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-[#4a4a59]">
                {s.extra.map((e) => <span key={e.label}>{e.label}: <b className="text-[#0f0f0f]">{e.value}</b></span>)}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-[#6b6b7b]">Step 1 counts clicks on tracked links and your link-in-bio. Reach and watch time come from the weekly numbers you enter in the report.</p>
      </Panel>

      <Section title="Groups you can list at any time" sub="Click a group to open those people in Leads & CRM.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.groups.map((g) => (
            <Link key={g.key} href={`${dash("growth-leads")}?group=${g.key}`} className="block">
              <StatCard label={g.label} value={funnel.groups[g.key] ?? 0} />
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Lead sources" sub="Where leads came from, and how many paid.">
          {funnel.bySource.length ? (
            <table className="w-full text-[14px]">
              <thead><tr className="text-left text-[12px] text-[#6b6b7b]"><th className="pb-2 font-medium">Source</th><th className="pb-2 font-medium">Leads</th><th className="pb-2 font-medium">Paid</th></tr></thead>
              <tbody>{funnel.bySource.map((s) => <tr key={s.source} className="border-t border-[#f0f0f0]"><td className="py-2">{s.source}</td><td>{s.leads}</td><td>{s.paid}</td></tr>)}</tbody>
            </table>
          ) : <p className="text-[13px] text-[#6b6b7b]">No leads yet. Share your Pattern Check link to start.</p>}
        </Section>
        <Section title="Clicks by platform" sub="From tracked links and link-in-bio buttons.">
          {Object.keys(data.clicksByPlatform).length ? (
            <div className="space-y-2">{Object.entries(data.clicksByPlatform).sort((a, b) => b[1] - a[1]).map(([p, n]) => <div key={p}><div className="flex justify-between text-[13px]"><span>{p}</span><b>{n}</b></div><Bar pct={(n / Math.max(...Object.values(data.clicksByPlatform))) * 100} /></div>)}</div>
          ) : <p className="text-[13px] text-[#6b6b7b]">No clicks yet. Create tracked links in Links & Bio Page.</p>}
        </Section>
      </div>
    </div>
  );
}
