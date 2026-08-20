'use client';

// The visual sidetone: lights Papaya Whip while the key is down. Not a button.

export default function LampPanel({ lit }) {
  return (
    <section
      aria-label="Signal lamp"
      style={{
        flex: '0 0 var(--lamp-w)', display: 'grid', placeItems: 'center', minHeight: 132,
        borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: lit ? 'var(--ink)' : 'transparent',
          border: `2px solid ${lit ? 'var(--ink)' : 'var(--border)'}`,
          boxShadow: lit ? 'var(--lamp-glow)' : 'none',
          transition: 'background 40ms linear, box-shadow 60ms linear',
        }}
      />
    </section>
  );
}
