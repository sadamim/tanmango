"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { copy, fmtDate, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptySearch, Modal, Panel, Pill, RowAction, Search, Select, Title, Toggle, Walkthrough, type Col } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";

function Inner() {
  const col = useCollection("coupons");
  const sales = useCollection("sales");
  const mangoes = useCollection("mangoes");
  const params = useSearchParams();
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [q, setQ] = useState("");
  const [mangoFilter, setMangoFilter] = useState("All mangoes");
  const [filterOpen, setFilterOpen] = useState(false);
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  useEffect(() => { if (params.get("new") === "1") setEdit("new"); }, [params]);

  const oneTime = mangoes.rows.filter((m) => m.type !== "Subscription").map((m) => String(m.title));
  const used = (code: unknown) => sales.rows.filter((s) => s.coupon === code && s.status === "Success").length;
  const isActive = (c: Row) => Boolean(c.active) && (!c.end || new Date(String(c.end)).getTime() >= Date.now());

  const rows = useMemo(() => col.rows.filter((c) => status === "All" || (status === "Active" ? isActive(c) : !isActive(c))).filter((c) => String(c.code).toLowerCase().includes(q.toLowerCase())).filter((c) => mangoFilter === "All mangoes" || c.mango === mangoFilter || c.mango === "All mangoes"), [col.rows, status, q, mangoFilter]);

  const cols: Col<Row>[] = [
    { key: "mango", label: "Mango", render: (r) => String(r.mango || "All mangoes") },
    { key: "code", label: "Coupon Code", render: (r) => <button onClick={() => copy(String(r.code), "Coupon code")} className="rounded bg-[#fdefdf] px-2 py-1 font-mono text-[13px] font-semibold text-[#c7740f]" title="Copy">{String(r.code)}</button> },
    { key: "status", label: "Status", render: (r) => <div className="flex items-center gap-2"><Toggle on={Boolean(r.active)} onChange={async (v) => { await col.update(r.id, { active: v }); toast(v ? "Coupon activated" : "Coupon deactivated"); }} label="Active" />{isActive(r) ? <Pill>Active</Pill> : <Pill tone="grey">Inactive</Pill>}</div> },
    { key: "duration", label: "Duration", render: (r) => <span className="text-[13px]">{r.start ? fmtDate(String(r.start)) : "Now"} → {r.end ? fmtDate(String(r.end)) : "No end"}</span> },
    { key: "usage", label: "Usage", render: (r) => `${used(r.code)}${r.maxUses ? ` / ${r.maxUses}` : ""}` },
    { key: "a", label: "Actions", render: (r) => <div className="flex gap-1.5"><span className="mr-1 self-center text-[13px] font-semibold">{String(r.discount)}% off</span><RowAction icon="edit" title="Edit" onClick={() => setEdit(r)} /><RowAction icon="trash" title="Delete" danger onClick={() => setDel(r)} /></div> },
  ];

  return (
    <>
      <Walkthrough title="Create discount coupons" />
      <Panel className="p-5">
        <Title right={<Btn variant="black" icon="plus" onClick={() => setEdit("new")}>Create Coupon</Btn>}>Coupons</Title>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-4 text-[14px]">{(["All", "Active", "Inactive"] as const).map((s) => <label key={s} className="flex cursor-pointer items-center gap-1.5"><input type="radio" className="accent-[#f2962c]" checked={status === s} onChange={() => setStatus(s)} />{s}</label>)}</div>
          <Search value={q} onChange={setQ} placeholder="Search by coupon code" />
          <Btn variant="outline" icon="filter" onClick={() => setFilterOpen(true)}>Filter by</Btn>
        </div>
        <div className="mt-3"><DataTable cols={cols} rows={rows} loading={col.loading} empty={<EmptySearch title="No coupons found!" text="Create your first Coupon for you Event & Build Engagement" />} /></div>
      </Panel>
      {filterOpen && (
        <Modal title="Filter by" onClose={() => setFilterOpen(false)}>
          <Select className="w-full" value={mangoFilter} onChange={setMangoFilter} options={["All mangoes", ...mangoes.rows.map((m) => String(m.title))]} />
          <div className="mt-5 flex justify-end"><Btn onClick={() => setFilterOpen(false)}>Apply</Btn></div>
        </Modal>
      )}
      {edit && (
        <FormDrawer
          title={edit === "new" ? "Create Coupon" : "Edit Coupon"}
          intro={<div className="rounded-md bg-[#fdefdf] px-3 py-2 text-[12.5px]">Note: Coupon won&apos;t apply if the discount reduces the final price below €1 / $1 or exceeds 80% off</div>}
          fields={[
            { key: "code", label: "Coupon Code", required: true, placeholder: "Enter Coupon Code", maxLength: 100 },
            { key: "mango", label: "Mango", type: "select", options: ["All mangoes", ...oneTime], required: true, hint: "Applies to all mangoes · Coupons can't be created for subscription based mangoes" },
            { key: "discount", label: "Percentage Discount (%)", type: "number", min: 1, max: 80, required: true, placeholder: "Enter Discount Percentage" },
            { key: "target", label: "Target customer", type: "toggle" },
            { key: "targetEmails", label: "Customer emails (comma separated)", type: "textarea", required: true, show: (d) => Boolean(d.target) },
            { key: "maxUses", label: "Total usages (optional)", type: "number", min: 1, placeholder: "Enter Total Usages (optional)" },
            { key: "start", label: "Start", type: "datetime-local" },
            { key: "end", label: "End", type: "datetime-local" },
            { key: "active", label: "Active", type: "toggle" },
          ]}
          initial={edit === "new" ? { mango: "All mangoes", active: true } : edit}
          onClose={() => setEdit(null)}
          onSubmit={async (d) => {
            const code = String(d.code).toUpperCase().replace(/[^A-Z0-9]/g, "");
            if (code.length < 3) return "Coupon code needs at least 3 letters or numbers";
            if (col.rows.some((c) => c.code === code && (edit === "new" || c.id !== edit.id))) return "A coupon with this code already exists";
            if (d.start && d.end && String(d.end) <= String(d.start)) return "End must be after start";
            const data = { ...d, code, targetEmails: d.target ? d.targetEmails : "" };
            if (edit === "new") await col.create(data);
            else await col.update(edit.id, data);
            toast(edit === "new" ? "Coupon created" : "Coupon updated");
          }}
        />
      )}
      {del && <Confirm title="Delete coupon?" text={<>Code <b>{String(del.code)}</b> will stop working at checkout.</>} onOk={async () => { await col.remove(del.id); toast("Coupon deleted"); }} onClose={() => setDel(null)} />}
    </>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
