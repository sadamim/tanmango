'use client';

import Link from 'next/link';
import { useState } from 'react';
import { postJson, href } from '@/lib/coach/content';
import type { FormEvent } from 'react';

export default function LeadForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [err, setErr] = useState(''); // idle | sending | done | error

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await postJson('/api/coach/form', { kind: 'lead', ...data, whatsappOptIn: data.whatsappOptIn === 'on' });
    if (r.error) { setErr(r.error); setState('error'); } else setState('done');
  }

  if (state === 'done') {
    return (
      <div className="stack lg" role="status">
        <span className="tag ok" style={{ alignSelf: 'flex-start' }}>Sent</span>
        <h2 className={compact ? 'h3' : 'h2'}>Check your inbox</h2>
        <p className={compact ? 'muted' : 'lead'}>
          Your resource is on its way by email. If you added WhatsApp, you will get an opt-in confirmation there too.
        </p>
        {!compact && <Link className="btn dk" href={href("/programme")} style={{ alignSelf: 'flex-start' }}>While you wait: see the programme</Link>}
        <button className="btn sm" onClick={() => setState('idle')} style={{ alignSelf: 'flex-start' }}>Back to the form</button>
      </div>
    );
  }

  if (compact) {
    return (
      <form className="row" style={{ alignItems: 'flex-end' }} onSubmit={onSubmit}>
        <div className="field" style={{ flex: '1 1 200px' }}><label htmlFor="h-name">First name</label><input id="h-name" name="firstName" type="text" autoComplete="given-name" required /></div>
        <div className="field" style={{ flex: '1 1 240px' }}><label htmlFor="h-email">Email</label><input id="h-email" name="email" type="email" autoComplete="email" required /></div>
        <button className="btn pri" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send it to me'}</button>
        {state === 'error' && <p className="small" role="alert" style={{ color: 'var(--bad)', flexBasis: '100%' }}>{err || 'Something went wrong. Please try again.'}</p>}
      </form>
    );
  }

  return (
    <form className="stack lg" onSubmit={onSubmit}>
      <Phx />
      <h2 className="h3">Send me the free resource</h2>
      <div className="field"><label htmlFor="fr-name">First name</label><input id="fr-name" name="firstName" type="text" autoComplete="given-name" required /></div>
      <div className="field"><label htmlFor="fr-email">Email</label><input id="fr-email" name="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label htmlFor="fr-wa">WhatsApp number <span className="muted">(optional)</span></label><input id="fr-wa" name="whatsapp" type="tel" autoComplete="tel" placeholder="+91" /></div>
      <label className="check"><input type="checkbox" name="whatsappOptIn" /><span>Send me WhatsApp updates. I can opt out any time.</span></label>
      <button className="btn pri" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Get it now'}</button>
      {state === 'error' && <p className="small" role="alert" style={{ color: 'var(--bad)' }}>{err || 'Something went wrong. Please try again.'}</p>}
      <p className="small muted">We respect your inbox. Read our <Link href={href("/privacy")}>privacy policy</Link>.</p>
    </form>
  );
}

function Phx() {
  return <div className="ph" style={{ minHeight: 200 }} role="img" aria-label="Cover mockup">[COVER MOCKUP]</div>;
}
