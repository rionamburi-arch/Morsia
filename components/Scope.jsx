'use client';

// The measuring field. Two stacked canvases, both sized to the VISIBLE viewport
// (never to the whole message — long messages would exceed the browser's
// canvas size limit). A spacer box carries the full timeline width so the
// wrapper scrolls natively; the canvases sit in a sticky layer and draw the
// timeline translated by -scrollLeft.
//   static  — printed unit scale, graticule, baseline, resting blocks, labels
//             (redrawn on segments / wpm / labels / size / tokens change and on scroll)
//   dynamic — the sounding block and the registration gate (rAF only while `clock` is given)
//
// Everything is drawn to scale: blocks and gaps are exact multiples of --unit
// (dit 1, dah 3, gaps 1 / 3 / 7), and the graticule marks every one of them, so
// the claim that width is duration is checkable by eye against the scale.
// Tokens are read once (mount, resize, DPR / motion-pref change) — never in the loop.

import { useEffect, useRef } from 'react';
import { unitMs, cumulativeStarts, indexAtMs } from '@/lib/timing';
import { readTokens } from '@/components/tokens';

const SIZES = ['--unit', '--bar-h', '--bar-radius', '--strip-bar-top', '--strip-label-size', '--strip-label-gap', '--strip-pad-x'];
const COLORS = ['--bar-rest', '--bar-active', '--baseline', '--muted', '--playhead', '--grat-minor', '--grat-major', '--scale-label'];
const STRINGS = ['--font-mono', '--strip-label-tracking'];

const SCROLL_THROTTLE_MS = 250;
const MANUAL_HOLD_MS = 1500; // after a manual pan, auto-follow stays out of the way this long
const MAJOR_EVERY = 5;       // a heavier tick and a numeral every five units

// Scale geometry, measured up from the top of the block area (--strip-bar-top).
const SCALE_RULE_UP = 8;     // the rule the ticks hang from
const TICK_MINOR = 4;
const TICK_MAJOR = 8;
const SCALE_FONT = 9;

function block(g, x, y, w, h, r) {
  if (r <= 0) {
    g.fillRect(x, y, w, h);
    return;
  }
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + rr, y);
  g.arcTo(x + w, y, x + w, y + h, rr);
  g.arcTo(x + w, y + h, x, y + h, rr);
  g.arcTo(x, y + h, x, y, rr);
  g.arcTo(x, y, x + w, y, rr);
  g.closePath();
  g.fill();
}

