'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BASE, LOGIN_URL, PORTAL_URL, SIGNUP_URL, nav, sec } from '@/lib/coach/content';

/**
 * Plain-link header. Each topic is its own page; the topics inside it are sections listed
 * in the bar at the top of that page. The topic whose page is open is highlighted.
 */
export default function Header() {
  const pathname = usePathname() || '/';
  const [mobile, setMobile] = useState(false);

  useEffect(() => { setMobile(false); }, [pathname]);

  const isActive = (h: string) => pathname === h || pathname.startsWith(h + '/');

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
              <Link key={t.id} href={t.h} className={'navbtn' + (isActive(t.h) ? ' on' : '')} aria-current={isActive(t.h) ? 'page' : undefined} onClick={() => setMobile(false)}>
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
