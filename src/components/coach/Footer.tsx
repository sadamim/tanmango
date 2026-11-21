import Link from 'next/link';
import { programme , href } from '@/lib/coach/content';

export default function Footer() {
  return (
    <footer className="dark site-footer">
      <div className="wrap stack lg">
        <div className="footer-grid">
          <div className="stack footer-brand">
            <div className="logo logo--light">
              <span className="logo__name">Nitienaa</span>
              <span className="logo__tag mono">THE HUMAN OS™</span>
            </div>
            <p className="muted" style={{ maxWidth: 380 }}>
              A 6-week cohort programme with live classes, lessons and assignments, run by Nitienaa.
            </p>
            <Link className="btn pri sm" href={href("/free-resource")} style={{ alignSelf: 'flex-start' }}>Get the free resource</Link>
          </div>
          <div className="stack fl">
            <p className="eyebrow">Explore</p>
            <Link href={href("/about")}>About</Link>
            <Link href={href("/programme")}>Programme</Link>
            <Link href={href("/events")}>Events</Link>
            <Link href={href("/blog")}>Blog</Link>
            <Link href="/portal">Learning portal</Link>
          </div>
          <div className="stack fl">
            <p className="eyebrow">Company</p>
            <Link href={href("/contact")}>Contact</Link>
            <Link href={href("/press")}>Press and media</Link>
            <Link href={href("/apply")}>Apply</Link>
          </div>
          <div className="stack fl">
            <p className="eyebrow">Legal</p>
            <Link href={href("/privacy")}>Privacy</Link>
            <Link href={href("/terms")}>Terms</Link>
            <Link href={href("/refund-policy")}>Refund policy</Link>
          </div>
        </div>
        <div className="footer-rule" />
        <div className="row between small muted">
          <p>© {new Date().getFullYear()} Nitienaa. THE HUMAN OS™ is a trademark of {programme.legalEntity}.</p>
          <p>Payments secured by Razorpay</p>
        </div>
      </div>
    </footer>
  );
}
