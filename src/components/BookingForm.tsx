"use client";
import { useMemo, useState } from "react";

export default function BookingForm({ eventId, slots }: { eventId: string; slots: string[] }) {
  const days = useMemo(() => [...new Set(slots.map((s) => s.slice(0, 10)))], [slots]);
  const [day, setDay] = useState(days[0] || "");
  const [slot, setSlot] = useState("");
  const [d, setD] = useState({ name: "", email: "", phone: "" });
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ slot: string; link?: string } | null>(null);

  if (!slots.length) return <div className="rounded-2xl bg-white p-8 text-center text-[#6b6b7b] ring-1 ring-black/5">No slots are available right now. Please check back later.</div>;
  if (done) {
    return (
      <div className="animate-soft-fade rounded-2xl bg-white p-8 text-center ring-1 ring-black/5">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#2e9e4f] text-[24px] text-white">✓</div>
        <p className="mt-3 text-[20px] font-semibold">You&apos;re booked!</p>
        <p className="mt-1 text-[#4a4a59]">{new Date(done.slot).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</p>
        {done.link && <a href={done.link} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-lg bg-[#f2962c] px-5 py-2.5 font-semibold text-white">Call link</a>}
      </div>
    );
  }
  const inp = "w-full rounded-lg border border-[#e1e1e1] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#f2962c]";
  return (
    <div className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-black/5">
      <div>
        <p className="mb-2 text-[14px] font-semibold">Pick a date</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((x) => (
            <button key={x} onClick={() => { setDay(x); setSlot(""); }} className={`shrink-0 rounded-lg border px-3 py-2 text-center text-[13px] ${day === x ? "border-[#f2962c] bg-[#fdefdf] text-[#c7740f]" : "border-[#e1e1e1]"}`}>
              <span className="block text-[11px] uppercase">{new Date(x + "T00:00").toLocaleDateString("en-IN", { weekday: "short" })}</span>
              <b>{new Date(x + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</b>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[14px] font-semibold">Pick a time</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.filter((s) => s.startsWith(day)).map((s) => (
            <button key={s} onClick={() => setSlot(s)} className={`rounded-lg border py-2 text-[13px] ${slot === s ? "border-[#f2962c] bg-[#f2962c] text-white" : "border-[#e1e1e1] hover:border-[#f2962c]"}`}>{new Date(s).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</button>
          ))}
        </div>
      </div>
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!slot) return setErr("Pick a time slot");
          setBusy(true);
          const r = await fetch("/api/public/book", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventId, slot, ...d }) }).then((x) => x.json());
          setBusy(false);
          if (r.error) setErr(r.error);
          else setDone(r.booking);
        }}
      >
        <input className={inp} placeholder="Full name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} required />
        <input className={inp} type="email" placeholder="Email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} required />
        <input className={inp} inputMode="numeric" maxLength={10} placeholder="Phone (optional)" value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, "") })} />
        {err && <p className="text-[13px] text-[#ff4d4f]">{err}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-[#f2962c] py-3 font-semibold text-white disabled:opacity-60">{busy ? "Booking…" : "Confirm booking"}</button>
      </form>
    </div>
  );
}
