"use client";
import { useMemo, useState } from "react";
import { fmtDate, inr, useCollection, type Row } from "@/lib/client";
import { Btn, DataTable, DateRange, EmptyBox, EmptySearch, Modal, Note, Panel, Pill, Search, Title, Updated, Walkthrough, type Col } from "@/components/dash/kit";
import { useMoney } from "@/components/dash/hooks";

export default function Earnings() {
  const { rate, ok, net } = useMoney();
  const mangoes = useCollection("mangoes");
  const [range, setRange] = useState<[string, string]>(["", ""]);
  const [q, setQ] = useState("");
  const [inv, setInv] = useState<string | null>(null);

  const inMonths = (iso: string) => (!range[0] || iso.slice(0, 7) >= range[0]) && (!range[1] || iso.slice(0, 7) <= range[1]);
  const scoped = ok.filter((s) => inMonths(s.createdAt));
  const total = scoped.reduce((a, s) => a + net(s), 0);

  // monthly bars
  const months = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of scoped) m.set(s.createdAt.slice(0, 7), (m.get(s.createdAt.slice(0, 7)) || 0) + net(s));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  }, [scoped, net]);
  const max = Math.max(1, ...months.map((m) => m[1]));

  const per = (t: string) => scoped.filter((s) => s.mango === t).reduce((a, s) => a + net(s), 0);
  const rows = mangoes.rows.filter((m) => String(m.title).toLowerCase().includes(q.toLowerCase()));
  const cols: Col<Row>[] = [
    { key: "mango", label: "Mango", render: (r) => <div><p className="font-medium">{String(r.title)}</p><div className="mt-1 flex gap-1.5"><span className="text-[12px] text-[#6b6b7b]">{r.type === "Free" ? "Free" : inr(Number(r.price))}</span><Pill tone={r.active ? "green" : "grey"}>{r.active ? "Active" : "Inactive"}</Pill><Pill tone="blue">{r.type === "Subscription" ? "Subscription" : r.type === "Free" ? "Free" : "Onetime"}</Pill></div></div> },
    { key: "earnings", label: "Earnings", render: (r) => <b>{inr(per(String(r.title)))}</b>, sort: (a, b) => per(String(a.title)) - per(String(b.title)) },
    { key: "action", label: "Action", render: (r) => <Btn variant="outline" className="h-8 px-3 text-[13px]" onClick={() => setInv(String(r.title))}>View Invoices</Btn> },
  ];

  return (
    <>
      <Walkthrough title="Track your earnings" />
      <div className="mb-4"><Note>Your earnings are displayed after deducting {Math.round(rate * 1000) / 10}% commissions.</Note></div>
      <Panel className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-[28px] font-semibold">{inr(total)}</p><p className="text-[12px] text-[#6b6b7b]">Total earnings as on {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p></div>
          <DateRange type="month" from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />
        </div>
        {months.length === 0 ? (
          <EmptyBox title="No earnings found" />
        ) : (
          <div className="mt-6 flex h-52 items-end gap-3 border-b border-[#ededed] pb-1">
            {months.map(([k, v]) => (
              <div key={k} className="group flex flex-1 flex-col items-center gap-1">
                <span className="text-[11px] text-[#6b6b7b] opacity-0 transition group-hover:opacity-100">{inr(v)}</span>
                <div className="w-full max-w-12 origin-bottom animate-[grow-y_.8s_var(--ease-out-expo)] rounded-t bg-[#f2962c]" style={{ height: `${(v / max) * 160}px` }} />
                <span className="text-[11px] text-[#6b6b7b]">{new Date(k + "-01").toLocaleDateString("en-IN", { month: "short" })}</span>
              </div>
            ))}
          </div>
        )}
        <style>{`@keyframes grow-y{from{transform:scaleY(0)}to{transform:scaleY(1)}}`}</style>
      </Panel>
      <Panel className="mt-5 p-5" delay={0.06}>
        <Title sub={<Updated at={mangoes.updatedAt} />} right={<Btn variant="black" icon="refresh" onClick={() => mangoes.reload()}>Refresh</Btn>}>Mangoes earnings</Title>
        <div className="mt-4 flex"><Search value={q} onChange={setQ} placeholder="Search by mango" /></div>
        <div className="mt-3"><DataTable cols={cols} rows={rows} loading={mangoes.loading} empty={<EmptySearch title="No mangoes found" />} /></div>
      </Panel>
      {inv && (
        <Modal title={`Invoices — ${inv}`} onClose={() => setInv(null)} wide>
          {scoped.filter((s) => s.mango === inv).length === 0 ? <p className="py-6 text-center text-[14px] text-[#6b6b7b]">No invoices for this mango yet.</p> : (
            <table className="w-full text-left text-[13px]">
              <thead><tr className="border-b border-[#ededed]">{["Invoice", "Date", "Customer", "Amount", "Your earnings"].map((h) => <th key={h} className="py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>{scoped.filter((s) => s.mango === inv).map((s) => <tr key={s.id} className="border-b border-[#f5f5f5]"><td className="py-2">INV-{s.id.slice(0, 6).toUpperCase()}</td><td>{fmtDate(s.createdAt)}</td><td>{String(s.customer)}</td><td>{inr(Number(s.amount))}</td><td className="font-semibold">{inr(net(s))}</td></tr>)}</tbody>
            </table>
          )}
        </Modal>
      )}
    </>
  );
}
