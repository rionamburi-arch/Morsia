// The five durations that are the whole of Morse, drawn at true proportion —
// and two worked examples so a real letter and a real word can be seen doing it.

import UnitBars, { patternSegments, wordSegments } from '@/components/home/UnitBars';
import { TABLE } from '@/lib/morse';

const MONO = 'var(--font-mono), monospace';

const figure = {
  padding: '16px 18px', borderRadius: 16, border: '1px solid var(--border-soft)', background: 'var(--inset-fill)',
};
const caption = {
  fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase',
};
const rowLabel = { fontSize: 13, color: 'var(--ink)' };
const units = { fontFamily: MONO, fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' };
// Longer captions must wrap rather than clip inside the scrollable figure.
const note = { fontFamily: MONO, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 };

const RULES = [
  { label: 'dot', n: 1, segments: [{ on: true, u: 1 }] },
  { label: 'dash', n: 3, segments: [{ on: true, u: 3 }] },
  { label: 'gap inside a letter', n: 1, segments: [{ on: true, u: 1 }, { on: false, u: 1, tint: true }, { on: true, u: 1 }] },
  { label: 'gap between letters', n: 3, segments: [{ on: true, u: 1 }, { on: false, u: 3, tint: true }, { on: true, u: 1 }] },
  { label: 'gap between words', n: 7, segments: [{ on: true, u: 1 }, { on: false, u: 7, tint: true }, { on: true, u: 1 }] },
];

function Row({ label, n, segments }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <span style={rowLabel}>{label}</span>
        <span style={units}>{n} {n === 1 ? 'unit' : 'units'}</span>
      </div>
      <UnitBars segments={segments} />
    </div>
  );
}

export function TimingRules() {
  return (
    <figure style={{ ...figure, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <figcaption style={caption}>The five durations</figcaption>
      {RULES.map((r) => (
        <Row key={r.label} label={r.label} n={r.n} segments={r.segments} />
      ))}
    </figure>
  );
}

export function WorkedExample() {
  return (
    <figure style={{ ...figure, margin: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <figcaption style={caption}>At true proportion</figcaption>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowX: 'auto' }}>
        <span style={rowLabel}>
          C <span style={{ fontFamily: MONO, color: 'var(--chart-pattern)' }}>−·−·</span>
        </span>
        <UnitBars segments={patternSegments(TABLE.C)} />
        <span style={note}>four elements, three 1-unit gaps</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowX: 'auto' }}>
        <span style={rowLabel}>
          HI <span style={{ fontFamily: MONO, color: 'var(--chart-pattern)' }}>···· ··</span>
        </span>
        <UnitBars segments={wordSegments([TABLE.H, TABLE.I], 3, true)} />
        <span style={note}>the dashed space is the 3-unit letter gap</span>
      </div>
    </figure>
  );
}
