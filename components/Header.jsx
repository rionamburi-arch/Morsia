'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';

const TABS = [
  { href: '/', label: 'Translate', mode: 'translate' },
  { href: '/free', label: 'Free Mode', mode: 'free' },
  { href: '/chart', label: 'Chart', mode: 'chart' },
  { href: '/learn', label: 'Learn', mode: 'learn' },
];

function activeIndex(pathname) {
  if (pathname.startsWith('/free')) return 1;
  if (pathname.startsWith('/chart')) return 2;
  if (pathname.startsWith('/learn')) return 3;
  return 0;
}

// The wordmark is itself a measured object: three blocks at 1 / 3 / 1 units
// on a baseline — the letter R, drawn the way the product draws everything.
function Mark() {
  const u = 6;
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ display: 'flex', alignItems: 'flex-end', gap: u, height: 16 }}>
        <span style={{ width: u, height: 16, background: 'var(--ink)' }} />
        <span style={{ width: u * 3, height: 16, background: 'var(--ink)' }} />
        <span style={{ width: u, height: 16, background: 'var(--reference)' }} />
      </span>
      <span style={{ width: u * 7, height: 1, background: 'var(--g3)' }} />
    </span>
  );
}

export default function Header() {
  const pathname = usePathname() || '/';
  const idx = activeIndex(pathname);
  const { settings } = useSettings();
  const navRef = useRef(null);
  const activeRef = useRef(null);
  const [mark, setMark] = useState({ left: 0, width: 0 });

  // The active mark is measured from the real tab, so it stays true when the
  // labels change width at a breakpoint or the font swaps in.
  useLayoutEffect(() => {
    const measure = () => {
      const el = activeRef.current;
      if (!el) return;
      setMark({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [idx]);

  // Four tabs overflow a phone: the row scrolls, so keep the active one in view.
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
    <header className="hdr-row">
      <div className="hdr-logo">
        <Mark />
        <span className="hdr-mark">Morsia</span>
      </div>

      <div className="nav-scroll">
        <nav ref={navRef} aria-label="Sections" className="nav-rail">
          <span
            aria-hidden="true"
            className="nav-mark"
            style={{ transform: `translateX(${mark.left}px) scaleX(${mark.width})` }}
          />
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
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="hdr-badge t-readout">
        <span aria-hidden="true" style={{ width: 5, height: 5, background: 'var(--reference)', animation: 'morsia-live 2.6s ease-in-out infinite' }} />
        <span><span className="t-value">{settings.wpm}</span> <span className="t-unit">WPM</span></span>
        <span aria-hidden="true" style={{ color: 'var(--g3)' }}>·</span>
        <span><span className="t-value">{settings.toneHz}</span> <span className="t-unit">Hz</span></span>
      </div>
    </header>
  );
}
