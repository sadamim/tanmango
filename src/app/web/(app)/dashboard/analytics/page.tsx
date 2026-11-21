"use client";
import { useMemo, useState } from "react";
import { inr, useCollection, useMe, type Row } from "@/lib/client";
import { DataTable, DateRange, EmptySearch, Note, Panel, Select, StatCard, Tabs, Title, type Col } from "@/components/dash/kit";
import { inRange, lastNDays, useCustomers } from "@/components/dash/hooks";

const TABS = ["Checkout Page", "Transactions", "Users", "Broadcasts", "Page Views", "Courses"] as const;
type T = (typeof TABS)[number];

function days(from: string, to: string) {
  const out: string[] = [];
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  for (let d = a; d <= b && out.length < 370; d = new Date(d.getTime() + 864e5)) out.push(d.toISOString().slice(0, 10));
  return out;
}

function Chart({ labels, series, title }: { labels: string[]; series: { name: string; color: string; values: number[] }[]; title: string }) {
  const W = 760, H = 240, P = 28;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const nice = Math.ceil(max / 5) * 5 || 5;
  const x = (i: number) => P + (i / Math.max(1, labels.length - 1)) * (W - P * 2);
  const y = (v: number) => H - P - (v / nice) * (H - P * 2);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title}>
        {Array.from({ length: 6 }, (_, k) => (nice / 5) * k).map((v) => (
          <g key={v}><line x1={P} x2={W - P} y1={y(v)} y2={y(v)} stroke="#000" strokeOpacity=".06" /><text x={P - 6} y={y(v) + 4} fontSize="10" fill="#9b9bab" textAnchor="end">{Math.round(v)}</text></g>
        ))}
        {series.map((s) => (
          <g key={s.name}>
            <path d={s.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" className="[stroke-dasharray:3000] [stroke-dashoffset:3000] animate-[draw_1.2s_var(--ease-out-expo)_forwards]" />
            {s.values.map((v, i) => (v ? <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={s.color}><title>{`${labels[i]}: ${v}`}</title></circle> : null))}
          </g>
        ))}
        {labels.map((l, i) => (i % Math.max(1, Math.ceil(labels.length / 8)) === 0 ? <text key={l} x={x(i)} y={H - 6} fontSize="10" fill="#9b9bab" textAnchor="middle">{new Date(l).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</text> : null))}
      </svg>
      <style>{`@keyframes draw{to{stroke-dashoffset:0}}`}</style>
      <div className="mt-1 flex justify-center gap-5 text-[12px] text-[#4a4a59]">{series.map((s) => <span key={s.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}</span>)}</div>
      <p className="mt-1 text-center text-[12px] text-[#6b6b7b]">{title}</p>
    </div>
  );
}

