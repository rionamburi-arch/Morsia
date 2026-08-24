'use client';

// Shown only when Clarity is actually configured — with no non-essential
// cookies there is nothing to consent to, and a banner for no reason costs
// traffic and Core Web Vitals.
//
// Accept and Decline are equally reachable: same size, same place, both real
// buttons. Making Decline harder would be a dark pattern and non-compliant.
// It never blocks the page: no overlay, no scroll lock, no modal.

import { useSyncExternalStore } from 'react';
import { grantClarityConsent } from '@/lib/analytics';

const KEY = 'morsia:consent'; // 'granted' | 'declined'

const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

function read() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return 'declined'; // storage blocked: assume no consent, ask nothing
  }
}

function write(value) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    /* nothing we can persist */
  }
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/** 'granted' | 'declined' | null (not asked yet). Server renders as answered. */
export function useConsent() {
  return useSyncExternalStore(subscribe, read, () => 'declined');
}

const button = {
  minHeight: 44, padding: '11px 20px', borderRadius: 999, cursor: 'pointer', appearance: 'none',
  fontFamily: 'inherit', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
};

export default function ConsentBanner() {
  const consent = useConsent();
  if (consent) return null; // answered once, never shown again

  const accept = () => {
    write('granted');
    grantClarityConsent();
  };

  return (
    <div
      role="region"
      aria-label="Cookie choice"
      className="consent-banner"
      style={{
        position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 50,
        maxWidth: 620, marginLeft: 'auto', marginRight: 'auto',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14,
        padding: '16px 20px', borderRadius: 24,
        background: 'var(--surface)', border: '1px solid var(--border)',
        boxShadow: '0 12px 40px rgb(0 0 0 / 0.35)',
      }}
    >
      <p style={{ flex: '1 1 260px', margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--ink)' }}>
        We can record how this page is used — clicks, scrolling and mouse movement — to work out what needs fixing.
        Nothing you type is recorded.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={accept}
          style={{ ...button, background: 'var(--signal)', border: '1px solid var(--signal)', color: 'var(--on-accent)' }}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => write('declined')}
          style={{ ...button, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
