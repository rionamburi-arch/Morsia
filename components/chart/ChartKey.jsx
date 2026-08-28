// The chart's printed reference. A reference chart states its own scale, so
// the page carries the unit key above the fold and the tone wedge at its foot,
// the way a printed test chart carries both.

import UnitBars from '@/components/home/UnitBars';

const MONO = 'var(--font-mono), ui-monospace, monospace';
const KEY_UNIT = 'var(--diagram-unit)'; // 10px — legible at reading distance

const value = {
  fontFamily: MONO, fontSize: 11, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
  letterSpacing: '0.04em', whiteSpace: 'nowrap',
};

/**
 * The unit key. It sits above the grid so every bar in the table below has a
 * stated scale to be measured against, rather than being a bar of no known size.
 *
 * The three specimens share a left origin at every width — a scale key whose
 * samples cannot be compared against a common origin has lost the one thing it
 * exists to show, which is exactly what happened when the row simply wrapped.
 */
function Row({ segments, quantity, name }) {
  return (
    <span className="chart-key-row">
      <span className="chart-key-swatch">
        <UnitBars segments={segments} unit={KEY_UNIT} height="16px" />
      </span>
      <span style={value}>{quantity}</span>
      <span className="t-readout" style={{ textTransform: 'none' }}>{name}</span>
    </span>
  );
}

export function UnitKey() {
  return (
    <div className="chart-key">
      <span className="field-label chart-key-label">The scale</span>
      <Row segments={[{ on: true, u: 1 }]} quantity="1 unit" name="a dot" />
      <Row segments={[{ on: true, u: 3 }]} quantity="3 units" name="a dash" />
      <Row
        segments={[{ on: true, u: 1 }, { on: false, u: 1, tint: true }, { on: true, u: 1 }]}
        quantity="1 unit"
        name="the gap between them"
      />
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
