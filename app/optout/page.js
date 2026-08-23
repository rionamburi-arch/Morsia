// A utility page, deliberately unlinked and unindexed: it exists so the site
// owner can exclude a phone from analytics without a devtools console.

import OptOutControl from '@/components/OptOutControl';

export const metadata = {
  title: 'Analytics opt-out — Morsia',
  description: 'Exclude this device from Morsia’s analytics.',
  robots: { index: false, follow: false },
};

const MONO = 'var(--font-mono), monospace';

export default function OptOutPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <section
        style={{
          width: '100%', maxWidth: 520, padding: '30px 32px 32px', borderRadius: 24,
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
          <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
          <span
            style={{
              fontFamily: MONO, fontSize: 'var(--panel-label-size)', fontWeight: 700, letterSpacing: '0.2em',
              color: 'var(--interact)',
            }}
          >
            ANALYTICS
          </span>
        </div>

        <h1 style={{ margin: '0 0 18px', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Opt this device out
        </h1>

        <OptOutControl />
      </section>
    </main>
  );
}
