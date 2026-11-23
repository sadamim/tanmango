import Link from 'next/link';
import { Ph, Step, Avatar } from '@/components/coach/ui';
import LeadForm from '@/components/coach/LeadForm';
import ApplyForm from '@/components/coach/ApplyForm';
import EnrolCheckout from '@/components/coach/EnrolCheckout';
import { StoriesGrid, EventsList, BlogGrid } from '@/components/coach/Filters';
import { WeekAccordion, Faq, MethodTabs } from '@/components/coach/Accordions';
import { LOGIN_URL, href, nav, posts } from '@/lib/coach/content';
import { getCoach } from '@/lib/coach/server';

export const metadata = {
  title: { absolute: 'Nitienaa | THE HUMAN OS™ — 6-week live cohort programme' },
  description: 'Upgrade the operating system you run on every day. A live, guided 6-week programme with Nitienaa: live classes, lessons, assignments and a certificate.',
};
export const dynamic = 'force-dynamic';

/** Band that opens each header topic, with links to its sections. */
function TopicBar({ id }: { id: string }) {
  const t = nav.find((x) => x.id === id)!;
  return (
    <div className="topicbar">
      <div className="wrap row between">
        <p className="eyebrow">{t.label}</p>
        <nav aria-label={`${t.label} sections`} className="row" style={{ gap: 8 }}>
          {t.sections.map((s) => <a key={s.id} className="btn sm" href={`#${s.id}`}>{s.l}</a>)}
        </nav>
      </div>
    </div>
  );
}

const steps = [
  ['01', 'Enrol', 'Apply and pay securely on the site.'],
  ['02', 'Account', 'Your portal account is created automatically.'],
  ['03', 'Welcome', 'Login details arrive by email and WhatsApp.'],
  ['04', 'Learn', 'Live classes, lessons and assignments each week.'],
  ['05', 'Complete', 'Progress is tracked to your certificate.'],
];
const included = [
  ['6 live classes', 'Join link, reminders by email and WhatsApp, and recordings.'],
  ['Learning portal', 'A dashboard with the week-by-week programme and a progress bar.'],
  ['Assignments and feedback', 'Submit as files or text and get personal feedback.'],
  ['Resource library', 'Worksheets and downloads for every week.'],
  ['Cohort announcements', 'Updates from Nitienaa, straight to your portal.'],
  ['Certificate', 'Awarded when you complete the programme.'],
];
const rhythm = [
  ['1', 'Lesson', 'Short lessons open in the portal at the start of each week.'],
  ['2', 'Live class', 'Work through it together with Nitienaa and the cohort.'],
  ['3', 'Assignment', 'Apply it to your own life and submit a file or text.'],
  ['4', 'Feedback', 'Get notified when feedback is ready in your portal.'],
];
const faqs: [string, string][] = [
  ['What happens after I pay?', 'Your portal account is created automatically and your login details arrive by email and WhatsApp.'],
  ['What if I miss a live class?', 'Every live class is recorded and added to your portal.'],
  ['How much time does it take each week?', '[Weekly time commitment — as you supply]'],
  ['Do I get a certificate?', 'Yes. Your progress is tracked in the portal and a certificate is issued when you complete the programme.'],
  ['Can I get a refund?', 'Refunds follow the refund policy. See the Refund policy page for details.'],
];

