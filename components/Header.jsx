'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';
import { track } from '@/lib/track';

const TABS = [
  { href: '/', label: 'Translate', mode: 'translate' },
  { href: '/free', label: 'Free Mode', mode: 'free' },
  { href: '/learn', label: 'Learn', mode: 'learn' },
];

function activeIndex(pathname) {
  if (pathname.startsWith('/free')) return 1;
  if (pathname.startsWith('/learn')) return 2;
  return 0;
}

export default function Header() {
  const pathname = usePathname() || '/';
  const idx = activeIndex(pathname);
  const { settings } = useSettings();

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 4, height: 20 }}>
          <div style={{ width: 7, height: 18, borderRadius: 2, background: 'var(--logo-a)' }} />
          <div style={{ width: 21, height: 18, borderRadius: 2, background: 'var(--logo-b)' }} />
          <div style={{ width: 7, height: 18, borderRadius: 2, background: 'var(--logo-c)' }} />
        </div>
        <div style={{ fontSize: 27, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)' }}>Morsia</div>
      </div>

      <nav aria-label="Sections" style={{ position: 'relative', display: 'flex', alignItems: 'stretch', padding: 5, borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 5, bottom: 5, left: 5, width: 'calc((100% - 10px) / 3)', borderRadius: 999,
            background: 'var(--interact)', transition: 'transform 380ms cubic-bezier(0.22,1,0.36,1)',
            transform: `translateX(${idx * 100}%)`,
          }}
        />
        {TABS.map((tab, i) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={i === idx ? 'page' : undefined}
            onClick={() => { if (i !== idx) track('mode_switched', { to: tab.mode }); }}
            // A mouse click must not leave the tab focused: Free Mode's spacebar
            // would then paint a focus ring on it. Tab-to-focus is unaffected.
            onPointerDown={(e) => e.preventDefault()}
            style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 500, padding: '8px 20px', minWidth: 112, borderRadius: 999, flex: '1 1 0',
              transition: 'color 220ms', color: i === idx ? 'var(--on-accent)' : 'var(--muted)', textDecoration: 'none',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-soft)', fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>
        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)', animation: 'morsia-breathe 2.6s ease-in-out infinite' }} />
        <span>{settings.wpm} WPM</span>
        <span aria-hidden="true" style={{ color: 'var(--border)' }}>/</span>
        <span>{settings.toneHz} Hz</span>
      </div>
    </header>
  );
}
