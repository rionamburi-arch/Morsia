'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';

const TABS = [
  { href: '/', label: 'Translate', mode: 'translate' },
  { href: '/free', label: 'Free Mode', mode: 'free' },
  { href: '/chart', label: 'Chart', mode: 'chart' },
  { href: '/learn', label: 'Learn', mode: 'learn' },
];

// -1 for a page that is not one of the four sections (the tattoo guide): the
// pill has nowhere honest to sit, so it is not drawn at all.
function activeIndex(pathname) {
  if (pathname.startsWith('/free')) return 1;
  if (pathname.startsWith('/chart')) return 2;
  if (pathname.startsWith('/learn')) return 3;
  if (pathname === '/' || pathname.startsWith('/m/')) return 0;
  return -1;
}

export default function Header() {
  const pathname = usePathname() || '/';
  const idx = activeIndex(pathname);
  const { settings } = useSettings();
  const navRef = useRef(null);
  const activeRef = useRef(null);

  // Four pills overflow a phone: the row scrolls, so keep the active one in view.
  useEffect(() => {
    const nav = navRef.current;
    const active = activeRef.current;
    if (!nav || !active) return;
    const scroller = nav.parentElement;
    if (scroller && scroller.scrollWidth > scroller.clientWidth + 1) {
      active.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, [idx]);

  return (
    <header className="hdr-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: 18, minWidth: 0 }}>
      <div className="hdr-logo" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 4, height: 20 }}>
          <div style={{ width: 7, height: 18, borderRadius: 2, background: 'var(--logo-a)' }} />
          <div style={{ width: 21, height: 18, borderRadius: 2, background: 'var(--logo-b)' }} />
          <div style={{ width: 7, height: 18, borderRadius: 2, background: 'var(--logo-c)' }} />
        </div>
        <div className="hdr-mark" style={{ fontSize: 27, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)' }}>Morsia</div>
      </div>

      <div className="nav-scroll">
      <nav ref={navRef} aria-label="Sections" style={{ position: 'relative', display: 'flex', alignItems: 'stretch', width: 'max-content', padding: 5, borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
        {idx >= 0 && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', top: 5, bottom: 5, left: 5, width: `calc((100% - 10px) / ${TABS.length})`, borderRadius: 999,
              background: 'var(--interact)', transition: 'transform 380ms cubic-bezier(0.22,1,0.36,1)',
              transform: `translateX(${idx * 100}%)`,
            }}
          />
        )}
        {TABS.map((tab, i) => (
          <Link
            key={tab.href}
            href={tab.href}
            ref={i === idx ? activeRef : null}
            className="nav-tab"
            aria-current={i === idx ? 'page' : undefined}
            // A mouse click must not leave the tab focused: Free Mode's spacebar
            // would then paint a focus ring on it. Tab-to-focus is unaffected.
            onPointerDown={(e) => e.preventDefault()}
            style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 500, padding: '8px 20px', borderRadius: 999, flex: '1 1 0', whiteSpace: 'nowrap',
              transition: 'color 220ms', color: i === idx ? 'var(--on-accent)' : 'var(--muted)', textDecoration: 'none',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      </div>

      <div className="hdr-badge" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-soft)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>
        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)', animation: 'morsia-breathe 2.6s ease-in-out infinite' }} />
        <span>{settings.wpm} WPM</span>
        <span aria-hidden="true" style={{ color: 'var(--border)' }}>/</span>
        <span>{settings.toneHz} Hz</span>
      </div>
    </header>
  );
}
