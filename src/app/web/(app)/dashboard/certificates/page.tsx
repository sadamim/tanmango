"use client";
import { useState } from "react";
import { fmtDateTime, toast, useCollection, useMe, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptySearch, Modal, Panel, Pill, RowAction, Search, Title, Walkthrough, type Col } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";
import { useCustomers, useMangoTitles } from "@/components/dash/hooks";

const DESIGNS = [
  { id: "classic", name: "Classic", border: "#c9a24d", bg: "#fffdf6", ink: "#3b2f12" },
  { id: "modern", name: "Modern", border: "#f2962c", bg: "#ffffff", ink: "#0f0f0f" },
  { id: "navy", name: "Navy", border: "#1e3a8a", bg: "#f5f8ff", ink: "#1e293b" },
  { id: "dark", name: "Dark", border: "#f2962c", bg: "#111111", ink: "#ffffff" },
  { id: "mint", name: "Mint", border: "#10b981", bg: "#f0fdf8", ink: "#064e3b" },
  { id: "violet", name: "Violet", border: "#7c3aed", bg: "#faf5ff", ink: "#2e1065" },
  { id: "rose", name: "Rose", border: "#e11d48", bg: "#fff1f2", ink: "#4c0519" },
];
const design = (id: unknown) => DESIGNS.find((d) => d.id === id) || DESIGNS[0];

function Cert({ d, title, name, course, signer }: { d: (typeof DESIGNS)[number]; title: string; name: string; course: string; signer: string }) {
  return (
    <div className="aspect-[1.414/1] w-full p-[3%]" style={{ background: d.bg, color: d.ink }}>
      <div className="flex h-full flex-col items-center justify-center border-[3px] p-[4%] text-center" style={{ borderColor: d.border }}>
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">tagmango</p>
        <p className="mt-2 text-[clamp(12px,2.4vw,26px)] font-bold uppercase tracking-wide" style={{ color: d.border }}>{title || "Certificate of Completion"}</p>
        <p className="mt-2 text-[clamp(8px,1vw,12px)] opacity-70">This is proudly presented to</p>
        <p className="mt-1 font-serif text-[clamp(14px,3vw,34px)] italic">{name}</p>
        <p className="mt-2 text-[clamp(8px,1vw,12px)] opacity-80">for successfully completing <b>{course || "the program"}</b></p>
        <div className="mt-auto flex w-full items-end justify-between text-[clamp(7px,0.9vw,11px)] opacity-80">
          <span>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="border-t px-4 pt-1" style={{ borderColor: d.ink }}>{signer}</span>
        </div>
      </div>
    </div>
  );
}

