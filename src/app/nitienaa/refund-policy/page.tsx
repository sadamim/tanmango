import Link from 'next/link';
import LegalPage from '@/components/coach/LegalPage';
import { programme , href } from '@/lib/coach/content';

export const metadata = { title: 'Refund policy', description: 'How refunds work for THE HUMAN OS™: eligibility, how to request one and timings.' };

const flow = [
  ['1', 'Request', `Email ${programme.email} or use the contact form with your receipt number.`],
  ['2', 'Review', 'We check the request against this policy within [X] working days.'],
  ['3', 'Processed', 'Approved refunds go back to your original payment method via Razorpay.'],
  ['4', 'Confirmed', 'You get a confirmation by email and a status update on WhatsApp.'],
];

export default function Refund() {
  const intro = (
    <section className="sec sm">
      <div className="wrap stack lg">
        <div className="stack"><p className="eyebrow">At a glance</p><h2 className="h3">How refunds work</h2></div>
        <div className="g4">
          {flow.map(([n, t, d]) => (
            <div className="card stack" key={n}><span className="num" style={{ fontSize: 40 }}>{n}</span><strong>{t}</strong><p className="small muted">{d}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
  const sections = [
    { h: 'Eligibility', body: <ul><li>Before the cohort starts: [refund terms, e.g. full / partial refund up to X days before the start date].</li><li>After the cohort starts: [refund terms].</li><li>[Any non-refundable items or conditions.]</li></ul> },
    { h: 'How to request a refund', body: <p>Write to {programme.email} from the email you enrolled with, including your name, cohort and receipt number.</p> },
    { h: 'Timing', body: <p>Once approved, refunds are issued through Razorpay. Banks usually take [5–7] working days to show the amount in your account.</p> },
    { h: 'Portal access after a refund', body: <p>Portal access ends when a refund is processed.</p> },
    { h: 'Failed or duplicate payments', body: <p>If you were charged twice or a failed payment was debited, contact us and we will reverse it in full.</p> },
    { h: 'Questions', body: <p>Use the <Link href={href("/contact")}>contact page</Link> and choose &quot;Payments or refunds&quot;.</p> },
  ];
  return <LegalPage id="refund" title="Refund policy" intro={intro} note="Refund terms below are placeholders. They will appear exactly as you supply them and should be reviewed by your legal adviser." sections={sections} />;
}
