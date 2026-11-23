import Link from 'next/link';
import { Ph } from '@/components/coach/ui';
import { FaqSection, steps } from '@/components/coach/Sections';
import { nav, sec } from '@/lib/coach/content';
import { getCoach } from '@/lib/coach/server';

export const metadata = {
  title: { absolute: 'Nitienaa | THE HUMAN OS™ — 6-week live cohort programme' },
  description: 'Upgrade the operating system you run on every day. A live, guided 6-week programme with Nitienaa: live classes, lessons, assignments and a certificate.',
};
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { programme } = await getCoach();
  return (
    <>
      <section className="sec" id="top" style={{ paddingTop: 88 }}>
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <p className="eyebrow">6-week cohort programme · Next cohort {programme.startDate}</p>
            <h1 className="h1">Upgrade the operating system you run on every day.</h1>
            <p className="lead">{programme.name} is a live, guided 6-week programme with Nitienaa. Weekly live classes, short lessons and practical assignments, with your progress tracked all the way to a certificate.</p>
            <div className="row"><Link className="btn pri" href={sec('apply')}>Apply for the next cohort</Link><Link className="btn" href={sec('programme')}>See the programme</Link></div>
            <div className="row small muted" style={{ gap: 24 }}><span>Live on Zoom or Google Meet</span><span>Up to {programme.capacity} learners per cohort</span><span>Certificate on completion</span></div>
          </div>
          <Ph label="[HERO PORTRAIT OF NITIENAA — your photography]" h={520} />
        </div>
      </section>

      <section className="sec sm alt">
        <div className="wrap stack lg">
          <div className="stack" style={{ maxWidth: 720 }}><p className="eyebrow">How it works</p><h2 className="h2">From enrolment to certificate, in five steps</h2></div>
          <div className="g4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
            {steps.map(([n, t, d]) => <div className="card stack" key={n}><span className="num">{n}</span><h3 className="h3">{t}</h3><p className="muted">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap stack lg">
          <div className="stack" style={{ maxWidth: 720 }}><p className="eyebrow">Explore</p><h2 className="h2">Everything in one place</h2></div>
          <div className="g2" style={{ gap: 20 }}>
            {nav.map((t) => (
              <Link key={t.id} href={t.h} className="card stack cardlink">
                <h3 className="h3" style={{ fontSize: 26 }}>{t.label}</h3>
                <p className="muted">{t.intro}</p>
                <div className="row" style={{ gap: 8 }}>{t.sections.map((s) => <span key={s.id} className="tag">{s.l}</span>)}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
