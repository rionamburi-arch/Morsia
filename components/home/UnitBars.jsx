// Bars drawn at true unit proportion, for the teaching diagrams. Takes an
// explicit run of marks and gaps so a 7-unit word gap is actually seven units
// of empty space. Server-rendered, static — no canvas.

const UNIT = 'var(--diagram-unit)';
const H = 'var(--diagram-bar-h)';

/** segments: [{ on: boolean, u: number, tint?: boolean }] */
export default function UnitBars({ segments, height, unit, color = 'var(--bar-rest)' }) {
  const u = unit || UNIT;
  const h = height || H;
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', height: h }}>
      {segments.map((s, i) => (
        <div
          key={i}
          style={{
            width: `calc(${u} * ${s.u})`,
            height: s.on ? '100%' : '100%',
            borderRadius: s.on ? 'var(--chart-bar-radius)' : 0,
            background: s.on ? color : s.tint ? 'var(--gap-tint)' : 'transparent',
            border: s.on || !s.tint ? 0 : '1px dashed var(--border)',
            boxSizing: 'border-box',
          }}
        />
      ))}
    </div>
  );
}

/** A dot-dash pattern as segments, with 1-unit gaps between elements. */
export function patternSegments(pattern) {
  const els = [...pattern].filter((c) => c === '.' || c === '-');
  const out = [];
  els.forEach((c, i) => {
    out.push({ on: true, u: c === '-' ? 3 : 1 });
    if (i < els.length - 1) out.push({ on: false, u: 1 });
  });
  return out;
}

/** Several patterns joined by a gap of `gapUnits` (3 between letters, 7 between words). */
export function wordSegments(patterns, gapUnits = 3, tintGaps = false) {
  const out = [];
  patterns.forEach((p, i) => {
    if (i > 0) out.push({ on: false, u: gapUnits, tint: tintGaps });
    out.push(...patternSegments(p));
  });
  return out;
}
