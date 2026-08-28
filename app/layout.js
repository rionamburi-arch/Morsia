import { Chivo, Martian_Mono } from 'next/font/google';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import Header from '@/components/Header';
import './globals.css';

// Human voice. A workhorse grotesque with enough warmth to keep a measurement
// instrument from reading as a clinical one.
const chivo = Chivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

// Machine voice. Every measured value — units, milliseconds, WPM, Hz, and the
// Morse itself — is set in this. Engineered, wide, and unmistakably a readout.
const martian = Martian_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport = { viewportFit: 'cover' }; // safe-area insets (fullscreen key) need it

const SITE = 'https://morsia.app'; // canonical: www.morsia.app 308s to the apex
const TITLE = 'Morsia — Morse code translator, chart and trainer';
const DESCRIPTION =
  'Translate text to Morse code, hear it, key it yourself, and learn to read it by ear. Free, no sign-up.';

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: '%s' },
  description: DESCRIPTION,
  applicationName: 'Morsia',
  openGraph: {
    type: 'website',
    siteName: 'Morsia',
    url: SITE,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const siteSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Morsia',
    url: SITE,
    description: DESCRIPTION,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Morsia',
    url: SITE,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    description: DESCRIPTION,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
];

// The direction contract. React strips JSX comments, so this ships through
// dangerouslySetInnerHTML to survive the production build and stay greppable.
const CONTRACT = `<!--
THESIS: Morse is a measurement, so the interface is an instrument's reference
chart. It refuses the two-panel translator with a dot-and-dash readout.
OWN-WORLD: Near-black neutral field; a calibrated grey step wedge as the only
neutral ramp; one tungsten amber for the live measure, one red for
out-of-range. Square corners, hairline rules, printed scales. No cards, no
eyebrow labels, no glow. Chivo for human text, Martian Mono for every measured
value.
STORY: Someone who searched for Morse sees it drawn true to time, types, hears
it, and understands that a dah is exactly three dits.
FIRST VIEWPORT: A ruled measuring field spanning the column, a printed unit
scale across its top edge, the message as hard-edged blocks on the baseline, a
registration gate riding the scale while it plays, the ms/unit readout at the
scale's right.
FORM: The Calibration Chart; candidate 1 of the safer-register list; seed bc1c8e8b.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
-->`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${chivo.variable} ${martian.variable}`}>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replaceAll('<', '\\u003c') }}
        />
        <div className="chassis">
          <div className="column">
            <Header />
            {children}
          </div>
        </div>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
