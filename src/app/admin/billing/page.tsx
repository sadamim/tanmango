"use client";
import { useMemo, useState } from "react";
import { downloadCsv, inr } from "@/lib/client";
import { useAdminData } from "@/lib/adminClient";
import type { AInvoice } from "@/lib/adminTypes";
import type { Plan } from "@/components/dash/nav";
import { Btn, DataTable, EmptySearch, Panel, Pill, Search, StatCard, Title, type Col } from "@/components/dash/kit";
import { HBar } from "@/components/admin/charts";
import { ErrorBox, PageHead, day } from "@/components/admin/ui";

const COLOR = { basic: "#bfbfbf", pro: "#1677ff", advanced: "#f2962c", ultimate: "#7c3aed" } as const;

export default function Billing() {
  const { data, loading, error, reload } = useAdminData<{ invoices: AInvoice[]; plans: { plan: Plan; price: number; count: number }[]; mrr: number; invoiced: number; freedom: number }>("/api/admin/billing");
  const [q, setQ] = useState("");
  const rows = useMemo(() => (data?.invoices || []).filter((i) => `${i.creator} ${i.creatorEmail} ${i.product} ${i.number}`.toLowerCase().includes(q.toLowerCase())), [data, q]);

  const cols: Col<AInvoice>[] = [
    { key: "n", label: "Invoice", render: (i) => <code className="text-[12px]">{i.number}</code> },
    { key: "d", label: "Date", render: (i) => day(i.createdAt), sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "c", label: "Creator", render: (i) => <div><p className="font-medium">{i.creator}</p><p className="text-[12px] text-[#6b6b7b]">{i.creatorEmail}</p></div> },
    { key: "p", label: "Product", render: (i) => i.product },
    { key: "a", label: "Amount (incl. GST)", render: (i) => <b>{inr(i.amount)}</b>, sort: (a, b) => a.amount - b.amount },
    { key: "s", label: "Status", render: (i) => <Pill tone={i.status.startsWith("Paid") ? "green" : "blue"}>{i.status}</Pill> },
  ];

  if (error && !data) return <ErrorBox message={error} retry={reload} />;

  return (
    <>
      <PageHead title="Plans & billing" sub="Subscription plans and invoices. Payments are in test mode, so nothing is actually charged." right={<Btn variant="outline" icon="download" disabled={!rows.length} onClick={() => downloadCsv("invoices.csv", ["Invoice", "Date", "Creator", "Email", "Product", "Amount", "Status"], rows.map((i) => [i.number, i.createdAt, i.creator, i.creatorEmail, i.product, i.amount, i.status]))}>Export CSV</Btn>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <StatCard icon="billing" label="Monthly recurring (est.)" value={inr(data?.mrr || 0)} sub="plan price × creators, ex-GST" />
        <StatCard icon="check" label="Invoiced (paid)" value={inr(data?.invoiced || 0)} sub="incl. GST" delay={0.04} />
        <StatCard icon="star" label="Paid-plan creators" value={(data?.plans || []).filter((p) => p.plan !== "basic").reduce((a, p) => a + p.count, 0)} delay={0.08} />
        <StatCard icon="lock" label="Freedom Setup" value={data?.freedom || 0} sub="custom-domain creators" delay={0.12} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Panel className="h-fit p-5" delay={0.05}>
          <Title sub="Creators on each plan">Plan distribution</Title>
          <div className="mt-5"><HBar items={(data?.plans || []).map((p) => ({ label: p.plan[0].toUpperCase() + p.plan.slice(1), sub: p.price ? `₹${p.price.toLocaleString("en-IN")}/mo` : "free", value: p.count, color: COLOR[p.plan] }))} /></div>
        </Panel>
        <Panel className="p-5" delay={0.1}>
          <Title>Invoices</Title>
          <div className="mt-3 flex"><Search value={q} onChange={setQ} placeholder="Search creator, product or invoice number" /></div>
          <div className="mt-3"><DataTable cols={cols} rows={rows} loading={loading} empty={<EmptySearch title="No invoices yet" text="Invoices appear when a creator changes plan." />} /></div>
        </Panel>
      </div>
    </>
  );
}
