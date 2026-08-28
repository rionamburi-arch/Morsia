// The Morse code chart. This is the page most people arrive on, so the whole
// table is rendered on the server (statically prerendered) and is complete
// with JavaScript switched off; Chart.jsx layers search, audio and the tree
// on top of the same markup.

import Chart from '@/components/chart/Chart';
import { UnitKey, ToneWedge } from '@/components/chart/ChartKey';
import { TABLE, PROSIGNS, prettyPattern } from '@/lib/morse';

const TITLE = 'Morse Code Chart — Full Alphabet with Sound | Morsia';
const DESCRIPTION =
  'The full Morse code alphabet as timing bars you can hear: every letter, number, punctuation mark and prosign. Click any character to play it.';

export const dynamic = 'force-static';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/chart' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/chart', type: 'article' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

/** ItemList of every character and its pattern, for rich results. */
function structuredData() {
  const items = [
    ...Object.entries(TABLE).map(([char, pattern]) => ({ name: char, pattern })),
    ...PROSIGNS.map((p) => ({ name: p.name, pattern: p.pattern, meaning: p.meaning })),
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: TITLE,
    description: DESCRIPTION,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${item.name} — ${prettyPattern(item.pattern)}`,
      ...(item.meaning ? { description: item.meaning } : {}),
    })),
  };
}

export default function ChartPage() {
  const json = JSON.stringify(structuredData()).replaceAll('<', '\\u003c');
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />

      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Morse code chart
        </h1>
        <p style={{ margin: 0, maxWidth: '62ch', fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>
          Every character as proportional bars — a dot is one unit, a dash is three, and the gap between them is one.
          That is what Morse actually sounds like, so click any character to hear it.
        </p>
      </header>

      <UnitKey />

      <Chart />

      <ToneWedge />
    </main>
  );
}
