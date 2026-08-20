'use client';

// Wires lib/keyer.js to the world: pointer/keyboard events in, sidetone out,
// marks for the scope kept in a ref (never React state — they change per
// keypress and are read per frame), decoded text and readout as state.
//
// Commit timing: after each key-up two timeouts fire keyer.tick() at the
// char-gap and word-gap boundaries; the next key-down also settles pending
// commits, so decoding never depends on an animation loop running.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createKeyer } from '@/lib/keyer';
import { createEngine } from '@/lib/audio';
import { track } from '@/lib/track';

const READOUT_KEEP = 40;   // committed patterns kept for the band
const TIMEOUT_SLACK_MS = 30;

export default function useKeyer({ wpm, toneHz }) {
  const engineRef = useRef(null);
  const keyerRef = useRef(null);
  const marksRef = useRef([]);          // [{ down, up|null }] — pruned by the scope
  const timersRef = useRef([]);
  const sessionRef = useRef({ startedAt: 0, chars: 0, keyedTracked: false });

  const [keyedDown, setKeyedDown] = useState(false);
  const [pendingPattern, setPendingPattern] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [sent, setSent] = useState('');
  const [muted, setMuted] = useState(false);
  const [lastCharacter, setLastCharacter] = useState(null); // { char, at } for the fullscreen reveal

  if (keyerRef.current == null) {
    keyerRef.current = createKeyer({ wpm });
  }

  // Live retune — no remount (acceptance #2).
  useEffect(() => {
    keyerRef.current.setWpm(wpm);
  }, [wpm]);
  useEffect(() => {
    engineRef.current?.setTone(toneHz);
  }, [toneHz]);

  const endSession = useCallback(() => {
    const s = sessionRef.current;
    if (s.chars > 0) {
      track('characters_sent', { count: s.chars, mode: 'free' });
      track('session_duration', { seconds: Math.round((performance.now() - s.startedAt) / 1000), mode: 'free' });
    }
    sessionRef.current = { startedAt: 0, chars: 0, keyedTracked: false };
  }, []);

  const apply = useCallback((events) => {
    for (const ev of events) {
      if (ev.type === 'element') {
        setPendingPattern(keyerRef.current.pending());
      } else if (ev.type === 'character') {
        setPatterns((p) => [...p, ev.pattern].slice(-READOUT_KEEP));
        setSent((s) => s + ev.char);
        setPendingPattern('');
        setLastCharacter({ char: ev.char, at: performance.now() });
        const session = sessionRef.current;
        session.chars += 1;
        if (!session.keyedTracked) {
          session.keyedTracked = true;
          track('free_keyed');
        }
      } else if (ev.type === 'word') {
        setSent((s) => (s && !s.endsWith(' ') ? `${s} ` : s));
      }
    }
  }, []);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  const schedule = useCallback(() => {
    clearTimers();
    const th = keyerRef.current.thresholds();
    const flush = () => apply(keyerRef.current.tick(performance.now()));
    timersRef.current = [
      setTimeout(flush, th.charGap + TIMEOUT_SLACK_MS),
      setTimeout(flush, th.wordGap + TIMEOUT_SLACK_MS),
    ];
  }, [apply, clearTimers]);

  // toneHz must be fresh inside keyDown without re-creating the handler.
  const toneHzRef = useRef(toneHz);
  useEffect(() => {
    toneHzRef.current = toneHz;
  }, [toneHz]);

  const keyDown = useCallback(() => {
    if (keyerRef.current.isDown()) return;
    clearTimers();
    if (!engineRef.current) engineRef.current = createEngine();
    engineRef.current.setTone(toneHzRef.current);
    engineRef.current.keyDown();
    const now = performance.now();
    const s = sessionRef.current;
    if (!s.startedAt) s.startedAt = now;
    marksRef.current.push({ down: now, up: null });
    setKeyedDown(true);
    apply(keyerRef.current.down(now));
  }, [apply, clearTimers]);

  const keyUp = useCallback(() => {
    if (!keyerRef.current.isDown()) return;
    engineRef.current?.keyUp();
    const now = performance.now();
    const open = marksRef.current[marksRef.current.length - 1];
    if (open && open.up == null) open.up = now;
    setKeyedDown(false);
    apply(keyerRef.current.up(now));
    schedule();
  }, [apply, schedule]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!engineRef.current) engineRef.current = createEngine();
      engineRef.current.setMuted(!m);
      return !m;
    });
  }, []);

  const clear = useCallback(() => {
    clearTimers();
    keyerRef.current.reset();
    marksRef.current = [];
    setSent('');
    setPatterns([]);
    setPendingPattern('');
    setKeyedDown(false);
    setLastCharacter(null);
    endSession();
  }, [clearTimers, endSession]);

  // Global keyboard + safety nets. Space keys unless an interactive element has focus.
  useEffect(() => {
    const interactive = (el) =>
      !!el && !!el.closest && !!el.closest('button, a, input, textarea, select, [contenteditable]');
    const onKeyDown = (e) => {
      if (e.code !== 'Space' || e.repeat || interactive(e.target)) return;
      e.preventDefault();
      keyDown();
    };
    const onKeyUp = (e) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      keyUp();
    };
    const onBlur = () => keyUp();
    const onHidden = () => {
      if (document.visibilityState === 'hidden') keyUp();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [keyDown, keyUp]);

  // Teardown: end the analytics session, silence and dispose the engine.
  useEffect(() => {
    return () => {
      clearTimers();
      endSession();
      const e = engineRef.current;
      if (e) e.dispose();
      engineRef.current = null;
    };
  }, [clearTimers, endSession]);

  /** Pointer handlers for a key surface. Spread onto the element. */
  const surfaceProps = useMemo(
    () => ({
      onPointerDown: (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        keyDown();
      },
      onPointerUp: () => keyUp(),
      onPointerCancel: () => keyUp(),
    }),
    [keyDown, keyUp],
  );

  return {
    keyedDown,
    pendingPattern,
    patterns,
    sent,
    muted,
    lastCharacter,
    marksRef,
    keyDown,
    keyUp,
    toggleMute,
    clear,
    surfaceProps,
  };
}
