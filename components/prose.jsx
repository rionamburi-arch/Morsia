// Shared prose styling for the long-form panels. The explanation is one
// document split across four routes — the homepage keeps the timing, /free and
// /chart keep the parts that belong beside those tools, and the tattoo page is
// its own thing — so the type scale is defined once here rather than per page.

export const MONO = 'var(--font-mono), monospace';

export const h2 = { margin: '0 0 14px', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' };
// A second or later section in the same panel needs the air an h3 gets.
export const h2Next = { ...h2, marginTop: 34 };
export const h3 = { margin: '30px 0 12px', fontSize: 17, fontWeight: 600, color: 'var(--ink)' };
export const p = { margin: '0 0 14px', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)' };
export const strong = { color: 'var(--ink)', fontWeight: 600 };
export const card = { margin: '18px 0 20px' };
export const code = { fontFamily: MONO, color: 'var(--ink)' };

/** The mono kicker every content panel opens with. */
export function Eyebrow({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
      <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
      <span
        style={{
          fontFamily: MONO, fontSize: 'var(--panel-label-size)', fontWeight: 700, letterSpacing: '0.2em',
          color: 'var(--interact)',
        }}
      >
        {children}
      </span>
    </div>
  );
}
