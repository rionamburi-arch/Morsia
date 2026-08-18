import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
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

export const metadata = {
  title: 'Cadence — Morse code translator',
  description: 'Translate text to Morse code, hear it, and learn to read it by ear.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>
        {/* Shell wrappers ported from design/cadence/Cadence Translate.dc.html */}
        <div style={{ minHeight: '100vh', background: 'var(--ground)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 32px 56px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Header />
            {children}
          </div>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
