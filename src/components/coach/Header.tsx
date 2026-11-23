'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BASE, LOGIN_URL, PORTAL_URL, SIGNUP_URL, nav, sec } from '@/lib/coach/content';

/**
 * Plain-link header for the one-page site. Each topic scrolls to its first section;
 * the topic whose sections are on screen is highlighted.
 */
export default function Header() {
  const pathname = usePathname() || '/';
  const [mobile, setMobile] = useState(false);
  const [active, setActive] = useState('');
  const onHome = pathname === BASE || pathname === BASE + '/';

  useEffect(() => { setMobile(false); }, [pathname]);

  // Scroll spy: highlight the topic of the section nearest the top of the screen.
  useEffect(() => {
    if (!onHome) { setActive(''); return; }
    const owner: Record<string, string> = {};
    nav.forEach((t) => t.sections.forEach((s) => { owner[s.id] = t.id; }));
    const els = Object.keys(owner).map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const onScroll = () => {
      let cur = '';
      for (const el of els) if (el.getBoundingClientRect().top <= 140) cur = owner[el.id];
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onHome]);

  return (
    <header className="site-header">
      <div className="wrap site-header__bar">
        <Link href={BASE} className="logo">
          <span className="logo__name">Nitienaa</span>
          <span className="logo__tag mono">THE HUMAN OS™</span>
        </Link>

        <button className="navbtn menu-toggle" aria-expanded={mobile} aria-controls="main-nav" onClick={() => setMobile((m) => !m)}>
          {mobile ? 'Close' : 'Menu'}
        </button>

        <div id="main-nav" className={'site-header__nav' + (mobile ? ' is-open' : '')}>
          <nav aria-label="Main" className="row" style={{ gap: 2 }}>
            {nav.map((t) => (
              <Link key={t.id} href={t.h} className={'navbtn' + (active === t.id ? ' on' : '')} aria-current={active === t.id ? 'location' : undefined} onClick={() => setMobile(false)}>
                {t.label}
              </Link>
            ))}
            <Link className="navbtn" href={PORTAL_URL}>Learner login</Link>
            <Link className="navbtn" href={sec('enrol')} onClick={() => setMobile(false)}>Pricing</Link>
          </nav>
          <div className="row" style={{ gap: 8 }}>
            <Link className="navbtn" href={LOGIN_URL}>Log in</Link>
            <Link className="btn dk sm" href={SIGNUP_URL}>Sign up</Link>
            <Link className="btn pri sm" href={sec('apply')} onClick={() => setMobile(false)}>Apply now</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
