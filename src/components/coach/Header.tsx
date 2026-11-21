'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { nav , href, LOGIN_URL, SIGNUP_URL } from '@/lib/coach/content';

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState('');
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Close menus on route change, outside click and Escape.
  useEffect(() => { setOpen(''); setMobile(false); }, [pathname]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(''); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(''); };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, []);

  const activeGroup = nav.find((g) => g.items.some((i) => pathname === i.h.split('?')[0]))?.id;

  return (
    <header className="site-header" ref={ref}>
      <div className="wrap site-header__bar">
        <Link href={href("/")} className="logo">
          <span className="logo__name">Nitienaa</span>
          <span className="logo__tag mono">THE HUMAN OS™</span>
        </Link>

        <button
          className="navbtn menu-toggle"
          aria-expanded={mobile}
          aria-controls="main-nav"
          onClick={() => setMobile((m) => !m)}
        >
          {mobile ? 'Close' : 'Menu'}
        </button>

        <div id="main-nav" className={'site-header__nav' + (mobile ? ' is-open' : '')}>
          <nav aria-label="Main" className="row" style={{ gap: 2 }}>
            {nav.map((g) => {
              const isOpen = open === g.id;
              return (
                <div key={g.id} className="dd-wrap">
                  <button
                    className={'navbtn' + (activeGroup === g.id || isOpen ? ' on' : '')}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? '' : g.id)}
                  >
                    {g.label}
                    <Chevron />
                  </button>
                  {isOpen && (
                    <div className="dd">
                      {g.items.map((it) => (
                        <Link key={it.h} href={it.h}>
                          {it.l}
                          <span>{it.d}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link className={'navbtn' + (pathname === href('/enrol') ? ' on' : '')} href={href("/enrol")}>Pricing</Link>
          </nav>
          <div className="row" style={{ gap: 8 }}>
            <Link className="navbtn" href={LOGIN_URL}>Log in</Link>
            <Link className="btn dk sm" href={SIGNUP_URL}>Sign up</Link>
            <Link className="btn pri sm" href={href("/apply")}>Apply now</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
