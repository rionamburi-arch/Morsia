import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import Header from '@/components/Header';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replaceAll('<', '\\u003c') }}
        />
        {/* Shell wrappers ported from the Claude Design export in design/cadence/ */}
        <div style={{ minHeight: '100vh', background: 'var(--ground)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 32px 56px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Header />
            {children}
          </div>
        </div>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
