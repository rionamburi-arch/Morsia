'use client';

// The rhythm strip. Two stacked canvases, both sized to the VISIBLE viewport
// (never to the whole message — long messages would exceed the browser's
// canvas size limit). A spacer box carries the full timeline width so the
// wrapper scrolls natively; the canvases sit in a sticky layer and draw the
// timeline translated by -scrollLeft.
//   static  — baseline, unit graticule, resting bars, letter labels
//             (redrawn on segments / wpm / labels / size / tokens change and on scroll)
//   dynamic — the sounding bar and playhead (rAF only while `clock` is given)
// Props in, nothing else. Bars and gaps are exact multiples of --unit.
// Tokens are read once (mount, resize, DPR / motion-pref change) — never in the loop.

import { useEffect, useRef } from 'react';
import { unitMs, cumulativeStarts, indexAtMs } from '@/lib/timing';
import { readTokens } from '@/components/tokens';

const SIZES = [
  '--unit', '--bar-h', '--bar-radius', '--strip-bar-top', '--strip-label-size', '--strip-label-gap', '--strip-pad-x',
  '--bar-glow-outer', '--bar-glow-inner',
];
const COLORS = ['--bar-rest', '--bar-active', '--bar-active-glow', '--bar-active-core', '--baseline', '--muted', '--border-soft', '--playhead'];
const STRINGS = ['--font-mono', '--strip-label-tracking'];

const SCROLL_THROTTLE_MS = 250;

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

function computeLayout(segments, wpm, tk, viewW) {
  const pxPerMs = tk['--unit'] / unitMs(wpm);
  const starts = cumulativeStarts(segments);
  const totalPx = starts[segments.length] * pxPerMs;
  const fullWidth = Math.max(viewW, totalPx + 2 * tk['--strip-pad-x']);
  const height = tk['--strip-bar-top'] + tk['--bar-h'] + 1 + tk['--strip-label-gap'] + tk['--strip-label-size'] + 4;
  return {
    pxPerMs,
    starts,
    totalPx,
    fullWidth,
    viewW,
    height,
    offsetX: (fullWidth - totalPx) / 2, // centred when short, padded when scrolling
    dpr: Math.min(2, window.devicePixelRatio || 1),
  };
}

