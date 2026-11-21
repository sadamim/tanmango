"use client";
import { useMemo, useState } from "react";
import { downloadCsv, fmtDate, inr, useCollection, type Row } from "@/lib/client";
import { Btn, DataTable, DateRange, EmptySearch, Modal, Panel, Pill, Search, Select, StatCard, Title, Updated, Walkthrough, type Col } from "@/components/dash/kit";
import { inRange, lastNDays, useMoney } from "@/components/dash/hooks";

const fmt = (d: string) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "");

export default function Transactions() {
  const { net } = useMoney();
  const sales = useCollection("sales");
  const mangoes = useCollection("mangoes");
  const [range, setRange] = useState<[string, string]>(() => [...lastNDays(8)] as [string, string]);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ mango: "All mangoes", status: "All statuses" });
  const [showFilters, setShowFilters] = useState(false);

  const rows = useMemo(
    () =>
      sales.rows
        .filter((s) => inRange(s.createdAt, range[0], range[1]))
        .filter((s) => `${s.customer} ${s.email} ${s.phone}`.toLowerCase().includes(q.toLowerCase()))
        .filter((s) => filters.mango === "All mangoes" || s.mango === filters.mango)
        .filter((s) => filters.status === "All statuses" || s.status === filters.status),
    [sales.rows, range, q, filters]
  );
  const okRows = rows.filter((s) => s.status === "Success");

  const cols: Col<Row>[] = [
    { key: "date", label: "Date", render: (r) => <span className="whitespace-nowrap">{fmtDate(r.createdAt)}</span>, sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "customer", label: "Customer", render: (r) => <span className="font-medium">{String(r.customer)}</span> },
    { key: "amount", label: "Amount", render: (r) => inr(Number(r.amount)), sort: (a, b) => Number(a.amount) - Number(b.amount) },
    { key: "contact", label: "Contact", render: (r) => <div className="text-[13px]"><p>{String(r.email)}</p>{r.phone ? <p className="text-[#6b6b7b]">+91 {String(r.phone)}</p> : null}</div> },
    { key: "mango", label: "Mango" },
    { key: "qty", label: "Quantity", render: (r) => String(r.quantity || 1) },
    { key: "cycle", label: "Payment Cycle", render: (r) => String(r.cycle || "One-time") },
    { key: "coupon", label: "Coupon", render: (r) => (r.coupon ? <code className="rounded bg-[#fdefdf] px-1.5 text-[12px] text-[#c7740f]">{String(r.coupon)}</code> : "-") },
    { key: "status", label: "Status", render: (r) => <Pill tone={r.status === "Success" ? "green" : r.status === "Refunded" ? "red" : "orange"}>{String(r.status)}</Pill> },
  ];

  return (
    <>
      <Walkthrough title="View all transactions" />
      <Panel className="p-5">
        <Title sub={`Showing transactions records from ${fmt(range[0]) || "the beginning"} to ${fmt(range[1]) || "today"}`} right={<DateRange from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />}>Transactions</Title>
        <div className="mt-4 flex flex-wrap gap-3">
          <StatCard label="Total Earnings" value={inr(okRows.reduce((a, s) => a + net(s), 0))} />
          <StatCard label="No. of Successful Orders" value={okRows.length} delay={0.04} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Search value={q} onChange={setQ} placeholder="Search by name, phone or email" />
          <Btn variant="black" icon="filter" onClick={() => setShowFilters(true)} aria-label="Filters" />
          <Btn variant="soft" icon="refresh" onClick={() => sales.reload()} aria-label="Refresh" />
          <span className="text-[12px] text-[#6b6b7b]"><Updated at={sales.updatedAt} /></span>
          <Btn variant="outline" icon="download" className="ml-auto" disabled={!rows.length} onClick={() => downloadCsv("transactions.csv", ["Date", "Customer", "Amount", "Email", "Phone", "Mango", "Quantity", "Payment cycle", "Coupon", "Status"], rows.map((r) => [r.createdAt, String(r.customer), Number(r.amount), String(r.email), String(r.phone || ""), String(r.mango), Number(r.quantity || 1), String(r.cycle || ""), String(r.coupon || ""), String(r.status)]))}>Export CSV</Btn>
        </div>
        <div className="mt-3">
          <DataTable
            cols={cols}
            rows={rows}
            loading={sales.loading}
            empty={<EmptySearch title={`No orders found between ${fmt(range[0]) || "the beginning"} and ${fmt(range[1]) || "today"}`} text={<>Your transaction history with order details and user info will appear here.<br />Update the filters by mango name, purchase date, order status and more.</>} />}
          />
        </div>
      </Panel>
      {showFilters && (
        <Modal title="Filters" onClose={() => setShowFilters(false)}>
          <div className="space-y-3">
            <Select className="w-full" value={filters.mango} onChange={(v) => setFilters((f) => ({ ...f, mango: v }))} options={["All mangoes", ...mangoes.rows.map((m) => String(m.title))]} />
            <Select className="w-full" value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} options={["All statuses", "Success", "Pending", "Refunded"]} />
          </div>
          <div className="mt-5 flex justify-between">
            <Btn variant="outline" onClick={() => setFilters({ mango: "All mangoes", status: "All statuses" })}>Reset</Btn>
            <Btn onClick={() => setShowFilters(false)}>Apply</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}
