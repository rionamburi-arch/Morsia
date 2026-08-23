'use client';

// The switch itself. Reads the flag through useSyncExternalStore so the label
// and buttons update the instant it changes, with no reload.

import { useOptOut, setOptedOut } from '@/hooks/useOptOut';

const MONO = 'var(--font-mono), monospace';

const button = {
  minHeight: 44, padding: '12px 20px', borderRadius: 999, cursor: 'pointer', appearance: 'none',
  fontFamily: 'inherit', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
};

export default function OptOutControl() {
  const excluded = useOptOut();

  return (
    <>
      <p
        aria-live="polite"
        style={{
          margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', color: 'var(--interact)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: excluded ? 'var(--border)' : 'var(--interact)',
          }}
        />
        {excluded ? 'EXCLUDED ON THIS DEVICE' : 'TRACKING ON FOR THIS DEVICE'}
      </p>

      <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)' }}>
        {excluded
          ? 'Your visits from this browser are not counted in Vercel Analytics or Speed Insights. The setting lives in this browser only — other devices, other browsers and private windows are unaffected.'
          : 'Your visits from this browser are counted like anyone else’s. Exclude it to keep your own testing out of the numbers.'}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setOptedOut(true)}
          disabled={excluded}
          style={{
            ...button,
            background: excluded ? 'var(--inset-fill)' : 'var(--signal)',
            border: `1px solid ${excluded ? 'var(--border)' : 'var(--signal)'}`,
            color: excluded ? 'var(--muted)' : 'var(--on-accent)',
            cursor: excluded ? 'default' : 'pointer',
          }}
        >
          EXCLUDE THIS DEVICE
        </button>
        <button
          type="button"
          onClick={() => setOptedOut(false)}
          disabled={!excluded}
          style={{
            ...button,
            background: 'transparent',
            border: `1px solid ${excluded ? 'var(--interact-border)' : 'var(--border)'}`,
            color: excluded ? 'var(--interact)' : 'var(--muted)',
            cursor: excluded ? 'pointer' : 'default',
          }}
        >
          RE-ENABLE TRACKING
        </button>
      </div>
    </>
  );
}
