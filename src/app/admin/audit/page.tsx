"use client";
import { useMemo, useState } from "react";
import { downloadCsv } from "@/lib/client";
import { useAdminData } from "@/lib/adminClient";
import type { AAudit } from "@/lib/adminTypes";
import { Btn, DataTable, EmptySearch, Panel, Search, Select, type Col } from "@/components/dash/kit";
import { ErrorBox, PageHead, when } from "@/components/admin/ui";

const TONE = (a: string) => (/delete|reject|suspend|refund|remove|revoke/.test(a) ? "bg-[#fff2f0] text-[#cf1322]" : /paid|reinstat|restore|send|verified/.test(a) ? "bg-[#e9f9ee] text-[#166534]" : "bg-[#f2f2f2] text-[#4a4a59]");

export default function Audit() {
  const { data, loading, error, reload } = useAdminData<{ entries: AAudit[] }>("/api/admin/audit");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("All actions");
  const kinds = useMemo(() => ["All actions", ...new Set((data?.entries || []).map((e) => e.action.split(".")[0]))], [data]);
  const rows = useMemo(() => (data?.entries || []).filter((e) => `${e.admin} ${e.action} ${e.target} ${e.detail}`.toLowerCase().includes(q.toLowerCase())).filter((e) => kind === "All actions" || e.action.startsWith(kind + ".")), [data, q, kind]);

  const cols: Col<AAudit>[] = [
    { key: "t", label: "When", render: (e) => <span className="whitespace-nowrap">{when(e.createdAt)}</span>, sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "ad", label: "Admin", render: (e) => e.admin },
    { key: "ac", label: "Action", render: (e) => <span className={`rounded px-2 py-0.5 font-mono text-[12px] ${TONE(e.action)}`}>{e.action}</span> },
    { key: "tg", label: "Target", render: (e) => <span className="font-medium">{e.target}</span> },
    { key: "d", label: "Details", render: (e) => <span className="text-[13px] text-[#4a4a59]">{e.detail || "—"}</span> },
  ];

  if (error && !data) return <ErrorBox message={error} retry={reload} />;

  return (
    <>
      <PageHead title="Audit log" sub="Every admin action, newest first. Entries can't be edited or deleted from the panel." right={<Btn variant="outline" icon="download" disabled={!rows.length} onClick={() => downloadCsv("audit-log.csv", ["When", "Admin", "Action", "Target", "Details"], rows.map((e) => [e.createdAt, e.admin, e.action, e.target, e.detail]))}>Export CSV</Btn>} />
      <Panel className="p-5">
        <div className="flex flex-wrap items-center gap-2"><Search value={q} onChange={setQ} placeholder="Search admin, action, target or details" /><Select value={kind} onChange={setKind} options={kinds} /></div>
        <div className="mt-3"><DataTable cols={cols} rows={rows} loading={loading} pageSize={15} empty={<EmptySearch title="No admin actions yet" text="Changes you make in this panel are recorded here." />} /></div>
      </Panel>
    </>
  );
}
