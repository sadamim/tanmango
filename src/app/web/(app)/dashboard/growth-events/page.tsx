"use client";
import { useState } from "react";
import { api, copy, fmtDateTime, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, Modal, Panel, Pill, Title, inputCls, type Col } from "@/components/dash/kit";
import { FormDrawer, type FieldDef } from "@/components/dash/forms";
import { Section, origin, useGrowthDoc } from "@/components/growth/shared";
import type { Lead } from "@/lib/growth/model";

const MC_FIELDS: FieldDef[] = [
  { key: "title", label: "Title", required: true, placeholder: "Free masterclass: Spot your pattern" },
  { key: "startsAt", label: "Starts", type: "datetime-local", required: true },
  { key: "duration", label: "Length (minutes)", type: "number", min: 15, placeholder: "120" },
  { key: "seats", label: "Numbered seats", type: "number", min: 1, placeholder: "50", hint: "Each person gets a seat number. Leave blank for unlimited." },
  { key: "joinLink", label: "Live class link", type: "url", hint: "Leave empty to get a built-in video room automatically (when Metered is set up)." },
  { key: "replayUrl", label: "Replay link (private Vimeo / Bunny Stream)", type: "url", hint: "Never use YouTube unlisted for recordings of paying learners." },
  { key: "description", label: "Short description", type: "textarea" },
  { key: "published", label: "Open for registration", type: "toggle" },
];
const toLocal = (iso?: unknown) => (iso ? new Date(String(iso)).toISOString().slice(0, 16) : "");

function Attendance({ mc, onClose }: { mc: Row; onClose: () => void }) {
  const crm = useCollection("crm");
  const regs = crm.rows.filter((r) => r.masterclassId === mc.id);
  const [on, setOn] = useState<string[] | null>(null);
  const sel = on ?? regs.filter((r) => (r.m as Lead["m"])?.mcAttended).map((r) => r.id);
  return (
    <Modal title={`Attendance: ${mc.title}`} onClose={onClose} wide>
      <p className="mb-3 text-[13px] text-[#4a4a59]">Tick who attended. Attendees get the thank-you, replay and booking link. Everyone else registered gets the replay and next date.</p>
      <div className="max-h-[50vh] overflow-y-auto rounded border border-[#ededed]">
        {regs.length ? regs.sort((a, b) => Number(a.seat) - Number(b.seat)).map((r) => (
          <label key={r.id} className="flex items-center gap-3 border-b border-[#f3f3f3] px-3 py-2 text-[14px] last:border-0">
            <input type="checkbox" className="h-4 w-4 accent-[#f2962c]" checked={sel.includes(r.id)} onChange={(e) => setOn(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} />
            <span className="w-10 text-[#6b6b7b]">#{String(r.seat)}</span><span className="flex-1">{String(r.name)}</span><span className="text-[12.5px] text-[#6b6b7b]">{String(r.email)}</span>
          </label>
        )) : <p className="p-6 text-center text-[#6b6b7b]">Nobody has registered yet.</p>}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!regs.length} onClick={async () => { const r = await api<{ attended: number; missed: number }>("/api/growth", "POST", { action: "mc-attendance", masterclassId: mc.id, attended: sel }); toast(`${r.attended} attended, ${r.missed} missed. Follow-ups started.`); crm.reload(); onClose(); }}>Save attendance</Btn>
      </div>
    </Modal>
  );
}

