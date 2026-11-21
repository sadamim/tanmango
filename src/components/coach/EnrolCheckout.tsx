'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { href, postJson } from '@/lib/coach/content';

type RzpHandlerResp = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RzpInstance = { open: () => void; on: (evt: string, cb: (r: unknown) => void) => void };
declare global {
  interface Window { Razorpay?: new (opts: Record<string, unknown>) => RzpInstance }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Order = { error?: string; test?: boolean; mangoId?: string; keyId?: string; id?: string; amount?: number; currency?: string; programme?: string; prefill?: Record<string, string> };

export default function EnrolCheckout({ price, programmeName, cohort }: { price: string; programmeName: string; cohort: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'working' | 'pending' | 'failed'>('idle');
  const [err, setErr] = useState('');
  const [testMode, setTestMode] = useState(false);

  async function pay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const learner = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setErr('');
    setStatus('working');

    const order = await postJson<Order>('/api/coach/order', learner);
    if (order.error) { setErr(order.error); setStatus('idle'); return; }

    // No Razorpay keys yet: the platform's test checkout records the sale and enrols the learner.
    if (order.test) {
      setTestMode(true);
      const r = await postJson<{ saleId?: string }>('/api/public/checkout', { mangoId: order.mangoId, name: learner.name, email: learner.email, phone: learner.whatsapp });
      if (r.error) { setErr(r.error); setStatus('failed'); return; }
      router.push(`${href('/confirmation')}?sale=${encodeURIComponent(r.saleId || '')}`);
      return;
    }

    if (!(await loadRazorpay()) || !window.Razorpay) { setErr('Could not load the secure payment window. Check your connection and try again.'); setStatus('failed'); return; }
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      name: 'Nitienaa',
      description: `${order.programme || programmeName} · Cohort ${cohort}`,
      prefill: order.prefill,
      theme: { color: '#13212B' },
      handler: async (resp: RzpHandlerResp) => {
        setStatus('working');
        const v = await postJson<{ status?: string; paymentId?: string }>('/api/coach/verify', resp);
        if (v.error) { setErr(v.error); setStatus('failed'); return; }
        if (v.status === 'paid') router.push(`${href('/confirmation')}?payment_id=${encodeURIComponent(v.paymentId || resp.razorpay_payment_id)}`);
        else setStatus(v.status === 'failed' ? 'failed' : 'pending');
      },
      modal: { ondismiss: () => setStatus((s) => (s === 'working' ? 'idle' : s)) },
    });
    rzp.on('payment.failed', () => setStatus('failed'));
    rzp.open();
  }

  return (
    <form className="stack lg" onSubmit={pay}>
      <h2 className="h3">1. Your details</h2>
      <p className="small muted">Your learning portal account is created with these details once payment succeeds.</p>
      <div className="g2" style={{ gap: 20 }}>
        <div className="field"><label htmlFor="e-name">Full name</label><input id="e-name" name="name" type="text" autoComplete="name" required /></div>
        <div className="field"><label htmlFor="e-em">Email</label><input id="e-em" name="email" type="email" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="e-wa">WhatsApp number</label><input id="e-wa" name="whatsapp" type="tel" placeholder="+91" required /></div>
        <div className="field"><label htmlFor="e-st">State</label><input id="e-st" name="state" type="text" /></div>
      </div>
      <div className="field"><label htmlFor="e-gst">GSTIN <span className="muted">(optional, for a business invoice)</span></label><input id="e-gst" name="gstin" type="text" /></div>
      <div className="hr" />
      <h2 className="h3">2. Payment</h2>
      <p className="small muted">You pay in the secure Razorpay window: UPI, cards, net banking or wallets. We never see or store your card details.</p>
      <label className="check"><input type="checkbox" name="terms" required /><span>I have read the <Link href={href('/terms')}>terms</Link> and <Link href={href('/refund-policy')}>refund policy</Link>.</span></label>

      {status !== 'pending' && status !== 'failed' && (
        <button className="btn pri" type="submit" disabled={status === 'working'} style={{ minHeight: 56, fontSize: 18 }}>
          {status === 'working' ? 'Opening secure checkout…' : `Pay ${price} securely`}
        </button>
      )}
      {err && status === 'idle' && <p className="small" role="alert" style={{ color: 'var(--bad)' }}>{err}</p>}

      {status === 'pending' && (
        <div className="card stack" role="status" style={{ background: '#FCEBCB', borderColor: '#F0A830' }}>
          <span className="tag warn" style={{ alignSelf: 'flex-start' }}>Payment pending</span>
          <p>Your bank has not confirmed the payment yet. We will email and WhatsApp you as soon as it clears — you do not need to pay again. If it does not clear, you will get a reminder with your payment link.</p>
          <button type="button" className="btn sm" onClick={() => setStatus('idle')} style={{ alignSelf: 'flex-start' }}>Back</button>
        </div>
      )}
      {status === 'failed' && (
        <div className="card stack" role="alert" style={{ background: '#F8DEDB', borderColor: '#E3A39B' }}>
          <span className="tag bad" style={{ alignSelf: 'flex-start' }}>Payment failed</span>
          <p>{err || 'The payment did not go through and you have not been charged.'} Try again or choose another method. We will also send a reminder with your payment link.</p>
          <button type="button" className="btn dk sm" onClick={() => { setErr(''); setStatus('idle'); }} style={{ alignSelf: 'flex-start' }}>Try again</button>
        </div>
      )}

      <div className="row small muted" style={{ gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        <span>Secured by Razorpay</span>
        {testMode && <span className="tag sun">Test mode — no money moves</span>}
      </div>
    </form>
  );
}
