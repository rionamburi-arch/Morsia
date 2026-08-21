import Link from 'next/link';

// A section that hasn't shipped yet. It never dead-ends: the links point at
// the parts of the app that already do the job.

const ACTION = {
  primary: {
    background: 'var(--signal)', border: '1px solid var(--signal)', color: 'var(--on-accent)',
  },
  secondary: {
    background: 'var(--interact-fill)', border: '1px solid var(--interact-border)', color: 'var(--interact)',
  },
};

function Action({ href, tone, children }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44,
        padding: '12px 20px', borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
        textDecoration: 'none', ...ACTION[tone],
      }}
    >
      {children}
    </Link>
  );
}

export default function PlaceholderSection({ title, copy, actions = [] }) {
  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: 460 }}>
      <div style={{ maxWidth: 460, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: 40, borderRadius: 22, background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div aria-hidden="true" style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 8, height: 24, borderRadius: 3, background: 'var(--placeholder-bar)' }} />
          <div style={{ width: 26, height: 24, borderRadius: 3, background: 'var(--placeholder-bar-dim)' }} />
          <div style={{ width: 8, height: 24, borderRadius: 3, background: 'var(--placeholder-bar-signal)' }} />
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{title}</h1>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>{copy}</p>
        {actions.length ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
            {actions.map((a) => (
              <Action key={a.href} href={a.href} tone={a.tone}>
                {a.label}
              </Action>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
