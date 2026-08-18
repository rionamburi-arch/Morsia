'use client';

import { useMemo, useState } from 'react';
import { toSegments } from '@/lib/timing';
import Scope from '@/components/Scope';

export default function TranslatePage() {
  const [text, setText] = useState('PARIS');
  const segments = useMemo(() => toSegments(text, { wpm: 18 }), [text]);
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section style={{ borderRadius: 24, padding: '18px 26px 14px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <Scope segments={segments} wpm={18} clock={null} showLabels />
      </section>
      <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ color: 'var(--ink)', background: 'var(--surface)', padding: 12 }} />
    </main>
  );
}
