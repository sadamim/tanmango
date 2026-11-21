import LegalPage from '@/components/coach/LegalPage';
import { programme } from '@/lib/coach/content';

export const metadata = { title: 'Terms', description: 'Terms of use and enrolment for the Nitienaa website and THE HUMAN OS™ programme.' };

export default function Terms() {
  const sections = [
    { h: 'About these terms', body: <p>These terms apply to this website and to THE HUMAN OS™ programme and learning portal, run by {programme.legalEntity}.</p> },
    { h: 'Your account', body: <p>One account covers the site and the portal. Keep your login private; accounts are for one person and cannot be shared.</p> },
    { h: 'Enrolment and payment', body: <p>Your seat is confirmed once Razorpay confirms your payment. The price shown at checkout is [inclusive / exclusive] of GST. A receipt is emailed automatically. Pending or failed payments do not confirm a seat.</p> },
    { h: 'The programme', body: <p>THE HUMAN OS™ runs for 6 weeks per cohort. [Programme details exactly as you supply them.] We may adjust dates or session times with reasonable notice.</p> },
    { h: 'Live classes and recordings', body: <p>Live classes run on [Zoom / Google Meet]. Sessions may be recorded and shared only with your cohort in the portal. Portal access remains open for [PERIOD] after the cohort ends.</p> },
    { h: 'Conduct', body: <p>Treat fellow learners with respect and keep what others share in class confidential. We may remove access for serious breaches.</p> },
    { h: 'Intellectual property', body: <p>Lessons, worksheets, recordings and the THE HUMAN OS™ name belong to {programme.legalEntity}. They are for your personal use only.</p> },
    { h: 'Certificate', body: <p>A completion certificate is issued when you meet the completion criteria shown in your portal: [criteria, e.g. attendance and assignments].</p> },
    { h: 'Not professional advice', body: <p>The programme is educational and is not medical, psychological, legal or financial advice.</p> },
    { h: 'Liability', body: <p>[Limitation of liability wording.]</p> },
    { h: 'Governing law', body: <p>These terms are governed by the laws of India, with courts in [CITY] having jurisdiction.</p> },
  ];
  return <LegalPage id="terms" title="Terms of use and enrolment" note="Template structure. Final wording to be supplied by you and reviewed by your legal adviser." sections={sections} />;
}
