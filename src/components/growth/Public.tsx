"use client";
import Link from "next/link";
import { useState } from "react";

const cls = "w-full rounded-lg border border-[#d8d8d8] bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-[#222]";
const btn = "w-full rounded-lg bg-[#111] px-5 py-3 text-[15px] font-semibold text-white disabled:opacity-50";

export function PublicShell({ coach, programme, children, narrow = true }: { coach?: string; programme?: string; children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#171717]" style={{ fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
      <div className={`mx-auto px-4 py-10 ${narrow ? "max-w-xl" : "max-w-3xl"}`}>
        {coach && <p className="mb-6 text-center text-[13px] uppercase tracking-[0.2em] text-[#777]">{coach}</p>}
        {children}
        <footer className="mt-12 border-t border-[#e6e6e0] pt-5 text-center text-[12px] text-[#888]">
          {programme && <p className="tracking-wide">{programme}</p>}
          <p className="mt-1"><Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link> · <Link href="/refund-policy" className="underline">Refund policy</Link></p>
        </footer>
      </div>
    </div>
  );
}

async function post<T>(url: string, body: unknown): Promise<T & { error?: string }> {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return r.json().catch(() => ({ error: "Something went wrong" }));
}

type Person = { name: string; email: string; phone: string; whatsappOptIn: boolean };

/** Name / email / WhatsApp fields. Saves a half-filled form when the email is entered but the form is left. */
export function PersonFields({ slug, form, src, p, setP, consent }: { slug: string; form: string; src?: string; p: Person; setP: (p: Person) => void; consent: string }) {
  return (
    <div className="space-y-2.5">
      <input className={cls} placeholder="Full name" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} required autoComplete="name" />
      <input className={cls} type="email" placeholder="Email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} required autoComplete="email"
        onBlur={() => /^\S+@\S+\.\S+$/.test(p.email) && post("/api/public/partial", { slug, form, src, name: p.name, email: p.email, phone: p.phone })} />
      <input className={cls} inputMode="numeric" maxLength={10} placeholder="WhatsApp number (10 digits)" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value.replace(/\D/g, "") })} required autoComplete="tel-national" />
      <label className="flex items-start gap-2 text-[13px] text-[#555]"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={p.whatsappOptIn} onChange={(e) => setP({ ...p, whatsappOptIn: e.target.checked })} /> Yes, send me updates on WhatsApp (you can stop any time).</label>
      <p className="text-[12px] text-[#777]">{consent} See our <Link href="/privacy" className="underline">privacy policy</Link>.</p>
    </div>
  );
}

type Pattern = { id: string; name: string; blurb?: string; bullets: { id: string; text: string }[] };

