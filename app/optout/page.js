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
          width: '100%', maxWidth: 520, padding: '28px 30px 30px', borderRadius: 'var(--r-0)',
          background: 'var(--field)', border: '1px solid var(--rule)',
        }}
      >

        <h1 style={{ margin: '0 0 18px', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Opt this device out
        </h1>

        <OptOutControl />
      </section>
    </main>
  );
}
