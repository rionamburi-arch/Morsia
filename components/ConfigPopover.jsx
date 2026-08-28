'use client';

import { useEffect, useId, useRef } from 'react';
import { LIMITS } from '@/lib/settings';

// Instrument settings. Every control states its current value as a readout,
// because a setting you cannot read is not a setting on an instrument.

function Slider({ label, value, unit, min, max, step, onChange, note }) {
  const id = useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <label htmlFor={id} style={{ fontSize: 13, color: 'var(--g6)' }}>{label}</label>
        <span className="t-readout-lg">
          <span className="t-value">{value}</span> <span className="t-unit">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', height: 4 }}
      />
      {note ? <span className="t-readout" style={{ fontSize: 9.5, color: 'var(--g4)', textTransform: 'none', letterSpacing: 0 }}>{note}</span> : null}
    </div>
  );
}

export default function ConfigPopover({ id, open, settings, setWpm, setEffWpm, setToneHz, setLabels, onCloseCfg }) {
  const rootRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onCloseCfg(); };
    const onDown = (e) => {
      const root = rootRef.current;
      if (!root || root.contains(e.target)) return;
      // clicks on the settings toggle itself are handled by the toggle
      if (e.target.closest && e.target.closest('[aria-controls="' + id + '"]')) return;
      onCloseCfg();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, id, onCloseCfg]);

  const unitMs = (1200 / settings.wpm).toFixed(1);

  return (
    <div
      ref={rootRef}
      id={id}
      role="group"
      aria-label="Playback settings"
      style={{
        position: 'absolute', right: 0, bottom: 78, width: 300, padding: 18, borderRadius: 'var(--r-0)',
        background: 'var(--field)', border: '1px solid var(--rule-strong)',
        display: open ? 'flex' : 'none', flexDirection: 'column', gap: 18, zIndex: 6,
      }}
    >
      <Slider
        label="Speed"
        value={settings.wpm}
        unit="wpm"
        min={LIMITS.wpm[0]}
        max={LIMITS.wpm[1]}
        step={1}
        onChange={setWpm}
        note={`one unit = ${unitMs} ms`}
      />
      <Slider
        label="Effective speed"
        value={settings.effWpm}
        unit="wpm"
        min={LIMITS.effWpm[0]}
        max={settings.wpm}
        step={1}
        onChange={setEffWpm}
        note="stretches the gaps, not the characters"
      />
      <Slider label="Tone" value={settings.toneHz} unit="Hz" min={LIMITS.toneHz[0]} max={LIMITS.toneHz[1]} step={10} onChange={setToneHz} />

      <button
        type="button"
        onClick={() => setLabels(!settings.labels)}
        aria-pressed={settings.labels}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px',
          borderRadius: 'var(--r-1)', cursor: 'pointer', appearance: 'none', background: 'transparent',
          border: '1px solid var(--rule-strong)', color: 'var(--g6)', fontFamily: 'inherit', fontSize: 13,
        }}
      >
        <span>Letter labels</span>
        <span
          aria-hidden="true"
          style={{
            width: 32, height: 16, borderRadius: 'var(--r-1)', position: 'relative',
            background: settings.labels ? 'var(--reference)' : 'var(--g2)',
            border: `1px solid ${settings.labels ? 'var(--reference)' : 'var(--g3)'}`,
            transition: 'background 180ms linear, border-color 180ms linear',
          }}
        >
          <span
            style={{
              position: 'absolute', top: 1, left: 1, width: 12, height: 12,
              background: settings.labels ? '#17120A' : 'var(--g5)',
              transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1)',
              transform: `translateX(${settings.labels ? 16 : 0}px)`,
            }}
          />
        </span>
      </button>
    </div>
  );
}
