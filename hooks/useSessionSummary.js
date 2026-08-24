'use client';

// Counts activity during a session and emits exactly one `session_summary`
// when the user leaves — on unmount, or when the tab is hidden (which is how
// most sessions actually end on a phone).
//
// This is the thing that keeps event volume sane: 200 keyed characters is one
// event, not 200.

import { useCallback, useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

export default function useSessionSummary(mode) {
  const ref = useRef({ startedAt: 0, characters: 0 });

  const flush = useCallback(() => {
    const s = ref.current;
    if (!s.characters) return;
    track('session_summary', {
      mode,
      characters: s.characters,
      seconds: Math.max(1, Math.round((performance.now() - s.startedAt) / 1000)),
    });
    ref.current = { startedAt: 0, characters: 0 }; // a later burst is a new session
  }, [mode]);

  /** Call once per character produced. Cheap: it only increments a ref. */
  const count = useCallback((n = 1) => {
    const s = ref.current;
    if (!s.startedAt) s.startedAt = performance.now();
    s.characters += n;
  }, []);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      flush();
    };
  }, [flush]);

  return { count, flush };
}
