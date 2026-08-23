'use client';

// The eight letters you meet first, as bar patterns you can hear. Same sidetone
// engine as everywhere else, at whatever speed and tone the settings say.

import { useCallback, useEffect, useRef, useState } from 'react';
import { TABLE, prettyPattern } from '@/lib/morse';
import { patternToSegments } from '@/lib/timing';
import { useSettings } from '@/hooks/useSettings';
import usePlayer from '@/hooks/usePlayer';
import PatternBars from '@/components/chart/PatternBars';

const MONO = 'var(--font-mono), monospace';
const LETTERS = ['E', 'T', 'A', 'I', 'N', 'M', 'S', 'O'];

export default function CommonLetters() {
  const { settings } = useSettings();
  const { wpm, toneHz } = settings;
  const player = usePlayer({ toneHz });
  const { playing, sounding } = player;
  const [active, setActive] = useState(null);
  const cells = useRef(new Map());
  const activeEl = useRef(null);

  const play = useCallback(
    (char) => {
      activeEl.current = cells.current.get(char) || null;
      setActive(char);
      player.play(patternToSegments(TABLE[char], { wpm }));
    },
    [player, wpm],
  );

  // Flash in time with the audio, like the chart rows. Reduced motion keeps the sound.
  useEffect(() => {
    const el = activeEl.current;
    if (!playing || !el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    let last = null;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const next = sounding() ? 'var(--chart-flash)' : 'transparent';
      if (next !== last) {
        last = next;
        el.style.background = next;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.style.background = 'transparent';
    };
  }, [playing, sounding, active]);

  return (
    <figure
      style={{
        margin: 0, padding: '16px 18px', borderRadius: 16,
        border: '1px solid var(--border-soft)', background: 'var(--inset-fill)',
      }}
    >
      <figcaption
        style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}
      >
        Click to hear
      </figcaption>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
        {LETTERS.map((char) => (
          <li key={char}>
            <button
              type="button"
              ref={(el) => {
                if (el) cells.current.set(char, el);
                else cells.current.delete(char);
              }}
              onClick={() => play(char)}
              onPointerDown={(e) => e.preventDefault()}
              aria-label={`Play ${char}, ${prettyPattern(TABLE[char])}`}
              className="chart-cell"
              style={{
                width: '100%', minHeight: 62, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 8, padding: '10px 6px', borderRadius: 11, cursor: 'pointer',
                appearance: 'none', background: 'transparent', border: '1px solid var(--border-soft)',
              }}
            >
              <PatternBars pattern={TABLE[char]} />
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{char}</span>
            </button>
          </li>
        ))}
      </ul>
    </figure>
  );
}
