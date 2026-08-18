'use client';

import { useEffect, useId, useRef } from 'react';
import { LIMITS } from '@/lib/settings';

const MONO = 'var(--font-mono), monospace';

function Slider({ label, value, unit, min, max, step, onChange }) {
  const id = useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--muted)' }}>
        <label htmlFor={id}>{label}</label>
        <span style={{ fontFamily: MONO, color: 'var(--ink)' }}>{value} {unit}</span>
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
      // clicks on the CONFIG toggle itself are handled by the toggle
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

  return (
    <div
      ref={rootRef}
      id={id}
      role="group"
      aria-label="Playback settings"
      style={{
        position: 'absolute', right: 0, bottom: 78, width: 292, padding: 20, borderRadius: 18, background: 'var(--surface)',
        border: '1px solid var(--border)', display: open ? 'flex' : 'none', flexDirection: 'column', gap: 18, zIndex: 6,
      }}
    >
      <Slider label="Speed" value={settings.wpm} unit="wpm" min={LIMITS.wpm[0]} max={LIMITS.wpm[1]} step={1} onChange={setWpm} />
      <Slider label="Effective speed" value={settings.effWpm} unit="wpm" min={LIMITS.effWpm[0]} max={settings.wpm} step={1} onChange={setEffWpm} />
      <Slider label="Tone" value={settings.toneHz} unit="Hz" min={LIMITS.toneHz[0]} max={LIMITS.toneHz[1]} step={10} onChange={setToneHz} />
      <button
        type="button"
        onClick={() => setLabels(!settings.labels)}
        aria-pressed={settings.labels}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
          appearance: 'none', background: 'var(--inset-fill)', border: '1px solid var(--border-soft)', color: 'var(--muted)', fontFamily: 'inherit', fontSize: 12.5,
        }}
      >
        <span>Letter labels</span>
        <span aria-hidden="true" style={{ width: 34, height: 18, borderRadius: 999, background: settings.labels ? 'var(--interact)' : 'var(--pressed-fill)', position: 'relative', transition: 'background 200ms' }}>
          <span style={{ position: 'absolute', top: 2, left: 2, width: 14, height: 14, borderRadius: '50%', background: settings.labels ? 'var(--on-accent)' : 'var(--muted)', transition: 'transform 220ms cubic-bezier(0.22,1,0.36,1)', transform: `translateX(${settings.labels ? 16 : 0}px)` }} />
        </span>
      </button>
    </div>
  );
}
