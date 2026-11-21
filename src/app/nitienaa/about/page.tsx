import Link from 'next/link';
import { Ph, Crumbs } from '@/components/coach/ui';

import { href } from '@/lib/coach/content';
export const metadata = {
  title: 'About Nitienaa',
  description: 'Meet Nitienaa, the person behind THE HUMAN OS™ — her story, values and why the programme runs as a live cohort.',
};

export default function About() {
  return (
    <>
      <section className="sec">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'About' }]} />
            <p className="eyebrow">About Nitienaa</p>
            <h1 className="h1">[Headline about Nitienaa, from your content]</h1>
            <p className="lead">[Short introduction: who Nitienaa is, who she works with and what THE HUMAN OS™ helps them change.]</p>
          </div>
          <Ph label="[PORTRAIT — Nitienaa]" h={560} />
        </div>
      </section>

      <section className="sec alt">
        <div className="narrow prose">
          <p className="eyebrow" style={{ marginBottom: 16 }}>The story</p>
          <h2 style={{ marginTop: 0 }}>[Story section heading]</h2>
          <p>[Paragraph 1 of Nitienaa&apos;s story — background and turning point. Supplied by you, with our recommended edits.]</p>
          <p>[Paragraph 2 — what she learned, and how it became a method.]</p>
          <p>[Paragraph 3 — why the programme runs as a live cohort, not a course you watch alone.]</p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap stack lg">
          <div className="stack" style={{ maxWidth: 680 }}><p className="eyebrow">What guides the work</p><h2 className="h2">[Values heading]</h2></div>
          <div className="g3">
            {['01', '02', '03'].map((n, i) => (
              <div className="card stack" key={n}><span className="num">{n}</span><h3 className="h3">[Value {['one', 'two', 'three'][i]}]</h3><p className="muted">[One sentence explaining it.]</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec dark">
        <div className="wrap stack lg">
          <div className="stack"><p className="eyebrow">Credentials and milestones</p><h2 className="h2">[Milestones heading]</h2></div>
          <div className="g4">
            {[1, 2, 3, 4].map((i) => (
              <div className="card stack" key={i}><p className="mono" style={{ color: '#F0A830' }}>[YEAR]</p><p>[Milestone or credential]</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <Ph label="[PHOTO — Nitienaa with a cohort or at an event]" h={360} />
          <div className="stack lg">
            <h2 className="h2">See what learners say, then decide.</h2>
            <p className="lead">Read real stories from past cohorts, or explore the programme in detail.</p>
            <div className="row"><Link className="btn pri" href={href("/stories")}>Stories and proof</Link><Link className="btn" href={href("/programme")}>The programme</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
