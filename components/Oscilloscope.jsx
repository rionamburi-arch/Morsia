'use client';

// Decorative wave under the strip (from the design). Its own small rAF; the
// envelope eases toward 1 while sounding() is true, 0.2 otherwise. Purely
// cosmetic — removable without touching anything else.

import { useEffect, useRef } from 'react';
import { readTokens } from '@/components/tokens';

const COLORS = ['--wave', '--wave-ghost', '--wave-glow', '--wave-ghost-glow'];

export default function Oscilloscope({ sounding }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv.getContext('2d');
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let tk = readTokens({ colors: COLORS });
    let w = 0;
    let h = 0;
    let env = 0.05;
    let ph = 0;
    let raf = 0;

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
      const amp = h * 0.38 * Math.max(0.18, env);
      const freq = 0.016 + env * 0.04;
      for (let pass = 1; pass >= 0; pass--) {
        g.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const taper = 1 - Math.pow(Math.abs(x - w / 2) / (w / 2), 4) * 0.25;
          const y = mid + Math.sin(x * freq - ph + pass * 1.1) * amp * taper * (pass ? 0.5 : 1);
          if (x === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.lineWidth = pass ? 1 : 2;
        g.strokeStyle = pass ? tk['--wave-ghost'] : tk['--wave'];
        g.shadowColor = pass ? tk['--wave-ghost-glow'] : tk['--wave-glow'];
        g.shadowBlur = pass ? 8 : 6 + 16 * env;
        g.stroke();
      }
      g.shadowBlur = 0;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const target = sounding() ? 1 : 0.2;
      env += (target - env) * 0.16;
      ph += 0.05 + env * 0.1;
      draw();
    };

    const refresh = () => {
      tk = readTokens({ colors: COLORS });
      fit();
      if (mq.matches) {
        env = 0.2;
        draw();
      }
    };

    refresh();
    const ro = new ResizeObserver(refresh);
    ro.observe(cv);
    if (!mq.matches) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [sounding]);

  return <canvas ref={ref} aria-hidden="true" style={{ display: 'block', width: '100%', height: '56px', marginTop: '6px' }} />;
}
