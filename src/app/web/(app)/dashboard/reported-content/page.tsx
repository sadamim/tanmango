"use client";
import { useMemo, useState } from "react";
import { fmtDateTime, toast, useCollection, type Row } from "@/lib/client";
import { Btn, DataTable, DateRange, EmptySearch, Panel, Search, Tabs, Title, type Col } from "@/components/dash/kit";
import { inRange } from "@/components/dash/hooks";

const KIND = { "Reported Post": "post", "Reported Comment": "comment", "Reported Message": "message" } as const;

export default function ReportedContent() {
  const col = useCollection("reports");
  const posts = useCollection("posts");
  const comments = useCollection("comments");
  const blocked = useCollection("blocked");
  const [tab, setTab] = useState<keyof typeof KIND>("Reported Post");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<[string, string]>(["", ""]);

  const rows = useMemo(() => col.rows.filter((r) => r.kind === KIND[tab] && !r.resolved).filter((r) => `${r.reporter} ${r.author}`.toLowerCase().includes(q.toLowerCase())).filter((r) => inRange(r.createdAt, range[0], range[1])), [col.rows, tab, q, range]);

  const cols: Col<Row>[] = [
    { key: "on", label: "Reported on", render: (r) => fmtDateTime(r.createdAt) },
    { key: "by", label: "Reported by", render: (r) => String(r.reporter) },
    { key: "c", label: tab, render: (r) => <p className="max-w-sm truncate">{String(r.content)}</p> },
    { key: "u", label: "User", render: (r) => String(r.author) },
    {
      key: "a",
      label: "Action",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <Btn variant="outline" className="h-8 px-3 text-[12px]" onClick={async () => { await col.update(r.id, { resolved: "dismissed" }); toast("Report dismissed"); }}>Dismiss</Btn>
          <Btn variant="danger" className="h-8 px-3 text-[12px]" onClick={async () => {
            if (r.kind === "post" && r.refId) await posts.remove(String(r.refId)).catch(() => {});
            if (r.kind === "comment" && r.refId) await comments.remove(String(r.refId)).catch(() => {});
            await col.update(r.id, { resolved: "removed" });
            toast("Content removed");
          }}>Remove content</Btn>
          {r.authorEmail ? <Btn variant="black" className="h-8 px-3 text-[12px]" onClick={async () => { if (!blocked.rows.some((b) => b.email === r.authorEmail)) await blocked.create({ name: r.author, email: r.authorEmail, reason: `Reported ${String(r.kind)}` }); await col.update(r.id, { resolved: "blocked" }); toast("User blocked"); }}>Block user</Btn> : null}
        </div>
      ),
    },
  ];

  return (
    <Panel className="p-5">
      <Title>Reported Content</Title>
      <div className="mt-3"><Tabs tabs={Object.keys(KIND) as (keyof typeof KIND)[]} value={tab} onChange={setTab} /></div>
      <div className="mt-4 flex flex-wrap gap-2"><Search value={q} onChange={setQ} placeholder="Search by name" /><DateRange from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} /></div>
      <div className="mt-3"><DataTable cols={cols} rows={rows} loading={col.loading} empty={<EmptySearch title="No reported items found" />} /></div>
    </Panel>
  );
}
