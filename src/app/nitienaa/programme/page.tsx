import Link from 'next/link';
import { Crumbs } from '@/components/coach/ui';
import { WeekAccordion, Faq } from '@/components/coach/Accordions';
import { href } from '@/lib/coach/content';
import { getCoach } from '@/lib/coach/server';

export const metadata = {
  title: 'THE HUMAN OS™ — the 6-week programme',
  description: 'Six weeks of live classes, lessons and assignments with Nitienaa. See the week-by-week plan, what is included and the price.',
};

const included = [
  ['6 live classes', 'Join link, reminders by email and WhatsApp, and recordings.'],
  ['Learning portal', 'A dashboard with the week-by-week programme and a progress bar.'],
  ['Assignments and feedback', 'Submit as files or text and get personal feedback.'],
  ['Resource library', 'Worksheets and downloads for every week.'],
  ['Cohort announcements', 'Updates from Nitienaa, straight to your portal.'],
  ['Certificate', 'Awarded when you complete the programme.'],
];

const faqs: [string, string][] = [
  ['What happens after I pay?', 'Your portal account is created automatically and your login details arrive by email and WhatsApp.'],
  ['What if I miss a live class?', 'Every live class is recorded and added to your portal.'],
  ['How much time does it take each week?', '[Weekly time commitment — as you supply]'],
  ['Do I get a certificate?', 'Yes. Your progress is tracked in the portal and a certificate is issued when you complete the programme.'],
  ['Can I get a refund?', 'Refunds follow the refund policy. See the Refund policy page for details.'],
];

export const dynamic = 'force-dynamic';

export default async function Programme() {
  const { programme } = await getCoach();
  const facts = [
    ['Starts', programme.startDate], ['Length', `${programme.weeks} weeks`], ['Format', 'Live online + portal'],
    ['Cohort size', `Up to ${programme.capacity} learners`],
  ];
  return (
    <>
      <section className="sec dark">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Programme' }]} />
            <p className="eyebrow">The programme</p>
            <h1 className="h1">{programme.name}</h1>
            <p className="lead">{programme.description}</p>
            <div className="row"><Link className="btn pri" href={href("/apply")}>Apply now</Link><Link className="btn" href={href("/method")}>How the method works</Link></div>
          </div>
          <div className="card stack lg" style={{ background: '#FFFFFF', color: '#13212B', borderColor: '#FFFFFF' }}>
            <p className="eyebrow" style={{ color: '#1E5B55' }}>Next cohort</p>
            <div className="stack" style={{ gap: 8 }}>
              {facts.map(([k, v]) => (
                <div key={k} className="stack" style={{ gap: 8 }}>
                  <div className="row between"><span style={{ color: '#4E5D65' }}>{k}</span><strong>{v}</strong></div>
                  <div className="hr" />
                </div>
              ))}
              <div className="row between"><span style={{ color: '#4E5D65' }}>Investment</span><strong style={{ fontSize: 22 }}>{programme.price}</strong></div>
            </div>
            <Link className="btn dk" href={href("/enrol")} style={{ color: '#fff', borderColor: '#13212B' }}>Enrol and pay</Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap g2">
          <div className="stack lg">
            <p className="eyebrow">Who it is for</p>
            <h2 className="h2">[Who this programme is for]</h2>
            <p className="lead">[A short description of the ideal learner, from your content.]</p>
          </div>
          <div className="stack">
            {['one', 'two', 'three'].map((n) => (
              <div className="card flat step" key={n}><span className="n">✓</span><p>[Fit statement {n}]</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap stack lg">
          <div className="stack" style={{ maxWidth: 720 }}>
            <p className="eyebrow">Week by week</p>
            <h2 className="h2">The six weeks</h2>
            <p className="lead">Each week has one live class, lessons in the portal and one assignment. Select a week to see it.</p>
          </div>
          <WeekAccordion weeks={programme.weeks} />
        </div>
      </section>

      <section className="sec">
        <div className="wrap stack lg">
          <div className="stack"><p className="eyebrow">What is included</p><h2 className="h2">Everything you get</h2></div>
          <div className="g3">
            {included.map(([t, d]) => <div className="card stack" key={t}><h3 className="h3">{t}</h3><p className="muted">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="sec alt" id="pricing">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <p className="eyebrow">Pricing</p>
            <h2 className="h2">One programme. One clear price.</h2>
            <p className="lead">Pay securely with Razorpay: UPI, cards, net banking and wallets. A receipt is emailed to you automatically.</p>
            <Link className="muted" href={href("/refund-policy")}>Read the refund policy</Link>
          </div>
          <div className="card stack lg" style={{ border: '2px solid #13212B' }}>
            <div className="row between"><h3 className="h3">{programme.name}</h3><span className="tag sun">{programme.seats} seats left</span></div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 56, fontWeight: 600, lineHeight: 1 }}>{programme.price}</p>
            <p className="muted small">{programme.priceNotes}</p>
            <Link className="btn pri" href={href("/enrol")}>Enrol and pay</Link>
            <Link className="btn" href={href("/apply")}>Not sure yet? Apply first</Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="narrow stack lg">
          <div className="stack"><p className="eyebrow">Questions</p><h2 className="h2">Frequently asked</h2></div>
          <Faq items={faqs} />
        </div>
      </section>
    </>
  );
}
