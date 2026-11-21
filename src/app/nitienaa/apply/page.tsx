import { Crumbs, Step } from '@/components/coach/ui';
import ApplyForm from '@/components/coach/ApplyForm';
import { programme , href } from '@/lib/coach/content';

export const metadata = {
  title: 'Apply for THE HUMAN OS™',
  description: 'Apply for the next cohort of THE HUMAN OS™. It takes about 5 minutes.',
};

export default function Apply() {
  return (
    <section className="sec sm">
      <div className="wrap split">
        <div className="stack lg split__aside">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Apply' }]} />
          <p className="eyebrow">Apply · Cohort {programme.cohort}</p>
          <h1 className="h2" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>Apply for THE HUMAN OS™</h1>
          <p className="lead" style={{ fontSize: 18 }}>It takes about 5 minutes. You will hear back by email, usually within [X] working days.</p>
          <div className="card flat stack">
            <p className="eyebrow">What happens next</p>
            <Step n="1" sm><p className="small">We email you to confirm your application arrived.</p></Step>
            <Step n="2" sm><p className="small">Nitienaa&apos;s team reviews it and may follow up.</p></Step>
            <Step n="3" sm><p className="small">If it is a fit, you receive your link to enrol and pay.</p></Step>
          </div>
        </div>
        <div className="card split__main" style={{ padding: 'clamp(24px, 4vw, 40px)' }}><ApplyForm /></div>
      </div>
    </section>
  );
}
