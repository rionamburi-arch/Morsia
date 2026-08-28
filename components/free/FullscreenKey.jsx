'use client';

// The signature moment: the entire viewport is the key. Fixed 100dvh layer
// (works on iOS Safari, which has no requestFullscreen for non-video elements);
// the real Fullscreen API is layered on top where it exists, feature-detected.
// Escape or the fading top-right button exits. Committed characters flash large
// over the trace and fall into the readout band (skipped under reduced motion).

import { useCallback, useEffect, useRef, useState } from 'react';
import Scope from '@/components/free/Scope';
import { MuteIcon } from '@/components/free/ScopePanel';
import { prettyPattern } from '@/lib/morse';

const MONO = 'var(--font-mono), ui-monospace, monospace';
const EXIT_FADE_MS = 2000;
const REVEAL_MS = 1200; // pop in fast, hold readable, then fall into the readout

export default function FullscreenKey({ keyer, wpm, onExit }) {
  const layerRef = useRef(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeTimer = useRef(0);
  const { keyedDown, pendingPattern, patterns, marksRef, muted, toggleMute, surfaceProps, lastCharacter } = keyer;

  // onExit must be readable from mount-only effects: keying re-renders the
  // page every element, and a re-running fullscreen effect would exit itself.
  const onExitRef = useRef(onExit);
  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  // Real Fullscreen API on top of the CSS layer, where supported. Mount-only.
  useEffect(() => {
    const layer = layerRef.current;
    let entered = false;
    if (layer && typeof layer.requestFullscreen === 'function') {
      layer
        .requestFullscreen()
        .then(() => {
          entered = true;
        })
        .catch(() => {
          /* CSS layer already covers the viewport */
        });
    }
    const onFsChange = () => {
      // Only treat the browser LEAVING fullscreen (after we entered) as exit.
      if (entered && document.fullscreenElement == null) onExitRef.current();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Escape exits (keyer's own listener handles Space). Mount-only.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onExitRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Exit affordance fades after inactivity, returns on pointer move.
  const wake = useCallback(() => {
    setChromeVisible(true);
    clearTimeout(chromeTimer.current);
    chromeTimer.current = setTimeout(() => setChromeVisible(false), EXIT_FADE_MS);
  }, []);
  useEffect(() => {
    // Chrome starts visible (initial state); arm only the fade here —
    // setState in an effect body is both unnecessary and forbidden.
    chromeTimer.current = setTimeout(() => setChromeVisible(false), EXIT_FADE_MS);
    return () => clearTimeout(chromeTimer.current);
  }, []);

  const readout = [...patterns, pendingPattern].filter(Boolean).map(prettyPattern).join(' / ');

  return (
    <div
      ref={layerRef}
      {...surfaceProps}
      onPointerDown={(e) => {
        wake(); // taps produce no pointermove — a touch must also revive the exit affordance
        surfaceProps.onPointerDown(e);
      }}
      onPointerUp={() => {
        wake();
        surfaceProps.onPointerUp();
      }}
      onPointerMove={wake}
      role="application"
      aria-label="Fullscreen Morse key — press anywhere or hold space"
      style={{
        position: 'fixed', inset: 0, zIndex: 60, height: '100dvh', background: 'var(--ground)',
        display: 'flex', flexDirection: 'column', cursor: 'pointer',
        userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none', overscrollBehavior: 'none',
      }}
    >
      <div style={{ flex: '1 1 auto', position: 'relative', minHeight: 0 }}>
        <Scope marksRef={marksRef} keyed={keyedDown} wpm={wpm} height="100%" />

        {lastCharacter ? (
          <div
            key={lastCharacter.at}
            aria-hidden="true"
            style={{
              position: 'absolute', left: '50%', top: '38%', transform: 'translate(-50%, -50%)',
              fontSize: lastCharacter.char.length > 1 ? 'min(13vw, 110px)' : 'min(28vw, 220px)',
              fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)',
              pointerEvents: 'none', animation: `free-reveal ${REVEAL_MS}ms cubic-bezier(0.22,1,0.36,1) forwards`,
            }}
          >
            {lastCharacter.char}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onExit}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerUp={(e) => e.stopPropagation()}
          title="Exit fullscreen"
          aria-label="Exit fullscreen"
          className="hv-ink"
          style={{
            position: 'absolute', top: 'max(16px, env(safe-area-inset-top))', right: 'max(16px, env(safe-area-inset-right))',
            width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12, cursor: 'pointer',
            appearance: 'none', background: 'var(--field)', border: '1px solid var(--rule-strong)', color: 'var(--g5)',
            opacity: chromeVisible ? 1 : 0, transition: 'opacity 400ms', pointerEvents: chromeVisible ? 'auto' : 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 3H3v6M15 21h6v-6M3 3l7 7M21 21l-7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggleMute}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerUp={(e) => e.stopPropagation()}
          title={muted ? 'Unmute' : 'Mute'}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
          className="hv-ink"
          style={{
            position: 'absolute', top: 'max(16px, env(safe-area-inset-top))', right: 'calc(max(16px, env(safe-area-inset-right)) + 56px)',
            width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12, cursor: 'pointer',
            appearance: 'none', background: muted ? 'var(--reference-dim)' : 'var(--field)', border: `1px solid ${muted ? 'var(--reference-line)' : 'var(--rule-strong)'}`,
            color: muted ? 'var(--reference)' : 'var(--g5)',
            opacity: chromeVisible ? 1 : 0, transition: 'opacity 400ms', pointerEvents: chromeVisible ? 'auto' : 'none',
          }}
        >
          <MuteIcon muted={muted} />
        </button>
      </div>

      <div
        style={{
          flex: '0 0 auto', padding: '12px 18px calc(12px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--rule)', background: 'var(--field)',
          fontFamily: MONO, fontSize: 14, letterSpacing: '0.1em', color: 'var(--reference)',
          whiteSpace: 'nowrap', overflow: 'hidden', direction: 'rtl', textAlign: 'left', minHeight: 44,
        }}
      >
        <span style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>{readout || ' '}</span>
      </div>
    </div>
  );
}
