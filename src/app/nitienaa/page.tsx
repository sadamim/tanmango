import Link from 'next/link';
import { Ph } from '@/components/coach/ui';
import LeadForm from '@/components/coach/LeadForm';
import { posts, href } from '@/lib/coach/content';
import { getCoach } from '@/lib/coach/server';

export const metadata = {
  title: { absolute: 'Nitienaa | THE HUMAN OS™ — 6-week live cohort programme' },
  description: 'Upgrade the operating system you run on every day. A live, guided 6-week programme with Nitienaa: live classes, lessons, assignments and a certificate.',
};

const steps = [
  ['01', 'Enrol', 'Apply and pay securely on the site.'],
  ['02', 'Account', 'Your portal account is created automatically.'],
  ['03', 'Welcome', 'Login details arrive by email and WhatsApp.'],
  ['04', 'Learn', 'Live classes, lessons and assignments each week.'],
  ['05', 'Complete', 'Progress is tracked to your certificate.'],
];

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { programme } = await getCoach();
  return (
    <>
      <section className="sec" style={{ paddingTop: 88 }}>
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <p className="eyebrow">6-week cohort programme · Next cohort {programme.startDate}</p>
            <h1 className="h1">Upgrade the operating system you run on every day.</h1>
            <p className="lead">
              {programme.name} is a live, guided 6-week programme with Nitienaa. Weekly live classes, short lessons and practical
              assignments, with your progress tracked all the way to a certificate.
            </p>
            <div className="row">
              <Link className="btn pri" href={href("/apply")}>Apply for the next cohort</Link>
              <Link className="btn" href={href("/programme")}>See the programme</Link>
            </div>
            <div className="row small muted" style={{ gap: 24 }}>
              <span>Live on Zoom or Google Meet</span>
              <span>Up to {programme.capacity} learners per cohort</span>
              <span>Certificate on completion</span>
            </div>
          </div>
          <Ph label="[HERO PORTRAIT OF NITIENAA — your photography]" h={520} />
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap stack lg">
          <div className="stack" style={{ maxWidth: 720 }}>
            <p className="eyebrow">How it works</p>
            <h2 className="h2">From enrolment to certificate, in five steps</h2>
          </div>
          <div className="g4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
            {steps.map(([n, t, d]) => (
              <div className="card stack" key={n}>
                <span className="num">{n}</span>
                <h3 className="h3">{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <Ph label="[PHOTO — Nitienaa teaching / workshop]" h={440} />
          <div className="stack lg">
            <p className="eyebrow">Meet Nitienaa</p>
            <h2 className="h2">[One-line positioning statement from your content]</h2>
            <p className="lead">[Two to three sentences introducing Nitienaa, her background and why she created THE HUMAN OS™. Supplied by you.]</p>
            <Link className="btn" href={href("/about")} style={{ alignSelf: 'flex-start' }}>Read the full story</Link>
          </div>
        </div>
      </section>

      <section className="sec dark">
        <div className="wrap stack lg">
          <div className="row between">
            <div className="stack" style={{ maxWidth: 640 }}>
              <p className="eyebrow">Inside the programme</p>
              <h2 className="h2">Six weeks. One system. Built in public with your cohort.</h2>
            </div>
            <Link className="btn" href={href("/method")}>Explore the method</Link>
          </div>
          <div className="g3">
            <div className="card stack"><p className="eyebrow">Weekly</p><h3 className="h3">Live class</h3><p className="muted">A scheduled session with a join link, reminders before it starts and a recording after.</p></div>
            <div className="card stack"><p className="eyebrow">Self-paced</p><h3 className="h3">Lessons</h3><p className="muted">Short lessons in the portal, unlocked week by week, on phone, tablet or desktop.</p></div>
            <div className="card stack"><p className="eyebrow">Practice</p><h3 className="h3">Assignments</h3><p className="muted">Submit as a file or text, then see personal feedback right in your portal.</p></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap stack lg">
          <div className="row between">
            <div className="stack"><p className="eyebrow">Stories and proof</p><h2 className="h2">What learners say</h2></div>
            <Link className="btn" href={href("/stories")}>All stories</Link>
          </div>
          <div className="g3">
            {[1, 2, 3].map((i) => (
              <figure className="card stack" style={{ margin: 0 }} key={i}>
                <blockquote style={{ margin: 0, fontSize: 19, lineHeight: 1.55 }}>“[Learner quote — supplied by you]”</blockquote>
                <figcaption className="small muted">[Name], [Role / city], Cohort [#]</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <p className="eyebrow">Free resource</p>
            <h2 className="h2">[Lead magnet title]</h2>
            <p className="lead">[One-line promise of the free resource.] Delivered to your inbox, with an optional WhatsApp confirmation.</p>
            <LeadForm compact />
          </div>
          <Ph label="[LEAD MAGNET COVER MOCKUP]" h={360} />
        </div>
      </section>

      <section className="sec">
        <div className="wrap stack lg">
          <div className="row between">
            <div className="stack"><p className="eyebrow">From the blog</p><h2 className="h2">Latest articles</h2></div>
            <Link className="btn" href={href("/blog")}>All articles</Link>
          </div>
          <div className="g3">
            {posts.slice(0, 3).map((p) => (
              <Link key={p.slug} href={href(`/blog/${p.slug}`)} className="stack cardlink">
                <Ph label="[MIGRATED BLOG IMAGE]" h={220} />
                <p className="eyebrow">{p.category}</p>
                <h3 className="h3">{p.title}</h3>
                <p className="small muted">{p.date} · {p.read}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="card row between" style={{ background: '#F0A830', borderColor: '#F0A830', padding: 'clamp(28px, 5vw, 56px)', gap: 32 }}>
            <div className="stack" style={{ maxWidth: 640 }}>
              <p className="eyebrow" style={{ color: '#13212B' }}>Next cohort · {programme.startDate} · {programme.seats} seats</p>
              <h2 className="h2">Ready to begin? Seats are limited per cohort.</h2>
              <p style={{ fontSize: 19 }}>{programme.price} · one 6-week programme · certificate on completion</p>
            </div>
            <div className="row">
              <Link className="btn dk" href={href("/apply")}>Apply now</Link>
              <Link className="btn" href={href("/enrol")}>Enrol and pay</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
