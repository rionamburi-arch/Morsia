'use client';

// One audio engine per page. Owns playing / muted / repeat / light and exposes
// stable, render-free probes for canvases: clock(), probe() and sounding().

import { useCallback, useEffect, useRef, useState } from 'react';
import { createEngine } from '@/lib/audio';
import { cumulativeStarts, indexAtMs } from '@/lib/timing';

const END_SLACK_MS = 60;

export default function usePlayer({ toneHz }) {
  const engineRef = useRef(null);
  const runRef = useRef(null); // { segments, starts, start, total, timer }
  const optsRef = useRef({ toneHz, muted: false, repeat: false });

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    optsRef.current = { toneHz, muted, repeat };
  }, [toneHz, muted, repeat]);

  useEffect(() => {
    return () => {
      if (runRef.current) clearTimeout(runRef.current.timer);
      runRef.current = null;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    if (runRef.current) clearTimeout(runRef.current.timer);
    runRef.current = null;
    engineRef.current?.stop();
    setPlaying(false);
  }, []);

  /** Returns false when Web Audio is unavailable. */
  const play = useCallback((segments) => {
    if (!engineRef.current) engineRef.current = createEngine();
    const engine = engineRef.current;

    const run = (segs) => {
      const { toneHz: hz, muted: m } = optsRef.current;
      const res = engine.play(segs, { toneHz: hz, muted: m });
      if (!res) return false;
      if (runRef.current) clearTimeout(runRef.current.timer);
      const r = { segments: segs, starts: cumulativeStarts(segs), start: res.start, total: res.total, timer: 0 };
      r.timer = setTimeout(() => {
        if (runRef.current !== r) return;
        if (optsRef.current.repeat) {
          if (!run(segs)) {
            runRef.current = null;
            setPlaying(false);
          }
        } else {
          runRef.current = null;
          setPlaying(false);
        }
      }, res.total * 1000 + END_SLACK_MS);
      runRef.current = r;
      return true;
    };

    const ok = run(segments);
    setPlaying(ok);
    return ok;
  }, []);

  const toggleMute = useCallback(() => {
    const next = !optsRef.current.muted;
    if (next) engineRef.current?.stop(); // silence now; the strip keeps moving
    setMuted(next);
  }, []);

  const toggleRepeat = useCallback(() => setRepeat((r) => !r), []);
  const toggleLight = useCallback(() => setLight((l) => !l), []);

  /** Seconds since the current run started, or null when idle. */
  const clock = useCallback(() => {
    const r = runRef.current;
    if (!r || !engineRef.current) return null;
    return engineRef.current.now() - r.start;
  }, []);

  /** The segment under the clock as { on, char, charIndex }, or null when idle. */
  const probe = useCallback(() => {
    const r = runRef.current;
    if (!r || !engineRef.current) return null;
    const ms = (engineRef.current.now() - r.start) * 1000;
    const i = indexAtMs(r.starts, ms);
    if (i < 0) return { on: false, char: null, charIndex: -1 };
    const s = r.segments[i];
    return { on: s.on, char: s.char, charIndex: s.charIndex };
  }, []);

  /** True while the segment under the clock is a tone. */
  const sounding = useCallback(() => {
    const p = probe();
    return !!p && p.on;
  }, [probe]);

  return { playing, muted, repeat, light, play, stop, toggleMute, toggleRepeat, toggleLight, clock, probe, sounding };
}
