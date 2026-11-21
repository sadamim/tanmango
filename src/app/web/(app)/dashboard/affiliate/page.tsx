"use client";
import { useState } from "react";
import { copy, inr, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptySearch, Gate, Panel, Pill, RowAction, Search, StatCard, Title, Toggle, type Col } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";
import { useMangoTitles } from "@/components/dash/hooks";

function Affiliates() {
  const col = useCollection("affiliates");
  const sales = useCollection("sales");
  const mangoes = useMangoTitles();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);

  const credited = (a: Row) => sales.rows.filter((s) => s.status === "Success" && (s.ref === a.code || s.coupon === a.code) && (!((a.mangoes as string[]) || []).length || ((a.mangoes as string[]) || []).includes(String(s.mango))));
  const earned = (a: Row) => credited(a).reduce((x, s) => x + (Number(s.amount) * Number(a.commission || 0)) / 100, 0);
  const rows = col.rows.filter((a) => `${a.name} ${a.email} ${a.code}`.toLowerCase().includes(q.toLowerCase()));
  const totalSales = col.rows.reduce((x, a) => x + credited(a).length, 0);
  const totalOwed = col.rows.reduce((x, a) => x + earned(a), 0);

  const cols: Col<Row>[] = [
    { key: "n", label: "Affiliate", render: (r) => <div><p className="font-medium">{String(r.name)}</p><p className="text-[12px] text-[#6b6b7b]">{String(r.email)}</p></div> },
    { key: "code", label: "Referral link", render: (r) => <button className="text-left text-[13px] text-[#1677ff] hover:underline" onClick={() => copy(`${location.origin}/web/lite/store/${r.userId || ""}?ref=${r.code}`, "Referral link")}><code className="rounded bg-[#fdefdf] px-1.5 text-[#c7740f]">{String(r.code)}</code> copy link</button> },
    { key: "c", label: "Commission", render: (r) => `${String(r.commission)}%` },
    { key: "s", label: "Sales", render: (r) => credited(r).length, sort: (a, b) => credited(a).length - credited(b).length },
    { key: "e", label: "Earned", render: (r) => <b>{inr(earned(r))}</b>, sort: (a, b) => earned(a) - earned(b) },
    { key: "st", label: "Status", render: (r) => <div className="flex items-center gap-2"><Toggle on={Boolean(r.active)} onChange={async (v) => { await col.update(r.id, { active: v }); toast(v ? "Affiliate activated" : "Affiliate paused"); }} label="Active" />{r.active ? <Pill>Active</Pill> : <Pill tone="grey">Paused</Pill>}</div> },
    { key: "a", label: "", render: (r) => <div className="flex justify-end gap-1.5"><RowAction icon="edit" title="Edit" onClick={() => setEdit(r)} /><RowAction icon="trash" title="Remove" danger onClick={() => setDel(r)} /></div> },
  ];

  return (
    <Panel className="p-5">
      <Title sub="Let your members sell for you — each gets a link (or coupon code), a cut, and a reason to share." right={<Btn variant="black" icon="plus" onClick={() => setEdit("new")}>Add affiliate</Btn>}>Affiliates</Title>
      <div className="mt-4 flex flex-wrap gap-3"><StatCard label="Affiliates" value={col.rows.length} /><StatCard label="Referred sales" value={totalSales} delay={0.04} /><StatCard label="Commission owed" value={inr(totalOwed)} delay={0.08} /></div>
      <div className="mt-4 flex"><Search value={q} onChange={setQ} placeholder="Search by name, email or code" /></div>
      <div className="mt-3"><DataTable cols={cols} rows={rows} loading={col.loading} empty={<EmptySearch title="No affiliates yet" text="Add a member as an affiliate. Sales made with their code or link are credited to them." />} /></div>
      {edit && (
        <FormDrawer
          title={edit === "new" ? "Add affiliate" : "Edit affiliate"}
          fields={[
            { key: "name", label: "Name", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "code", label: "Referral code", required: true, hint: "Buyers can use this as a coupon or arrive via ?ref=CODE" },
            { key: "commission", label: "Commission (%)", type: "number", min: 1, max: 90, required: true },
            { key: "mangoes", label: "Applies to mangoes (empty = all)", type: "multi", options: mangoes },
            { key: "active", label: "Active", type: "toggle" },
          ]}
          initial={edit === "new" ? { commission: 20, active: true, mangoes: [] } : edit}
          onClose={() => setEdit(null)}
          onSubmit={async (d) => {
            const code = String(d.code).toUpperCase().replace(/[^A-Z0-9]/g, "");
            if (code.length < 3) return "Code needs at least 3 letters or numbers";
            if (col.rows.some((a) => a.code === code && (edit === "new" || a.id !== edit.id))) return "Code already used by another affiliate";
            const data = { ...d, code, email: String(d.email).toLowerCase() };
            if (edit === "new") await col.create(data); else await col.update(edit.id, data);
            toast("Affiliate saved");
          }}
        />
      )}
      {del && <Confirm title="Remove affiliate?" text="Their past referred sales stay in Transactions." okLabel="Remove" onOk={async () => { await col.remove(del.id); toast("Affiliate removed"); }} onClose={() => setDel(null)} />}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="affiliate" title="Affiliates"><Affiliates /></Gate>;
}
