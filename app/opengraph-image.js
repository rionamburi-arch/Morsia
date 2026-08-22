// Social card: the wordmark, one line of what this is, and SOS rendered in the
// same proportional bars the app draws — dit 1 unit, dah 3, gap 1.

import { ImageResponse } from 'next/og';
import { TABLE } from '@/lib/morse';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Morsia — Morse code translator, chart and trainer';

const GROUND = '#1D201F';
const INK = '#FDF0D5';
const MUTED = '#9A9AA4';
const SIGNAL = '#FF82A9';

const UNIT = 20; // px per Morse unit

/** A word as bars: dit 1u, dah 3u, 1u between elements, 3u between letters. */
function bars(word) {
  const out = [];
  [...word].forEach((char, ci) => {
    const pattern = TABLE[char] ?? '';
    [...pattern].forEach((el, ei) => {
      out.push(
        <div
          key={`${ci}-${ei}`}
          style={{
            width: (el === '-' ? 3 : 1) * UNIT,
            height: UNIT * 4,
            borderRadius: 4,
            background: ci === 1 ? SIGNAL : INK,
            marginLeft: ei === 0 ? (ci === 0 ? 0 : UNIT * 3) : UNIT,
          }}
        />,
      );
    });
  });
  return out;
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', background: GROUND, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '0 92px', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 16, height: 44, borderRadius: 4, background: INK }} />
            <div style={{ width: 48, height: 44, borderRadius: 4, background: INK }} />
            <div style={{ width: 16, height: 44, borderRadius: 4, background: SIGNAL }} />
          </div>
          <div style={{ fontSize: 86, fontWeight: 700, color: INK, letterSpacing: '-0.03em' }}>Morsia</div>
        </div>

        <div style={{ fontSize: 36, color: MUTED, marginTop: 26, lineHeight: 1.35 }}>
          Translate text to Morse code, hear the rhythm, and key it back yourself.
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 62 }}>{bars('SOS')}</div>
        <div style={{ fontSize: 24, color: MUTED, marginTop: 20, letterSpacing: '0.32em' }}>S O S</div>
      </div>
    ),
    size,
  );
}
