'use client';

// The rhythm strip. Two stacked canvases:
//   static  — baseline, unit graticule, resting bars, letter labels
//             (redrawn only when segments / wpm / labels / size / tokens change)
//   dynamic — the sounding bar and playhead (rAF only while `clock` is given)
// Props in, nothing else. Bars and gaps are exact multiples of --unit.
// Tokens are read once (mount, resize, motion-pref change) — never in the loop.

import { useEffect, useRef } from 'react';
import { unitMs, cumulativeStarts, indexAtMs } from '@/lib/timing';
import { readTokens } from '@/components/tokens';

const SIZES = ['--unit', '--bar-h', '--bar-radius', '--strip-bar-top', '--strip-label-size', '--strip-label-gap', '--strip-pad-x'];
const COLORS = ['--bar-rest', '--bar-active', '--bar-active-glow', '--bar-active-core', '--baseline', '--muted', '--border-soft', '--playhead'];
const STRINGS = ['--font-mono'];

function roundedRect(g, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + rr, y);
  g.arcTo(x + w, y, x + w, y + h, rr);
  g.arcTo(x + w, y + h, x, y + h, rr);
  g.arcTo(x, y + h, x, y, rr);
  g.arcTo(x, y, x + w, y, rr);
  g.closePath();
}

function computeLayout(segments, wpm, tk, wrapWidth) {
  const pxPerMs = tk['--unit'] / unitMs(wpm);
  const starts = cumulativeStarts(segments);
  const totalPx = starts[segments.length] * pxPerMs;
  const width = Math.max(wrapWidth, totalPx + 2 * tk['--strip-pad-x']);
  const height = tk['--strip-bar-top'] + tk['--bar-h'] + 1 + tk['--strip-label-gap'] + tk['--strip-label-size'] + 4;
  return {
    pxPerMs,
    starts,
    totalPx,
    width,
    height,
    offsetX: (width - totalPx) / 2, // centred when short, padded when scrolling
    dpr: Math.min(2, window.devicePixelRatio || 1),
  };
}

function sizeCanvas(canvas, geom) {
  canvas.width = Math.round(geom.width * geom.dpr);
  canvas.height = Math.round(geom.height * geom.dpr);
  canvas.style.width = `${geom.width}px`;
  canvas.style.height = `${geom.height}px`;
  canvas.getContext('2d').setTransform(geom.dpr, 0, 0, geom.dpr, 0, 0);
}

function clearCanvas(canvas) {
  const g = canvas.getContext('2d');
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, canvas.width, canvas.height);
  g.restore();
}

function drawStatic(canvas, geom, tk, segments, showLabels) {
  const g = canvas.getContext('2d');
  const { width, height, offsetX, pxPerMs, starts, totalPx } = geom;
  const barTop = tk['--strip-bar-top'];
  const barH = tk['--bar-h'];
  const baseY = barTop + barH;
  g.clearRect(0, 0, width, height);

  g.fillStyle = tk['--baseline'];
  g.fillRect(0, baseY, width, 1);

  if (totalPx > 0) {
    g.fillStyle = tk['--border-soft'];
    for (let x = offsetX; x <= offsetX + totalPx + 0.5; x += tk['--unit']) {
      g.fillRect(Math.round(x), baseY + 1, 1, 3);
    }
  }

  g.fillStyle = tk['--bar-rest'];
  const groups = new Map(); // charIndex → { char, x0, x1 }
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (!s.on) continue;
    const x = offsetX + starts[i] * pxPerMs;
    const w = s.ms * pxPerMs;
    roundedRect(g, x, barTop, w, barH, tk['--bar-radius']);
    g.fill();
    const grp = groups.get(s.charIndex);
    if (grp) grp.x1 = x + w;
    else groups.set(s.charIndex, { char: s.char, x0: x, x1: x + w });
  }

  if (showLabels && groups.size) {
    g.fillStyle = tk['--muted'];
    g.font = `${tk['--strip-label-size']}px ${tk['--font-mono'] || 'monospace'}`;
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    const y = baseY + 1 + tk['--strip-label-gap'] + tk['--strip-label-size'];
    for (const grp of groups.values()) g.fillText(grp.char, (grp.x0 + grp.x1) / 2, y);
  }
}

