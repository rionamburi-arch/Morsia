// Translate — the homepage. A server shell so the metadata, the prose and the
// structured data are in the initial HTML; the tool itself is the client leaf.

import TranslateApp from '@/components/translate/TranslateApp';
import AboutMorse from '@/components/home/AboutMorse';
import Faq from '@/components/home/Faq';
import { FAQ, answerText } from '@/components/home/faq';

const TITLE = 'Morse Code Translator — Text to Morse with Sound | Morsia';
const DESCRIPTION =
  'Translate text to Morse code and back, hear it played at any speed, and watch the rhythm as proportional timing bars. Free, instant, and no sign-up.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/', type: 'website' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: answerText(item) },
  })),
};

export default function TranslatePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replaceAll('<', '\\u003c') }}
      />
      <TranslateApp />
      <AboutMorse />
      <Faq />
    </>
  );
}
