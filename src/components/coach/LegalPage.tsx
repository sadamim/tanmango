import Link from 'next/link';
import { Crumbs } from '@/components/coach/ui';
import type { ReactNode } from 'react';

type Section = { h: string; body: ReactNode };

import { href } from '@/lib/coach/content';
const links: Record<string, [string, string]> = { privacy: [href('/privacy'), 'Privacy'], terms: [href('/terms'), 'Terms'], refund: [href('/refund-policy'), 'Refund policy'] };

export default function LegalPage({ id, title, updated = '[DATE]', note, intro, sections }: { id: 'privacy' | 'terms' | 'refund'; title: string; updated?: string; note: string; intro?: ReactNode; sections: Section[] }) {
  const others = Object.entries(links).filter(([k]) => k !== id);
  return (
    <>
      <section className="sec sm alt">
        <div className="wrap stack">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: title }]} />
          <h1 className="h2">{title}</h1>
          <p className="muted">
            Last updated {updated}
            {others.map(([k, [h, l]]) => <span key={k}> · <Link href={h}>{l}</Link></span>)}
          </p>
        </div>
      </section>
      {intro}
      <section className="sec sm">
        <div className="wrap legal-wrap">
          <nav className="stack small legal-toc" aria-label="On this page">
            <p className="eyebrow">On this page</p>
            {sections.map((s, i) => <a key={i} href={`#s${i + 1}`}>{s.h}</a>)}
          </nav>
          <article className="legal">
            <p className="card flat small">{note}</p>
            {sections.map((s, i) => (
              <div key={i}>
                <h2 id={`s${i + 1}`}>{i + 1}. {s.h}</h2>
                {s.body}
              </div>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
