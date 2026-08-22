// Favicon: the Morse for M — two dahs — in the app's own bar language.
// Two bars survive being shrunk to 16px where three thin ones would not.

import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

const GROUND = '#1D201F';
const INK = '#FDF0D5';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', background: GROUND,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        <div style={{ width: 11, height: 19, background: INK, borderRadius: 2 }} />
        <div style={{ width: 11, height: 19, background: INK, borderRadius: 2 }} />
      </div>
    ),
    size,
  );
}
