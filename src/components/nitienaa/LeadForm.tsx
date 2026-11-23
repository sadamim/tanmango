"use client";
import { useState, type FormEvent } from "react";
import { postJson } from "@/lib/coach/content";
import { input, label, mangoBtn } from "./kit";

/** Free resource (lead magnet) form → /api/coach/form → Leads & CRM + "Lead magnet form" workflow. */
export default function LeadForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErr("");
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await postJson("/api/coach/form", { kind: "lead", ...d, whatsappOptIn: d.whatsappOptIn === "on" });
    if (r.error) { setErr(r.error); setState("idle"); } else setState("done");
  }

  if (state === "done") {
    return (
      <div role="status" className="space-y-3">
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Sent</span>
        <h4 className="font-display text-2xl font-bold text-ink">Check your inbox</h4>
        <p className="text-ink/60">Your resource is on its way by email. If you added WhatsApp, you will get an opt-in confirmation there too.</p>
        <button onClick={() => setState("idle")} className="text-sm font-medium text-ink/60 underline">Back to the form</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><label htmlFor="lm-name" className={label}>First name</label><input id="lm-name" name="firstName" autoComplete="given-name" required className={input} /></div>
      <div><label htmlFor="lm-email" className={label}>Email</label><input id="lm-email" name="email" type="email" autoComplete="email" required className={input} /></div>
      <div><label htmlFor="lm-wa" className={label}>WhatsApp number <span className="font-normal text-ink/50">(optional)</span></label><input id="lm-wa" name="whatsapp" type="tel" placeholder="+91" className={input} /></div>
      <label className="flex items-start gap-3 text-sm text-ink/70"><input type="checkbox" name="whatsappOptIn" className="mt-1 h-4 w-4 accent-orange-500" />Send me WhatsApp updates. I can opt out any time.</label>
      <button type="submit" disabled={state === "sending"} className={`${mangoBtn} w-full`}>{state === "sending" ? "Sending…" : "Get it now"}</button>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <p className="text-xs text-ink/50">We respect your inbox. See our <a href="/privacy" className="underline">privacy policy</a>.</p>
    </form>
  );
}
