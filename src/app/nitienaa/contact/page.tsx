import Link from 'next/link';
import { Crumbs } from '@/components/coach/ui';
import ContactForm from '@/components/coach/ContactForm';
import { programme , href } from '@/lib/coach/content';

export const metadata = {
  title: 'Contact',
  description: 'Questions about THE HUMAN OS™, workshops or collaborations? Get in touch with Nitienaa’s team.',
};

export default function Contact() {
  return (
    <section className="sec sm">
      <div className="wrap split">
        <div className="stack lg split__aside">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Contact' }]} />
          <p className="eyebrow">Contact</p>
          <h1 className="h2" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>Let&apos;s talk</h1>
          <p className="lead" style={{ fontSize: 18 }}>Questions about the programme, workshops or collaborations? Send a message and we will reply within [X] working days.</p>
          <div className="stack" style={{ gap: 14 }}>
            <div className="card flat stack" style={{ gap: 4, padding: 20 }}><p className="eyebrow">Email</p><a href={`mailto:${programme.email}`}>{programme.email}</a></div>
            <div className="card flat stack" style={{ gap: 4, padding: 20 }}><p className="eyebrow">WhatsApp</p><a href="https://wa.me/">{programme.whatsapp}</a></div>
            <div className="card flat stack" style={{ gap: 4, padding: 20 }}><p className="eyebrow">Media enquiries</p><Link href={href("/press")}>Press and media page</Link></div>
          </div>
        </div>
        <div className="card split__main" style={{ padding: 'clamp(24px, 4vw, 40px)' }}><ContactForm /></div>
      </div>
    </section>
  );
}
