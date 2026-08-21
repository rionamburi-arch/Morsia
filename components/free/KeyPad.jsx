'use client';

// The physical key: a big pressable pad that is also the lamp. Press and hold
// it (or Space) to send; the circle lights Papaya Whip while the key is down.
// Replaces the old non-interactive LampPanel (owner decision, 2026-08-21).

const MONO = 'var(--font-mono), monospace';

export default function KeyPad({ lit, surfaceProps }) {
  return (
    <section
      aria-label="Morse key — press and hold, or hold Space"
      {...surfaceProps}
      style={{
        flex: '1 1 280px', minWidth: 240, minHeight: 220,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22,
        borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)',
        cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none',
        touchAction: 'none', overscrollBehavior: 'none',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 'var(--keypad-circle)', height: 'var(--keypad-circle)', borderRadius: '50%',
          background: lit ? 'var(--ink)' : 'transparent',
          border: `2px solid ${lit ? 'var(--ink)' : 'var(--border)'}`,
          boxShadow: lit ? 'var(--lamp-glow)' : 'none',
          transition: 'background 40ms linear, box-shadow 60ms linear',
        }}
      />
      <div
        style={{
          fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.3em',
          color: lit ? 'var(--ink)' : 'var(--muted)', transition: 'color 80ms linear',
        }}
      >
        HOLD / SPACE
      </div>
    </section>
  );
}
