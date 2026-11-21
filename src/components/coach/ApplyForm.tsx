'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { postJson, programme, href } from '@/lib/coach/content';
import type { FormEvent } from 'react';

const STEPS = ['About you', 'Your goals', 'Cohort and consent'];

export default function ApplyForm() {
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const data = useRef<Record<string, FormDataEntryValue>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [err, setErr] = useState('');

  function collect() {
    if (!formRef.current) return true;
    if (!formRef.current.reportValidity()) return false;
    Object.assign(data.current, Object.fromEntries(new FormData(formRef.current).entries()));
    return true;
  }

  async function next(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!collect()) return;
    if (step < 3) { setStep(step + 1); return; }
    setBusy(true);
    const d = data.current;
    const r = await postJson('/api/coach/form', { kind: 'application', ...d, terms: d.terms === 'on', whatsappOptIn: d.whatsappOptIn === 'on' });
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="stack lg" role="status">
        <span className="tag ok" style={{ alignSelf: 'flex-start' }}>Application received</span>
        <h2 className="h2">Thank you, we have your application.</h2>
        <p className="lead">A confirmation is on its way to your email. We will be in touch within [X] working days.</p>
        <div className="row">
          <Link className="btn dk" href={href("/stories")}>Read learner stories</Link>
          <button className="btn" onClick={() => { data.current = {}; setStep(1); setSent(false); }}>Start again</button>
        </div>
      </div>
    );
  }

  const pct = Math.round((step / 3) * 100);
  return (
    <form ref={formRef} className="stack lg" onSubmit={next} noValidate={false}>
      <div className="stack" style={{ gap: 10 }}>
        <div className="row between small"><strong>Step {step} of 3 · {STEPS[step - 1]}</strong><span className="muted">{pct}%</span></div>
        <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: pct + '%' }} /></div>
      </div>

      {step === 1 && (
        <div className="stack lg">
          <div className="g2" style={{ gap: 20 }}>
            <div className="field"><label htmlFor="a-fn">First name</label><input id="a-fn" name="firstName" type="text" autoComplete="given-name" required /></div>
            <div className="field"><label htmlFor="a-ln">Last name</label><input id="a-ln" name="lastName" type="text" autoComplete="family-name" required /></div>
          </div>
          <div className="field"><label htmlFor="a-em">Email</label><input id="a-em" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="a-wa">WhatsApp number</label><input id="a-wa" name="whatsapp" type="tel" placeholder="+91" /></div>
          <div className="g2" style={{ gap: 20 }}>
            <div className="field"><label htmlFor="a-city">City</label><input id="a-city" name="city" type="text" /></div>
            <div className="field"><label htmlFor="a-occ">Occupation</label><input id="a-occ" name="occupation" type="text" /></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack lg">
          <div className="field"><label htmlFor="a-why">What made you want to join THE HUMAN OS™?</label><textarea id="a-why" name="why" required /></div>
          <div className="field"><label htmlFor="a-goal">What would you like to be different after 6 weeks?</label><textarea id="a-goal" name="goal" /></div>
          <div className="field">
            <label htmlFor="a-src">How did you hear about us?</label>
            <select id="a-src" name="source">
              <option>Instagram</option><option>LinkedIn</option><option>A friend</option><option>An event or workshop</option><option>The blog</option><option>Other</option>
            </select>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="stack lg">
          <div className="field">
            <label htmlFor="a-coh">Preferred cohort</label>
            <select id="a-coh" name="cohort"><option>Cohort {programme.cohort} · starts {programme.startDate}</option><option>Next cohort · [DATE]</option></select>
          </div>
          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Can you attend live classes on {programme.liveDay} at {programme.liveTime} IST?</legend>
            <div className="row">
              <label className="check"><input type="radio" name="live" value="yes" required /><span>Yes</span></label>
              <label className="check"><input type="radio" name="live" value="mostly" /><span>Mostly, I will watch recordings sometimes</span></label>
            </div>
          </fieldset>
          <label className="check"><input type="checkbox" name="terms" required /><span>I agree to the <Link href={href("/terms")}>terms</Link> and <Link href={href("/privacy")}>privacy policy</Link>.</span></label>
          <label className="check"><input type="checkbox" name="whatsappOptIn" /><span>Send me updates about my application on WhatsApp.</span></label>
        </div>
      )}

      {err && <p className="small" role="alert" style={{ color: 'var(--bad)' }}>{err}</p>}
      <div className="row between">
        <button type="button" className="btn" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Back</button>
        <button type="submit" className="btn pri" disabled={busy}>{step === 3 ? (busy ? 'Sending…' : 'Submit application') : 'Continue'}</button>
      </div>
    </form>
  );
}
