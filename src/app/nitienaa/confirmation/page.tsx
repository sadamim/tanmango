import Link from 'next/link';
import { Step } from '@/components/coach/ui';
import PrintButton from '@/components/coach/PrintButton';
import { href, LOGIN_URL } from '@/lib/coach/content';
import { getCoach } from '@/lib/coach/server';
import { store } from '@/lib/db';
import { fetchPayment, razorpayConfigured } from '@/lib/coach/razorpay';

export const metadata = {
  title: 'Payment confirmed',
  description: 'Your enrolment is confirmed. Your receipt and portal login are on their way.',
  robots: { index: false },
};
export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ sale?: string; payment_id?: string }> };

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default async function Confirmation({ searchParams }: Props) {
  const { sale: saleId, payment_id: paymentId } = await searchParams;
  const { programme, creatorId } = await getCoach();

  // Receipt from the real order (by sale id from the test checkout, or Razorpay payment id).
  let sale: Record<string, unknown> | null = null;
  if (creatorId && saleId) {
    const s = await store.get('sales', saleId);
    if (s && s.userId === creatorId) sale = s;
  } else if (creatorId && paymentId) {
    [sale] = await store.find('sales', [['userId', creatorId], ['paymentId', paymentId]], { limit: 1 });
  }
  // No saved order (e.g. a demo payment): show the receipt straight from Razorpay.
  let demo = false;
  if (!sale && paymentId && razorpayConfigured()) {
    try {
      const p = await fetchPayment(paymentId);
      if (p.status === 'captured' || p.status === 'authorized') {
        demo = p.notes?.demo === '1';
        sale = { id: p.order_id, customer: p.notes?.name || p.email || 'Learner', email: p.email || p.notes?.email || '', amount: p.amount / 100, paymentId: p.id, method: `Razorpay · ${p.method || ''}`, mango: demo ? `${programme.name} (demo)` : programme.name, createdAt: new Date().toISOString() };
      }
    } catch { /* show the pending state */ }
  }
  const first = sale ? String(sale.customer || '').split(' ')[0] : '';
  const amount = sale ? inr(Number(sale.amount || 0)) : programme.total;
  const date = sale ? new Date(String(sale.createdAt)).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '[DATE]';

  return (
    <div style={{ background: '#F3F5F2' }}>
      <section className="sec sm">
        <div className="wrap row" style={{ gap: 32, alignItems: 'flex-start' }}>
          <div className="stack lg" style={{ flex: '999 1 520px', minWidth: 0 }}>
            {sale ? (
              <span className="tag ok" style={{ alignSelf: 'flex-start', fontSize: 15, padding: '6px 14px' }}>Payment successful</span>
            ) : (
              <span className="tag warn" style={{ alignSelf: 'flex-start', fontSize: 15, padding: '6px 14px' }}>Confirming your payment…</span>
            )}
            <h1 className="h2" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
              {sale ? `You are in${first ? `, ${first}` : ''}. Welcome to ${programme.name}.` : 'Thank you. We are confirming your payment.'}
            </h1>
            {demo && <p className="card flat small" role="status">Demo payment in Razorpay test mode: it is not saved and no portal account was created. Choose the real programme in Growth settings to switch demo mode off.</p>}
            <p className="lead">
              {sale
                ? `Your receipt has been emailed to ${String(sale.email)}. Your learning portal account is ready, and your login details are on their way by email and WhatsApp.`
                : 'This usually takes a few seconds. As soon as Razorpay confirms it, your receipt and login details arrive by email and WhatsApp. Refresh this page to check.'}
            </p>
            <div className="row noprint">
              <Link className="btn pri" href={LOGIN_URL}>Go to the learning portal</Link>
              {sale && <PrintButton />}
            </div>
            <div className="card stack lg noprint">
              <h2 className="h3">What happens next</h2>
              <Step n="1"><strong>Check your email and WhatsApp</strong><p className="small muted">Login details and your onboarding email arrive in the next few minutes.</p></Step>
              <Step n="2"><strong>Log in with your email</strong><p className="small muted">You get a one-time code each time, so there is no password to remember or reset.</p></Step>
              <Step n="3"><strong>Join the first live class</strong><p className="small muted">{programme.startDate}. You will get a reminder with the join link.</p></Step>
            </div>
          </div>
          <aside className="card stack lg" style={{ flex: '1 1 340px', padding: 32 }} aria-label="Receipt">
            <div className="row between"><h2 className="h3">Receipt</h2><span className="mono small muted">{sale ? String(sale.id) : '—'}</span></div>
            <div className="stack small" style={{ gap: 10 }}>
              <div className="row between"><span className="muted">Date</span><span>{date}</span></div>
              <div className="row between"><span className="muted">Billed to</span><span>{sale ? String(sale.customer) : '—'}</span></div>
              <div className="row between"><span className="muted">Payment ID</span><span className="mono">{sale ? String(sale.paymentId || 'Test checkout') : paymentId || '—'}</span></div>
              <div className="row between"><span className="muted">Method</span><span>{sale ? String(sale.method || '') : '—'}</span></div>
            </div>
            <div className="hr" />
            <div className="stack small" style={{ gap: 10 }}>
              <div className="row between"><span>{sale ? String(sale.mango) : programme.name}</span><span>{amount}</span></div>
              <div className="row between"><span className="muted">GST</span><span>{programme.gst}</span></div>
            </div>
            <div className="hr" />
            <div className="row between"><strong>Total paid</strong><strong style={{ fontSize: 22 }}>{amount}</strong></div>
            <p className="small muted">{programme.legalEntity}, [address, GSTIN]. Refunds follow our <Link href={href('/refund-policy')}>refund policy</Link>.</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
