// Morse tattoos. The advice used to sit inside the homepage explanation, where
// nobody searching for it would ever find it; it is the same text on its own
// route, with the question that goes with it.

import Link from 'next/link';
import TattooGuide from '@/components/tattoo/TattooGuide';
import Faq from '@/components/home/Faq';
import { TATTOO_FAQ, answerText } from '@/components/home/faq';

const TITLE = 'Morse Code Tattoo — Get the Spacing Right | Morsia';
const DESCRIPTION =
  'A lot of Morse tattoos are unreadable, and it’s always the same reason: the spacing. Here is the rule, and how to check a design before you commit to it.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/morse-code-tattoo' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/morse-code-tattoo', type: 'article' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: TATTOO_FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: answerText(item) },
  })),
};

export default function TattooPage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replaceAll('<', '\\u003c') }}
      />

      {/* The panels below sit at the reading measure, so the header lines up with
          them rather than running to the page edge like the chart's does. */}
      <header
        style={{
          width: '100%', maxWidth: 'var(--measure)', margin: '0 auto', padding: '0 30px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Morse code tattoo
        </h1>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>
          A lot of Morse tattoos are unreadable, and it’s always the same reason: the spacing.
        </p>
      </header>

      <TattooGuide />
      <Faq items={TATTOO_FAQ} />

      <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
        <Link href="/">Back to the Morse code translator</Link>
      </p>
    </main>
  );
}
