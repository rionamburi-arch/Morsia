// Common questions. Two columns from lg so the panel isn't mostly margin, a
// divider between each, and the answer's first sentence set apart because it
// is the answer. Everything server-rendered — nothing is hidden behind a
// disclosure or assembled on the client.

import UnitBars, { patternSegments } from '@/components/home/UnitBars';
import { FAQ } from '@/components/home/faq';

const MONO = 'var(--font-mono), monospace';

const BARS = {
  // SOS is keyed as one run-together signal, so no letter gaps.
  sos: {
    label: '· · · — — — · · ·',
    segments: patternSegments('...---...'),
  },
  ditdah: {
    label: 'dit, then dah',
    segments: [{ on: true, u: 1 }, { on: false, u: 3, tint: true }, { on: true, u: 3 }],
  },
};

function Figure({ kind }) {
  const spec = BARS[kind];
  if (!spec) return null;
  return (
    <div
      style={{
        marginTop: 12, padding: '12px 14px', borderRadius: 12,
        border: '1px solid var(--border-soft)', background: 'var(--inset-fill)',
        display: 'flex', flexDirection: 'column', gap: 8, overflowX: 'auto',
      }}
    >
      <UnitBars segments={spec.segments} unit="var(--diagram-unit-sm)" height="18px" />
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', color: 'var(--chart-pattern)' }}>
        {spec.label}
      </span>
    </div>
  );
}

export default function Faq() {
  return (
    <section
      aria-labelledby="faq"
      style={{ padding: '26px 30px 28px', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
        <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
        <span
          style={{
            fontFamily: MONO, fontSize: 'var(--panel-label-size)', fontWeight: 700, letterSpacing: '0.2em',
            color: 'var(--interact)',
          }}
        >
          QUESTIONS
        </span>
      </div>
      <h2 id="faq" style={{ margin: '0 0 6px', fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
        Common questions
      </h2>

      <dl className="faq-grid" style={{ margin: 0 }}>
        {FAQ.map((item) => (
          <div key={item.q} className="faq-item">
            <dt style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.4 }}>
              {item.q}
            </dt>
            <dd style={{ margin: 0 }}>
              <p style={{ margin: '0 0 10px', fontSize: 15, lineHeight: 1.6, color: 'var(--ink)' }}>{item.lead}</p>
              {item.body.map((para) => (
                <p key={para.slice(0, 24)} style={{ margin: '0 0 10px', fontSize: 14.5, lineHeight: 1.7, color: 'var(--muted)' }}>
                  {para}
                </p>
              ))}
              {item.bars ? <Figure kind={item.bars} /> : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