export default function Certificates() {
  const { me } = useMe();
  const col = useCollection("certificates");
  const courses = useCollection("courses");
  const workshops = useCollection("workshops");
  const mangoes = useMangoTitles();
  const { list: customers } = useCustomers();
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<{ design: string; title?: string; course?: string } | null>(null);
  const [edit, setEdit] = useState<Row | { design: string } | null>(null);
  const [send, setSend] = useState<Row | null>(null);
  const [del, setDel] = useState<Row | null>(null);

  const recipients = (c: Row) => customers.filter((x) => x.status === "Active" && (!c.mango || x.mango === c.mango));
  const rows = col.rows.filter((c) => String(c.title).toLowerCase().includes(q.toLowerCase()));
  const cols: Col<Row>[] = [
    { key: "t", label: "Certificate", render: (r) => <div className="flex items-center gap-3"><div className="w-16 overflow-hidden rounded border border-[#ededed]"><Cert d={design(r.design)} title={String(r.title)} name="Name" course="" signer="" /></div><div><p className="font-medium">{String(r.title)}</p><p className="text-[12px] text-[#6b6b7b]">{String(r.forKind)}: {String(r.forRef || "Any")}</p></div></div> },
    { key: "s", label: "Status", render: (r) => <Pill tone={r.active ? "green" : "grey"}>{r.active ? "Active" : "Draft"}</Pill> },
    { key: "n", label: "Total Sent", render: (r) => String(((r.sentTo as string[]) || []).length) },
    { key: "time", label: "Time", render: (r) => fmtDateTime(String(r.lastSent || r.createdAt)) },
    { key: "a", label: "Action", render: (r) => <div className="flex gap-1.5"><Btn className="h-8 px-3 text-[13px]" onClick={() => setSend(r)}>Send</Btn><RowAction icon="eye" title="Preview" onClick={() => setPreview({ design: String(r.design), title: String(r.title), course: String(r.forRef || "") })} /><RowAction icon="edit" title="Edit" onClick={() => setEdit(r)} /><RowAction icon="trash" title="Delete" danger onClick={() => setDel(r)} /></div> },
  ];

  return (
    <>
      <Walkthrough title="Creating certificates" />
      <Panel className="p-5">
        <Title>Templates</Title>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {DESIGNS.map((d) => (
            <div key={d.id} className="group rounded-[10px] border border-[#ededed] p-2">
              <div className="overflow-hidden rounded"><Cert d={d} title="Certificate of Completion" name="John Doe" course="Course Name" signer={me.name} /></div>
              <div className="mt-2 flex gap-1.5"><Btn className="h-8 flex-1 px-2 text-[12px]" onClick={() => setEdit({ design: d.id })}>Select Design</Btn><Btn variant="outline" className="h-8 px-2 text-[12px]" onClick={() => setPreview({ design: d.id })}>Preview</Btn></div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="mt-5 p-5" delay={0.06}>
        <Title>Certificates</Title>
        <div className="mt-4 flex"><Search value={q} onChange={setQ} placeholder="Search by certificate title" /></div>
        <div className="mt-3"><DataTable cols={cols} rows={rows} loading={col.loading} empty={<EmptySearch title="Create your first certificate!" text="Reward your customers for attending workshops or completing courses!" />} /></div>
      </Panel>

      {preview && (
        <Modal title="Certificate preview" onClose={() => setPreview(null)} wide>
          <div id="cert-print" className="overflow-hidden rounded border border-[#ededed]"><Cert d={design(preview.design)} title={preview.title || "Certificate of Completion"} name="John Doe" course={preview.course || "Course Name"} signer={me.name} /></div>
          <div className="mt-4 flex justify-end"><Btn variant="outline" icon="download" onClick={() => window.print()}>Print / Save as PDF</Btn></div>
        </Modal>
      )}
      {edit && (
        <FormDrawer
          title={"id" in edit ? "Edit certificate" : "Create certificate"}
          intro={<div className="overflow-hidden rounded border border-[#ededed]"><Cert d={design(edit.design)} title={"title" in edit ? String(edit.title) : "Certificate of Completion"} name="John Doe" course="Course Name" signer={me.name} /></div>}
          fields={[
            { key: "title", label: "Certificate title", required: true, maxLength: 60 },
            { key: "design", label: "Design", type: "select", options: DESIGNS.map((d) => d.id), required: true },
            { key: "forKind", label: "Issued for", type: "select", options: ["Course completion", "Workshop attendance", "Mango purchase"], required: true },
            { key: "forRef", label: "Which one", type: "select", options: [...courses.rows.map((c) => String(c.title)), ...workshops.rows.map((w) => String(w.title))] },
            { key: "mango", label: "Send to customers of", type: "select", options: mangoes, hint: "Leave empty to send to all active customers" },
            { key: "signer", label: "Signed by", required: true },
            { key: "active", label: "Active", type: "toggle" },
          ]}
          initial={{ title: "Certificate of Completion", forKind: "Course completion", signer: me.name, active: true, ...edit }}
          submitLabel="Save"
          onClose={() => setEdit(null)}
          onSubmit={async (d) => { if ("id" in edit) await col.update(edit.id as string, d); else await col.create({ ...d, sentTo: [] }); toast("Certificate saved"); }}
        />
      )}
      {send && (
        <Confirm
          title="Send certificate?"
          danger={false}
          okLabel={`Send to ${recipients(send).length}`}
          text={recipients(send).length ? <>Issues “{String(send.title)}” to {recipients(send).length} active customer(s){send.mango ? ` of ${String(send.mango)}` : ""}. Customers who already received it are skipped.</> : "There are no active customers in this audience yet."}
          onOk={async () => {
            const already = new Set((send.sentTo as string[]) || []);
            const fresh = recipients(send).map((c) => c.email).filter((e) => !already.has(e));
            if (!fresh.length) return toast("Everyone in this audience already has it");
            await col.update(send.id, { sentTo: [...already, ...fresh], lastSent: new Date().toISOString() });
            toast(`Certificate issued to ${fresh.length} customer(s)`);
          }}
          onClose={() => setSend(null)}
        />
      )}
      {del && <Confirm title="Delete certificate?" text="Already-issued certificates are not revoked." onOk={async () => { await col.remove(del.id); toast("Certificate deleted"); }} onClose={() => setDel(null)} />}
    </>
  );
}
