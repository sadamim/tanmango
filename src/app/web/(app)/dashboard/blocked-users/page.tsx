"use client";
import { useState } from "react";
import { fmtDate, toast, useCollection, type Row } from "@/lib/client";
import { Btn, DataTable, EmptySearch, Gate, Panel, Search, Title, type Col } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";

function Blocked() {
  const col = useCollection("blocked");
  const [q, setQ] = useState("");
  const [add, setAdd] = useState(false);
  const rows = col.rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase()));
  const cols: Col<Row>[] = [
    { key: "n", label: "User", render: (r) => <div><p className="font-medium">{String(r.name || "-")}</p><p className="text-[12px] text-[#6b6b7b]">{String(r.email)}</p></div> },
    { key: "r", label: "Reason", render: (r) => String(r.reason || "-") },
    { key: "on", label: "Blocked on", render: (r) => fmtDate(r.createdAt) },
    { key: "a", label: "Action", render: (r) => <Btn variant="outline" className="h-8 px-3 text-[13px]" onClick={async () => { await col.remove(r.id); toast("User unblocked"); }}>Unblock</Btn> },
  ];
  return (
    <Panel className="p-5">
      <Title sub="Blocked users can't purchase your mangoes or post in your community." right={<Btn variant="black" icon="plus" onClick={() => setAdd(true)}>Block user</Btn>}>Blocked Users</Title>
      <div className="mt-4 flex"><Search value={q} onChange={setQ} placeholder="Search by name or email" /></div>
      <div className="mt-3"><DataTable cols={cols} rows={rows} loading={col.loading} empty={<EmptySearch title="No blocked users" />} /></div>
      {add && (
        <FormDrawer
          title="Block user"
          fields={[{ key: "name", label: "Name" }, { key: "email", label: "Email", type: "email", required: true }, { key: "reason", label: "Reason", type: "textarea" }]}
          submitLabel="Block"
          onClose={() => setAdd(false)}
          onSubmit={async (d) => { const email = String(d.email).toLowerCase(); if (col.rows.some((b) => b.email === email)) return "Already blocked"; await col.create({ ...d, email }); toast("User blocked"); }}
        />
      )}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="blocked-users" title="Blocked Users"><Blocked /></Gate>;
}
