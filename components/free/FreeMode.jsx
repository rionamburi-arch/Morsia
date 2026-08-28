'use client';

// Free Mode: hold spacebar or press the scope to key Morse yourself.
// The scope is a live oscilloscope (real elapsed time); detection is tolerant
// and adapts to your rhythm (lib/keyer.js). Fullscreen turns the whole
// viewport into the key.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import useKeyer from '@/hooks/useKeyer';
import ScopePanel from '@/components/free/ScopePanel';
import KeyPad from '@/components/free/KeyPad';
import SentPanel from '@/components/free/SentPanel';
import FullscreenKey from '@/components/free/FullscreenKey';
import Toast from '@/components/Toast';
import { track } from '@/lib/analytics';

const MONO = 'var(--font-mono), ui-monospace, monospace';
const TOAST_MS = 2300;

export default function FreeMode() {
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
        <h1 style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Free Mode</h1>
        <span className="t-readout" style={{ letterSpacing: '0.1em' }}>
          HOLD SPACE · PRESS THE KEY OR THE SCOPE
        </span>
      </div>

      {!fullscreen && <ScopePanel keyer={keyer} wpm={wpm} onExpand={() => { track('fullscreen_entered'); setFullscreen(true); }} />}

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <KeyPad lit={keyer.keyedDown} surfaceProps={keyer.surfaceProps} />
        <SentPanel sent={keyer.sent} onCopy={onCopy} onClear={onClear} />
      </div>

      {fullscreen ? <FullscreenKey keyer={keyer} wpm={wpm} onExit={exitFullscreen} /> : null}

      <Toast message={toast} />
    </main>
  );
}
