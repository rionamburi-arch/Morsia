'use client';

// Decoded output. Copy + clear are the owner's addition to the spec (2026-08-20).

const MONO = 'var(--font-mono), monospace';

function SmallButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.preventDefault()} // keep focus off the button so Space keeps keying
      title={title}
      aria-label={title}
      className="hv-icon"
      style={{
        width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 9, cursor: 'pointer', appearance: 'none',
        background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', transition: 'color 180ms, border-color 180ms',
      }}
    >
      {children}
    </button>
  );
}

export default function SentPanel({ sent, onCopy, onClear }) {
  const count = sent.replace(/ /g, '').length;
  return (
    <section
      aria-label="What you sent"
      data-clarity-unmask="true"
      style={{
        flex: '1.6 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 220,
        padding: '18px 22px 14px', borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
          <span
            style={{
              fontFamily: MONO, fontSize: 'var(--panel-label-size)', fontWeight: 700, letterSpacing: '0.2em',
              color: 'var(--interact)',
            }}
          >
            WHAT YOU SENT
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SmallButton title="Copy sent text" onClick={onCopy}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="12" height="12" rx="2.5" />
              <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H5.5A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15" />
            </svg>
          </SmallButton>
          <SmallButton title="Clear session" onClick={onClear}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </SmallButton>
        </div>
      </div>
      <div
        style={{
          flex: '1 1 auto', fontSize: 28, fontWeight: 500, letterSpacing: '0.04em', lineHeight: 1.3,
          color: 'var(--ink)', overflowWrap: 'anywhere', userSelect: 'text',
        }}
      >
        {sent || <span style={{ color: 'var(--placeholder)' }}>Key something…</span>}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)' }}>{count} CHARS</div>
    </section>
  );
}
