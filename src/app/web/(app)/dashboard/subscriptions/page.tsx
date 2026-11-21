"use client";
import { fmtDate, inr, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptyBox, Panel, Pill, Title, Updated, Walkthrough, type Col } from "@/components/dash/kit";
import { useState } from "react";

export default function Subscriptions() {
  const sales = useCollection("sales");
  const [cancel, setCancel] = useState<Row | null>(null);
  const subs = sales.rows.filter((s) => s.status === "Success" && s.expires && ["Monthly", "Quarterly", "Half-yearly", "Yearly"].includes(String(s.cycle)));

  const cols: Col<Row>[] = [
    { key: "customer", label: "Customer", render: (r) => <div><p className="font-medium">{String(r.customer)}</p><p className="text-[12px] text-[#6b6b7b]">{String(r.email)}</p></div> },
    { key: "mango", label: "Mango" },
    { key: "plan", label: "Plan", render: (r) => `${inr(Number(r.amount))} / ${String(r.cycle).toLowerCase()}` },
    { key: "started", label: "Started", render: (r) => fmtDate(r.createdAt) },
    { key: "renews", label: "Renews / Expires", render: (r) => fmtDate(String(r.expires)), sort: (a, b) => String(a.expires).localeCompare(String(b.expires)) },
    { key: "status", label: "Status", render: (r) => (r.autoRenew === false ? <Pill tone="grey">Cancelled</Pill> : new Date(String(r.expires)).getTime() < Date.now() ? <Pill tone="red">Expired</Pill> : <Pill>Active</Pill>) },
    { key: "a", label: "Actions", render: (r) => (r.autoRenew === false ? <span className="text-[12px] text-[#9b9bab]">Ends {fmtDate(String(r.expires))}</span> : <Btn variant="danger" className="h-8 px-3 text-[13px]" onClick={() => setCancel(r)}>Cancel renewal</Btn>) },
  ];

  return (
    <>
      <Walkthrough title="Manage subscriptions" />
      <Panel className="p-5">
        <Title right={<><span className="text-[12px] text-[#6b6b7b]"><Updated at={sales.updatedAt} /></span><Btn variant="soft" icon="refresh" onClick={() => sales.reload()} aria-label="Refresh" /></>}>Subscriptions</Title>
        <div className="mt-3">
          {subs.length === 0 && !sales.loading ? <EmptyBox title="You don't have any recurring subscriptions" /> : <DataTable cols={cols} rows={subs} loading={sales.loading} empty={null} />}
        </div>
      </Panel>
      {cancel && <Confirm title="Cancel auto-renewal?" text={<>{String(cancel.customer)} keeps access until {fmtDate(String(cancel.expires))}, then the subscription ends.</>} okLabel="Cancel renewal" onOk={async () => { await sales.update(cancel.id, { autoRenew: false }); toast("Auto-renewal cancelled"); }} onClose={() => setCancel(null)} />}
    </>
  );
}
