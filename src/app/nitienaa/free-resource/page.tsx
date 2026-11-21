import { Crumbs, Step } from '@/components/coach/ui';
import LeadForm from '@/components/coach/LeadForm';

import { href } from '@/lib/coach/content';
export const metadata = {
  title: 'Free resource',
  description: '[Lead magnet title] — a free resource from Nitienaa, delivered to your inbox.',
};

export default function FreeResource() {
  return (
    <>
      <section className="sec alt">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Resources' }, { l: 'Free resource' }]} />
            <p className="eyebrow">Free resource</p>
            <h1 className="h1" style={{ fontSize: 'clamp(40px, 5vw, 64px)' }}>[Lead magnet title]</h1>
            <p className="lead">[What the reader gets and the result it helps them reach.]</p>
            <div className="stack" style={{ gap: 10 }}>
              {['one', 'two', 'three'].map((n) => <Step key={n} n="✓" sm><p>[What is inside — point {n}]</p></Step>)}
            </div>
          </div>
          <div className="card" style={{ padding: 'clamp(24px, 4vw, 40px)' }}><LeadForm /></div>
        </div>
      </section>
      <section className="sec sm">
        <div className="wrap g3">
          <div className="stack"><p className="eyebrow">Instant delivery</p><p>Your resource arrives by email within a minute.</p></div>
          <div className="stack"><p className="eyebrow">WhatsApp, if you like</p><p>Opt in for a confirmation and occasional updates.</p></div>
          <div className="stack"><p className="eyebrow">No spam</p><p>Unsubscribe from any email with one click.</p></div>
        </div>
      </section>
    </>
  );
}
