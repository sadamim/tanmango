'use client';

import { useState } from 'react';

export function WeekAccordion({ weeks = 6 }) {
  const [open, setOpen] = useState(1);
  return (
    <div className="stack" style={{ gap: 12 }}>
      {Array.from({ length: weeks }, (_, i) => i + 1).map((n) => {
        const isOpen = open === n;
        return (
          <div className="card" style={{ padding: 0 }} key={n}>
            <button className="acc-btn" style={{ padding: '24px 28px', minHeight: 72 }} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? 0 : n)}>
              <span className="mono" style={{ color: '#1E5B55', fontSize: 14, flex: 'none' }}>WEEK {n}</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, flex: 1 }}>[Week {n} theme]</span>
              <span style={{ fontSize: 24, flex: 'none' }} aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="g3" style={{ padding: '0 28px 28px', gap: 16 }}>
                <div className="stack" style={{ gap: 6 }}><p className="eyebrow">Live class</p><p>[Live class topic]</p></div>
                <div className="stack" style={{ gap: 6 }}><p className="eyebrow">Lessons</p><p>[Lesson titles]</p></div>
                <div className="stack" style={{ gap: 6 }}><p className="eyebrow">Assignment</p><p>[Assignment brief]</p></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Faq({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="stack" style={{ gap: 0 }}>
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div style={{ borderBottom: '1px solid #D6DCD8' }} key={q}>
            <button className="acc-btn" style={{ justifyContent: 'space-between', fontWeight: 600, fontSize: 18, padding: '20px 0' }} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
              {q}<span aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="muted" style={{ padding: '0 0 20px' }}>{a}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function MethodTabs() {
  const L = [
    { k: '01', name: '[Layer one]', weeks: '1–2' }, { k: '02', name: '[Layer two]', weeks: '2–3' },
    { k: '03', name: '[Layer three]', weeks: '4–5' }, { k: '04', name: '[Layer four]', weeks: '5–6' },
  ];
  const [i, setI] = useState(0);
  const cur = L[i];
  return (
    <div className="stack lg">
      <div className="row" role="tablist" aria-label="Method layers" style={{ gap: 8 }}>
        {L.map((l, j) => (
          <button key={l.k} role="tab" aria-selected={i === j} className={'btn sm' + (i === j ? ' dk' : '')} onClick={() => setI(j)}>
            {l.k} · {l.name}
          </button>
        ))}
      </div>
      <div className="card g2" role="tabpanel" style={{ padding: 'clamp(24px, 4vw, 48px)', alignItems: 'center' }}>
        <div className="stack lg">
          <p className="mono" style={{ fontSize: 14, color: '#1E5B55' }}>LAYER {cur.k}</p>
          <h2 className="h2">{cur.name}</h2>
          <p className="lead">[What this layer covers and what changes for the learner — from your content.]</p>
          <p className="small muted">Covered in weeks {cur.weeks}</p>
        </div>
        <div className="ph" style={{ minHeight: 320 }}>[DIAGRAM / ILLUSTRATION — layer {cur.k}]</div>
      </div>
    </div>
  );
}
