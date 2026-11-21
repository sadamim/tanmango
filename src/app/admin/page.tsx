"use client";
import Link from "next/link";
import { inr } from "@/lib/client";
import { useAdminData } from "@/lib/adminClient";
import type { AOverview } from "@/lib/adminTypes";
import { Btn, Panel, StatCard, Title, Updated } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { HBar, LineChart } from "@/components/admin/charts";
import { ErrorBox, PageHead, PlanBadge, Skeleton, when } from "@/components/admin/ui";

const PLAN_COLOR = { basic: "#bfbfbf", pro: "#1677ff", advanced: "#f2962c", ultimate: "#7c3aed" } as const;
const ACT_ICON = { signup: "user", order: "sales", withdrawal: "download", report: "warning" } as const;

function Attention({ href, icon, value, label, tone }: { href: string; icon: string; value: string | number; label: string; tone: "orange" | "red" | "grey" }) {
  const t = { orange: "bg-[#fff1e3] text-[#c7740f]", red: "bg-[#fff2f0] text-[#cf1322]", grey: "bg-[#f2f2f2] text-[#4a4a59]" }[tone];
  return (
    <Link href={href} className="animate-rise flex min-w-[220px] flex-1 items-center gap-3 rounded-[10px] border border-[#ededed] bg-white p-4 transition hover:border-[#f2962c] hover:shadow-sm">
      <span className={`grid h-11 w-11 place-items-center rounded-lg ${t}`}><Icon name={icon} className="h-5 w-5" /></span>
      <div><p className="text-[22px] font-semibold leading-none">{value}</p><p className="mt-1 text-[12px] text-[#6b6b7b]">{label}</p></div>
      <Icon name="chevron" className="ml-auto h-4 w-4 -rotate-90 text-[#bfbfbf]" />
    </Link>
  );
}

export default function Overview() {
  const { data: d, loading, error, reload, updatedAt } = useAdminData<AOverview>("/api/admin/overview");
  if (error && !d) return <ErrorBox message={error} retry={reload} />;
  if (loading || !d) return <div className="space-y-4"><Skeleton h={90} /><Skeleton h={110} /><Skeleton h={300} /></div>;

  return (
    <>
      <PageHead title="Platform overview" sub={<Updated at={updatedAt} />} right={<Btn variant="outline" icon="refresh" onClick={reload}>Refresh</Btn>} />

      <div className="flex flex-wrap gap-3">
        <Attention href="/admin/withdrawals" icon="download" tone="orange" value={d.pending.withdrawals} label={`Withdrawals to review · ${inr(d.pending.withdrawalAmount)}`} />
        <Attention href="/admin/reports" icon="warning" tone={d.pending.reports ? "red" : "grey"} value={d.pending.reports} label="Open content reports" />
        <Attention href="/admin/creators" icon="lock" tone={d.creators.suspended ? "red" : "grey"} value={d.creators.suspended} label="Suspended creators" />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <StatCard icon="customers" label="Creators" value={d.creators.total} sub={`+${d.creators.new30} in the last 30 days`} />
        <StatCard icon="sales" label="GMV (30 days)" value={inr(d.money.gmv30)} sub={`${inr(d.money.gmvAll)} all time`} delay={0.04} />
        <StatCard icon="products" label="Orders (30 days)" value={d.money.orders30} sub={`${d.money.refunds30} refunded`} delay={0.08} />
        <StatCard icon="billing" label="Commission earned" value={inr(d.money.commission)} sub="estimated, all time" delay={0.12} />
        <StatCard icon="star" label="Plan revenue" value={inr(d.money.subscriptions)} sub="incl. GST, test mode" delay={0.16} />
        <StatCard icon="check" label="Active creators" value={d.creators.active} sub={`${d.creators.kycDone} KYC-verified`} delay={0.2} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel className="p-5" delay={0.05}>
          <Title sub="Successful orders, last 30 days">Gross merchandise value</Title>
          <div className="mt-3"><LineChart labels={d.series.labels} money series={[{ name: "GMV", color: "#f2962c", values: d.series.gmv }]} /></div>
        </Panel>
        <Panel className="p-5" delay={0.1}>
          <Title sub="Last 30 days">Orders & sign-ups</Title>
          <div className="mt-3"><LineChart labels={d.series.labels} series={[{ name: "Orders", color: "#1677ff", values: d.series.orders }, { name: "New creators", color: "#00a400", values: d.series.signups }]} /></div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr_1.2fr]">
        <Panel className="p-5" delay={0.12}>
          <Title sub="Creators by plan">Plan mix</Title>
          <div className="mt-5"><HBar items={d.plans.map((p) => ({ label: p.plan[0].toUpperCase() + p.plan.slice(1), value: p.count, color: PLAN_COLOR[p.plan] }))} /></div>
        </Panel>

        <Panel className="p-5" delay={0.16}>
          <Title right={<Link href="/admin/creators" className="text-[13px] text-[#1677ff]">All creators</Link>} sub="By lifetime GMV">Top creators</Title>
          <div className="mt-4 divide-y divide-[#f0f0f0]">
            {d.top.length === 0 && <p className="py-6 text-center text-[13px] text-[#9b9bab]">No creators yet</p>}
            {d.top.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 py-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#f2f2f2] text-[12px] font-semibold">{i + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-medium">{c.name}</p><p className="truncate text-[12px] text-[#6b6b7b]">{c.orders} orders</p></div>
                <PlanBadge plan={c.plan} />
                <b className="w-20 text-right text-[14px]">{inr(c.gmv)}</b>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5" delay={0.2}>
          <Title sub="Latest across the platform">Recent activity</Title>
          <div className="mt-4 space-y-3">
            {d.activity.length === 0 && <p className="py-6 text-center text-[13px] text-[#9b9bab]">Nothing yet</p>}
            {d.activity.map((a, i) => (
              <div key={i} className="flex gap-3 text-[13px]">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fdefdf] text-[#f2962c]"><Icon name={ACT_ICON[a.type]} className="h-3.5 w-3.5" /></span>
                <div className="min-w-0"><p className="leading-snug">{a.text}</p><p className="text-[11px] text-[#9b9bab]">{when(a.at)}</p></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
