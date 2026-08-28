// iOS home screen icon — the same two dahs, with room to breathe.

import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const GROUND = '#0C0E0F';
const INK = '#DCE3E4';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', background: GROUND,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22,
        }}
      >
        <div style={{ width: 58, height: 100, background: INK, borderRadius: 10 }} />
        <div style={{ width: 58, height: 100, background: INK, borderRadius: 10 }} />
      </div>
    ),
    size,
  );
}
