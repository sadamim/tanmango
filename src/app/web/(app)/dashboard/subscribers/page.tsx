"use client";
import { useMemo, useState } from "react";
import { downloadCsv, fmtDate, toast, useMe } from "@/lib/client";
import { Btn, Confirm, DataTable, Drawer, EmptySearch, LockedCard, Modal, Panel, Pill, Search, Select, StatCard, Title, Walkthrough, type Col } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";
import { useCustomers, useMangoTitles, type Customer } from "@/components/dash/hooks";
import { isLocked } from "@/components/dash/nav";

export default function Customers() {
  const { me } = useMe();
  const { list, loading, manual } = useCustomers();
  const mangoes = useMangoTitles();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [add, setAdd] = useState(false);
  const [revoke, setRevoke] = useState<Customer[] | null>(null);
  const [filter, setFilter] = useState({ mango: "All mangoes", status: "All" });
  const [showFilter, setShowFilter] = useState(false);

  const rows = useMemo(
    () => list.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())).filter((c) => filter.mango === "All mangoes" || c.mango === filter.mango).filter((c) => filter.status === "All" || c.status === filter.status),
    [list, q, filter]
  );
  const active = list.filter((c) => c.status === "Active").length;

  const cols: Col<Customer>[] = [
    { key: "name", label: "Customer", render: (c) => <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#fdefdf] text-[12px] font-semibold text-[#c7740f]">{c.name[0]?.toUpperCase()}</span><span className="font-medium">{c.name}</span></div> },
    { key: "contact", label: "Contact", render: (c) => <div className="text-[13px]"><p>{c.email}</p>{c.phone && <p className="text-[#6b6b7b]">+91 {c.phone}</p>}</div> },
    { key: "mango", label: "Mango" },
    { key: "cycle", label: "Payment Cycle" },
    { key: "last", label: "Last Transaction Date", render: (c) => fmtDate(c.lastTx), sort: (a, b) => a.lastTx.localeCompare(b.lastTx) },
    { key: "exp", label: "Expiry Date", render: (c) => (c.expires ? fmtDate(c.expires) : "Lifetime") },
    { key: "status", label: "Status", render: (c) => <Pill tone={c.status === "Active" ? "green" : c.status === "Revoked" ? "red" : "grey"}>{c.status}</Pill> },
  ];

  return (
    <>
      <Walkthrough title="Customers and leads" />
      <Panel className="p-5">
        <Title right={<Btn variant="black" icon="plus" onClick={() => setAdd(true)}>Add Customers</Btn>}>Customers</Title>
        <div className="mt-4 flex flex-wrap gap-3">
          <StatCard label="Active Subscriptions" value={active} />
          <StatCard label="Inactive / Revoked Subscriptions" value={list.length - active} delay={0.04} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Search value={q} onChange={setQ} placeholder="Search by name, phone or email" />
          <Btn variant="soft" icon="filter" onClick={() => setShowFilter(true)} aria-label="Filter" />
          <Btn variant="soft" icon="download" disabled={!rows.length} onClick={() => downloadCsv("customers.csv", ["Name", "Email", "Phone", "Mango", "Payment cycle", "Last transaction", "Expiry", "Status"], rows.map((c) => [c.name, c.email, c.phone, c.mango, c.cycle, c.lastTx, c.expires || "Lifetime", c.status]))} aria-label="Export" />
          <Btn variant="danger" className="ml-auto" disabled={!sel.length} onClick={() => setRevoke(rows.filter((c) => sel.includes(c.id) && c.status !== "Revoked"))}>Revoke access</Btn>
        </div>
        <div className="mt-3">
          <DataTable cols={cols} rows={rows} loading={loading} selectable selected={sel} onSelect={setSel} empty={<EmptySearch title="No customers found!" text="Your Subscriber stats and user info will appear here." />} />
        </div>
      </Panel>

      {add && (isLocked("add-customers", me.plan) ? (
        <Drawer title="Add customers" onClose={() => setAdd(false)}><LockedCard title="Add customers" /></Drawer>
      ) : (
        <FormDrawer
          title="Add customers"
          fields={[
            { key: "name", label: "Name", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "phone", label: "Phone (10 digits)" },
            { key: "mango", label: "Give access to mango", type: "select", options: mangoes, required: true },
            { key: "expires", label: "Access expires on (optional)", type: "date" },
          ]}
          submitLabel="Add customer"
          onClose={() => setAdd(false)}
          onSubmit={async (d) => {
            if (d.phone && !/^\d{10}$/.test(String(d.phone))) return "Phone must be 10 digits";
            const email = String(d.email).toLowerCase();
            if (list.some((c) => c.email === email && c.mango === d.mango && c.status === "Active")) return "This customer already has access to that mango";
            await manual.create({ ...d, email, expires: d.expires ? new Date(String(d.expires)).toISOString() : null });
            toast("Customer added");
          }}
        />
      ))}
      {revoke && (
        <Confirm
          title={`Revoke access for ${revoke.length} customer${revoke.length === 1 ? "" : "s"}?`}
          text="They'll lose access to the mango's content immediately. This shows as Revoked in your list."
          okLabel="Revoke access"
          onOk={async () => {
            for (const c of revoke) {
              if (c.rowId) await manual.update(c.rowId, { revoked: true });
              else await manual.create({ name: c.name, email: c.email, phone: c.phone, mango: c.mango, revoked: true });
            }
            setSel([]);
            toast("Access revoked");
          }}
          onClose={() => setRevoke(null)}
        />
      )}
      {showFilter && (
        <Modal title="Filter customers" onClose={() => setShowFilter(false)}>
          <div className="space-y-3">
            <Select className="w-full" value={filter.mango} onChange={(v) => setFilter((f) => ({ ...f, mango: v }))} options={["All mangoes", ...mangoes]} />
            <Select className="w-full" value={filter.status} onChange={(v) => setFilter((f) => ({ ...f, status: v }))} options={["All", "Active", "Expired", "Revoked"]} />
          </div>
          <div className="mt-5 flex justify-between"><Btn variant="outline" onClick={() => setFilter({ mango: "All mangoes", status: "All" })}>Reset</Btn><Btn onClick={() => setShowFilter(false)}>Apply</Btn></div>
        </Modal>
      )}
    </>
  );
}
