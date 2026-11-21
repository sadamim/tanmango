import Link from 'next/link';
import { Ph, Crumbs } from '@/components/coach/ui';
import { StoriesGrid } from '@/components/coach/Filters';

import { href } from '@/lib/coach/content';
export const metadata = {
  title: 'Stories and proof',
  description: 'Real stories from learners who completed THE HUMAN OS™, shared in their own words.',
};

export default function Stories() {
  return (
    <>
      <section className="sec sm">
        <div className="wrap stack lg">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'About', h: href('/about') }, { l: 'Stories and proof' }]} />
          <p className="eyebrow">Stories and proof</p>
          <h1 className="h1" style={{ maxWidth: 900 }}>Real people. Real cohorts. In their own words.</h1>
          <p className="lead">Stories from learners who completed THE HUMAN OS™. Every quote is shared with permission.</p>
        </div>
      </section>

      <section className="sec sm alt">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <Ph label="[VIDEO TESTIMONIAL — supplied by you]" h={400} />
          <div className="stack lg">
            <p className="eyebrow">Featured story</p>
            <blockquote style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, lineHeight: 1.25, fontWeight: 500 }}>“[Featured learner quote — supplied by you]”</blockquote>
            <p className="muted">[Name], [Role / city] · Cohort [#]</p>
          </div>
        </div>
      </section>

      <section className="sec"><div className="wrap"><StoriesGrid /></div></section>

      <section className="sec dark">
        <div className="wrap stack lg">
          <div className="stack"><p className="eyebrow">Proof</p><h2 className="h2">By the numbers</h2><p className="muted">Figures are filled from your real cohort data once available.</p></div>
          <div className="g4">
            {[['[#]', 'learners completed'], ['[#]', 'cohorts run'], ['[#%]', 'completion rate'], ['[#]', 'average rating']].map(([n, l]) => (
              <div className="stack" key={l}><span className="num">{n}</span><p className="muted">{l}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap row between">
          <h2 className="h2" style={{ maxWidth: 640 }}>Your story could be next.</h2>
          <Link className="btn pri" href={href("/apply")}>Apply for the next cohort</Link>
        </div>
      </section>
    </>
  );
}
