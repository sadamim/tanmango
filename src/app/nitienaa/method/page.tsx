import Link from 'next/link';
import { Crumbs } from '@/components/coach/ui';
import { MethodTabs } from '@/components/coach/Accordions';

import { href } from '@/lib/coach/content';
export const metadata = {
  title: 'The method',
  description: 'How THE HUMAN OS™ works: the layers of the method and the weekly rhythm of lesson, live class, assignment and feedback.',
};

const rhythm = [
  ['1', 'Lesson', 'Short lessons open in the portal at the start of each week.'],
  ['2', 'Live class', 'Work through it together with Nitienaa and the cohort.'],
  ['3', 'Assignment', 'Apply it to your own life and submit a file or text.'],
  ['4', 'Feedback', 'Get notified when feedback is ready in your portal.'],
];

export default function Method() {
  return (
    <>
      <section className="sec">
        <div className="wrap stack lg">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Programme', h: href('/programme') }, { l: 'The method' }]} />
          <p className="eyebrow">The method</p>
          <h1 className="h1" style={{ maxWidth: 960 }}>[Name or one-line summary of the method]</h1>
          <p className="lead">[How the method works, in two sentences — from your content.]</p>
        </div>
      </section>
      <section className="sec alt"><div className="wrap"><MethodTabs /></div></section>
      <section className="sec">
        <div className="wrap stack lg">
          <div className="stack" style={{ maxWidth: 720 }}><p className="eyebrow">The weekly rhythm</p><h2 className="h2">Learn, practise, get feedback, repeat</h2></div>
          <div className="g4">
            {rhythm.map(([n, t, d]) => <div className="card stack" key={n}><span className="num">{n}</span><h3 className="h3">{t}</h3><p className="muted">{d}</p></div>)}
          </div>
        </div>
      </section>
      <section className="sec dark">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg"><h2 className="h2">See the method in action, free.</h2><p className="lead">Join an open workshop or start with the free resource.</p></div>
          <div className="row"><Link className="btn pri" href={href("/events")}>Upcoming events</Link><Link className="btn" href={href("/free-resource")}>Free resource</Link></div>
        </div>
      </section>
    </>
  );
}
