'use client';

import { useEffect, useState } from 'react';
import type { Topic } from '@/lib/coach/content';

/** Bar under the header on a topic page: links to the page's sections, highlighting the one on screen. */
export default function TopicNav({ topic }: { topic: Topic }) {
  const [active, setActive] = useState(topic.sections[0]?.id || '');

  useEffect(() => {
    const els = topic.sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const onScroll = () => {
      let cur = topic.sections[0]?.id || '';
      for (const el of els) if (el.getBoundingClientRect().top <= 170) cur = el.id;
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [topic]);

  return (
    <div className="topicbar sticky">
      <div className="wrap row between">
        <p className="eyebrow">{topic.label}</p>
        <nav aria-label={`${topic.label} sections`} className="row" style={{ gap: 8 }}>
          {topic.sections.map((s) => (
            <a key={s.id} className={'btn sm' + (active === s.id ? ' pri' : '')} aria-current={active === s.id ? 'location' : undefined} href={`#${s.id}`}>
              {s.l}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
