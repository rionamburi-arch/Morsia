// Common questions. Two columns from lg so the panel isn't mostly margin, a
// divider between each, and the answer's first sentence set apart because it
// is the answer. Everything server-rendered — nothing is hidden behind a
// disclosure or assembled on the client.

import UnitBars, { patternSegments } from '@/components/home/UnitBars';
import { FAQ } from '@/components/home/faq';

const MONO = 'var(--font-mono), ui-monospace, monospace';

const BARS = {
  // SOS is keyed as one run-together signal, so no letter gaps.
  sos: {
    label: '· · · — — — · · ·',
    segments: patternSegments('...---...'),
  },
  dotdash: {
    label: 'dot, then dash',
    segments: [{ on: true, u: 1 }, { on: false, u: 3, tint: true }, { on: true, u: 3 }],
  },
};

function Figure({ kind }) {
  const spec = BARS[kind];
  if (!spec) return null;
  return (
    <div
      style={{
        marginTop: 12, padding: '12px 14px', borderRadius: 'var(--r-0)',
        border: '1px solid var(--rule)', background: 'var(--field)',
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
    <section aria-labelledby="faq" className="content-panel">
      <h2 id="faq" style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.2, color: 'var(--ink)' }}>
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
                <p key={para.slice(0, 24)} style={{ margin: '0 0 10px', fontSize: 14.5, lineHeight: 1.7, color: 'var(--g6)' }}>
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
