'use client';

// Free Mode: hold spacebar or press the scope to key Morse yourself.
// The scope is a live oscilloscope (real elapsed time); detection is tolerant
// and adapts to your rhythm (lib/keyer.js). Fullscreen turns the whole
// viewport into the key.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import useKeyer from '@/hooks/useKeyer';
import ScopePanel from '@/components/free/ScopePanel';
import LampPanel from '@/components/free/LampPanel';
import SentPanel from '@/components/free/SentPanel';
import FullscreenKey from '@/components/free/FullscreenKey';
import Toast from '@/components/Toast';

const MONO = 'var(--font-mono), monospace';
const TOAST_MS = 2300;

export default function FreePage() {
  const { settings } = useSettings();
  const { wpm, toneHz } = settings;
  const keyer = useKeyer({ wpm, toneHz });

  const [fullscreen, setFullscreen] = useState(false);
  const exitFullscreen = useCallback(() => setFullscreen(false), []);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(0);

  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), TOAST_MS);
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(keyer.sent);
      showToast('Text copied');
    } catch {
      showToast("Couldn't copy");
    }
  };

  const onClear = () => {
    keyer.clear();
    showToast('Cleared');
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
          <span
            style={{
              fontFamily: MONO, fontSize: 'var(--panel-label-size)', fontWeight: 700, letterSpacing: '0.2em',
              color: 'var(--interact)', WebkitTextStroke: 'var(--panel-label-stroke) var(--ground)', paintOrder: 'stroke fill',
            }}
          >
            FREE MODE
          </span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted)' }}>
          HOLD SPACE OR PRESS THE SCOPE
        </span>
      </div>

      {!fullscreen && <ScopePanel keyer={keyer} wpm={wpm} onExpand={() => setFullscreen(true)} />}

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <LampPanel lit={keyer.keyedDown} />
        <SentPanel sent={keyer.sent} onCopy={onCopy} onClear={onClear} />
      </div>

      {fullscreen ? <FullscreenKey keyer={keyer} wpm={wpm} onExit={exitFullscreen} /> : null}

      <Toast message={toast} />
    </main>
  );
}
