'use client';

// The wave under the strip, behaving like an oscilloscope on the sidetone:
//   idle    — a flat line, drawn once, no animation loop at all
//   active  — a burst of wave while a dit/dah sounds, collapsing to flat in the
//             gaps; wavelength follows the Tone setting, and each letter adds
//             its own flavour (frequency multiplier, phase, a touch of harmonic)
//             so consecutive letters read differently.
// Props: active (run the loop), probe() → { on, char } | null, toneHz.
// Tokens are read once (mount / resize) — never in the loop.

import { useEffect, useRef } from 'react';
import { readTokens } from '@/components/tokens';

const COLORS = ['--wave', '--wave-ghost', '--wave-grid'];
const DIVISIONS = 8; // vertical graticule divisions, as on a scope screen
const ATTACK = 0.45;   // per-frame easing toward 1 when a tone starts
const RELEASE = 0.22;  // per-frame easing toward 0 when it stops
const SETTLED = 0.01;  // below this the line is drawn flat

/** Tone Hz → spatial frequency (rad/px): higher pitch, tighter wave. */
function spatialFreq(toneHz) {
  const t = Math.min(1, Math.max(0, (toneHz - 300) / 700));
  return 0.02 + t * 0.06;
}

/** A stable per-character flavour so M and O and R don't move alike. */
function flavour(char) {
  if (!char) return { mul: 1, phase: 0, harm: 0 };
  const code = char.codePointAt(0);
  return {
    mul: 0.8 + ((code * 7) % 11) / 25,           // 0.8 .. 1.2
    phase: (((code * 13) % 24) / 24) * Math.PI * 2,
    harm: ((code * 3) % 6) / 12,                 // 0 .. 0.42 of a 2nd harmonic
  };
}

export default function Oscilloscope({ active, probe, toneHz }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tk = readTokens({ colors: COLORS });
    let w = 0;
    let h = 0;
    let env = 0;
    let ph = 0;
    let fl = flavour(null);
    let raf = 0;
    const freq = spatialFreq(toneHz);

    const fit = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (!w || !h) return;
      g.clearRect(0, 0, w, h);
      const mid = h / 2;

      // The zero axis with its division ticks. Full-height division lines turn
      // an idle scope into an empty table, so the divisions are ticks on the
      // axis instead — which is what a scope graticule actually looks like.
      g.fillStyle = tk['--wave-grid'];
      const step = w / DIVISIONS;
      const axis = Math.round(mid);
      g.fillRect(0, axis, w, 1);
      for (let i = 1; i < DIVISIONS; i++) g.fillRect(Math.round(i * step), axis - 3, 1, 7);

      // Nothing is sounding: the axis alone, flat. Colour marks a live reading,
      // so an idle scope shows no trace rather than a flat coloured line.
      if (env < SETTLED) return;

      const amp = h * 0.4 * env;
      const k = freq * fl.mul;
      for (let pass = 1; pass >= 0; pass--) {
        g.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const taper = 1 - Math.pow(Math.abs(x - w / 2) / (w / 2), 4) * 0.25;
          const base = Math.sin(x * k - ph + fl.phase + pass * 1.1);
          const harm = fl.harm * Math.sin(2 * x * k - ph * 1.7 + fl.phase);
          const y = mid + (base + harm) * amp * taper * (pass ? 0.5 : 1);
          if (x === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        // No bloom: the trace is a measurement, drawn as a clean line.
        g.lineWidth = pass ? 1 : 1.75;
        g.strokeStyle = pass ? tk['--wave-ghost'] : tk['--wave'];
        g.stroke();
      }
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = probe();
      const on = !!p && p.on;
      if (p && p.char) fl = flavour(p.char);
      const target = on ? 1 : 0;
      env += (target - env) * (target > env ? ATTACK : RELEASE);
      ph += 0.12 + env * 0.25;
      draw();
    };

    const refresh = () => {
      tk = readTokens({ colors: COLORS });
      fit();
      draw();
    };

    refresh();
    const ro = new ResizeObserver(refresh);
    ro.observe(cv);
    if (active && !reduced) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active, probe, toneHz]);

  // An unlabelled empty band under the signature field reads as a render
  // failure. The scope states what it is and whether it is reading, the same
  // way Free Mode's does.
  return (
    <div style={{ borderTop: '1px solid var(--rule)' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '8px 14px 0',
        }}
      >
        <span className="field-label">Sidetone</span>
        <span className="t-readout" style={{ color: active ? 'var(--reference)' : 'var(--g5)' }}>
          {active ? '— sounding —' : '— idle —'}
        </span>
      </div>
      <canvas ref={ref} aria-hidden="true" style={{ display: 'block', width: '100%', height: '52px' }} />
    </div>
  );
}
