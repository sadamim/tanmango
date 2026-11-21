import { Crumbs } from '@/components/coach/ui';
import EnrolCheckout from '@/components/coach/EnrolCheckout';
import { href } from '@/lib/coach/content';
import { getCoach } from '@/lib/coach/server';

export const metadata = {
  title: 'Enrol and pay',
  description: 'Secure your seat in THE HUMAN OS™. Pay safely with Razorpay; your portal account is created instantly.',
};
export const dynamic = 'force-dynamic';

export default async function Enrol() {
  const { programme, mangoId } = await getCoach();
  return (
    <div style={{ background: '#F3F5F2' }}>
      <section className="sec sm">
        <div className="wrap stack lg">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Apply and enrol', h: href('/apply') }, { l: 'Enrol and pay' }]} />
          <div className="stack"><p className="eyebrow">Enrol and pay</p><h1 className="h2">Secure your seat in Cohort {programme.cohort}</h1></div>
          {!mangoId && (
            <p className="card flat small" role="status">
              Enrolment isn&apos;t connected yet. In the dashboard, open Growth › Settings and choose the programme mango; its price appears here.
            </p>
          )}
          <div className="row" style={{ gap: 32, alignItems: 'flex-start' }}>
            <div className="card" style={{ flex: '999 1 520px', minWidth: 0, padding: 'clamp(24px, 4vw, 40px)' }}>
              <EnrolCheckout price={programme.price} programmeName={programme.name} cohort={programme.cohort} />
            </div>
            <aside className="card stack lg" style={{ flex: '1 1 320px', padding: 32 }} aria-label="Order summary">
              <h2 className="h3">Order summary</h2>
              <div className="stack" style={{ gap: 6 }}>
                <strong>{programme.name}</strong>
                <span className="small muted">6-week cohort · Cohort {programme.cohort} · starts {programme.startDate}</span>
              </div>
              <div className="hr" />
              <div className="row between"><span className="muted">Programme fee</span><span>{programme.price}</span></div>
              <div className="row between"><span className="muted">GST</span><span>{programme.gst}</span></div>
              <div className="hr" />
              <div className="row between"><strong>Total</strong><strong style={{ fontSize: 22 }}>{programme.total}</strong></div>
              <div className="stack small" style={{ gap: 8 }}>
                <p>✓ Portal account created instantly</p>
                <p>✓ Welcome email and WhatsApp with login</p>
                <p>✓ Receipt emailed automatically</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
