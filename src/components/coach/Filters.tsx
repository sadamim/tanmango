'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Chips, Avatar } from '@/components/coach/ui';
import type { Post } from '@/lib/coach/content';

import { href } from '@/lib/coach/content';
export function StoriesGrid() {
  const all = [
    { theme: 'Clarity', cohort: '1' }, { theme: 'Confidence', cohort: '1' }, { theme: 'Habits', cohort: '2' },
    { theme: 'Clarity', cohort: '2' }, { theme: 'Habits', cohort: '3' }, { theme: 'Confidence', cohort: '3' },
  ];
  const [f, setF] = useState('All');
  return (
    <div className="stack lg">
      <Chips label="Filter stories" options={['All', 'Clarity', 'Confidence', 'Habits']} value={f} onChange={setF} />
      <div className="g3">
        {all.filter((s) => f === 'All' || s.theme === f).map((s, i) => (
          <figure className="card stack" style={{ margin: 0 }} key={i}>
            <span className="tag" style={{ alignSelf: 'flex-start' }}>{s.theme}</span>
            <blockquote style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>“[Learner quote — supplied by you]”</blockquote>
            <figcaption className="row" style={{ gap: 12 }}>
              <Avatar />
              <span className="small"><strong>[Name]</strong><br /><span className="muted">Cohort {s.cohort}</span></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function EventsList() {
  const all = [
    { type: 'Open session', where: 'Online · Zoom', price: 'Free', cta: 'Register' },
    { type: 'Workshop', where: '[City, venue]', price: '[PRICE]', cta: 'Book a seat' },
    { type: 'Open session', where: 'Online · Google Meet', price: 'Free', cta: 'Register' },
    { type: 'Talk', where: '[Conference name]', price: '[PRICE]', cta: 'Details' },
  ];
  const [f, setF] = useState('All');
  return (
    <div className="stack lg">
      <Chips label="Filter events" options={['All', 'Open session', 'Workshop', 'Talk']} value={f} onChange={setF} />
      <div className="stack">
        {all.filter((e) => f === 'All' || e.type === f).map((e, i) => (
          <article className="card row" style={{ gap: 28 }} key={i}>
            <div className="stack" style={{ gap: 0, flex: '0 0 96px', textAlign: 'center', background: '#F3F5F2', borderRadius: 14, padding: '14px 8px' }}>
              <span className="mono small" style={{ color: '#1E5B55' }}>[MON]</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 600, lineHeight: 1 }}>[DD]</span>
            </div>
            <div className="stack" style={{ flex: '1 1 360px', gap: 8 }}>
              <div className="row" style={{ gap: 8 }}><span className="tag">{e.type}</span><span className={e.price === 'Free' ? 'tag ok' : 'tag sun'}>{e.price}</span></div>
              <h2 className="h3">[Event title]</h2>
              <p className="muted small">[Time, IST] · {e.where}</p>
            </div>
            <Link className="btn dk sm" href={href("/contact")}>{e.cta}</Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export function BlogGrid({ posts }: { posts: Post[] }) {
  const cats = Array.from(new Set(posts.map((p) => p.category)));
  const [f, setF] = useState('All');
  const [q, setQ] = useState('');
  const list = posts.filter((p) => (f === 'All' || p.category === f) && (p.title + p.excerpt).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="stack lg">
      <div className="row between" style={{ alignItems: 'flex-end' }}>
        <Chips label="Filter by category" options={['All', ...cats]} value={f} onChange={setF} />
        <div className="field" style={{ flex: '0 1 340px' }}>
          <label htmlFor="b-search">Search articles</label>
          <input id="b-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or topic" />
        </div>
      </div>
      <div className="g3">
        {list.map((p) => (
          <Link key={p.slug} href={href(`/blog/${p.slug}`)} className="card stack cardlink" style={{ padding: 16 }}>
            <div className="ph" style={{ minHeight: 200 }}>[MIGRATED IMAGE]</div>
            <div className="stack" style={{ padding: '8px 8px 12px', gap: 10 }}>
              <p className="eyebrow">{p.category}</p>
              <h3 className="h3">{p.title}</h3>
              <p className="small muted">{p.date} · {p.read}</p>
            </div>
          </Link>
        ))}
        {list.length === 0 && <p className="muted">No articles match your search.</p>}
      </div>
    </div>
  );
}
