'use client';

const MONO = 'var(--font-mono)';

function ToolButton({ label, active, hover, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active === undefined ? undefined : active}
      className={hover}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 72, padding: '8px 6px', borderRadius: 14,
        cursor: 'pointer', appearance: 'none', fontFamily: 'inherit', transition: 'color 180ms, background 180ms',
        background: active ? 'var(--interact-fill)' : 'transparent',
        border: `1px solid ${active ? 'var(--interact-border)' : 'transparent'}`,
        color: active ? 'var(--interact)' : 'var(--muted)',
      }}
    >
      {children}
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em' }}>{label}</span>
    </button>
  );
}

const icon = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };

export default function Transport({
  onPlay, onStop,
  repeat, onToggleRepeat,
  light, onToggleLight,
  onWav, onShare,
  cfgOpen, onToggleCfg,
  children,
}) {
  return (
    <section
      aria-label="Transport"
      style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 4, paddingTop: 18, borderTop: '1px solid var(--rule)' }}
    >
      <button
        type="button"
        onClick={onPlay}
        className="hv-signal"
        style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '11px 20px 11px 17px', marginRight: 8, borderRadius: 999, cursor: 'pointer',
          appearance: 'none', fontFamily: 'inherit', background: 'var(--signal)', border: 0, color: 'var(--on-accent)',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', transition: 'background 180ms',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>
        <span>PLAY</span>
      </button>

      <ToolButton label="STOP" hover="hv-tint-ink" onClick={onStop}>
        <svg {...icon}><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
      </ToolButton>

      <ToolButton label="REPEAT" hover="hv-tint" active={repeat} onClick={onToggleRepeat}>
        <svg {...icon}><path d="M17 2l3 3-3 3" /><path d="M20 5H8a4 4 0 0 0-4 4v1" /><path d="M7 22l-3-3 3-3" /><path d="M4 19h12a4 4 0 0 0 4-4v-1" /></svg>
      </ToolButton>

      <ToolButton label="LIGHT" hover="hv-tint" active={light} onClick={onToggleLight}>
        <svg {...icon}><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" /></svg>
      </ToolButton>

      <div aria-hidden="true" style={{ width: 1, height: 26, margin: '0 8px', background: 'var(--divider)' }} />

      <ToolButton label="WAV" hover="hv-tint-ink" onClick={onWav}>
        <svg {...icon} strokeWidth={1.9}><path d="M3 12h2M8 7v10M13 4v16M18 9v6M21 12h0" /></svg>
      </ToolButton>

      <ToolButton label="SHARE" hover="hv-tint-ink" onClick={onShare}>
        <svg {...icon}><path d="M12 3v11" /><path d="m8 7 4-4 4 4" /><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>
      </ToolButton>

      <ToolButton label="CONFIG" hover="hv-tint" active={cfgOpen} onClick={onToggleCfg}>
        <svg {...icon}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2.2" /><circle cx="10" cy="17" r="2.2" /></svg>
      </ToolButton>

      {children}
    </section>
  );
}
