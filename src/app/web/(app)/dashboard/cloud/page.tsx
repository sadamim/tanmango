"use client";
import { useRef, useState } from "react";
import { fmtDateTime, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptySearch, Note, Panel, RowAction, Search, Select, Title, type Col } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";

const QUOTA = 20 * 1024 ** 3;
const size = (b: number) => (b > 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(2)} GB` : b > 1024 ** 2 ? `${(b / 1024 ** 2).toFixed(2)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default function Cloud() {
  const col = useCollection("cloud");
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("Type");
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(0);
  const [confirm, setConfirm] = useState<string[] | null>(null);

  const used = col.rows.reduce((a, r) => a + Number(r.size || 0), 0);
  const rows = col.rows.filter((r) => String(r.title).toLowerCase().includes(q.toLowerCase())).filter((r) => type === "Type" || r.kind === type);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(files.length);
    let ok = 0;
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/cloud", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) toast(`${f.name}: ${d.error || "upload failed"}`, "err");
      else ok++;
      setBusy((b) => b - 1);
    }
    if (ok) { toast(`${ok} file${ok > 1 ? "s" : ""} uploaded`); col.reload(); }
    if (input.current) input.current.value = "";
  }

  async function remove(ids: string[]) {
    for (const id of ids) await fetch(`/api/cloud/${id}`, { method: "DELETE" });
    setSel([]);
    col.reload();
    toast(`${ids.length} file${ids.length > 1 ? "s" : ""} deleted`);
  }

  const cols: Col<Row>[] = [
    { key: "t", label: "Title", render: (r) => <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-md bg-[#f2f2f2]"><Icon name={r.kind === "Video" ? "play" : r.kind === "Image" ? "eye" : "copy"} className="h-4 w-4" /></span><span className="max-w-[320px] truncate">{String(r.title)}</span></div>, sort: (a, b) => String(a.title).localeCompare(String(b.title)) },
    { key: "s", label: "File Size", render: (r) => size(Number(r.size)), sort: (a, b) => Number(a.size) - Number(b.size) },
    { key: "c", label: "Created On", render: (r) => fmtDateTime(r.createdAt), sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "r", label: "Last Restored On", render: () => "-" },
    { key: "a", label: "Actions", render: (r) => <div className="flex gap-1.5"><RowAction icon="eye" title="Open" href={`/api/cloud/${r.id}`} /><RowAction icon="link" title="Copy link" onClick={() => { navigator.clipboard?.writeText(`${location.origin}/api/cloud/${r.id}`); toast("Link copied (works while you're signed in)"); }} /><RowAction icon="trash" title="Delete" danger onClick={() => setConfirm([r.id])} /></div> },
  ];

  return (
    <Panel className="p-5">
      <Title right={<><input ref={input} type="file" multiple hidden onChange={(e) => upload(e.target.files)} /><Btn variant="black" icon="upload" disabled={busy > 0} onClick={() => input.current?.click()}>{busy ? `Uploading ${busy}…` : "Upload"}</Btn></>}>TagMango Cloud</Title>
      <div className="mt-4 w-fit min-w-[220px] rounded-[10px] border border-[#ededed] p-4">
        <p className="text-[12px] text-[#6b6b7b]">Total Used</p>
        <p className="text-[22px] font-semibold text-[#f2962c]">{size(used).replace(/ (\w+)$/, "$1")}<span className="text-[13px] font-normal text-[#6b6b7b]">of 20GB</span></p>
        <div className="mt-2 h-1.5 overflow-hidden rounded bg-[#f2f2f2]"><div className="h-full bg-[#f2962c]" style={{ width: `${Math.min(100, (used / QUOTA) * 100)}%` }} /></div>
      </div>
      <div className="mt-4"><Note tone="yellow"><b>Important:</b> Files uploaded here can only be used on this platform. Download is available exclusively on Ultimate Plan, so please keep a backup for other purposes.</Note></div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Search value={q} onChange={setQ} placeholder="Search by file name" />
        <Btn variant="soft" icon="refresh" onClick={() => col.reload()} aria-label="Refresh" />
        <Select value={type} onChange={setType} options={["Type", "Video", "Image", "Audio", "PDF", "Other"]} />
        <Btn variant="danger" disabled={!sel.length} onClick={() => setConfirm(sel)}>Delete</Btn>
      </div>
      <div className="mt-3"><DataTable cols={cols} rows={rows} loading={col.loading} selectable selected={sel} onSelect={setSel} empty={<EmptySearch title="No files yet" text="Upload videos, images and PDFs to use in your courses and pages (max 50 MB per file in this clone)." />} /></div>
      {confirm && <Confirm title={`Delete ${confirm.length} file${confirm.length > 1 ? "s" : ""}?`} text="Files are permanently deleted from TagMango Cloud." onOk={() => remove(confirm)} onClose={() => setConfirm(null)} />}
    </Panel>
  );
}
