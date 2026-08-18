'use client';

import { useEffect, useRef } from 'react';

export default function Flash({ enabled, sounding }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!enabled) {
      el.style.opacity = '0';
      return undefined;
    }
    let raf = 0;
    let last = null;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const next = sounding() ? 'var(--flash-opacity)' : '0';
      if (next !== last) { last = next; el.style.opacity = next; }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.style.opacity = '0';
    };
  }, [enabled, sounding]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'var(--flash)', opacity: 0, transition: 'opacity 60ms linear', zIndex: 30 }}
    />
  );
}
