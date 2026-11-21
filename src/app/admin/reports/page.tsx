"use client";
import { useMemo, useState } from "react";
import { toast } from "@/lib/client";
import { adminAct, useAdminData } from "@/lib/adminClient";
import type { AReport } from "@/lib/adminTypes";
import { Btn, Confirm, DataTable, EmptySearch, Panel, Pill, Search, Tabs, type Col } from "@/components/dash/kit";
import { ErrorBox, PageHead, when } from "@/components/admin/ui";

type Tab = "Open" | "Resolved" | "All";

export default function Reports() {
  const { data, loading, error, reload } = useAdminData<{ reports: AReport[] }>("/api/admin/reports");
  const [tab, setTab] = useState<Tab>("Open");
  const [q, setQ] = useState("");
  const [rm, setRm] = useState<AReport | null>(null);

  const rows = useMemo(() => (data?.reports || []).filter((r) => (tab === "All" ? true : tab === "Open" ? !r.resolved : Boolean(r.resolved))).filter((r) => `${r.reporter} ${r.author} ${r.creator} ${r.content}`.toLowerCase().includes(q.toLowerCase())), [data, tab, q]);
  const open = (data?.reports || []).filter((r) => !r.resolved).length;

  async function resolve(r: AReport, action: "dismiss" | "remove") {
    try {
      await adminAct("PATCH", `/api/admin/reports/${r.id}`, { action });
      toast(action === "remove" ? "Content removed" : "Report dismissed");
    } catch (e) {
      toast((e as Error).message, "err");
      throw e;
    }
  }

  const cols: Col<AReport>[] = [
    { key: "d", label: "Reported", render: (r) => <span className="whitespace-nowrap">{when(r.createdAt)}</span>, sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "k", label: "Type", render: (r) => <Pill tone="blue">{r.kind}</Pill> },
    { key: "c", label: "Content", render: (r) => <p className="max-w-md text-[13px] leading-snug">{r.content || "—"}</p> },
    { key: "by", label: "Reported by", render: (r) => r.reporter },
    { key: "u", label: "Author", render: (r) => r.author },
    { key: "cr", label: "Community of", render: (r) => r.creator },
    {
      key: "a",
      label: "Action",
      render: (r) =>
        r.resolved ? <Pill tone={r.resolved === "removed" ? "red" : "grey"}>{r.resolved}</Pill> : (
          <div className="flex gap-1.5">
            <Btn variant="outline" className="h-8 px-3 text-[12px]" onClick={() => resolve(r, "dismiss").catch(() => {})}>Dismiss</Btn>
            <Btn variant="danger" className="h-8 px-3 text-[12px]" onClick={() => setRm(r)}>Remove</Btn>
          </div>
        ),
    },
  ];

  if (error && !data) return <ErrorBox message={error} retry={reload} />;

  return (
    <>
      <PageHead title="Content reports" sub="Posts, comments and messages that people reported in creators' communities." />
      <Panel className="p-5">
        <Tabs tabs={["Open", "Resolved", "All"]} value={tab} onChange={setTab} />
        <p className="mt-2 text-[12px] text-[#6b6b7b]">{open} open report{open === 1 ? "" : "s"}</p>
        <div className="mt-3 flex"><Search value={q} onChange={setQ} placeholder="Search reporter, author, creator or content" /></div>
        <div className="mt-3"><DataTable cols={cols} rows={rows} loading={loading} empty={<EmptySearch title={tab === "Open" ? "No open reports" : "No reports"} text="Nice and quiet." />} /></div>
      </Panel>
      {rm && <Confirm title="Remove this content?" text={<>The {rm.kind} will be deleted from {rm.creator}&apos;s community and they&apos;ll be notified.<p className="mt-2 rounded bg-[#f7f7f8] p-2 text-[13px]">{rm.content}</p></>} okLabel="Remove content" onOk={() => resolve(rm, "remove")} onClose={() => setRm(null)} />}
    </>
  );
}
