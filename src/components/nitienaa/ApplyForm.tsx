"use client";
import { useRef, useState, type FormEvent } from "react";
import { postJson } from "@/lib/coach/content";
import { input, label, mangoBtn, outlineBtn } from "./kit";

const STEPS = ["About you", "Your goals", "Cohort and consent"];

/** 3-step application → /api/coach/form (kind: application) → Leads & CRM + "Application sent" workflow. */
export default function ApplyForm({ cohort, startDate }: { cohort: string; startDate: string }) {
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const data = useRef<Record<string, FormDataEntryValue>>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function next(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    Object.assign(data.current, Object.fromEntries(new FormData(formRef.current).entries()));
    if (step < 3) { setStep(step + 1); return; }
    setBusy(true);
    const d = data.current;
    const r = await postJson("/api/coach/form", { kind: "application", ...d, terms: d.terms === "on", whatsappOptIn: d.whatsappOptIn === "on" });
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="space-y-3">
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Application received</span>
        <h4 className="font-display text-2xl font-bold text-ink">Thank you, we have your application.</h4>
        <p className="text-ink/60">A confirmation is on its way to your email. We will be in touch within [X] working days.</p>
        <a href="#enrol" className={outlineBtn}>Go to enrolment</a>
      </div>
    );
  }

  const pct = Math.round((step / 3) * 100);
  return (
    <form ref={formRef} onSubmit={next} className="space-y-5">
      <div>
        <div className="flex justify-between text-sm"><b className="text-ink">Step {step} of 3 · {STEPS[step - 1]}</b><span className="text-ink/50">{pct}%</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="bg-mango h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="ap-fn" className={label}>First name</label><input id="ap-fn" name="firstName" autoComplete="given-name" required className={input} /></div>
          <div><label htmlFor="ap-ln" className={label}>Last name</label><input id="ap-ln" name="lastName" autoComplete="family-name" required className={input} /></div>
          <div><label htmlFor="ap-em" className={label}>Email</label><input id="ap-em" name="email" type="email" autoComplete="email" required className={input} /></div>
          <div><label htmlFor="ap-wa" className={label}>WhatsApp number</label><input id="ap-wa" name="whatsapp" type="tel" placeholder="+91" className={input} /></div>
          <div><label htmlFor="ap-city" className={label}>City</label><input id="ap-city" name="city" className={input} /></div>
          <div><label htmlFor="ap-occ" className={label}>Occupation</label><input id="ap-occ" name="occupation" className={input} /></div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div><label htmlFor="ap-why" className={label}>What made you want to join THE HUMAN OS™?</label><textarea id="ap-why" name="why" required rows={4} className={input} /></div>
          <div><label htmlFor="ap-goal" className={label}>What would you like to be different after 6 weeks?</label><textarea id="ap-goal" name="goal" rows={4} className={input} /></div>
          <div>
            <label htmlFor="ap-src" className={label}>How did you hear about us?</label>
            <select id="ap-src" name="source" className={input}><option>Instagram</option><option>LinkedIn</option><option>A friend</option><option>An event or workshop</option><option>The blog</option><option>Other</option></select>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="ap-coh" className={label}>Preferred cohort</label>
            <select id="ap-coh" name="cohort" className={input}><option>Cohort {cohort} · starts {startDate}</option><option>Next cohort · [DATE]</option></select>
          </div>
          <fieldset>
            <legend className={label}>Can you attend the live classes?</legend>
            <div className="flex flex-wrap gap-4 text-sm text-ink/70">
              <label className="flex items-center gap-2"><input type="radio" name="live" value="yes" required className="accent-orange-500" />Yes</label>
              <label className="flex items-center gap-2"><input type="radio" name="live" value="mostly" className="accent-orange-500" />Mostly, I will watch recordings sometimes</label>
            </div>
          </fieldset>
          <label className="flex items-start gap-3 text-sm text-ink/70"><input type="checkbox" name="terms" required className="mt-1 h-4 w-4 accent-orange-500" /><span>I agree to the <a href="/terms" className="underline">terms</a> and <a href="/privacy" className="underline">privacy policy</a>.</span></label>
          <label className="flex items-start gap-3 text-sm text-ink/70"><input type="checkbox" name="whatsappOptIn" className="mt-1 h-4 w-4 accent-orange-500" />Send me updates about my application on WhatsApp.</label>
        </div>
      )}

      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <div className="flex justify-between gap-3">
        <button type="button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className={`${outlineBtn} disabled:opacity-40`}>Back</button>
        <button type="submit" disabled={busy} className={mangoBtn}>{step === 3 ? (busy ? "Sending…" : "Submit application") : "Continue"}</button>
      </div>
    </form>
  );
}