function sizeCanvas(canvas, geom) {
  canvas.width = Math.round(geom.viewW * geom.dpr);
  canvas.height = Math.round(geom.height * geom.dpr);
  canvas.style.width = `${geom.viewW}px`;
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

/** Index of the first segment whose group should be drawn for a viewport starting at `left` px. */
function firstVisibleIndex(segments, geom, left) {
  const msLeft = (left - geom.offsetX) / geom.pxPerMs;
  if (msLeft < 0) return 0;
  let i = indexAtMs(geom.starts, msLeft);
  if (i < 0) return segments.length; // viewport is past the end of the message
  // Walk back to the start of this character so its label can be centred.
  const ci = segments[i].charIndex;
  while (ci >= 0 && i > 0 && segments[i - 1].charIndex === ci) i--;
  return i;
}

function drawStatic(canvas, geom, tk, segments, showLabels, scrollLeft) {
  const g = canvas.getContext('2d');
  const { viewW, height, offsetX, pxPerMs, starts, totalPx } = geom;
  const barTop = tk['--strip-bar-top'];
  const barH = tk['--bar-h'];
  const baseY = barTop + barH;
  const left = scrollLeft;
  const right = scrollLeft + viewW;

  g.clearRect(0, 0, viewW, height);
  g.save();
  g.translate(-scrollLeft, 0);

  g.fillStyle = tk['--baseline'];
  g.fillRect(left, baseY, viewW, 1);

  if (totalPx > 0) {
    const unit = tk['--unit'];
    g.fillStyle = tk['--border-soft'];
    const firstTick = offsetX + Math.max(0, Math.floor((left - offsetX) / unit)) * unit;
    const lastTick = Math.min(offsetX + totalPx + 0.5, right + unit);
    for (let x = firstTick; x <= lastTick; x += unit) g.fillRect(Math.round(x), baseY + 1, 1, 3);
  }

  g.fillStyle = tk['--bar-rest'];
  const groups = new Map(); // charIndex → { char, x0, x1 }
  let lastGroup = -1;
  for (let i = firstVisibleIndex(segments, geom, left); i < segments.length; i++) {
    const s = segments[i];
    const x = offsetX + starts[i] * pxPerMs;
    // Past the right edge: stop once the current character group is complete.
    if (x > right && (s.charIndex < 0 || s.charIndex !== lastGroup)) break;
    if (!s.on) continue;
    const w = s.ms * pxPerMs;
    roundedRect(g, x, barTop, w, barH, tk['--bar-radius']);
    g.fill();
    lastGroup = s.charIndex;
    const grp = groups.get(s.charIndex);
    if (grp) grp.x1 = x + w;
    else groups.set(s.charIndex, { char: s.char, x0: x, x1: x + w });
  }

  if (showLabels && groups.size) {
    g.fillStyle = tk['--muted'];
    g.font = `${tk['--strip-label-size']}px ${tk['--font-mono'] || 'monospace'}`;
    if ('letterSpacing' in g && tk['--strip-label-tracking']) g.letterSpacing = tk['--strip-label-tracking'];
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    const y = baseY + 1 + tk['--strip-label-gap'] + tk['--strip-label-size'];
    for (const grp of groups.values()) g.fillText(grp.char, (grp.x0 + grp.x1) / 2, y);
  }

  g.restore();
}

/** Draws the sounding bar + playhead for time tSec; returns the playhead x in timeline px. */
function drawDynamic(canvas, geom, tk, segments, tSec, reduced, scrollLeft) {
  const g = canvas.getContext('2d');
  const { viewW, height, offsetX, pxPerMs, starts } = geom;
  const barTop = tk['--strip-bar-top'];
  const barH = tk['--bar-h'];
  g.clearRect(0, 0, viewW, height);
  g.save();
  g.translate(-scrollLeft, 0);

  const ms = tSec * 1000;
  const i = indexAtMs(starts, ms);
  if (i >= 0 && segments[i].on) {
    const x = offsetX + starts[i] * pxPerMs;
    const w = segments[i].ms * pxPerMs;
    g.fillStyle = tk['--bar-active'];
    if (!reduced) {
      g.shadowColor = tk['--bar-active-glow'];
      g.shadowBlur = tk['--bar-glow-outer'];
    }
    roundedRect(g, x, barTop, w, barH, tk['--bar-radius']);
    g.fill();
    if (!reduced) {
      g.shadowColor = tk['--bar-active-core'];
      g.shadowBlur = tk['--bar-glow-inner'];
      g.fill();
    }
    g.shadowBlur = 0;
  }

  const total = starts[starts.length - 1];
  const px = offsetX + Math.max(0, Math.min(ms, total)) * pxPerMs;
  g.fillStyle = tk['--playhead'];
  g.fillRect(Math.round(px), 0, 1, barTop + barH + 1);
  g.restore();
  return px;
}

export default function Scope({ segments, wpm, clock, showLabels }) {
  const wrapRef = useRef(null);
  const boxRef = useRef(null);
  const stickyRef = useRef(null);
  const staticRef = useRef(null);
  const dynRef = useRef(null);
  const stateRef = useRef({ tokens: null, geom: null, reduced: false, props: { segments, wpm, showLabels } });
  const redrawRef = useRef(null);

  // Tokens + geometry: read on mount and again on resize / DPR / motion-pref change.
  useEffect(() => {
    const wrap = wrapRef.current;
    const st = stateRef.current;
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dprMq = null;

    const paintStatic = () => {
      if (!st.geom || !st.tokens) return;
      const { segments: segs, showLabels: labels } = st.props;
      drawStatic(staticRef.current, st.geom, st.tokens, segs, labels, wrap.scrollLeft);
    };

    const layout = () => {
      const viewW = wrap.clientWidth;
      if (!viewW || !st.tokens) return;
      const { segments: segs, wpm: w } = st.props;
      const geom = computeLayout(segs, w, st.tokens, viewW);
      st.geom = geom;
      boxRef.current.style.width = `${geom.fullWidth}px`;
      boxRef.current.style.height = `${geom.height}px`;
      stickyRef.current.style.width = `${viewW}px`;
      stickyRef.current.style.height = `${geom.height}px`;
      sizeCanvas(staticRef.current, geom);
      sizeCanvas(dynRef.current, geom);
      paintStatic();
    };

    const refresh = () => {
      st.tokens = readTokens({ sizes: SIZES, colors: COLORS, strings: STRINGS });
      st.reduced = motionMq.matches;
      layout();
    };

    const onDprChange = () => {
      armDpr();
      refresh();
    };
    const armDpr = () => {
      if (dprMq) dprMq.removeEventListener('change', onDprChange);
      dprMq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprMq.addEventListener('change', onDprChange);
    };

    redrawRef.current = layout;
    refresh();
    armDpr();
    const ro = new ResizeObserver(refresh);
    ro.observe(wrap);
    motionMq.addEventListener('change', refresh);
    wrap.addEventListener('scroll', paintStatic, { passive: true });
    return () => {
      ro.disconnect();
      motionMq.removeEventListener('change', refresh);
      if (dprMq) dprMq.removeEventListener('change', onDprChange);
      wrap.removeEventListener('scroll', paintStatic);
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
      const scrollLeft = wrap.scrollLeft;
      const px = drawDynamic(canvas, geom, tk, st.props.segments, t, st.reduced, scrollLeft);

      // Keep the playhead in the middle 60% of the viewport (throttled).
      if (geom.fullWidth > geom.viewW + 1) {
        const rel = px - scrollLeft;
        const now = performance.now();
        if ((rel < geom.viewW * 0.2 || rel > geom.viewW * 0.8) && now - lastScroll > SCROLL_THROTTLE_MS) {
          lastScroll = now;
          wrap.scrollTo({ left: Math.max(0, px - geom.viewW / 2), behavior: st.reduced ? 'auto' : 'smooth' });
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
      role="region"
      aria-label="Rhythm strip: the message as timing bars"
      tabIndex={0}
      style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}
    >
      <div
        ref={boxRef}
        style={{
          position: 'relative',
          height: 'calc(var(--strip-bar-top) + var(--bar-h) + 1px + var(--strip-label-gap) + var(--strip-label-size) + 4px)',
        }}
      >
        <div ref={stickyRef} style={{ position: 'sticky', left: 0, height: '100%' }}>
          <canvas ref={staticRef} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, display: 'block' }} />
          <canvas ref={dynRef} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, display: 'block' }} />
        </div>
      </div>
    </div>
  );
}