/** Draws the sounding bar + playhead for time tSec; returns the playhead x. */
function drawDynamic(canvas, geom, tk, segments, tSec, reduced) {
  const g = canvas.getContext('2d');
  const { width, height, offsetX, pxPerMs, starts } = geom;
  const barTop = tk['--strip-bar-top'];
  const barH = tk['--bar-h'];
  g.clearRect(0, 0, width, height);

  const ms = tSec * 1000;
  const i = indexAtMs(starts, ms);
  if (i >= 0 && segments[i].on) {
    const x = offsetX + starts[i] * pxPerMs;
    const w = segments[i].ms * pxPerMs;
    g.fillStyle = tk['--bar-active'];
    if (!reduced) {
      g.shadowColor = tk['--bar-active-glow'];
      g.shadowBlur = 24;
    }
    roundedRect(g, x, barTop, w, barH, tk['--bar-radius']);
    g.fill();
    if (!reduced) {
      g.shadowColor = tk['--bar-active-core'];
      g.shadowBlur = 8;
      g.fill();
    }
    g.shadowBlur = 0;
  }

  const total = starts[starts.length - 1];
  const px = offsetX + Math.max(0, Math.min(ms, total)) * pxPerMs;
  g.fillStyle = tk['--playhead'];
  g.fillRect(Math.round(px), 0, 1, barTop + barH + 1);
  return px;
}

export default function Scope({ segments, wpm, clock, showLabels }) {
  const wrapRef = useRef(null);
  const boxRef = useRef(null);
  const staticRef = useRef(null);
  const dynRef = useRef(null);
  const stateRef = useRef({ tokens: null, geom: null, reduced: false, props: { segments, wpm, showLabels } });
  const redrawRef = useRef(null);

  // Tokens + geometry: read on mount and again on resize / motion-pref change.
  useEffect(() => {
    const wrap = wrapRef.current;
    const st = stateRef.current;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const layout = () => {
      const wrapWidth = wrap.clientWidth;
      if (!wrapWidth || !st.tokens) return;
      const { segments: segs, wpm: w, showLabels: labels } = st.props;
      const geom = computeLayout(segs, w, st.tokens, wrapWidth);
      st.geom = geom;
      boxRef.current.style.width = `${geom.width}px`;
      boxRef.current.style.height = `${geom.height}px`;
      sizeCanvas(staticRef.current, geom);
      sizeCanvas(dynRef.current, geom);
      drawStatic(staticRef.current, geom, st.tokens, segs, labels);
    };

    const refresh = () => {
      st.tokens = readTokens({ sizes: SIZES, colors: COLORS, strings: STRINGS });
      st.reduced = mq.matches;
      layout();
    };

    redrawRef.current = layout;
    refresh();
    const ro = new ResizeObserver(refresh);
    ro.observe(wrap);
    mq.addEventListener('change', refresh);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', refresh);
      redrawRef.current = null;
    };
  }, []);

  // Static layer follows the message / speed / label toggle.
  useEffect(() => {
    stateRef.current.props = { segments, wpm, showLabels };
    const redraw = redrawRef.current;
    if (redraw) redraw();
  }, [segments, wpm, showLabels]);

  // Dynamic layer: rAF only while a clock is supplied.
  useEffect(() => {
    const canvas = dynRef.current;
    const wrap = wrapRef.current;
    const st = stateRef.current;
    if (!clock) {
      clearCanvas(canvas);
      return undefined;
    }
    let raf = 0;
    let lastScroll = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const geom = st.geom;
      const tk = st.tokens;
      if (!geom || !tk) return;
      const t = clock();
      if (t == null) return;
      const px = drawDynamic(canvas, geom, tk, st.props.segments, t, st.reduced);

      // Keep the playhead in the middle 60% of the viewport (throttled).
      const vis = wrap.clientWidth;
      if (wrap.scrollWidth > vis + 1) {
        const rel = px - wrap.scrollLeft;
        const now = performance.now();
        if ((rel < vis * 0.2 || rel > vis * 0.8) && now - lastScroll > 250) {
          lastScroll = now;
          wrap.scrollTo({ left: Math.max(0, px - vis / 2), behavior: st.reduced ? 'auto' : 'smooth' });
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      clearCanvas(canvas);
    };
  }, [clock]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="Rhythm of the message as timing bars"
      style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}
    >
      <div
        ref={boxRef}
        style={{
          position: 'relative',
          height: 'calc(var(--strip-bar-top) + var(--bar-h) + 1px + var(--strip-label-gap) + var(--strip-label-size) + 4px)',
        }}
      >
        <canvas ref={staticRef} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, display: 'block' }} />
        <canvas ref={dynRef} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, display: 'block' }} />
      </div>
    </div>
  );
}
