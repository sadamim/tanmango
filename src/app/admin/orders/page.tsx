"use client";
import { useMemo, useState } from "react";
import { downloadCsv, inr, toast } from "@/lib/client";
import { adminAct, useAdminData } from "@/lib/adminClient";
import type { AOrder } from "@/lib/adminTypes";
import { Btn, Confirm, DataTable, DateRange, EmptySearch, Panel, Pill, RowAction, Search, Select, StatCard, type Col } from "@/components/dash/kit";
import { inRange } from "@/components/dash/hooks";
import { ErrorBox, PageHead, day } from "@/components/admin/ui";

export default function Orders() {
  const { data, loading, error, reload } = useAdminData<{ orders: AOrder[]; creators: { id: string; name: string }[] }>("/api/admin/orders");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [creator, setCreator] = useState("All creators");
  const [range, setRange] = useState<[string, string]>(["", ""]);
  const [act, setAct] = useState<{ o: AOrder; to: "Refunded" | "Success" } | null>(null);

  const rows = useMemo(
    () =>
      (data?.orders || [])
        .filter((o) => `${o.customer} ${o.email} ${o.mango} ${o.creator} ${o.id}`.toLowerCase().includes(q.toLowerCase()))
        .filter((o) => status === "All statuses" || o.status === status)
        .filter((o) => creator === "All creators" || o.creatorId === creator)
        .filter((o) => inRange(o.createdAt, range[0], range[1])),
    [data, q, status, creator, range]
  );
  const ok = rows.filter((o) => o.status === "Success");

  const cols: Col<AOrder>[] = [
    { key: "d", label: "Date", render: (o) => <span className="whitespace-nowrap">{day(o.createdAt)}</span>, sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "id", label: "Order", render: (o) => <code className="text-[12px] text-[#6b6b7b]">{o.id.slice(0, 8).toUpperCase()}</code> },
    { key: "creator", label: "Creator", render: (o) => <div><p className="font-medium">{o.creator}</p><p className="text-[12px] text-[#6b6b7b]">{o.creatorEmail}</p></div> },
    { key: "customer", label: "Customer", render: (o) => <div><p>{o.customer}</p><p className="text-[12px] text-[#6b6b7b]">{o.email}</p></div> },
    { key: "mango", label: "Mango", render: (o) => <span>{o.mango}{o.cycle && o.cycle !== "One-time" && <span className="ml-1 text-[11px] text-[#9b9bab]">({o.cycle})</span>}</span> },
    { key: "amount", label: "Amount", render: (o) => <b>{inr(o.amount)}</b>, sort: (a, b) => a.amount - b.amount },
    { key: "fee", label: "Fee", render: (o) => <span className="text-[#6b6b7b]">{inr(o.fee)}</span>, sort: (a, b) => a.fee - b.fee },
    { key: "coupon", label: "Coupon", render: (o) => (o.coupon ? <code className="rounded bg-[#fdefdf] px-1.5 text-[12px] text-[#c7740f]">{o.coupon}</code> : "-") },
    { key: "status", label: "Status", render: (o) => <Pill tone={o.status === "Success" ? "green" : o.status === "Refunded" ? "red" : "orange"}>{o.status}</Pill> },
    { key: "a", label: "", render: (o) => (o.status === "Success" ? <RowAction icon="refresh" title="Refund order" danger onClick={() => setAct({ o, to: "Refunded" })} /> : o.status === "Refunded" ? <RowAction icon="check" title="Restore order" onClick={() => setAct({ o, to: "Success" })} /> : null) },
  ];

  if (error && !data) return <ErrorBox message={error} retry={reload} />;

  return (
    <>
      <PageHead title="Orders" sub="All purchases across every creator." right={<Btn variant="outline" icon="download" disabled={!rows.length} onClick={() => downloadCsv("orders.csv", ["Date", "Order", "Creator", "Customer", "Email", "Mango", "Amount", "Fee", "Coupon", "Status"], rows.map((o) => [o.createdAt, o.id, o.creator, o.customer, o.email, o.mango, o.amount, o.fee.toFixed(2), o.coupon || "", o.status]))}>Export CSV</Btn>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <StatCard icon="sales" label="GMV" value={inr(ok.reduce((a, o) => a + o.amount, 0))} sub={`${ok.length} successful orders`} />
        <StatCard icon="billing" label="Platform fees" value={inr(ok.reduce((a, o) => a + o.fee, 0))} sub="estimated" delay={0.04} />
        <StatCard icon="refresh" label="Refunded" value={rows.filter((o) => o.status === "Refunded").length} delay={0.08} />
        <StatCard icon="check" label="Avg. order" value={inr(ok.length ? ok.reduce((a, o) => a + o.amount, 0) / ok.length : 0)} delay={0.12} />
      </div>
      <Panel className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Search value={q} onChange={setQ} placeholder="Search customer, creator, mango or order id" />
          <DateRange from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />
          <Select value={status} onChange={setStatus} options={["All statuses", "Success", "Refunded", "Pending"]} />
          <Select value={creator} onChange={setCreator} options={[["All creators", "All creators"], ...(data?.creators || []).map((c) => [c.id, c.name] as [string, string])]} />
        </div>
        <div className="mt-3"><DataTable cols={cols} rows={rows} loading={loading} empty={<EmptySearch title="No orders found" text="Adjust the filters or date range." />} /></div>
      </Panel>
      {act && (
        <Confirm
          title={act.to === "Refunded" ? "Refund this order?" : "Restore this order?"}
          danger={act.to === "Refunded"}
          okLabel={act.to === "Refunded" ? "Refund" : "Restore"}
          text={<>{act.o.customer} · {act.o.mango} · <b>{inr(act.o.amount)}</b>. The creator ({act.o.creator}) is notified. No real money moves in this clone — the order status and the creator&apos;s earnings update.</>}
          onOk={async () => {
            try { await adminAct("PATCH", `/api/admin/orders/${act.o.id}`, { status: act.to }); toast(act.to === "Refunded" ? "Order refunded" : "Order restored"); }
            catch (e) { toast((e as Error).message, "err"); throw e; }
          }}
          onClose={() => setAct(null)}
        />
      )}
    </>
  );
}
