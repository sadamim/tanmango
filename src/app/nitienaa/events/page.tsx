import Link from 'next/link';
import { Ph, Crumbs } from '@/components/coach/ui';
import { EventsList } from '@/components/coach/Filters';

import { href } from '@/lib/coach/content';
export const metadata = {
  title: 'Events and workshops',
  description: 'Talks, workshops and free open sessions with Nitienaa, online and in person.',
};

export default function Events() {
  return (
    <>
      <section className="sec sm">
        <div className="wrap stack lg">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Programme', h: href('/programme') }, { l: 'Events and workshops' }]} />
          <p className="eyebrow">Events and workshops</p>
          <h1 className="h1" style={{ maxWidth: 900 }}>Talks, workshops and open sessions</h1>
          <p className="lead">Meet Nitienaa live, online or in person. Free open sessions are a good way to try the method before you apply.</p>
        </div>
      </section>
      <section className="sec sm alt"><div className="wrap"><EventsList /></div></section>
      <section className="sec">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <p className="eyebrow">Book Nitienaa</p>
            <h2 className="h2">Bring a workshop to your team or event</h2>
            <p className="lead">For corporate workshops, conferences and community events, send an enquiry with your dates and audience.</p>
            <div className="row"><Link className="btn pri" href={href("/contact")}>Send an enquiry</Link><Link className="btn" href={href("/press")}>Speaker kit</Link></div>
          </div>
          <Ph label="[PHOTO — past workshop]" h={360} />
        </div>
      </section>
    </>
  );
}