export function QuizClient({ slug, patterns, consent, src, programme }: { slug: string; patterns: Pattern[]; consent: string; src?: string; programme?: string }) {
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [p, setP] = useState<Person>({ name: "", email: "", phone: "", whatsappOptIn: false });
  const [step, setStep] = useState<"quiz" | "details">("quiz");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const count = Object.values(picked).reduce((a, b) => a + b.length, 0);
  const toggle = (pid: string, bid: string) => setPicked((s) => ({ ...s, [pid]: (s[pid] || []).includes(bid) ? s[pid].filter((x) => x !== bid) : [...(s[pid] || []), bid] }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await post<{ leadId: string }>("/api/public/quiz", { slug, picked, src, ...p });
    setBusy(false);
    if (r.error) return setErr(r.error);
    window.location.href = `/q/${slug}/r/${r.leadId}`;
  }

  if (step === "details") {
    return (
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-[22px] font-semibold">Where should we send your result?</h2>
        <p className="text-[14px] text-[#555]">You picked {count} statement{count === 1 ? "" : "s"}. Enter your details to see your result.</p>
        <PersonFields slug={slug} form="pattern-check" src={src} p={p} setP={setP} consent={consent} />
        {err && <p className="text-[14px] text-[#c0392b]">{err}</p>}
        <button className={btn} disabled={busy}>{busy ? "Scoring…" : "Show my result"}</button>
        <button type="button" className="w-full text-[14px] text-[#555] underline" onClick={() => setStep("quiz")}>Back to the statements</button>
      </form>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight">The Pattern Check</h1>
        <p className="mt-2 text-[15px] text-[#555]">Tick every statement that sounds like you. There are no right answers. It takes about five minutes.</p>
        {programme && <p className="mt-1 text-[12px] tracking-wide text-[#888]">{programme}</p>}
      </div>
      {patterns.map((pt, i) => (
        <section key={pt.id} className="rounded-xl border border-[#e6e6e0] bg-white p-4">
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#888]">Group {i + 1}</p>
          <div className="mt-2 space-y-2">
            {pt.bullets.map((b) => (
              <label key={b.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-[15px] ${picked[pt.id]?.includes(b.id) ? "border-[#111] bg-[#f3f3ef]" : "border-[#e6e6e0]"}`}>
                <input type="checkbox" className="mt-1 h-4 w-4" checked={!!picked[pt.id]?.includes(b.id)} onChange={() => toggle(pt.id, b.id)} /> {b.text}
              </label>
            ))}
          </div>
        </section>
      ))}
      <button className={btn} disabled={!count} onClick={() => setStep("details")}>See my result ({count} picked)</button>
    </div>
  );
}

type Mc = { id: string; title: string; startsAt: string; seats?: number; taken: number; description?: string };
export function MasterclassClient({ slug, list, consent, src }: { slug: string; list: Mc[]; consent: string; src?: string }) {
  const [sel, setSel] = useState(list[0]?.id || "");
  const [p, setP] = useState<Person>({ name: "", email: "", phone: "", whatsappOptIn: false });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ seat: number; title: string; startsAt: string; joinLink: string } | null>(null);
  if (!list.length) return <p className="rounded-xl bg-white p-8 text-center text-[#666]">No masterclass is open for registration right now. Please check back soon.</p>;
  if (done) return (
    <div className="rounded-xl border border-[#e6e6e0] bg-white p-8 text-center">
      <p className="text-[13px] uppercase tracking-wider text-[#888]">You&apos;re in</p>
      <p className="mt-1 text-[40px] font-semibold">Seat #{done.seat}</p>
      <p className="mt-1 text-[16px]">{done.title}</p>
      <p className="text-[#555]">{new Date(done.startsAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</p>
      <p className="mt-4 text-[14px] text-[#555]">We&apos;ve emailed your confirmation. Reminders will follow on WhatsApp if you opted in.</p>
      {done.joinLink && <a href={done.joinLink} className="mt-4 inline-block rounded-lg bg-[#111] px-5 py-2.5 text-white" target="_blank" rel="noreferrer">Class link</a>}
    </div>
  );
  return (
    <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(""); const r = await post<{ seat: number; title: string; startsAt: string; joinLink: string }>("/api/public/masterclass", { slug, masterclassId: sel, src, ...p }); setBusy(false); if (r.error) setErr(r.error); else setDone(r as never); }}>
      <h1 className="text-[28px] font-semibold leading-tight">Free live masterclass</h1>
      <div className="space-y-2">
        {list.map((m) => {
          const full = !!m.seats && m.taken >= m.seats;
          return (
            <label key={m.id} className={`block cursor-pointer rounded-xl border bg-white p-4 ${sel === m.id ? "border-[#111]" : "border-[#e6e6e0]"} ${full ? "opacity-50" : ""}`}>
              <input type="radio" className="mr-2" name="mc" checked={sel === m.id} disabled={full} onChange={() => setSel(m.id)} />
              <b>{m.title}</b>
              <p className="ml-6 text-[14px] text-[#555]">{new Date(m.startsAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</p>
              {m.seats ? <p className="ml-6 text-[13px] text-[#888]">{full ? "All seats taken" : `${m.seats - m.taken} of ${m.seats} numbered seats left`}</p> : null}
              {m.description && <p className="ml-6 mt-1 text-[14px] text-[#555]">{m.description}</p>}
            </label>
          );
        })}
      </div>
      <PersonFields slug={slug} form="masterclass" src={src} p={p} setP={setP} consent={consent} />
      {err && <p className="text-[14px] text-[#c0392b]">{err}</p>}
      <button className={btn} disabled={busy}>{busy ? "Reserving…" : "Reserve my seat"}</button>
    </form>
  );
}

export function CallClient({ slug, slots, consent, src, email }: { slug: string; slots: { id: string; startsAt: string }[]; consent: string; src?: string; email?: string }) {
  const days = [...new Set(slots.map((s) => new Date(s.startsAt).toLocaleDateString("en-CA")))];
  const [day, setDay] = useState(days[0] || "");
  const [slotId, setSlotId] = useState("");
  const [p, setP] = useState<Person>({ name: "", email: email || "", phone: "", whatsappOptIn: false });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ startsAt: string; link: string } | null>(null);
  if (!slots.length) return <p className="rounded-xl bg-white p-8 text-center text-[#666]">No times are open right now. Please check back soon.</p>;
  if (done) return (
    <div className="rounded-xl border border-[#e6e6e0] bg-white p-8 text-center">
      <p className="text-[22px] font-semibold">Your conversation is booked</p>
      <p className="mt-2 text-[#555]">{new Date(done.startsAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</p>
      <p className="mt-3 text-[14px] text-[#555]">A confirmation with two preparation questions is on its way to your email.</p>
      {done.link && <a className="mt-4 inline-block rounded-lg bg-[#111] px-5 py-2.5 text-white" href={done.link} target="_blank" rel="noreferrer">Call link</a>}
    </div>
  );
  return (
    <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); if (!slotId) return setErr("Pick a time"); setBusy(true); setErr(""); const r = await post<{ startsAt: string; link: string }>("/api/public/discovery", { slug, slotId, src, ...p }); setBusy(false); if (r.error) setErr(r.error); else setDone(r as never); }}>
      <h1 className="text-[28px] font-semibold leading-tight">Book a one-to-one conversation</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">{days.map((d) => <button type="button" key={d} onClick={() => { setDay(d); setSlotId(""); }} className={`shrink-0 rounded-lg border px-3 py-2 text-[14px] ${day === d ? "border-[#111] bg-[#111] text-white" : "border-[#ddd] bg-white"}`}>{new Date(d + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</button>)}</div>
      <div className="grid grid-cols-3 gap-2">{slots.filter((s) => new Date(s.startsAt).toLocaleDateString("en-CA") === day).map((s) => <button type="button" key={s.id} onClick={() => setSlotId(s.id)} className={`rounded-lg border py-2 text-[14px] ${slotId === s.id ? "border-[#111] bg-[#111] text-white" : "border-[#ddd] bg-white"}`}>{new Date(s.startsAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</button>)}</div>
      <PersonFields slug={slug} form="discovery" src={src} p={p} setP={setP} consent={consent} />
      {err && <p className="text-[14px] text-[#c0392b]">{err}</p>}
      <button className={btn} disabled={busy}>{busy ? "Booking…" : "Confirm booking"}</button>
    </form>
  );
}

export function TestimonialClient({ slug, lead, name }: { slug: string; lead: string; name: string }) {
  const [a, setA] = useState(["", "", ""]);
  const [voice, setVoice] = useState("");
  const [perm, setPerm] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const Q = ["What was the situation before you began?", "What changed for you?", "What would you tell someone considering it?"];
  if (done) return <div className="rounded-xl border border-[#e6e6e0] bg-white p-8 text-center"><p className="text-[22px] font-semibold">Thank you, {name.split(" ")[0]}</p><p className="mt-2 text-[#555]">Your words mean a lot.</p></div>;
  return (
    <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setErr(""); const r = await post("/api/public/testimonial", { slug, l: lead, answers: a, voiceUrl: voice, permission: perm }); if (r.error) setErr(r.error); else setDone(true); }}>
      <h1 className="text-[28px] font-semibold leading-tight">Three quick questions</h1>
      {Q.map((q, i) => <label key={i} className="block"><span className="mb-1 block text-[14px] font-medium">{q}</span><textarea className={`${cls} min-h-24`} value={a[i]} onChange={(e) => setA(a.map((x, k) => (k === i ? e.target.value : x)))} /></label>)}
      <label className="block"><span className="mb-1 block text-[14px] font-medium">Prefer a voice note? Paste a link (optional)</span><input className={cls} value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="https://…" /></label>
      <label className="flex items-start gap-2 text-[14px]"><input type="checkbox" className="mt-1 h-4 w-4" checked={perm} onChange={(e) => setPerm(e.target.checked)} /> You may use my words and name publicly (website and social).</label>
      {err && <p className="text-[14px] text-[#c0392b]">{err}</p>}
      <button className={btn}>Send</button>
    </form>
  );
}
