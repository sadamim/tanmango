import type { ReactNode } from 'react';
import { Crumbs } from '@/components/coach/ui';
import TopicNav from '@/components/coach/TopicNav';
import { href, nav } from '@/lib/coach/content';

/** A header topic's page: title, intro, the sticky bar of its sections, then the sections. */
export default function TopicPage({ id, title, children }: { id: string; title?: string; children: ReactNode }) {
  const topic = nav.find((t) => t.id === id)!;
  return (
    <div className="topic-page">
      <section className="sec sm topic-hero">
        <div className="wrap stack">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: topic.label }]} />
          <h1 className="h1" style={{ fontSize: 'clamp(40px, 6vw, 68px)' }}>{title || topic.label}</h1>
          <p className="lead">{topic.intro}</p>
        </div>
      </section>
      <TopicNav topic={topic} />
      {children}
    </div>
  );
}
