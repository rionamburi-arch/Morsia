'use client';

// The head of the measuring field: what is being measured on the left, the
// measurement itself on the right. The ms/unit figure is the constant the whole
// product derives from (UNIT_MS = 1200 / wpm), so it is stated rather than hidden.
//
// The word and its pattern are whatever the visitor typed, so they carry the
// same privacy promise as the textareas: masked in session recordings. Only
// the bars themselves (Scope, in TranslateApp) are left visible.

function MuteIcon({ muted }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d={muted ? 'M17 9l4 6M21 9l-4 6' : 'M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12'} />
    </svg>
  );
}

export default function StripHeader({ word, code, muted, onToggleMute, wpm, totalMs }) {
  const unitMs = 1200 / wpm;
  const seconds = totalMs ? (totalMs / 1000).toFixed(2) : null;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '10px 14px', borderBottom: '1px solid var(--rule)', flexWrap: 'wrap',
      }}
    >
      <div data-clarity-mask="true" style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0, flex: '1 1 auto' }}>
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {word}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono), ui-monospace, monospace', fontSize: 11, color: 'var(--g5)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.06em',
          }}
        >
          {code}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '0 0 auto' }}>
        <span className="t-readout" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span><span className="t-value">{unitMs.toFixed(1)}</span> <span className="t-unit">ms/unit</span></span>
          {seconds ? (
            <>
              <span aria-hidden="true" style={{ color: 'var(--g3)' }}>·</span>
              <span><span className="t-value">{seconds}</span> <span className="t-unit">s</span></span>
            </>
          ) : null}
        </span>
        <button
          type="button"
          onClick={onToggleMute}
          title={muted ? 'Unmute' : 'Mute'}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
          className={muted ? 'icon-btn btn-on' : 'icon-btn'}
        >
          <MuteIcon muted={muted} />
        </button>
      </div>
    </div>
  );
}
