import Link from 'next/link';

export default function PlaceholderSection({ title, copy }) {
  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: 460 }}>
      <div style={{ maxWidth: 420, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: 40, borderRadius: 22, background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div aria-hidden="true" style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 8, height: 24, borderRadius: 3, background: 'var(--placeholder-bar)' }} />
          <div style={{ width: 26, height: 24, borderRadius: 3, background: 'var(--placeholder-bar-dim)' }} />
          <div style={{ width: 8, height: 24, borderRadius: 3, background: 'var(--placeholder-bar-signal)' }} />
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{title}</h1>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>{copy}</p>
        <Link
          href="/"
          style={{ marginTop: 4, padding: '11px 20px', borderRadius: 999, background: 'var(--interact-fill)', border: '1px solid var(--interact-border)', color: 'var(--interact)', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textDecoration: 'none' }}
        >
          BACK TO TRANSLATE
        </Link>
      </div>
    </section>
  );
}
