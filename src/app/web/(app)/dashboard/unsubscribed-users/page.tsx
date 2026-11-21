"use client";
import { useState } from "react";
import { downloadCsv, fmtDate, toast, useCollection, type Row } from "@/lib/client";
import { Btn, DataTable, EmptySearch, Gate, Panel, Search, Title, type Col } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";

function Unsub() {
  const col = useCollection("unsubscribed");
  const [q, setQ] = useState("");
  const [add, setAdd] = useState(false);
  const rows = col.rows.filter((r) => String(r.email).includes(q.toLowerCase()));
  const cols: Col<Row>[] = [
    { key: "email", label: "Email" },
    { key: "reason", label: "Reason", render: (r) => String(r.reason || "-") },
    { key: "on", label: "Unsubscribed on", render: (r) => fmtDate(r.createdAt) },
    { key: "a", label: "Action", render: (r) => <Btn variant="outline" className="h-8 px-3 text-[13px]" onClick={async () => { await col.remove(r.id); toast("Resubscribed"); }}>Resubscribe</Btn> },
  ];
  return (
    <Panel className="p-5">
      <Title sub="These people won't receive email broadcasts." right={<><Btn variant="outline" icon="download" disabled={!rows.length} onClick={() => downloadCsv("unsubscribed.csv", ["Email", "Reason", "Date"], rows.map((r) => [String(r.email), String(r.reason || ""), r.createdAt]))}>Export</Btn><Btn variant="black" icon="plus" onClick={() => setAdd(true)}>Add email</Btn></>}>Unsubscribed Users</Title>
      <div className="mt-4 flex"><Search value={q} onChange={setQ} placeholder="Search by email" /></div>
      <div className="mt-3"><DataTable cols={cols} rows={rows} loading={col.loading} empty={<EmptySearch title="No unsubscribed users" />} /></div>
      {add && (
        <FormDrawer
          title="Unsubscribe an email"
          fields={[{ key: "email", label: "Email", type: "email", required: true }, { key: "reason", label: "Reason (optional)" }]}
          onClose={() => setAdd(false)}
          onSubmit={async (d) => {
            const email = String(d.email).toLowerCase();
            if (col.rows.some((r) => r.email === email)) return "Already unsubscribed";
            await col.create({ ...d, email });
            toast("Email unsubscribed");
          }}
        />
      )}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="unsubscribed-users" title="Unsubscribed Users"><Unsub /></Gate>;
}
