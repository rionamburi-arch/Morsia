'use client';

// Translate. Owns the message (text ⇄ morse) and its playback; every visual
// region is a props-only component. Timing comes from toSegments() only.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { encode, decode, normaliseMorse } from '@/lib/morse';
import { toSegments, totalMs } from '@/lib/timing';
import { segmentsToWav, wavFilename } from '@/lib/wav';
import { encodeSlug } from '@/lib/slug';
import { track } from '@/lib/analytics';
import { useSettings } from '@/hooks/useSettings';
import usePlayer from '@/hooks/usePlayer';
import Scope from '@/components/Scope';
import Oscilloscope from '@/components/Oscilloscope';
import StripHeader from '@/components/StripHeader';
import TranslatePanels from '@/components/TranslatePanels';
import Transport from '@/components/Transport';
import ConfigPopover from '@/components/ConfigPopover';
import Toast from '@/components/Toast';
import Flash from '@/components/Flash';

const INITIAL_TEXT = 'MORSE';
const TOAST_MS = 2300;

// The message survives switching sections (client-side nav) — including being
// deliberately empty. A fresh page load still starts with the MORSE demo.
let savedMessage = null;
const WAV_MAX_MS = 10 * 60 * 1000;

export default function TranslateApp() {
  const { settings, setWpm, setEffWpm, setToneHz, setLabels } = useSettings();
  const { wpm, effWpm, toneHz, labels } = settings;
  const player = usePlayer({ toneHz });

  const [text, setText] = useState(() => (savedMessage ? savedMessage.text : INITIAL_TEXT));
  const [morse, setMorse] = useState(() => (savedMessage ? savedMessage.morse : encode(INITIAL_TEXT).morse));
  const [unknown, setUnknown] = useState(() => (savedMessage ? savedMessage.unknown : []));
  const [swapped, setSwapped] = useState(() => (savedMessage ? savedMessage.swapped : false));
  const [swapDeg, setSwapDeg] = useState(0);

  useEffect(() => {
    savedMessage = { text, morse, unknown, swapped };
  }, [text, morse, unknown, swapped]);
  const [cfgOpen, setCfgOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(0);
  const cfgId = useId();

  const source = text.trim().toUpperCase(); // empty text → empty strip
  const segments = useMemo(() => toSegments(source, { wpm, effWpm }), [source, wpm, effWpm]);
  const stripCode = useMemo(() => encode(source).morse, [source]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), TOAST_MS);
  }, []);

  const copy = async (str, okMsg) => {
    try {
      await navigator.clipboard.writeText(str);
      showToast(okMsg);
      return true;
    } catch {
      showToast("Couldn't copy");
      return false;
    }
  };

  // --- message editing ---
  const onTextChange = (v) => {
    if (player.playing) player.stop();
    setText(v);
    const r = encode(v);
    setMorse(r.morse);
    setUnknown(r.unknown);
  };
  const onMorseChange = (raw) => {
    if (player.playing) player.stop();
    const v = normaliseMorse(raw);
    setMorse(v);
    setText(decode(v));
    setUnknown([]);
  };
  const onSwap = () => {
    setSwapped((v) => !v);
    setSwapDeg((d) => d + 180);
  };

  // --- transport ---
  const onPlay = () => {
    if (!segments.length) {
      showToast('Type something to play');
      return;
    }
    if (!player.play(segments)) showToast('Audio unavailable in this browser');
  };
  const onToggleLight = () => {
    player.toggleLight();
  };
  const onWav = () => {
    if (!segments.length) {
      showToast('Nothing to export');
      return;
    }
    if (totalMs(segments) > WAV_MAX_MS) {
      showToast('Message too long to export (10 min max)');
      return;
    }
    const blob = segmentsToWav(segments, { toneHz });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = wavFilename(source);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    showToast('WAV exported');
    track('wav_downloaded');
  };
  const onShare = async () => {
    const slug = encodeSlug(source);
    if (!slug) {
      showToast('Nothing to share');
      return;
    }
    if (await copy(`${window.location.origin}/m/${slug}`, 'Link copied')) track('share_clicked');
  };
  const onToggleCfg = () => {
    setCfgOpen((o) => !o);
  };
  const stopThen = (fn) => (v) => {
    if (player.playing) player.stop();
    fn(v);
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section aria-label="Rhythm strip" className="field">
        <StripHeader
          word={source}
          code={stripCode}
          muted={player.muted}
          onToggleMute={player.toggleMute}
          wpm={wpm}
          totalMs={totalMs(segments)}
        />
        <div data-clarity-unmask="true">
          <Scope segments={segments} wpm={wpm} clock={player.playing ? player.clock : null} showLabels={labels} />
        </div>
        <Oscilloscope active={player.playing} probe={player.probe} toneHz={toneHz} />
      </section>

      <TranslatePanels
        text={text}
        morse={morse}
        unknown={unknown}
        swapped={swapped}
        swapDeg={swapDeg}
        onTextChange={onTextChange}
        onMorseChange={onMorseChange}
        onCopyText={() => copy(text, 'Text copied')}
        onCopyMorse={() => copy(morse, 'Morse copied')}
        onSwap={onSwap}
      />

      <Transport
        onPlay={onPlay}
        onStop={player.stop}
        repeat={player.repeat}
        onToggleRepeat={player.toggleRepeat}
        light={player.light}
        onToggleLight={onToggleLight}
        onWav={onWav}
        onShare={onShare}
        cfgOpen={cfgOpen}
        onToggleCfg={onToggleCfg}
        cfgId={cfgId}
      >
        <ConfigPopover
          id={cfgId}
          open={cfgOpen}
          settings={settings}
          setWpm={stopThen(setWpm)}
          setEffWpm={stopThen(setEffWpm)}
          setToneHz={setToneHz}
          setLabels={setLabels}
          onCloseCfg={() => setCfgOpen(false)}
        />
      </Transport>

      <Flash enabled={player.light && player.playing} sounding={player.sounding} />
      <Toast message={toast} />
    </main>
  );
}
