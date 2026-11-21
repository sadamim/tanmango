"use client";
import { useEffect, useMemo, useState } from "react";
import { api, downloadCsv, fmtDateTime, toast, useCollection, type Row } from "@/lib/client";
import { Btn, DataTable, Drawer, Panel, Pill, Search, Select, Title, inputCls, areaCls, type Col } from "@/components/dash/kit";
import { Bar, PATTERN_COLORS, useGrowthDoc } from "@/components/growth/shared";
import { GROUPS, STEPS, stageOf, type Lead } from "@/lib/growth/model";

const STAGE_LABEL = Object.fromEntries(STEPS.map((s) => [s.key, s.label.replace(/^\d · /, "")]));
const MILESTONE_LABEL: Record<string, string> = {
  half: "Started a form", captured: "Captured", pattern: "Pattern Check done", mcRegistered: "Registered for masterclass", mcAttended: "Attended masterclass", mcMissed: "Missed masterclass", replay: "Watched replay",
  callBooked: "Booked a call", callAttended: "Attended the call", callNoShow: "Call no-show", callDone: "Call done", enrolStarted: "Started enrolling", paid: "Paid", declined: "Said no", missedClass: "Missed a class", completed: "Completed", testimonial: "Gave a testimonial",
};

type Detail = { lead: Lead; masterclass: Row | null; messages: Row[]; runs: Row[] };

