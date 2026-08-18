'use client';

const MONO = 'var(--font-mono), monospace';

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H5.5A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15" />
    </svg>
  );
}

function PanelHead({ label, copyTitle, onCopy }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink)' }} />
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted)' }}>{label}</span>
      </div>
      <button
        type="button"
        onClick={onCopy}
        title={copyTitle}
        aria-label={copyTitle}
        className="hv-icon"
        style={{
          width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 9, cursor: 'pointer', appearance: 'none',
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', transition: 'color 180ms, border-color 180ms',
        }}
      >
        <CopyIcon />
      </button>
    </div>
  );
}

const panelBase = {
  display: 'flex', flexDirection: 'column', gap: 14, minHeight: 214, padding: '20px 24px 16px',
  borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)',
};

const textareaBase = {
  flex: '1 1 auto', width: '100%', minHeight: 116, resize: 'none', border: 0,
  background: 'transparent', color: 'var(--ink)', caretColor: 'var(--interact)',
};

export default function TranslatePanels({
  text, morse, unknown, swapDeg,
  onTextChange, onMorseChange, onCopyText, onCopyMorse, onSwap,
}) {
  const charCount = text.length;
  const signalCount = (morse.match(/[.-]/g) || []).length;
  const unsupported = unknown.length ? ` · ${unknown.length} UNSUPPORTED (${unknown.join(', ')})` : '';

  return (
    <section aria-label="Translator" style={{ position: 'relative', display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', gap: 18 }}>
      <div style={{ ...panelBase, flex: '1 1 calc(60% - 9px)', maxWidth: 'calc(60% - 9px)', minWidth: 320 }}>
        <PanelHead label="PLAIN TEXT" copyTitle="Copy text" onCopy={onCopyText} />
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          spellCheck={false}
          placeholder="Type anything…"
          aria-label="Plain text"
          style={{ ...textareaBase, fontSize: 34, fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.015em' }}
        />
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)' }}>{charCount} CHARS</div>
      </div>

      <div style={{ ...panelBase, flex: '1 1 calc(40% - 9px)', maxWidth: 'calc(40% - 9px)', minWidth: 260 }}>
        <PanelHead label="MORSE CODE" copyTitle="Copy morse" onCopy={onCopyMorse} />
        <textarea
          value={morse}
          onChange={(e) => onMorseChange(e.target.value)}
          spellCheck={false}
          placeholder="· − · ·"
          aria-label="Morse code"
          style={{ ...textareaBase, fontFamily: MONO, fontSize: 21, lineHeight: 1.5, letterSpacing: '0.06em' }}
        />
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)' }}>
          {signalCount} SIGNALS{unsupported}
        </div>
      </div>

      <button
        type="button"
        onClick={onSwap}
        title="Swap"
        aria-label="Swap text and Morse"
        className="hv-interact"
        style={{
          position: 'absolute', left: '60%', top: '50%', width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: '50%',
          cursor: 'pointer', appearance: 'none', background: 'var(--interact)', border: 0, color: 'var(--on-accent)', zIndex: 3,
          transition: 'background 240ms, transform 300ms cubic-bezier(0.22,1,0.36,1)',
          transform: `translate(-50%, -50%) rotate(${swapDeg}deg)`,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5" />
        </svg>
      </button>
    </section>
  );
}
