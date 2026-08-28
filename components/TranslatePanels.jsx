'use client';

// The two editors. `swapped` decides which one sits in the primary (left, 60%,
// large type) slot; the swap button physically slides them across (FLIP via the
// Web Animations API) and exchanges their sizes. Content is never re-derived here.
//
// They are ruled fields, not cards: a hairline box, square corners, and a
// label set on the head rule the way a drawing calls out a region.

import { useLayoutEffect, useRef } from 'react';

const MONO = 'var(--font-mono), ui-monospace, monospace';
const SWAP_MS = 300;
const SWAP_EASE = 'cubic-bezier(0.16,1,0.3,1)';

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" />
      <path d="M15 5H3v12" />
    </svg>
  );
}

function PanelHead({ label, copyTitle, onCopy }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '10px 14px', borderBottom: '1px solid var(--rule)',
      }}
    >
      <span className="field-label">{label}</span>
      <button
        type="button"
        onClick={onCopy}
        title={copyTitle}
        aria-label={copyTitle}
        className="icon-btn"
        style={{ width: 26, height: 26 }}
      >
        <CopyIcon />
      </button>
    </div>
  );
}

// Slot geometry: primary = left 60%, secondary = right 40%.
const slotStyle = (primary) => ({
  flex: '0 0 auto',
  width: primary ? 'calc(60% - 9px)' : 'calc(40% - 9px)',
  minWidth: primary ? 320 : 260,
  order: primary ? 0 : 1,
  display: 'flex', flexDirection: 'column', minHeight: 218,
  background: 'var(--field)', border: '1px solid var(--rule)', borderRadius: 'var(--r-0)',
});

const textareaBase = {
  // No focus ring on the editors (owner's call): the amber caret marks focus.
  // Buttons and links keep their :focus-visible rings.
  flex: '1 1 auto', width: '100%', minHeight: 112, resize: 'none', border: 0, outline: 'none',
  background: 'transparent', color: 'var(--ink)', caretColor: 'var(--reference)',
  padding: '14px 14px 0',
  transition: `font-size ${SWAP_MS}ms ${SWAP_EASE}`,
};

const footStyle = {
  fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'var(--g4)',
  textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums',
  padding: '10px 14px', borderTop: '1px solid var(--rule)',
};

export default function TranslatePanels({
  text, morse, unknown, swapped, swapDeg,
  onTextChange, onMorseChange, onCopyText, onCopyMorse, onSwap,
}) {
  const textRef = useRef(null);
  const morseRef = useRef(null);
  const beforeRef = useRef(null); // rects captured on click, consumed after the swap commits

  const charCount = text.length;
  const signalCount = (morse.match(/[.-]/g) || []).length;

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
      <div ref={textRef} className="tp-slot" style={slotStyle(textPrimary)}>
        <PanelHead label="Plain text" copyTitle="Copy text" onCopy={onCopyText} />
        <textarea
          data-clarity-mask="true"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          spellCheck={false}
          placeholder="Type anything…"
          aria-label="Plain text"
          style={{ ...textareaBase, fontSize: textPrimary ? 32 : 22, fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.02em' }}
        />
        <div style={footStyle}>{charCount} chars</div>
      </div>

      <div ref={morseRef} className="tp-slot" style={slotStyle(!textPrimary)}>
        <PanelHead label="Morse" copyTitle="Copy morse" onCopy={onCopyMorse} />
        <textarea
          data-clarity-mask="true"
          value={morse}
          onChange={(e) => onMorseChange(e.target.value)}
          spellCheck={false}
          placeholder="· − · ·"
          aria-label="Morse code"
          style={{ ...textareaBase, fontFamily: MONO, fontSize: textPrimary ? 15 : 20, lineHeight: 1.7, letterSpacing: '0.04em' }}
        />
        <div style={footStyle}>
          {signalCount} signals
          {unknown.length ? (
            <span style={{ color: 'var(--alert)' }}> · {unknown.length} unsupported ({unknown.join(', ')})</span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSwap}
        title="Swap"
        aria-label="Swap the text and Morse panels"
        aria-pressed={swapped}
        className="tp-swap"
        style={{
          // The seam between the panels is always at 60%, whichever editor is primary.
          position: 'absolute', left: '60%', top: '50%', width: 38, height: 38, display: 'grid', placeItems: 'center',
          borderRadius: 'var(--r-1)', cursor: 'pointer', appearance: 'none',
          background: 'var(--reference)', border: 0, color: '#17120A', zIndex: 3,
          transition: `background 200ms linear, transform ${SWAP_MS}ms ${SWAP_EASE}`,
          transform: `translate(-50%, -50%) rotate(${swapDeg}deg)`,
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
          <path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5" />
        </svg>
      </button>
    </section>
  );
}
