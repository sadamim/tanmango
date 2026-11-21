import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

// Image placeholder. Swap for <Image src=... /> from next/image when photos arrive.
export function Ph({ label, h = 120, style, className = '' }: { label: string; h?: number; style?: CSSProperties; className?: string }) {
  return (
    <div className={'ph ' + className} style={{ minHeight: h, ...style }} role="img" aria-label={label}>
      {label}
    </div>
  );
}

export function Avatar({ size = 48 }) {
  return (
    <span className="ph" style={{ width: size, height: size, minHeight: size, borderRadius: 999, padding: 0, fontSize: 10, flex: 'none' }} aria-hidden="true">
      IMG
    </span>
  );
}

export function Crumbs({ items }: { items: { l: string; h?: string }[] }) {
  return (
    <p className="crumb">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && ' / '}
          {it.h ? <Link href={it.h}>{it.l}</Link> : it.l}
        </span>
      ))}
    </p>
  );
}

export function Check({ children, color = '#1E6B3A', cross = false }: { children: ReactNode; color?: string; cross?: boolean }) {
  return (
    <div className="li">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" aria-hidden="true">
        <path d={cross ? 'M6 6l12 12M18 6L6 18' : 'M5 12l5 5L20 7'} />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export function Step({ n, children, sm = false }: { n: ReactNode; children: ReactNode; sm?: boolean }) {
  return (
    <div className="step">
      <span className={'n' + (sm ? ' n--sm' : '')}>{n}</span>
      <div>{children}</div>
    </div>
  );
}

export function Chips({ options, value, onChange, label }: { options: string[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="row" role="group" aria-label={label} style={{ gap: 8 }}>
      {options.map((o) => (
        <button key={o} className={'btn sm' + (value === o ? ' dk' : '')} aria-pressed={value === o} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}
