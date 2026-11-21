"use client";
import { useMemo, useState } from "react";
import { downloadCsv, fmtDateTime, toast, useCollection, type Row } from "@/lib/client";
import { Btn, DataTable, DateRange, EmptySearch, Panel, RowAction, Search, Select, Tabs, Title, Walkthrough, type Col } from "@/components/dash/kit";
import { inRange, useMangoTitles } from "@/components/dash/hooks";

export default function Leads() {
  const col = useCollection("leads");
  const mangoes = useMangoTitles();
  const [tab, setTab] = useState<"Form Responses" | "Drop-Offs">("Form Responses");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<[string, string]>(["", ""]);
  const [mango, setMango] = useState("All mangoes");

  const rows = useMemo(
    () =>
      col.rows
        .filter((l) => (tab === "Form Responses" ? l.type === "form" : l.type === "dropoff"))
        .filter((l) => `${l.name} ${l.email} ${l.phone}`.toLowerCase().includes(q.toLowerCase()))
        .filter((l) => inRange(l.createdAt, range[0], range[1]))
        .filter((l) => mango === "All mangoes" || l.mango === mango),
    [col.rows, tab, q, range, mango]
  );

  const cols: Col<Row>[] = [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{String(r.name)}</span> },
    { key: "contact", label: "Contact", render: (r) => <div className="text-[13px]"><p>{String(r.email)}</p>{r.phone ? <p className="text-[#6b6b7b]">+91 {String(r.phone)}</p> : null}</div> },
    { key: "mango", label: "Mango" },
    { key: "page", label: "Page Title", render: (r) => String(r.pageTitle || "-") },
    { key: "on", label: "Submitted On", render: (r) => fmtDateTime(r.createdAt), sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "a", label: "Action", render: (r) => <div className="flex gap-1.5"><RowAction icon="messages" title="Email this lead" href={`mailto:${r.email}`} /><RowAction icon="trash" title="Delete lead" danger onClick={async () => { await col.remove(r.id); toast("Lead deleted"); }} /></div> },
  ];

  return (
    <>
      <Walkthrough title="Collected leads" />
      <Panel className="p-5">
        <Title>Collected Leads</Title>
        <div className="mt-3"><Tabs tabs={["Form Responses", "Drop-Offs"]} value={tab} onChange={setTab} /></div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Search value={q} onChange={setQ} placeholder="Search by name, phone or email" />
          <DateRange from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />
          <Select value={mango} onChange={setMango} options={["All mangoes", ...mangoes]} />
          <Btn variant="outline" icon="download" disabled={!rows.length} onClick={() => downloadCsv(`leads-${tab === "Drop-Offs" ? "dropoffs" : "responses"}.csv`, ["Name", "Email", "Phone", "Mango", "Page", "Submitted on"], rows.map((r) => [String(r.name), String(r.email), String(r.phone || ""), String(r.mango), String(r.pageTitle || ""), r.createdAt]))}>Export</Btn>
        </div>
        <div className="mt-3">
          <DataTable cols={cols} rows={rows} loading={col.loading} empty={<EmptySearch title="No Leads found" text={tab === "Form Responses" ? "Looks like there are no responses yet to your leads form!" : "Buyers who enter their details at checkout but don't pay show up here."} />} />
        </div>
      </Panel>
    </>
  );
}