export default function GrowthEvents() {
  const { g, ready } = useGrowthDoc();
  const mcs = useCollection("masterclasses");
  const slots = useCollection("slots");
  const crm = useCollection("crm");
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [att, setAtt] = useState<Row | null>(null);
  const [del, setDel] = useState<{ coll: "masterclasses" | "slots"; row: Row } | null>(null);
  const [bulk, setBulk] = useState({ date: "", times: "10:00, 11:00, 12:00", duration: "30", link: "" });

  if (!ready) return <div className="h-40 animate-pulse rounded-lg bg-white" />;
  const base = origin();
  const mcCols: Col<Row>[] = [
    { key: "title", label: "Masterclass", render: (r) => <div><p className="font-medium">{String(r.title)}</p><p className="text-[12.5px] text-[#6b6b7b]">{fmtDateTime(String(r.startsAt))}</p></div> },
    { key: "seats", label: "Seats", render: (r) => `${crm.rows.filter((c) => c.masterclassId === r.id).length}${r.seats ? ` / ${r.seats}` : ""}` },
    { key: "att", label: "Attended", render: (r) => crm.rows.filter((c) => c.masterclassId === r.id && (c.m as Lead["m"])?.mcAttended).length },
    { key: "st", label: "Status", render: (r) => (r.published === false ? <Pill tone="grey">Closed</Pill> : <Pill>Open</Pill>) },
    { key: "a", label: "Actions", render: (r) => <div className="flex gap-1.5"><Btn variant="outline" className="!h-8 !px-3 text-[13px]" onClick={() => setAtt(r)}>Attendance</Btn><Btn variant="outline" className="!h-8 !px-3 text-[13px]" onClick={() => setEdit(r)}>Edit</Btn><Btn variant="danger" className="!h-8 !px-3 text-[13px]" onClick={() => setDel({ coll: "masterclasses", row: r })}>Delete</Btn></div> },
  ];
  const slotCols: Col<Row>[] = [
    { key: "t", label: "Time", render: (r) => fmtDateTime(String(r.startsAt)), sort: (a, b) => String(a.startsAt).localeCompare(String(b.startsAt)) },
    { key: "who", label: "Booked by", render: (r) => { const l = crm.rows.find((c) => c.id === r.leadId); return l ? String(l.name) : <span className="text-[#9b9bab]">Open</span>; } },
    { key: "a", label: "", render: (r) => <Btn variant="danger" className="!h-8 !px-3 text-[13px]" disabled={!!r.leadId} onClick={() => setDel({ coll: "slots", row: r })}>Remove</Btn> },
  ];

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <Title sub="Registration page, numbered seats, confirmation and reminders, all on the same lead record." right={<><Btn variant="outline" onClick={async () => { try { const r = await api<{ link: string }>("/api/video/room", "POST", {}); copy(r.link, "Video room link"); } catch (e) { toast((e as Error).message, "err"); } }}>Create a video room</Btn><Btn onClick={() => setEdit("new")}>+ New masterclass</Btn></>}>Free masterclass</Title>
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-[#f7f7f8] px-3 py-2 text-[13px]"><span className="font-medium">Registration page:</span><code>{base}/m/{g!.slug}</code><Btn variant="outline" className="!h-7 !px-2 text-[12px]" onClick={() => copy(`${base}/m/${g!.slug}`)}>Copy</Btn></div>
        <div className="mt-3"><DataTable cols={mcCols} rows={mcs.rows} loading={mcs.loading} empty={<p className="py-8 text-center text-[#6b6b7b]">No masterclass yet.</p>} /></div>
      </Panel>

      <Section title="Discovery conversation slots" sub="People pick a time on your booking page; it joins their record. Reminders go 24 hours and 2 hours before.">
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md bg-[#f7f7f8] px-3 py-2 text-[13px]"><span className="font-medium">Booking page:</span><code>{base}/call/{g!.slug}</code><Btn variant="outline" className="!h-7 !px-2 text-[12px]" onClick={() => copy(`${base}/call/${g!.slug}`)}>Copy</Btn></div>
        <div className="grid items-end gap-3 sm:grid-cols-5">
          <label className="text-[13px]">Date<input type="date" className={inputCls} value={bulk.date} onChange={(e) => setBulk({ ...bulk, date: e.target.value })} /></label>
          <label className="text-[13px] sm:col-span-2">Times (comma separated, 24h)<input className={inputCls} value={bulk.times} onChange={(e) => setBulk({ ...bulk, times: e.target.value })} /></label>
          <label className="text-[13px]">Meeting link<input className={inputCls} placeholder="Empty = built-in video room" value={bulk.link} onChange={(e) => setBulk({ ...bulk, link: e.target.value })} /></label>
          <Btn onClick={async () => {
            if (!bulk.date) return toast("Pick a date", "err");
            let n = 0;
            for (const t of bulk.times.split(",").map((x) => x.trim()).filter(Boolean)) {
              if (!/^\d{1,2}:\d{2}$/.test(t)) { toast(`“${t}” is not a time like 10:30`, "err"); continue; }
              try { await slots.create({ startsAt: new Date(`${bulk.date}T${t.padStart(5, "0")}`).toISOString(), duration: Number(bulk.duration) || 30, ...(bulk.link ? { link: bulk.link } : {}) }); n++; } catch (e) { toast((e as Error).message, "err"); }
            }
            if (n) toast(`${n} slot(s) added`);
          }}>Add slots</Btn>
        </div>
        <div className="mt-3"><DataTable cols={slotCols} rows={slots.rows.filter((s) => new Date(String(s.startsAt)).getTime() > Date.now() - 864e5)} loading={slots.loading} empty={<p className="py-6 text-center text-[#6b6b7b]">No upcoming slots.</p>} /></div>
      </Section>

      {edit && (
        <FormDrawer
          title={edit === "new" ? "New masterclass" : "Edit masterclass"}
          fields={MC_FIELDS}
          initial={edit === "new" ? { published: true, duration: 120 } : { ...edit, startsAt: toLocal(edit.startsAt) }}
          onSubmit={async (d) => {
            const body = { ...d, startsAt: new Date(String(d.startsAt)).toISOString(), seats: d.seats === "" || d.seats == null ? undefined : Number(d.seats) };
            if (edit === "new") await mcs.create(body);
            else await mcs.update(edit.id, body);
          }}
          onClose={() => setEdit(null)}
        />
      )}
      {att && <Attendance mc={att} onClose={() => setAtt(null)} />}
      {del && <Confirm title="Delete?" text="This can't be undone." onOk={async () => { await (del.coll === "slots" ? slots : mcs).remove(del.row.id); }} onClose={() => setDel(null)} />}
    </div>
  );
}