export default async function Home() {
  const { programme, mangoId } = await getCoach();
  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => p !== featured);
  const facts = [['Starts', programme.startDate], ['Length', `${programme.weeks} weeks`], ['Format', 'Live online + portal'], ['Cohort size', `Up to ${programme.capacity} learners`]];

  return (
    <>
      {/* ------------------------------------------------ HERO */}
      <section className="sec" id="top" style={{ paddingTop: 88 }}>
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <p className="eyebrow">6-week cohort programme · Next cohort {programme.startDate}</p>
            <h1 className="h1">Upgrade the operating system you run on every day.</h1>
            <p className="lead">{programme.name} is a live, guided 6-week programme with Nitienaa. Weekly live classes, short lessons and practical assignments, with your progress tracked all the way to a certificate.</p>
            <div className="row"><a className="btn pri" href="#apply">Apply for the next cohort</a><a className="btn" href="#programme">See the programme</a></div>
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

      {/* ================================================ ABOUT */}
      <TopicBar id="about" />
      <section className="sec" id="about">
        <div className="wrap stack lg">
          <div className="g2" style={{ alignItems: 'center' }}>
            <Ph label="[PORTRAIT — Nitienaa]" h={520} />
            <div className="stack lg">
              <p className="eyebrow">About Nitienaa</p>
              <h2 className="h2">[Headline about Nitienaa, from your content]</h2>
              <p className="lead">[Short introduction: who Nitienaa is, who she works with and what THE HUMAN OS™ helps them change.]</p>
              <div className="prose" style={{ fontSize: 17 }}>
                <p>[Paragraph 1 of Nitienaa&apos;s story — background and turning point.]</p>
                <p>[Paragraph 2 — what she learned, and how it became a method.]</p>
              </div>
            </div>
          </div>
          <div className="g3">
            {['one', 'two', 'three'].map((n, i) => <div className="card stack" key={n}><span className="num sm">0{i + 1}</span><h3 className="h3">[Value {n}]</h3><p className="muted">[One sentence explaining it.]</p></div>)}
          </div>
          <div className="g4">
            {[1, 2, 3, 4].map((i) => <div className="card flat stack" key={i}><p className="mono" style={{ color: '#1E5B55' }}>[YEAR]</p><p>[Milestone or credential]</p></div>)}
          </div>
        </div>
      </section>

      <section className="sec alt" id="stories">
        <div className="wrap stack lg">
          <div className="stack" style={{ maxWidth: 820 }}><p className="eyebrow">Stories and proof</p><h2 className="h2">Real people. Real cohorts. In their own words.</h2><p className="lead">Every quote is shared with permission.</p></div>
          <div className="card g2" style={{ alignItems: 'center', padding: 'clamp(20px, 3vw, 36px)' }}>
            <Ph label="[VIDEO TESTIMONIAL — supplied by you]" h={320} />
            <div className="stack lg">
              <p className="eyebrow">Featured story</p>
              <blockquote style={{ margin: 0, fontFamily: 'var(--font-sg)', fontSize: 28, lineHeight: 1.3, fontWeight: 500 }}>“[Featured learner quote — supplied by you]”</blockquote>
              <p className="muted">[Name], [Role / city] · Cohort [#]</p>
            </div>
          </div>
          <StoriesGrid />
          <div className="g4">
            {[['[#]', 'learners completed'], ['[#]', 'cohorts run'], ['[#%]', 'completion rate'], ['[#]', 'average rating']].map(([n, l]) => <div className="stack" key={l}><span className="num">{n}</span><p className="muted">{l}</p></div>)}
          </div>
        </div>
      </section>

      {/* ================================================ PROGRAMME */}
      <TopicBar id="programme" />
      <section className="sec dark" id="programme">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <p className="eyebrow">The programme</p>
            <h2 className="h1" style={{ fontSize: 'clamp(40px, 5vw, 68px)' }}>{programme.name}</h2>
            <p className="lead">{programme.description}</p>
            <div className="row"><a className="btn pri" href="#apply">Apply now</a><a className="btn" href="#method">How the method works</a></div>
          </div>
          <div className="card stack lg" style={{ background: '#FFFFFF', color: '#13212B', borderColor: '#FFFFFF' }}>
            <p className="eyebrow" style={{ color: '#1E5B55' }}>Next cohort</p>
            <div className="stack" style={{ gap: 8 }}>
              {facts.map(([k, v]) => <div key={k} className="stack" style={{ gap: 8 }}><div className="row between"><span style={{ color: '#4E5D65' }}>{k}</span><strong>{v}</strong></div><div className="hr" /></div>)}
              <div className="row between"><span style={{ color: '#4E5D65' }}>Investment</span><strong style={{ fontSize: 22 }}>{programme.price}</strong></div>
            </div>
            <a className="btn dk" href="#enrol" style={{ color: '#fff', borderColor: '#13212B' }}>Enrol and pay</a>
          </div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap stack lg">
          <div className="g2">
            <div className="stack lg"><p className="eyebrow">Who it is for</p><h2 className="h2">[Who this programme is for]</h2><p className="lead">[A short description of the ideal learner, from your content.]</p></div>
            <div className="stack">{['one', 'two', 'three'].map((n) => <div className="card flat step" key={n}><span className="n">✓</span><p>[Fit statement {n}]</p></div>)}</div>
          </div>
          <div className="stack" style={{ maxWidth: 720 }}><p className="eyebrow">Week by week</p><h2 className="h2">The six weeks</h2><p className="lead">Each week has one live class, lessons in the portal and one assignment. Select a week to see it.</p></div>
          <WeekAccordion weeks={programme.weeks} />
          <div className="stack"><p className="eyebrow">What is included</p><h2 className="h2">Everything you get</h2></div>
          <div className="g3">{included.map(([t, d]) => <div className="card stack" key={t}><h3 className="h3">{t}</h3><p className="muted">{d}</p></div>)}</div>
        </div>
      </section>

      <section className="sec alt" id="method">
        <div className="wrap stack lg">
          <div className="stack" style={{ maxWidth: 820 }}><p className="eyebrow">The method</p><h2 className="h2">[Name or one-line summary of the method]</h2><p className="lead">[How the method works, in two sentences — from your content.]</p></div>
          <MethodTabs />
          <div className="stack"><p className="eyebrow">The weekly rhythm</p><h3 className="h3" style={{ fontSize: 28 }}>Learn, practise, get feedback, repeat</h3></div>
          <div className="g4">{rhythm.map(([n, t, d]) => <div className="card stack" key={n}><span className="num sm">{n}</span><h3 className="h3">{t}</h3><p className="muted">{d}</p></div>)}</div>
        </div>
      </section>

      <section className="sec" id="events">
        <div className="wrap stack lg">
          <div className="stack" style={{ maxWidth: 820 }}><p className="eyebrow">Events and workshops</p><h2 className="h2">Talks, workshops and open sessions</h2><p className="lead">Meet Nitienaa live, online or in person. Free open sessions are a good way to try the method before you apply.</p></div>
          <EventsList />
          <div className="card flat row between">
            <div className="stack" style={{ maxWidth: 620 }}><h3 className="h3">Bring a workshop to your team or event</h3><p className="muted">Send an enquiry with your dates and audience.</p></div>
            <div className="row"><Link className="btn pri" href={href('/contact')}>Send an enquiry</Link><Link className="btn" href={href('/press')}>Speaker kit</Link></div>
          </div>
        </div>
      </section>

      {/* ================================================ RESOURCES */}
      <TopicBar id="resources" />
      <section className="sec alt" id="blog">
        <div className="wrap stack lg">
          <div className="stack"><p className="eyebrow">The blog</p><h2 className="h2">Notes on being human</h2></div>
          <BlogGrid posts={rest} />
        </div>
      </section>

      <section className="sec sm" id="article">
        <div className="wrap stack lg">
          <p className="eyebrow">Latest article</p>
          <Link href={href(`/blog/${featured.slug}`)} className="card g2 cardlink" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
            <Ph label="[FEATURED POST IMAGE — migrated]" h={360} style={{ borderRadius: 0, border: 0 }} />
            <div className="stack lg" style={{ padding: 'clamp(24px, 4vw, 48px)', justifyContent: 'center' }}>
              <span className="tag sun" style={{ alignSelf: 'flex-start' }}>{featured.category}</span>
              <h2 className="h2">{featured.title}</h2>
              <p className="muted">{featured.excerpt}</p>
              <div className="row" style={{ gap: 12 }}><Avatar size={40} /><span className="small muted">Nitienaa · {featured.date} · {featured.read}</span></div>
              <span className="btn dk sm" style={{ alignSelf: 'flex-start' }}>Read the article</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="sec alt" id="free-resource">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <p className="eyebrow">Free resource</p>
            <h2 className="h2">[Lead magnet title]</h2>
            <p className="lead">[What the reader gets and the result it helps them reach.] Delivered to your inbox, with an optional WhatsApp confirmation.</p>
            <div className="stack" style={{ gap: 10 }}>{['one', 'two', 'three'].map((n) => <Step key={n} n="✓" sm><p>[What is inside — point {n}]</p></Step>)}</div>
          </div>
          <div className="card" style={{ padding: 'clamp(24px, 4vw, 40px)' }}><LeadForm /></div>
        </div>
      </section>

      {/* ================================================ APPLY AND ENROL */}
      <TopicBar id="apply" />
      <section className="sec" id="apply">
        <div className="wrap split">
          <div className="stack lg split__aside">
            <p className="eyebrow">Apply · Cohort {programme.cohort}</p>
            <h2 className="h2">Apply for {programme.name}</h2>
            <p className="lead" style={{ fontSize: 18 }}>It takes about 5 minutes. You will hear back by email, usually within [X] working days.</p>
            <div className="card flat stack">
              <p className="eyebrow">What happens next</p>
              <Step n="1" sm><p className="small">We email you to confirm your application arrived.</p></Step>
              <Step n="2" sm><p className="small">Nitienaa&apos;s team reviews it and may follow up.</p></Step>
              <Step n="3" sm><p className="small">If it is a fit, you enrol and pay below.</p></Step>
            </div>
          </div>
          <div className="card split__main" style={{ padding: 'clamp(24px, 4vw, 40px)' }}><ApplyForm /></div>
        </div>
      </section>

      <section className="sec alt" id="enrol">
        <div className="wrap stack lg">
          <div className="stack"><p className="eyebrow">Enrol and pay</p><h2 className="h2">Secure your seat in Cohort {programme.cohort}</h2><p className="lead">Pay securely with Razorpay: UPI, cards, net banking and wallets. A receipt is emailed to you automatically.</p></div>
          {!mangoId && <p className="card flat small" role="status">Enrolment isn&apos;t connected yet. In the dashboard, open Growth › Settings and choose the programme mango; its price appears here.</p>}
          <div className="row" style={{ gap: 32, alignItems: 'flex-start' }}>
            <div className="card" style={{ flex: '999 1 520px', minWidth: 0, padding: 'clamp(24px, 4vw, 40px)' }}>
              <EnrolCheckout price={programme.price} programmeName={programme.name} cohort={programme.cohort} />
            </div>
            <aside className="card stack lg" style={{ flex: '1 1 300px', minWidth: 0, padding: 'clamp(20px, 4vw, 32px)', border: '2px solid #13212B', overflowWrap: 'anywhere' }} aria-label="Order summary">
              <div className="row between"><h3 className="h3">{programme.name}</h3><span className="tag sun">{programme.seats} seats left</span></div>
              <p style={{ fontFamily: 'var(--font-sg)', fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: 600, lineHeight: 1.05 }}>{programme.price}</p>
              <p className="muted small">{programme.priceNotes}</p>
              <div className="hr" />
              <div className="row between"><span className="muted">Programme fee</span><span>{programme.price}</span></div>
              <div className="row between"><span className="muted">GST</span><span>{programme.gst}</span></div>
              <div className="row between"><strong>Total</strong><strong style={{ fontSize: 22 }}>{programme.total}</strong></div>
              <Link className="small muted" href={href('/refund-policy')}>Read the refund policy</Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="sec" id="confirmation">
        <div className="wrap g2" style={{ alignItems: 'center' }}>
          <div className="stack lg">
            <p className="eyebrow">Confirmation</p>
            <h2 className="h2">What happens after you pay</h2>
            <p className="lead">You land on a confirmation page with your receipt, and the same receipt is emailed to you. Then:</p>
            <Step n="1"><strong>Your portal account is created</strong><p className="small muted">Automatically, with the email you paid with.</p></Step>
            <Step n="2"><strong>Welcome email and WhatsApp</strong><p className="small muted">Your login details and the kick-off date.</p></Step>
            <Step n="3"><strong>Log in with your email</strong><p className="small muted">You get a one-time code each time, so there is no password to remember.</p></Step>
            <div className="row"><Link className="btn dk" href={LOGIN_URL}>Learner login</Link></div>
          </div>
          <div className="card stack lg" style={{ padding: 32 }} aria-label="Sample receipt">
            <div className="row between"><h3 className="h3">Receipt</h3><span className="tag ok">Payment successful</span></div>
            <div className="stack small" style={{ gap: 10 }}>
              <div className="row between"><span className="muted">Billed to</span><span>Your name</span></div>
              <div className="row between"><span className="muted">Payment ID</span><span className="mono">pay_…</span></div>
              <div className="row between"><span className="muted">Method</span><span>UPI / Card / Net banking</span></div>
            </div>
            <div className="hr" />
            <div className="row between"><strong>Total paid</strong><strong style={{ fontSize: 22 }}>{programme.total}</strong></div>
          </div>
        </div>
      </section>

      <section className="sec alt" id="faq">
        <div className="narrow stack lg">
          <div className="stack"><p className="eyebrow">Questions</p><h2 className="h2">Frequently asked</h2></div>
          <Faq items={faqs} />
        </div>
      </section>
    </>
  );
}