function computeLayout(segments, wpm, tk, viewW) {
  const pxPerMs = tk['--unit'] / unitMs(wpm);
  const starts = cumulativeStarts(segments);
  const totalPx = starts[segments.length] * pxPerMs;
  const fullWidth = Math.max(viewW, totalPx + 2 * tk['--strip-pad-x']);
  const height = tk['--strip-bar-top'] + tk['--bar-h'] + 1 + tk['--strip-label-gap'] + tk['--strip-label-size'] + 8;
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

/** The printed scale and the graticule behind the blocks. */
function drawGrid(g, geom, tk, left, right) {
  const { offsetX, totalPx } = geom;
  if (totalPx <= 0) return;
  const unit = tk['--unit'];
  const barTop = tk['--strip-bar-top'];
  const baseY = barTop + tk['--bar-h'];
  const ruleY = barTop - SCALE_RULE_UP;

  const firstIdx = Math.max(0, Math.floor((left - offsetX) / unit));
  const lastIdx = Math.ceil((Math.min(offsetX + totalPx, right) - offsetX) / unit);

  g.font = `${SCALE_FONT}px ${tk['--font-mono'] || 'monospace'}`;
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';

  for (let n = firstIdx; n <= lastIdx; n++) {
    const x = Math.round(offsetX + n * unit);
    if (x < left - unit || x > right + unit) continue;
    const major = n % MAJOR_EVERY === 0;

    // graticule: every unit, down the full height of the block area
    g.fillStyle = major ? tk['--grat-major'] : tk['--grat-minor'];
    g.fillRect(x, barTop, 1, baseY - barTop);

    // tick hanging from the scale rule
    g.fillStyle = tk['--scale-label'];
    const tick = major ? TICK_MAJOR : TICK_MINOR;
    g.fillRect(x, ruleY - tick, 1, tick);

    if (major) g.fillText(String(n), x, ruleY - tick - 4);
  }

  // the scale's own rule
  g.fillStyle = tk['--grat-major'];
  g.fillRect(Math.max(left, offsetX), ruleY, Math.min(right, offsetX + totalPx) - Math.max(left, offsetX), 1);
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

  drawGrid(g, geom, tk, left, right);

  // the line every block sits on
  g.fillStyle = tk['--baseline'];
  g.fillRect(left, baseY, viewW, 1);

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
    block(g, x, barTop, w, barH, tk['--bar-radius']);
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

/**
 * Draws the sounding block and the registration gate for time tSec.
 * The live element is marked, never lit: it fills amber and the gate rides the
 * scale with crosshair caps. Returns the gate x in timeline px.
 */
function drawDynamic(canvas, geom, tk, segments, tSec, scrollLeft) {
  const g = canvas.getContext('2d');
  const { viewW, height, offsetX, pxPerMs, starts } = geom;
  const barTop = tk['--strip-bar-top'];
  const barH = tk['--bar-h'];
  const baseY = barTop + barH;
  g.clearRect(0, 0, viewW, height);
  g.save();
  g.translate(-scrollLeft, 0);

  const ms = tSec * 1000;
  const i = indexAtMs(starts, ms);
  if (i >= 0 && segments[i].on) {
    const x = offsetX + starts[i] * pxPerMs;
    const w = segments[i].ms * pxPerMs;
    g.fillStyle = tk['--bar-active'];
    block(g, x, barTop, w, barH, tk['--bar-radius']);
  }

  // The registration gate: a hairline through the field with a cap top and
  // bottom, the way a reading is marked against a scale.
  const total = starts[starts.length - 1];
  const px = Math.round(offsetX + Math.max(0, Math.min(ms, total)) * pxPerMs);
  const capTop = barTop - SCALE_RULE_UP;
  g.fillStyle = tk['--playhead'];
  g.fillRect(px, capTop, 1, baseY - capTop + 5);
  g.fillRect(px - 3, capTop, 7, 1);
  g.fillRect(px - 3, baseY + 4, 7, 1);

  g.restore();
  return px;
}

export default function Scope({ segments, wpm, clock, showLabels }) {
  const wrapRef = useRef(null);
  const boxRef = useRef(null);
  const stickyRef = useRef(null);
  const staticRef = useRef(null);
  const dynRef = useRef(null);
  const stateRef = useRef({ tokens: null, geom: null, reduced: false, manualUntil: 0, props: { segments, wpm, showLabels } });
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
      wrap.style.cursor = geom.fullWidth > viewW + 1 ? 'grab' : '';
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

    // Manual panning: mouse drag (touch pans natively via overflow scroll),
    // wheel over the strip, and arrow keys when focused.
    const canPan = () => !!st.geom && st.geom.fullWidth > st.geom.viewW + 1;
    const markManual = () => {
      st.manualUntil = performance.now() + MANUAL_HOLD_MS;
    };
    let drag = null; // { id, startX, startLeft }
    const onPointerDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !canPan()) return;
      drag = { id: e.pointerId, startX: e.clientX, startLeft: wrap.scrollLeft };
      wrap.setPointerCapture(e.pointerId);
      wrap.style.cursor = 'grabbing';
      markManual();
    };
    const onPointerMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      wrap.scrollLeft = drag.startLeft - (e.clientX - drag.startX);
      markManual();
    };
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      wrap.style.cursor = canPan() ? 'grab' : '';
      markManual();
    };
    const onWheel = (e) => {
      if (!canPan()) return;
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (!d) return;
      e.preventDefault();
      wrap.scrollLeft += d;
      markManual();
    };
    const onKey = (e) => {
      if (!canPan()) return;
      const step = st.geom.viewW * 0.25;
      if (e.key === 'ArrowLeft') wrap.scrollLeft -= step;
      else if (e.key === 'ArrowRight') wrap.scrollLeft += step;
      else if (e.key === 'Home') wrap.scrollLeft = 0;
      else if (e.key === 'End') wrap.scrollLeft = st.geom.fullWidth;
      else return;
      e.preventDefault();
      markManual();
    };

    redrawRef.current = layout;
    refresh();
    armDpr();
    const ro = new ResizeObserver(refresh);
    ro.observe(wrap);
    motionMq.addEventListener('change', refresh);
    wrap.addEventListener('scroll', paintStatic, { passive: true });
    wrap.addEventListener('pointerdown', onPointerDown);
    wrap.addEventListener('pointermove', onPointerMove);
    wrap.addEventListener('pointerup', endDrag);
    wrap.addEventListener('pointercancel', endDrag);
    wrap.addEventListener('wheel', onWheel, { passive: false });
    wrap.addEventListener('keydown', onKey);
    return () => {
      ro.disconnect();
      motionMq.removeEventListener('change', refresh);
      if (dprMq) dprMq.removeEventListener('change', onDprChange);
      wrap.removeEventListener('scroll', paintStatic);
      wrap.removeEventListener('pointerdown', onPointerDown);
      wrap.removeEventListener('pointermove', onPointerMove);
      wrap.removeEventListener('pointerup', endDrag);
      wrap.removeEventListener('pointercancel', endDrag);
      wrap.removeEventListener('wheel', onWheel);
      wrap.removeEventListener('keydown', onKey);
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
      const px = drawDynamic(canvas, geom, tk, st.props.segments, t, scrollLeft);

      // Keep the gate in the middle 60% of the viewport (throttled).
      if (geom.fullWidth > geom.viewW + 1) {
        const rel = px - scrollLeft;
        const now = performance.now();
        if ((rel < geom.viewW * 0.2 || rel > geom.viewW * 0.8) && now - lastScroll > SCROLL_THROTTLE_MS && now > (st.manualUntil || 0)) {
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
      aria-label="Measuring field: the message drawn as timing blocks against a unit scale"
      tabIndex={0}
      style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', padding: '14px 0 4px' }}
    >
      <div
        ref={boxRef}
        style={{
          position: 'relative',
          height: 'calc(var(--strip-bar-top) + var(--bar-h) + 1px + var(--strip-label-gap) + var(--strip-label-size) + 8px)',
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
