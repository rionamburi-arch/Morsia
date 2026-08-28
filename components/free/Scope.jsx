'use client';

// Free Mode's live oscilloscope. NOT Translate's strip: the x-axis is real
// elapsed time. The write head is the right edge; marks scroll left underneath
// it and silence draws itself as empty space.
//
// One canvas, one rAF loop. The loop runs only while keying or while marks are
// still inside the window; it pauses when idle (battery). Grid is a static
// ruler: a line every 3 units (one dah) measured from the right edge.
// Marks rise from the baseline — never centred.

import { useEffect, useRef } from 'react';
import { unitMs } from '@/lib/timing';
import { readTokens } from '@/components/tokens';

const WINDOW_UNITS = 42;   // visible time = 42 units, scales with WPM
const GRID_UNITS = 3;      // one gridline per dah width
const MARK_RISE = 0.6;     // marks rise to 60% of canvas height
const BASELINE_PAD = 18;   // px from the bottom edge

const SIZES = ['--bar-radius'];
const COLORS = ['--bar-rest', '--bar-active', '--baseline', '--grat-minor', '--muted'];

export default function Scope({ marksRef, keyed, wpm, height }) {
  const canvasRef = useRef(null);
  const stRef = useRef({ tokens: null, w: 0, h: 0, running: false, raf: 0 });
  const keyedRef = useRef(keyed);
  const unitRef = useRef(unitMs(wpm));

  useEffect(() => {
    unitRef.current = unitMs(wpm);
  }, [wpm]);

  useEffect(() => {
    const cv = canvasRef.current;
    const g = cv.getContext('2d');
    const st = stRef.current;

    const fit = () => {
      st.tokens = readTokens({ sizes: SIZES, colors: COLORS });
      st.w = cv.clientWidth;
      st.h = cv.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(st.w * dpr);
      cv.height = Math.round(st.h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
      if (st.start) st.start(); // a resize while parked must not leave marks frozen
    };

    const draw = (now) => {
      const { w, h, tokens: tk } = st;
      if (!w || !h || !tk) return false;
      const unit = unitRef.current;
      const windowMs = WINDOW_UNITS * unit;
      const pxPerMs = w / windowMs;
      const baseY = h - BASELINE_PAD;
      const riseY = baseY - h * MARK_RISE;

      g.clearRect(0, 0, w, h);

      // Ruler grid: one line per dah, anchored to the write head (right edge).
      // It spans only the band the marks occupy — a ruler drawn over the whole
      // canvas turns an idle scope into an empty table — and each line carries
      // a tick below the baseline, the way the translate scale is ruled.
      const gridPx = GRID_UNITS * unit * pxPerMs;
      const gridTop = riseY - 8;
      for (let x = w; x >= 0; x -= gridPx) {
        const gx = Math.round(x) - 1;
        g.fillStyle = tk['--grat-minor'];
        g.fillRect(gx, gridTop, 1, baseY - gridTop);
        g.fillStyle = tk['--muted'];
        g.fillRect(gx, baseY + 1, 1, 4);
      }

      // Baseline.
      g.fillStyle = tk['--baseline'];
      g.fillRect(0, baseY, w, 1);

      // The write head. Marks appear at the right edge and scroll left, so the
      // edge is marked as a structural line rather than left to be inferred.
      g.fillStyle = tk['--muted'];
      g.fillRect(w - 1, gridTop - 8, 1, baseY - gridTop + 8);

      // Marks: prune what has scrolled off, draw the rest rising from the baseline.
      const marks = marksRef.current;
      const cutoff = now - windowMs - 500;
      while (marks.length && marks[0].up != null && marks[0].up < cutoff) marks.shift();

      let visible = false;
      const r = Math.min(tk['--bar-radius'] || 0, 4);
      for (const m of marks) {
        const open = m.up == null;
        const x0 = w - (now - m.down) * pxPerMs;
        const x1 = w - (now - (m.up ?? now)) * pxPerMs;
        if (x1 < 0) continue;
        visible = true;
        const left = Math.max(-2, x0);
        const width = Math.max(1.5, x1 - left);
        // The mark being written NOW is the reference amber; settled marks are ink.
        g.fillStyle = open ? tk['--bar-active'] : tk['--bar-rest'];
        g.beginPath();
        if (typeof g.roundRect === 'function') g.roundRect(left, riseY, width, baseY - riseY, [r, r, 0, 0]);
        else g.rect(left, riseY, width, baseY - riseY);
        g.fill();
      }
      return visible;
    };

    const frame = () => {
      const anyVisible = draw(performance.now());
      if (keyedRef.current || anyVisible) {
        st.raf = requestAnimationFrame(frame);
      } else {
        st.running = false; // idle and empty: stop burning battery
      }
    };

    st.start = () => {
      if (st.running) return;
      st.running = true;
      st.raf = requestAnimationFrame(frame);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(cv);
    st.start();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(st.raf);
      st.running = false;
    };
  }, [marksRef]);

  // Key-down (or any keyed change) wakes the loop; it parks itself when done.
  useEffect(() => {
    keyedRef.current = keyed;
    const st = stRef.current;
    if (st.start) st.start();
  }, [keyed]);

  // WPM changes rescale the window/grid — wake the loop to repaint once.
  useEffect(() => {
    const st = stRef.current;
    if (st.start) st.start();
  }, [wpm]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: height || 'var(--scope-h)' }}
    />
  );
}