export default function Analytics() {
  const { me } = useMe();
  const sales = useCollection("sales");
  const views = useCollection("views");
  const broadcasts = useCollection("broadcasts");
  const courses = useCollection("courses");
  const mangoes = useCollection("mangoes");
  const { list: customers } = useCustomers();
  const [tab, setTab] = useState<T>("Checkout Page");
  const [range, setRange] = useState<[string, string]>(() => [...lastNDays(11)] as [string, string]);
  const [mango, setMango] = useState("All mangoes");

  const labels = useMemo(() => days(range[0] || lastNDays(11)[0], range[1] || lastNDays(1)[1]), [range]);
  const pickMango = (r: Row) => mango === "All mangoes" || r.mango === mango;
  const per = (rows: Row[], f: (r: Row) => number = () => 1) => labels.map((d) => rows.filter((r) => r.createdAt.slice(0, 10) === d).reduce((a, r) => a + f(r), 0));

  const okSales = sales.rows.filter((s) => s.status === "Success" && pickMango(s) && inRange(s.createdAt, range[0], range[1]));
  const checkoutViews = views.rows.filter((v) => v.kind === "checkout" && pickMango(v) && inRange(v.createdAt, range[0], range[1]));
  const pageViews = views.rows.filter((v) => v.kind !== "checkout" && inRange(v.createdAt, range[0], range[1]));
  const sent = broadcasts.rows.filter((b) => !b.isTemplate && inRange(String(b.sendAt || b.createdAt), range[0], range[1]));
  const firstBuy = new Map<string, string>();
  for (const s of [...sales.rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) if (s.status === "Success" && !firstBuy.has(String(s.email))) firstBuy.set(String(s.email), s.createdAt);
  const newUsers = [...firstBuy.entries()].filter(([, d]) => inRange(d, range[0], range[1])).map(([e, d]) => ({ id: e, createdAt: d }) as Row);

  const courseCols: Col<Row>[] = [
    { key: "t", label: "Course", render: (r) => <span className="font-medium">{String(r.title)}</span> },
    { key: "p", label: "Status", render: (r) => (r.published ? "Published" : "Draft") },
    { key: "c", label: "Chapters", render: (r) => ((r.sections as { chapters: unknown[] }[]) || []).reduce((a, s) => a + s.chapters.length, 0) },
    { key: "m", label: "Linked mangoes", render: (r) => ((r.mangoes as string[]) || []).join(", ") || "-" },
    { key: "l", label: "Learners", render: (r) => new Set(customers.filter((c) => c.status === "Active" && ((r.mangoes as string[]) || []).includes(c.mango)).map((c) => c.email)).size },
  ];

  return (
    <Panel className="p-5">
      <Title sub={<span className="text-[#ff4d4f]">*This is early preview access to the analytics page. Some features may not work as expected.</span>} right={<DateRange from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />}>Analytics</Title>
      <div className="mt-3"><Tabs tabs={[...TABS]} value={tab} onChange={setTab} /></div>

      {tab === "Courses" ? (
        <div className="mt-4"><DataTable cols={courseCols} rows={courses.rows} loading={courses.loading} empty={<EmptySearch title="No courses yet" />} /></div>
      ) : (
        <>
          {(tab === "Checkout Page" || tab === "Transactions") && <div className="mt-4"><Select value={mango} onChange={setMango} options={["All mangoes", ...mangoes.rows.map((m) => String(m.title))]} /></div>}
          <div className="mt-4 flex flex-wrap gap-3">
            {tab === "Checkout Page" && (<><StatCard label="Total Visits" value={checkoutViews.length} /><StatCard label="Conversion Rate" value={`${checkoutViews.length ? Math.round((okSales.length / checkoutViews.length) * 1000) / 10 : 0}%`} delay={0.04} /></>)}
            {tab === "Transactions" && (<><StatCard label="Successful orders" value={okSales.length} /><StatCard label="Revenue" value={inr(okSales.reduce((a, s) => a + Number(s.amount || 0), 0))} delay={0.04} /><StatCard label="Avg. order value" value={inr(okSales.length ? okSales.reduce((a, s) => a + Number(s.amount || 0), 0) / okSales.length : 0)} delay={0.08} /></>)}
            {tab === "Users" && (<><StatCard label="New customers" value={newUsers.length} /><StatCard label="Total customers" value={new Set(customers.map((c) => c.email)).size} delay={0.04} /></>)}
            {tab === "Broadcasts" && (<><StatCard label="Broadcasts sent" value={sent.length} /><StatCard label="Recipients reached" value={sent.reduce((a, b) => a + Number(b.recipients || 0), 0)} delay={0.04} /></>)}
            {tab === "Page Views" && (<><StatCard label="Page views" value={pageViews.length} /><StatCard label="Storefront views" value={pageViews.filter((v) => v.kind === "store").length} delay={0.04} /><StatCard label="Mango page views" value={pageViews.filter((v) => v.kind === "page").length} delay={0.08} /></>)}
          </div>
          <div className="mt-4"><Note tone="blue">Visibility is limited to data generated on or after {new Date(me.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</Note></div>
          <div className="mt-4 rounded-[10px] border border-[#ededed] p-4">
            {tab === "Checkout Page" && <Chart labels={labels} title="No. of Visits and Purchases" series={[{ name: "Visits", color: "#1677ff", values: per(checkoutViews) }, { name: "Purchases", color: "#f2962c", values: per(okSales) }]} />}
            {tab === "Transactions" && <Chart labels={labels} title="Orders and revenue (₹ hundreds)" series={[{ name: "Orders", color: "#f2962c", values: per(okSales) }, { name: "Revenue / 100", color: "#00a400", values: per(okSales, (s) => Math.round(Number(s.amount || 0) / 100)) }]} />}
            {tab === "Users" && <Chart labels={labels} title="New customers per day" series={[{ name: "New customers", color: "#f2962c", values: per(newUsers) }]} />}
            {tab === "Broadcasts" && <Chart labels={labels} title="Broadcasts sent per day" series={[{ name: "Broadcasts", color: "#7c3aed", values: per(sent.map((b) => ({ ...b, createdAt: String(b.sendAt || b.createdAt) }))) }]} />}
            {tab === "Page Views" && <Chart labels={labels} title="Page views per day" series={[{ name: "Views", color: "#1677ff", values: per(pageViews) }]} />}
          </div>
        </>
      )}
    </Panel>
  );
}
