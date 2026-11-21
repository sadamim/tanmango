import Link from 'next/link';
import LegalPage from '@/components/coach/LegalPage';
import { programme , href } from '@/lib/coach/content';

export const metadata = { title: 'Privacy policy', description: 'How Nitienaa collects, uses and protects your personal data.' };

export default function Privacy() {
  const sections = [
    { h: 'Who we are', body: <p>This site and the THE HUMAN OS™ learning portal are run by {programme.legalEntity}, [ADDRESS] (&quot;we&quot;, &quot;us&quot;).</p> },
    { h: 'What we collect', body: <ul><li>Details you give us: name, email, WhatsApp number, city, application answers and messages.</li><li>Learning data: progress, attendance, assignments and feedback in the portal.</li><li>Payment records: amount, date and payment ID from Razorpay. We never receive your full card details.</li><li>Technical data: device, browser and pages visited.</li></ul> },
    { h: 'How we use it', body: <p>To deliver free resources, review applications, run the programme, provide portal access, issue receipts and certificates, and improve the site.</p> },
    { h: 'Email and WhatsApp', body: <p>We send messages linked to what you asked for: resource delivery, application updates, payment confirmations, class and assignment reminders, feedback notices and cohort announcements. WhatsApp messages are sent only if you opt in. You can opt out at any time.</p> },
    { h: 'Payments', body: <p>Payments are processed by Razorpay under its own privacy policy.</p> },
    { h: 'Cookies and analytics', body: <p>We use Google Analytics and the Meta Conversions API to measure visits, sign-ups and payments. [Describe the cookie banner and consent options.]</p> },
    { h: 'Sharing', body: <p>We share data only with service providers that help us run the programme ([hosting, database, email, WhatsApp, Zoom or Google Meet, Razorpay]), or where the law requires it. We do not sell your data.</p> },
    { h: 'Retention', body: <p>[How long each type of data is kept.]</p> },
    { h: 'Your rights', body: <p>You can ask to access, correct or delete your data, or withdraw consent, by writing to {programme.email}.</p> },
    { h: 'Contact', body: <p>Grievance officer: [NAME], {programme.email}. Or use the <Link href={href("/contact")}>contact page</Link>.</p> },
  ];
  return <LegalPage id="privacy" title="Privacy policy" note="Template structure. Final wording to be supplied by you and reviewed by your legal adviser, including India's Digital Personal Data Protection Act, 2023." sections={sections} />;
}
