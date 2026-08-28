'use client';

// The instrument's control row. Play is the one live control and carries the
// reference colour; everything else is a labelled switch that only lights when
// it is actually engaged.

function ToolButton({ label, active, onClick, children, ariaProps }) {
  const pressed = ariaProps && 'aria-expanded' in ariaProps ? undefined : (active === undefined ? undefined : active);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      data-on={active ? 'true' : 'false'}
      {...ariaProps}
      className="tool"
    >
      {children}
      <span className="tool-cap">{label}</span>
    </button>
  );
}

const icon = {
  width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.7, strokeLinecap: 'square', strokeLinejoin: 'miter', 'aria-hidden': 'true',
};

export default function Transport({
  onPlay, onStop,
  repeat, onToggleRepeat,
  light, onToggleLight,
  onWav, onShare,
  cfgOpen, onToggleCfg,
  cfgId,
  children,
}) {
  return (
    <section
      aria-label="Transport"
      style={{
        position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center',
        flexWrap: 'wrap', gap: 4, paddingTop: 18, borderTop: '1px solid var(--rule)',
      }}
    >
      <button type="button" onClick={onPlay} className="btn btn-primary" style={{ marginRight: 10, padding: '11px 18px' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
        <span>Play</span>
      </button>

      <ToolButton label="Stop" onClick={onStop}>
        <svg {...icon}><rect x="6" y="6" width="12" height="12" /></svg>
      </ToolButton>

      <ToolButton label="Repeat" active={repeat} onClick={onToggleRepeat}>
        <svg {...icon}><path d="M17 2l3 3-3 3" /><path d="M20 5H8a4 4 0 0 0-4 4v1" /><path d="M7 22l-3-3 3-3" /><path d="M4 19h12a4 4 0 0 0 4-4v-1" /></svg>
      </ToolButton>

      <ToolButton label="Light" active={light} onClick={onToggleLight}>
        <svg {...icon}><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" /></svg>
      </ToolButton>

      <div aria-hidden="true" style={{ width: 1, height: 26, margin: '0 10px', background: 'var(--rule-strong)' }} />

      <ToolButton label="WAV" onClick={onWav}>
        <svg {...icon}><path d="M3 12h2M8 7v10M13 4v16M18 9v6M21 12h1" /></svg>
      </ToolButton>

      <ToolButton label="Share" onClick={onShare}>
        <svg {...icon}><path d="M12 3v11" /><path d="m8 7 4-4 4 4" /><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>
      </ToolButton>

      <ToolButton
        label="Settings"
        active={cfgOpen}
        onClick={onToggleCfg}
        ariaProps={{ 'aria-expanded': cfgOpen, 'aria-controls': cfgId, 'aria-pressed': undefined }}
      >
        <svg {...icon}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2.2" /><circle cx="10" cy="17" r="2.2" /></svg>
      </ToolButton>

      {children}
    </section>
  );
}
