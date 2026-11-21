"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { copy, fmtDateTime, patchMe, toast, useCollection, useMe, type Row } from "@/lib/client";
import { Btn, Confirm, EmptyBox, Field, Modal, Panel, Pill, RowAction, Title, Toggle, Walkthrough, inputCls } from "@/components/dash/kit";
import { FormDrawer, type FieldDef } from "@/components/dash/forms";
import { Icon } from "@/components/dash/icons";
import { useMangoTitles } from "@/components/dash/hooks";

function Slots({ ev, onClose }: { ev: Row; onClose: () => void }) {
  const col = useCollection("events");
  const [slots, setSlots] = useState<string[]>(((ev.slots as string[]) || []).slice().sort());
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("13:00");
  const dur = Number(ev.duration || 30);
  const buffer = Number(ev.bufferMin || 0);

  function generate() {
    if (!date) return toast("Pick a date", "err");
    const start = new Date(`${date}T${from}`).getTime();
    const end = new Date(`${date}T${to}`).getTime();
    if (end <= start) return toast("End time must be after start time", "err");
    const out: string[] = [];
    for (let t = start; t + dur * 60000 <= end; t += (dur + buffer) * 60000) {
      if (t > Date.now()) out.push(new Date(t - new Date(t).getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    }
    if (!out.length) return toast("No future slots fit in that window", "err");
    setSlots((s) => [...new Set([...s, ...out])].sort());
  }

  return (
    <Modal title={`Slots — ${String(ev.title)}`} onClose={onClose} wide>
      <p className="text-[13px] text-[#6b6b7b]">Each slot is {dur} minutes{buffer ? ` with ${buffer} min buffer` : ""}. Customers pick one on your booking page.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_120px_120px_auto]">
        <input type="date" className={inputCls} value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        <input type="time" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
        <input type="time" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" />
        <Btn variant="black" onClick={generate}>Add slots</Btn>
      </div>
      <div className="mt-4 flex max-h-64 flex-wrap gap-2 overflow-y-auto">
        {slots.length === 0 && <p className="text-[13px] text-[#9b9bab]">No slots yet.</p>}
        {slots.map((s) => (
          <span key={s} className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[12px] ${new Date(s).getTime() < Date.now() ? "border-[#ededed] text-[#9b9bab]" : "border-[#e1e1e1]"}`}>
            {fmtDateTime(s)}
            <button aria-label="Remove slot" onClick={() => setSlots((x) => x.filter((y) => y !== s))}>×</button>
          </span>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={async () => { await col.update(ev.id, { slots }); toast("Slots saved"); onClose(); }}>Save slots</Btn>
      </div>
    </Modal>
  );
}

function Inner() {
  const { me, setMe } = useMe();
  const col = useCollection("events");
  const bookings = useCollection("bookings");
  const mangoes = useMangoTitles();
  const params = useSearchParams();
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [slotsFor, setSlotsFor] = useState<Row | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const [gcal, setGcal] = useState(false);
  useEffect(() => { if (params.get("new") === "1") setEdit("new"); }, [params]);

  const fields: FieldDef[] = [
    { key: "title", label: "Title", required: true, placeholder: "Enter title", maxLength: 100 },
    { key: "description", label: "Description (optional)", type: "textarea", placeholder: "Type something here..." },
    { key: "slotsPerUser", label: "Set number of slots per user", type: "number", min: 1, max: 20, required: true, placeholder: "Enter number of slots per user" },
    { key: "duration", label: "Set duration of each slot", type: "select", options: ["15", "30", "45", "60", "90"], required: true, hint: "Minutes" },
    { key: "bufferMin", label: "Set buffer time for showing available slots to the customers (minutes)", type: "number", min: 0, max: 240 },
    { key: "platform", label: "Select call platform", type: "select", options: ["Custom Meeting Platform (like Google Meet, Zoom, etc.)"], required: true },
    { key: "link", label: "Enter the external call link", type: "url", required: true, placeholder: "Enter the external call link" },
    { key: "mango", label: "Link a mango where you want to offer this event", type: "select", options: mangoes, placeholder: "Link mango here" },
  ];

  return (
    <>
      <Walkthrough title="One-on-one consultation events" />
      <Panel className="p-5">
        <Title
          sub={<span className="flex items-center gap-2">Enable overlapping slot bookings <Toggle on={Boolean(me.settings?.overlappingSlots)} onChange={async (v) => { const r = await patchMe({ settings: { overlappingSlots: v } }); setMe(r.user); toast(v ? "Overlapping bookings enabled" : "Overlapping bookings disabled"); }} label="Enable overlapping slot bookings" /></span>}
          right={<><Btn variant="soft" onClick={() => setGcal(true)}><Icon name="google" className="h-4 w-4" />{me.settings?.gcal ? "Google calendar linked" : "Link google calendar"}</Btn><Btn variant="black" icon="plus" onClick={() => setEdit("new")}>Create event</Btn></>}
        >
          Events
        </Title>
        {col.rows.length === 0 && !col.loading ? (
          <EmptyBox title="You do not have any events" />
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {col.rows.map((ev, i) => {
              const upcoming = ((ev.slots as string[]) || []).filter((s) => new Date(s).getTime() > Date.now());
              const booked = bookings.rows.filter((b) => b.eventId === ev.id && b.status !== "Cancelled").length;
              const url = `${location.origin}/book/${ev.id}`;
              return (
                <div key={ev.id} className="animate-rise rounded-[10px] border border-[#ededed] bg-white p-4" style={{ ["--delay" as string]: `${i * 0.04}s` }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><p className="truncate font-semibold">{String(ev.title)}</p><p className="text-[12px] text-[#6b6b7b]">{String(ev.duration)} min · {String(ev.slotsPerUser)} slot(s)/user</p></div>
                    <Toggle on={ev.active !== false} onChange={async (v) => { await col.update(ev.id, { active: v }); toast(v ? "Event enabled" : "Event disabled"); }} label="Active" />
                  </div>
                  <div className="mt-3 flex gap-2 text-[12px]"><Pill tone="blue">{upcoming.length} open slots</Pill><Pill tone="green">{booked} booked</Pill></div>
                  <p className="mt-2 truncate text-[12px] text-[#6b6b7b]">{ev.mango ? `Offered in ${String(ev.mango)}` : "Not linked to a mango"}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Btn className="h-8 px-3 text-[13px]" onClick={() => setSlotsFor(ev)}>Manage slots</Btn>
                    <span className="ml-auto flex gap-1.5">
                      <RowAction icon="link" title="Copy booking link" onClick={() => copy(url, "Booking link")} />
                      <RowAction icon="eye" title="Open booking page" href={`/book/${ev.id}`} />
                      <RowAction icon="edit" title="Edit" onClick={() => setEdit(ev)} />
                      <RowAction icon="trash" title="Delete" danger onClick={() => setDel(ev)} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      {edit && (
        <FormDrawer
          title="1-1 Consultation"
          fields={fields}
          initial={edit === "new" ? { slotsPerUser: 1, duration: "15", bufferMin: 0, platform: "Custom Meeting Platform (like Google Meet, Zoom, etc.)" } : { ...edit, duration: String(edit.duration) }}
          submitLabel={edit === "new" ? "Save and proceed to add slots" : "Save"}
          onSubmit={async (d) => {
            const data = { ...d, duration: Number(d.duration) };
            if (edit === "new") {
              const row = await col.create({ ...data, active: true, slots: [] });
              toast("Event created — now add slots");
              setTimeout(() => setSlotsFor(row), 50);
            } else {
              await col.update(edit.id, data);
              toast("Event updated");
            }
          }}
          onClose={() => setEdit(null)}
        />
      )}
      {slotsFor && <Slots ev={col.rows.find((r) => r.id === slotsFor.id) || slotsFor} onClose={() => setSlotsFor(null)} />}
      {del && <Confirm title="Delete event?" text="Existing bookings stay in Bookings, but no new slots can be booked." onOk={async () => { await col.remove(del.id); toast("Event deleted"); }} onClose={() => setDel(null)} />}
      {gcal && (
        <Modal title="Link Google Calendar" onClose={() => setGcal(false)}>
          <p className="text-[14px] text-[#4a4a59]">In production this opens Google sign-in so bookings sync to your calendar. This clone has no Google OAuth app configured, so linking is simulated.</p>
          <Field label="Status"><p className="text-[14px]">{me.settings?.gcal ? "Linked (simulated)" : "Not linked"}</p></Field>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setGcal(false)}>Close</Btn>
            <Btn onClick={async () => { const r = await patchMe({ settings: { gcal: !me.settings?.gcal } }); setMe(r.user); toast(me.settings?.gcal ? "Google calendar unlinked" : "Google calendar linked"); setGcal(false); }}>{me.settings?.gcal ? "Unlink" : "Link (simulated)"}</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
