"use client";
import { useEffect, useState } from "react";
import { api, toast, useCollection } from "@/lib/client";
import { Btn, Field, Panel, Select, Title, inputCls } from "@/components/dash/kit";
import { Bar, Section } from "@/components/growth/shared";
import { PLATFORMS, type Funnel } from "@/lib/growth/model";

type Report = { week: string; funnel: Funnel; testimonials: number; social: { platform: string; this: Record<string, unknown> | null; latest: Record<string, unknown> | null; previous: Record<string, unknown> | null }[] };
const NUM = ["followers", "reach", "saves", "shares", "watchTime", "dms", "leads"] as const;
const LABEL: Record<string, string> = { followers: "Followers", reach: "Reach", saves: "Saves", shares: "Shares", watchTime: "Watch time (hrs)", dms: "DMs", leads: "Leads" };
const TARGETS: Record<string, { key: string; label: string; target: number }[]> = { YouTube: [{ key: "followers", label: "Subscribers", target: 1000 }, { key: "watchTime", label: "Watch hours (12 months)", target: 4000 }], Instagram: [{ key: "followers", label: "Followers", target: 10000 }] };

const mondayOf = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.toISOString().slice(0, 10); };
const lastWeeks = (n: number) => Array.from({ length: n }, (_, i) => mondayOf(new Date(Date.now() - i * 7 * 864e5)));

export default function GrowthReport() {
  const [week, setWeek] = useState(mondayOf(new Date()));
  const [r, setR] = useState<Report | null>(null);
  const stats = useCollection("socialStats");
  const [form, setForm] = useState<Record<string, string>>({ platform: "Instagram" });
  useEffect(() => { api<Report>(`/api/growth?q=report&week=${week}`).then(setR); }, [week, stats.rows.length]);

  async function add() {
    try {
      const data: Record<string, unknown> = { platform: form.platform, weekStart: week };
      for (const k of NUM) if (form[k] !== undefined && form[k] !== "") data[k] = Number(form[k]);
      const existing = stats.rows.find((s) => s.platform === form.platform && s.weekStart === week);
      if (existing) await stats.update(existing.id, data);
      else await stats.create(data);
      toast("Numbers saved");
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <Title sub="Emailed to you every Monday. Shows last week's social numbers and the funnel." right={<Select value={week} onChange={setWeek} options={lastWeeks(12).map((w) => [w, `Week of ${w}`] as [string, string])} />}>Weekly report</Title>
        {r && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead><tr className="text-left text-[12px] text-[#6b6b7b]"><th className="pb-2 font-medium">Step</th><th className="font-medium">In</th><th className="font-medium">Moved on</th><th className="font-medium">Dropped</th><th className="font-medium">Detail</th></tr></thead>
              <tbody>{r.funnel.steps.map((s) => <tr key={s.key} className="border-t border-[#f0f0f0]"><td className="py-2 font-medium">{s.label}</td><td>{s.entered}</td><td>{s.left}</td><td>{s.dropPct}%</td><td className="text-[13px] text-[#4a4a59]">{s.extra.map((e) => `${e.label} ${e.value}`).join(" · ")}</td></tr>)}</tbody>
            </table>
            <p className="mt-2 text-[13px]">Testimonials collected this week: <b>{r.testimonials}</b></p>
          </div>
        )}
      </Panel>

      <Section title="Social numbers" sub="Enter these each week from Instagram, YouTube, LinkedIn and Facebook insights. They cannot be pulled automatically without each platform's API approval.">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Platform"><select className={inputCls} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></Field>
          {NUM.map((k) => <Field key={k} label={LABEL[k]}><input className={inputCls} type="number" min={0} value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></Field>)}
        </div>
        <div className="mt-3"><Btn onClick={add}>Save for week of {week}</Btn></div>
        {r && r.social.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13.5px]">
              <thead><tr className="text-left text-[12px] text-[#6b6b7b]"><th className="pb-2 font-medium">Platform</th>{NUM.map((k) => <th key={k} className="font-medium">{LABEL[k]}</th>)}</tr></thead>
              <tbody>{r.social.map((p) => <tr key={p.platform} className="border-t border-[#f0f0f0]"><td className="py-2 font-medium">{p.platform}</td>{NUM.map((k) => { const v = p.this?.[k] as number | undefined; const pv = p.previous?.[k] as number | undefined; return <td key={k}>{v ?? "—"}{v !== undefined && pv !== undefined && <span className={`ml-1 text-[11px] ${v >= pv ? "text-[#2e9e4f]" : "text-[#cf1322]"}`}>{v >= pv ? "▲" : "▼"}{Math.abs(v - pv)}</span>}</td>; })}</tr>)}</tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Progress towards monetisation" sub="Targets follow the public YouTube Partner Programme and a 10,000-follower Instagram goal. Latest numbers you entered.">
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(TARGETS).flatMap(([plat, items]) => items.map((t) => {
            const row = r?.social.find((p) => p.platform === plat)?.latest as Record<string, number> | null | undefined;
            const v = Number(row?.[t.key] || 0);
            return <div key={plat + t.key}><div className="flex justify-between text-[13px]"><span>{plat}: {t.label}</span><b>{v.toLocaleString("en-IN")} / {t.target.toLocaleString("en-IN")}</b></div><Bar pct={(v / t.target) * 100} /></div>;
          }))}
        </div>
      </Section>
    </div>
  );
}
