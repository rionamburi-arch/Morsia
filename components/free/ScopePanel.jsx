'use client';

// The scope's chrome: status row (status left; UNIT label, mute, expand right),
// the canvas, and the readout band along the bottom edge. The whole panel is a
// key surface — pointer-down anywhere on it keys.

import Scope from '@/components/free/Scope';
import { unitMs } from '@/lib/timing';
import { prettyPattern } from '@/lib/morse';

const MONO = 'var(--font-mono), monospace';

function IconButton({ title, pressed, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault(); // keep focus off the button so Space keeps keying
      }}
      onPointerUp={(e) => e.stopPropagation()}
      title={title}
      aria-label={title}
      aria-pressed={pressed}
      className="hv-ink"
      style={{
        width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 11, cursor: 'pointer',
        appearance: 'none', background: pressed ? 'var(--pressed-fill)' : 'transparent',
        border: '1px solid var(--border)', color: pressed ? 'var(--ink)' : 'var(--muted)',
        transition: 'color 200ms, background 200ms', flex: '0 0 auto',
      }}
    >
      {children}
    </button>
  );
}

export function MuteIcon({ muted }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d={muted ? 'M17 9l4 6M21 9l-4 6' : 'M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12'} />
    </svg>
  );
}

export function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

export default function ScopePanel({ keyer, wpm, onExpand }) {
  const { keyedDown, pendingPattern, patterns, marksRef, muted, toggleMute, surfaceProps } = keyer;

  const status = keyedDown
    ? '— SENDING —'
    : pendingPattern
      ? `— KEYED ${prettyPattern(pendingPattern)} —`
      : '— IDLE —';

  const readout = [...patterns, pendingPattern].filter(Boolean).map(prettyPattern).join(' / ');

  return (
    <section
      aria-label="Keying scope"
      {...surfaceProps}
      style={{
        borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)',
        overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none',
        touchAction: 'none', overscrollBehavior: 'none', cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px 0' }}>
        <div aria-live="off" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: keyedDown ? 'var(--ink)' : 'var(--muted)' }}>
          {status}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)' }}>
            UNIT {Math.round(unitMs(wpm))} MS
          </span>
          <IconButton title={muted ? 'Unmute' : 'Mute'} pressed={muted} onClick={toggleMute}>
            <MuteIcon muted={muted} />
          </IconButton>
          <IconButton title="Fullscreen" onClick={onExpand}>
            <ExpandIcon />
          </IconButton>
        </div>
      </div>

      <Scope marksRef={marksRef} keyed={keyedDown} wpm={wpm} />

      <div
        style={{
          padding: '10px 18px 12px', borderTop: '1px solid var(--border-soft)',
          fontFamily: MONO, fontSize: 14, letterSpacing: '0.14em', color: 'var(--signal)',
          whiteSpace: 'nowrap', overflow: 'hidden', direction: 'rtl', textAlign: 'left', minHeight: 40,
        }}
      >
        {/* rtl + ltr embed: overflow clips the OLD (left) end while text stays readable */}
        <span style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>{readout || ' '}</span>
      </div>
    </section>
  );
}
