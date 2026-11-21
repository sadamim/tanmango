"use client";
import { useMemo, useState } from "react";
import { downloadCsv, fmtDate, fmtDateTime, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptySearch, Panel, Pill, RowAction, Search, Tabs, Title, type Col } from "@/components/dash/kit";

export default function Bookings() {
  const col = useCollection("bookings");
  const [tab, setTab] = useState<"Upcoming" | "Previous">("Upcoming");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<string[] | null>(null);

  const rows = useMemo(() => {
    const now = Date.now();
    return col.rows
      .filter((b) => (tab === "Upcoming" ? new Date(String(b.slot)).getTime() >= now && b.status !== "Cancelled" : new Date(String(b.slot)).getTime() < now || b.status === "Cancelled"))
      .filter((b) => `${b.name} ${b.email} ${b.phone}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => String(a.slot).localeCompare(String(b.slot)));
  }, [col.rows, tab, q]);

  const cols: Col<Row>[] = [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{String(r.name)}</span> },
    { key: "contact", label: "Contact", render: (r) => <div className="text-[13px]"><p>{String(r.email)}</p>{r.phone ? <p className="text-[#6b6b7b]">+91 {String(r.phone)}</p> : null}</div> },
    { key: "event", label: "Event" },
    { key: "date", label: "Booking Date", render: (r) => fmtDate(r.createdAt), sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "slot", label: "Booked Slot", render: (r) => <div>{fmtDateTime(String(r.slot))}{r.status === "Cancelled" && <span className="ml-2"><Pill tone="red">Cancelled</Pill></span>}</div>, sort: (a, b) => String(a.slot).localeCompare(String(b.slot)) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-1.5">
          {r.link && r.status !== "Cancelled" ? <RowAction icon="link" title="Open call link" href={String(r.link)} /> : null}
          {r.status !== "Cancelled" && tab === "Upcoming" && <RowAction icon="close" title="Cancel booking" danger onClick={() => setConfirm([r.id])} />}
        </div>
      ),
    },
  ];

  return (
    <Panel className="p-5">
      <Title>Bookings</Title>
      <div className="mt-3"><Tabs tabs={["Upcoming", "Previous"]} value={tab} onChange={(t) => { setTab(t); setSel([]); }} /></div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Search value={q} onChange={setQ} placeholder="Search by name, phone or email" />
        <Btn variant="black" icon="refresh" onClick={() => col.reload()} aria-label="Refresh" />
        <Btn variant="outline" icon="download" disabled={!rows.length} onClick={() => downloadCsv(`bookings-${tab.toLowerCase()}.csv`, ["Name", "Email", "Phone", "Event", "Booking date", "Slot", "Status"], rows.map((r) => [String(r.name), String(r.email), String(r.phone || ""), String(r.event), r.createdAt, String(r.slot), String(r.status)]))}>Export CSV</Btn>
        <Btn variant="danger" disabled={!sel.length || tab !== "Upcoming"} onClick={() => setConfirm(sel)}>Cancel bookings</Btn>
      </div>
      <div className="mt-3">
        <DataTable cols={cols} rows={rows} loading={col.loading} selectable={tab === "Upcoming"} selected={sel} onSelect={setSel} empty={<EmptySearch title="No bookings found" text="Share your event's booking link (Products › 1-1 Consultation › Events) to get bookings." />} />
      </div>
      {confirm && (
        <Confirm
          title={`Cancel ${confirm.length} booking${confirm.length > 1 ? "s" : ""}?`}
          text="Customers lose these slots and they open up again for others."
          okLabel="Cancel bookings"
          onOk={async () => {
            for (const id of confirm) await col.update(id, { status: "Cancelled" });
            setSel([]);
            toast("Bookings cancelled");
          }}
          onClose={() => setConfirm(null)}
        />
      )}
    </Panel>
  );
}
