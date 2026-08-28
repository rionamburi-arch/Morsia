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
      <div
        aria-hidden="true"
        style={{
          width: 'var(--keypad-circle)', height: 'var(--keypad-circle)', borderRadius: 'var(--r-1)',
          background: lit ? 'var(--reference)' : 'transparent',
          border: `1px solid ${lit ? 'var(--reference)' : 'var(--rule-strong)'}`,
          transition: 'background 40ms linear, border-color 40ms linear',
          display: 'grid', placeItems: 'center',
        }}
      >
        <span
          style={{
            width: 22, height: 22,
            background: lit ? '#17120A' : 'var(--g3)',
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
