// A pattern drawn as proportional bars — the same visual language as the strip:
// dit 1 unit, dah 3 units, 1 unit between them. Small and static, so plain
// divs are right here (the canvas renderer solves a different problem).

export default function PatternBars({ pattern, unit, height, color = 'var(--bar-rest)', ruled = false }) {
  const u = unit || 'var(--chart-bar-unit)';
  const h = height || 'var(--chart-bar-h)';
  const row = (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: u, height: h, position: 'relative' }}>
      {[...pattern].map((el, i) => (
        <div
          key={`${el}${i}`}
          style={{
            width: el === '-' ? `calc(${u} * 3)` : u,
            height: '100%',
            borderRadius: 'var(--chart-bar-radius)',
            background: color,
          }}
        />
      ))}
    </div>
  );
  if (!ruled) return row;
  // A unit tick strip sized to the pattern itself. Ruling the whole cell reads
  // as hatching and competes with the bars; ticks on the pattern's own footing
  // align exactly to the unit and stay quiet.
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>
      {row}
      <div
        aria-hidden="true"
        style={{
          height: 3,
          backgroundImage: `repeating-linear-gradient(to right, var(--g4) 0 1px, transparent 1px ${u})`,
        }}
      />
    </div>
  );
}