function CallCard({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const { g } = useGrowthDoc();
  const [notes, setNotes] = useState("");
  const load = () => api<Detail>(`/api/growth?q=lead&id=${id}`).then((x) => { setD(x); setNotes(String(x.lead.notes || "")); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);
  const act = async (what: string, label: string) => {
    await api("/api/growth", "POST", { action: "lead-action", leadId: id, what });
    toast(label);
    await load();
    onChanged();
  };
  if (!d) return <Drawer title="Call card" onClose={onClose}><div className="h-32 animate-pulse rounded bg-[#f3f3f3]" /></Drawer>;
  const l = d.lead;
  const patterns = g?.quiz?.patterns || [];
  const pr = l.pattern;
  const name = (pid?: string) => patterns.find((p) => p.id === pid)?.name || pid || "";
  const m = l.m || {};

  return (
    <Drawer title="Call card" onClose={onClose} width="max-w-[720px]">
      <div className="space-y-5 text-[14px]">
        <div>
          <p className="text-[20px] font-semibold">{l.name}</p>
          <p className="text-[#4a4a59]">{l.email}{l.phone ? ` · +91 ${l.phone}` : ""}{l.whatsappOptIn ? " · WhatsApp opted in" : ""}</p>
          <p className="mt-1 text-[12.5px] text-[#6b6b7b]">Source: {l.source || "direct"} · Stage: {STAGE_LABEL[stageOf(l)]} · Added {fmtDateTime(l.createdAt)}</p>
          {l.callAt && <p className="mt-1 text-[13px]"><b>Call:</b> {fmtDateTime(l.callAt)}{l.callLink ? <> · <a className="text-[#1677ff] underline" href={l.callLink} target="_blank" rel="noreferrer">join link</a></> : null}</p>}
          {d.masterclass && <p className="text-[13px]"><b>Masterclass:</b> {String(d.masterclass.title)}{l.seat ? ` · seat #${l.seat}` : ""} · attended: {m.mcAttended ? "yes" : "no"}</p>}
        </div>

        {pr ? (
          <div className="rounded-lg border border-[#ededed] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">Pattern Check</p>
              <Pill tone="orange">{pr.type}</Pill>
              {pr.flag && <Pill tone={pr.flag === "low" ? "grey" : "red"}>{pr.flag === "low" ? "Low across all 4: gentler call" : "High across all 4: gentler call"}</Pill>}
            </div>
            <p className="mt-1 text-[13px] text-[#4a4a59]">Primary: <b>{name(pr.primary)}</b>{pr.secondary ? <> · Second: <b>{name(pr.secondary)}</b></> : null}{pr.third ? <> · Third: <b>{name(pr.third)}</b></> : null}</p>
            <div className="mt-3 space-y-4">
              {patterns.map((p, i) => (
                <div key={p.id}>
                  <div className="flex justify-between text-[13px]"><span className={p.id === pr.primary ? "font-semibold" : ""}>{p.name}</span><b>{pr.pct[p.id] ?? 0}%</b></div>
                  <Bar pct={pr.pct[p.id] ?? 0} tone={PATTERN_COLORS[i % 8]} />
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[13px] text-[#4a4a59]">
                    {(pr.picked[p.id] || []).map((bid) => <li key={bid}>{p.bullets.find((b) => b.id === bid)?.text || bid}</li>)}
                    {!(pr.picked[p.id] || []).length && <li className="list-none text-[#9b9bab]">Nothing picked</li>}
                  </ul>
                </div>
              ))}
            </div>
            {pr.retest && <p className="mt-3 rounded bg-[#e6f4ff] px-3 py-2 text-[13px]">Retest ({fmtDateTime(pr.retest.at)}): {patterns.map((p) => `${p.name} ${pr.retest!.pct[p.id] ?? 0}%`).join(" · ")}</p>}
          </div>
        ) : <p className="rounded-lg border border-dashed border-[#d9d9d9] p-4 text-[13px] text-[#6b6b7b]">No Pattern Check yet.</p>}

        <div className="flex flex-wrap gap-2">
          <Btn variant="outline" onClick={() => act("callAttended", "Marked as attended")}>Call attended</Btn>
          <Btn variant="outline" onClick={() => act("callNoShow", "Marked no-show, reschedule message queued")}>No-show</Btn>
          <Btn variant="outline" onClick={() => act("callDone", "Marked call done, follow-ups started")}>Call done (start follow-ups)</Btn>
          <Btn variant="outline" onClick={() => act("declined", "Marked as said no")}>Said no</Btn>
          <Btn variant="black" disabled={!!m.paid} onClick={() => act("paid", "Marked as paid and portal access opened")}>Mark paid / enrolled</Btn>
        </div>

        <div>
          <p className="mb-1.5 text-[13px] font-medium">Call notes</p>
          <textarea className={`${areaCls} min-h-24`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Private notes for you and your team" />
          <div className="mt-2"><Btn onClick={async () => { await api(`/api/data/crm/${id}`, "PATCH", { notes }); toast("Notes saved"); }}>Save notes</Btn></div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium">Journey</p>
          <ol className="space-y-1.5 border-l-2 border-[#f0f0f0] pl-4 text-[13px]">
            {[...(l.events || [])].reverse().map((e, i) => <li key={i}><span className="text-[#6b6b7b]">{fmtDateTime(e.at)}</span> · {MILESTONE_LABEL[e.type] || e.type}{e.detail ? ` (${e.detail})` : ""}</li>)}
          </ol>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium">Messages sent</p>
          {d.messages.length ? (
            <table className="w-full text-[12.5px]">
              <thead><tr className="text-left text-[#6b6b7b]"><th className="pb-1 font-medium">When</th><th className="font-medium">Channel</th><th className="font-medium">Subject</th><th className="font-medium">Status</th></tr></thead>
              <tbody>{d.messages.map((x) => <tr key={x.id} className="border-t border-[#f0f0f0]"><td className="py-1.5">{fmtDateTime(String(x.createdAt))}</td><td>{String(x.channel)}</td><td className="max-w-[220px] truncate">{String(x.subject || "")}</td><td>{x.actedAt ? "acted" : x.clickedAt ? "clicked" : x.openedAt ? "opened" : x.sentAt ? "sent" : "failed"}</td></tr>)}</tbody>
            </table>
          ) : <p className="text-[13px] text-[#6b6b7b]">No automatic messages yet.</p>}
        </div>
      </div>
    </Drawer>
  );
}

export default function GrowthLeads() {
  const col = useCollection("crm");
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { const g = new URLSearchParams(window.location.search).get("group"); if (g) setGroup(g); }, []);

  const rows = useMemo(() => {
    const t = GROUPS.find((x) => x.key === group);
    return col.rows
      .filter((r) => `${r.name} ${r.email} ${r.phone}`.toLowerCase().includes(q.toLowerCase()))
      .filter((r) => !t || t.test((r.m as Lead["m"]) || {}));
  }, [col.rows, q, group]);

  const cols: Col<Row>[] = [
    { key: "name", label: "Name", render: (r) => <button className="text-left font-medium hover:text-[#f2962c]" onClick={() => setOpen(r.id)}>{String(r.name)}</button>, sort: (a, b) => String(a.name).localeCompare(String(b.name)) },
    { key: "contact", label: "Contact", render: (r) => <div className="text-[13px]"><p>{String(r.email)}</p>{r.phone ? <p className="text-[#6b6b7b]">+91 {String(r.phone)}</p> : null}</div> },
    { key: "stage", label: "Stage", render: (r) => <Pill tone={stageOf(r as unknown as Lead) === "programme" ? "green" : "orange"}>{STAGE_LABEL[stageOf(r as unknown as Lead)]}</Pill> },
    { key: "pattern", label: "Pattern", render: (r) => { const p = (r as unknown as Lead).pattern; return p ? <span className="text-[13px]">{p.type}</span> : <span className="text-[#9b9bab]">—</span>; } },
    { key: "source", label: "Source", render: (r) => String(r.source || "direct") },
    { key: "on", label: "Added", render: (r) => fmtDateTime(r.createdAt), sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
  ];

  return (
    <>
      <Panel className="p-5">
        <Title sub="One record per person, from first click to completion. Only you and your named team members can open these.">Leads & CRM</Title>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Search value={q} onChange={setQ} placeholder="Search by name, phone or email" />
          <Select value={group} onChange={setGroup} options={[["all", "All leads"], ...GROUPS.map((g) => [g.key, g.label] as [string, string])]} />
          <Btn variant="outline" icon="download" disabled={!rows.length} onClick={() => downloadCsv("leads.csv", ["Name", "Email", "Phone", "Stage", "Source", "Pattern", "Primary", "Added"], rows.map((r) => { const l = r as unknown as Lead; return [l.name, l.email, l.phone, STAGE_LABEL[stageOf(l)], l.source, l.pattern?.type, l.pattern?.primary, l.createdAt]; }))}>Export</Btn>
        </div>
        <div className="mt-3"><DataTable cols={cols} rows={rows} loading={col.loading} empty={<p className="py-10 text-center text-[#6b6b7b]">No leads here yet.</p>} /></div>
      </Panel>
      {open && <CallCard id={open} onClose={() => setOpen(null)} onChanged={col.reload} />}
    </>
  );
}
void inputCls;
