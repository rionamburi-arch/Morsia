// The chart's printed reference. A reference chart states its own scale, so
// the page carries the unit key above the fold and the tone wedge at its foot,
// the way a printed test chart carries both.

import UnitBars from '@/components/home/UnitBars';

const MONO = 'var(--font-mono), ui-monospace, monospace';
const KEY_UNIT = 'var(--diagram-unit)'; // 10px — legible at reading distance

const ruleRow = {
  display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap',
};
const value = {
  fontFamily: MONO, fontSize: 11, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
  letterSpacing: '0.04em',
};

/**
 * The unit key. It sits above the grid so every bar in the table below has a
 * stated scale to be measured against, rather than being a bar of no known size.
 */
export function UnitKey() {
  return (
    <div
      className="chart-key"
      style={{
        display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap',
        padding: '12px 16px', background: 'var(--field)', border: '1px solid var(--rule)',
      }}
    >
      <span className="field-label">The scale</span>

      <span style={ruleRow}>
        <UnitBars segments={[{ on: true, u: 1 }]} unit={KEY_UNIT} height="16px" />
        <span style={value}>1 unit</span>
        <span style={{ color: 'var(--g3)' }}>·</span>
        <span className="t-readout" style={{ textTransform: 'none' }}>a dot</span>
      </span>

      <span style={ruleRow}>
        <UnitBars segments={[{ on: true, u: 3 }]} unit={KEY_UNIT} height="16px" />
        <span style={value}>3 units</span>
        <span style={{ color: 'var(--g3)' }}>·</span>
        <span className="t-readout" style={{ textTransform: 'none' }}>a dash</span>
      </span>

      <span style={ruleRow}>
        <UnitBars
          segments={[{ on: true, u: 1 }, { on: false, u: 1, tint: true }, { on: true, u: 1 }]}
          unit={KEY_UNIT}
          height="16px"
        />
        <span style={value}>1 unit</span>
        <span style={{ color: 'var(--g3)' }}>·</span>
        <span className="t-readout" style={{ textTransform: 'none' }}>the gap between them</span>
      </span>
    </div>
  );
}

// The seven calibrated steps every neutral in the product is drawn from. A
// printed reference chart carries its tone scale so the reader can see whether
// their screen is showing the whole range; this one does the same job.
const STEPS = ['--g1', '--g2', '--g3', '--g4', '--g5', '--g6', '--g7'];

export function ToneWedge() {
  return (
    <figure
      style={{
        margin: 0, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        padding: '12px 16px', background: 'var(--field)', border: '1px solid var(--rule)',
      }}
    >
      <figcaption className="field-label">Tone scale</figcaption>
      <span aria-hidden="true" style={{ display: 'flex', height: 16 }}>
        {STEPS.map((step) => (
          <span key={step} style={{ width: 34, height: '100%', background: `var(${step})` }} />
        ))}
      </span>
      <span className="t-readout" style={{ textTransform: 'none' }}>
        seven steps, darkest to lightest — every grey on this site is one of them
      </span>
    </figure>
  );
}
