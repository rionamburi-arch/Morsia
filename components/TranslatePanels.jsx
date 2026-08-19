'use client';

// The two editors. `swapped` decides which one sits in the primary (left, 60%,
// large type) slot; the swap button physically slides them across (FLIP via the
// Web Animations API) and exchanges their sizes. Content is never re-derived here.

import { useLayoutEffect, useRef } from 'react';

const MONO = 'var(--font-mono), monospace';
const SWAP_MS = 300;
const SWAP_EASE = 'cubic-bezier(0.22,1,0.36,1)';

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
        <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
        <span
          style={{
            fontFamily: MONO, fontSize: 'var(--panel-label-size)', fontWeight: 700, letterSpacing: '0.2em',
            color: 'var(--interact)', WebkitTextStroke: 'var(--panel-label-stroke) var(--ground)',
            paintOrder: 'stroke fill',
          }}
        >
          {label}
        </span>
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

// Slot geometry from the design: primary = left 60%, secondary = right 40%.
const slotStyle = (primary) => ({
  flex: '0 0 auto',
  width: primary ? 'calc(60% - 9px)' : 'calc(40% - 9px)',
  minWidth: primary ? 320 : 260,
  order: primary ? 0 : 1,
  display: 'flex', flexDirection: 'column', gap: 14, minHeight: 214, padding: '20px 24px 16px',
  borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)',
});

const textareaBase = {
  // No focus ring on the editors (owner's call): the blue caret marks focus.
  // Buttons and links keep their :focus-visible rings.
  flex: '1 1 auto', width: '100%', minHeight: 116, resize: 'none', border: 0, outline: 'none',
  background: 'transparent', color: 'var(--ink)', caretColor: 'var(--interact)',
  transition: `font-size ${SWAP_MS}ms ${SWAP_EASE}`,
};

const footStyle = { fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)' };

export default function TranslatePanels({
  text, morse, unknown, swapped, swapDeg,
  onTextChange, onMorseChange, onCopyText, onCopyMorse, onSwap,
}) {
  const textRef = useRef(null);
  const morseRef = useRef(null);
  const beforeRef = useRef(null); // rects captured on click, consumed after the swap commits

  const charCount = text.length;
  const signalCount = (morse.match(/[.-]/g) || []).length;
  const unsupported = unknown.length ? ` · ${unknown.length} UNSUPPORTED (${unknown.join(', ')})` : '';

  const handleSwap = () => {
    const t = textRef.current;
    const m = morseRef.current;
    if (t && m) beforeRef.current = { text: t.getBoundingClientRect(), morse: m.getBoundingClientRect() };
    onSwap();
  };

  // FLIP: after the DOM has moved, animate each panel from where it was to where it is.
  useLayoutEffect(() => {
    const before = beforeRef.current;
    beforeRef.current = null;
    if (!before || typeof Element === 'undefined' || !Element.prototype.animate) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pairs = [[textRef.current, before.text], [morseRef.current, before.morse]];
    for (const [el, old] of pairs) {
      if (!el) continue;
      const now = el.getBoundingClientRect();
      const dx = old.left - now.left;
      if (!dx && old.width === now.width) continue;
      el.animate(
        [
          { transform: `translateX(${dx}px)`, width: `${old.width}px` },
          { transform: 'none', width: `${now.width}px` },
        ],
        { duration: SWAP_MS, easing: SWAP_EASE },
      );
    }
  }, [swapped]);

  const textPrimary = !swapped;

  return (
    <section aria-label="Translator" style={{ position: 'relative', display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', gap: 18 }}>
      <div ref={textRef} style={slotStyle(textPrimary)}>
        <PanelHead label="PLAIN TEXT" copyTitle="Copy text" onCopy={onCopyText} />
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          spellCheck={false}
          placeholder="Type anything…"
          aria-label="Plain text"
          style={{ ...textareaBase, fontSize: textPrimary ? 34 : 24, fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.015em' }}
        />
        <div style={footStyle}>{charCount} CHARS</div>
      </div>

      <div ref={morseRef} style={slotStyle(!textPrimary)}>
        <PanelHead label="MORSE CODE" copyTitle="Copy morse" onCopy={onCopyMorse} />
        <textarea
          value={morse}
          onChange={(e) => onMorseChange(e.target.value)}
          spellCheck={false}
          placeholder="· − · ·"
          aria-label="Morse code"
          style={{ ...textareaBase, fontFamily: MONO, fontSize: textPrimary ? 21 : 28, lineHeight: 1.5, letterSpacing: '0.06em' }}
        />
        <div style={footStyle}>
          {signalCount} SIGNALS{unsupported}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSwap}
        title="Swap"
        aria-label="Swap the text and Morse panels"
        aria-pressed={swapped}
        className="hv-interact"
        style={{
          // The seam between the panels is always at 60%, whichever editor is primary.
          position: 'absolute', left: '60%', top: '50%', width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: '50%',
          cursor: 'pointer', appearance: 'none', background: 'var(--interact)', border: 0, color: 'var(--on-accent)', zIndex: 3,
          transition: `background 240ms, transform ${SWAP_MS}ms ${SWAP_EASE}`,
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
