'use client';

import Link from 'next/link';
import { useState } from 'react';
import { postJson, href } from '@/lib/coach/content';
import type { FormEvent } from 'react';

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [err, setErr] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await postJson('/api/coach/form', { kind: 'contact', ...data, consent: data.consent === 'on' });
    if (r.error) { setErr(r.error); setState('error'); } else setState('done');
  }

  if (state === 'done') {
    return (
      <div className="stack lg" role="status">
        <span className="tag ok" style={{ alignSelf: 'flex-start' }}>Message sent</span>
        <h2 className="h2">Thanks, we will be in touch.</h2>
        <p className="lead">A copy of your message has been sent to your email.</p>
        <button className="btn sm" onClick={() => setState('idle')} style={{ alignSelf: 'flex-start' }}>Send another</button>
      </div>
    );
  }

  return (
    <form className="stack lg" onSubmit={onSubmit}>
      <div className="g2" style={{ gap: 20 }}>
        <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" name="name" type="text" autoComplete="name" required /></div>
        <div className="field"><label htmlFor="c-em">Email</label><input id="c-em" name="email" type="email" autoComplete="email" required /></div>
      </div>
      <div className="field">
        <label htmlFor="c-topic">What is it about?</label>
        <select id="c-topic" name="topic">
          <option>The programme</option><option>Payments or refunds</option><option>Workshops and speaking</option><option>Press and media</option><option>Something else</option>
        </select>
      </div>
      <div className="field"><label htmlFor="c-msg">Message</label><textarea id="c-msg" name="message" style={{ minHeight: 180 }} required /></div>
      <label className="check"><input type="checkbox" name="consent" required /><span>I agree to the <Link href={href("/privacy")}>privacy policy</Link>.</span></label>
      <button className="btn pri" type="submit" disabled={state === 'sending'} style={{ alignSelf: 'flex-start' }}>{state === 'sending' ? 'Sending…' : 'Send message'}</button>
      {state === 'error' && <p className="small" role="alert" style={{ color: 'var(--bad)' }}>{err || 'Something went wrong. Please try again.'}</p>}
    </form>
  );
}
