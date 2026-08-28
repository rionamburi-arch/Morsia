'use client';

// The physical key: a big pressable pad that is also the lamp. Press and hold
// it (or Space) to send; the pad reads amber while the key is down, because
// amber is what a live reading looks like everywhere else in the product.
// Replaces the old non-interactive LampPanel (owner decision, 2026-08-21).

const MONO = 'var(--font-mono), ui-monospace, monospace';

export default function KeyPad({ lit, surfaceProps }) {
  return (
    <section
      aria-label="Morse key — press and hold, or hold Space"
      {...surfaceProps}
      style={{
        flex: '1 1 280px', minWidth: 240, minHeight: 220,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22,
        borderRadius: 'var(--r-0)', background: 'var(--field)', border: '1px solid var(--rule)',
        cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none',
        touchAction: 'none', overscrollBehavior: 'none',
      }}
    >
      {/* Six units square, ruled at the unit so the pad states its own size the
          way every other object in this product does. */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          width: 'var(--keypad-size)', height: 'var(--keypad-size)', borderRadius: 'var(--r-0)',
          background: lit ? 'var(--reference)' : 'var(--field-2)',
          border: `1px solid ${lit ? 'var(--reference)' : 'var(--g4)'}`,
          transition: 'background 40ms linear, border-color 40ms linear',
          display: 'grid', placeItems: 'center',
        }}
      >
        <span
          style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: 4,
            backgroundImage: `repeating-linear-gradient(to right, ${lit ? 'rgb(23 18 10 / 0.55)' : 'var(--g4)'} 0 1px, transparent 1px var(--unit))`,
            transition: 'background-image 40ms linear',
          }}
        />
        <span
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 4,
            backgroundImage: `repeating-linear-gradient(to right, ${lit ? 'rgb(23 18 10 / 0.55)' : 'var(--g4)'} 0 1px, transparent 1px var(--unit))`,
            transition: 'background-image 40ms linear',
          }}
        />
        <span
          style={{
            // One unit square: the smallest mark the key can make.
            width: 'var(--unit)', height: 'var(--unit)',
            background: lit ? '#17120A' : 'var(--g5)',
            transition: 'background 40ms linear',
          }}
        />
      </div>
      <div
        style={{
          fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.3em',
          color: lit ? 'var(--reference)' : 'var(--g5)', transition: 'color 80ms linear',
        }}
      >
        HOLD / SPACE
      </div>
    </section>
  );
}
