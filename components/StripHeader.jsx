'use client';

// The word and its pattern are whatever the visitor typed, so they carry the
// same privacy promise as the textareas: masked in session recordings. Only
// the bars themselves (Scope, in TranslateApp) are left visible.
export default function StripHeader({ word, code, muted, onToggleMute }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div data-clarity-mask="true" style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{word}</div>
        <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{code}</div>
      </div>
      <button
        type="button"
        onClick={onToggleMute}
        title={muted ? 'Unmute' : 'Mute'}
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
        className="hv-ink"
        style={{
          flex: '0 0 auto', width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 11, cursor: 'pointer',
          appearance: 'none', background: muted ? 'var(--pressed-fill)' : 'transparent', border: '1px solid var(--border)',
          color: muted ? 'var(--ink)' : 'var(--muted)', transition: 'color 200ms, background 200ms',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4z" />
          <path d={muted ? 'M17 9l4 6M21 9l-4 6' : 'M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12'} />
        </svg>
      </button>
    </div>
  );
}
