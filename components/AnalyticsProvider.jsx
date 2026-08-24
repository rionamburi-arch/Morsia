'use client';

// All analytics in one place: Vercel Analytics, Speed Insights, and Microsoft
// Clarity behind two independent gates.
//
//   1. Env gate    — no NEXT_PUBLIC_CLARITY_ID means no script and no banner.
//                    The whole feature stays dormant until the variable is set
//                    in Vercel.
//   2. Consent gate — the Clarity project is in cookie consent mode, so it
//                    collects nothing until clarity("consent") is called, and
//                    that only happens from the banner's Accept.
//
// The va-disable opt-out suppresses everything, Clarity included: on an
// opted-out device the script is never even injected.
//
// beforeSend is a function prop, which cannot cross the server/client
// boundary — that is why the root layout renders this wrapper.

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { isOptedOut, useOptOut } from '@/hooks/useOptOut';
import { track, tagMode, grantClarityConsent } from '@/lib/analytics';
import ConsentBanner, { useConsent } from '@/components/ConsentBanner';

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

const beforeSend = (event) => (isOptedOut() ? null : event);

function modeFor(pathname) {
  if (pathname.startsWith('/free')) return 'free';
  if (pathname.startsWith('/chart')) return 'chart';
  if (pathname.startsWith('/learn')) return 'learn';
  if (pathname.startsWith('/optout')) return null; // utility page, not a mode
  return 'translate';
}

export default function AnalyticsProvider() {
  const pathname = usePathname() || '/';
  const optedOut = useOptOut();
  const consent = useConsent();
  const clarityOn = Boolean(CLARITY_ID) && !optedOut;
  const mode = modeFor(pathname);

  // Tag the session and record the section, on first load and every route change.
  useEffect(() => {
    if (!mode) return;
    tagMode(mode);
    track('mode_entered', { mode });
  }, [mode]);

  // A device that already accepted keeps its consent across visits.
  useEffect(() => {
    if (clarityOn && consent === 'granted') grantClarityConsent();
  }, [clarityOn, consent]);

  return (
    <>
      <Analytics beforeSend={beforeSend} />
      <SpeedInsights beforeSend={beforeSend} />

      {clarityOn ? (
        <>
          {/* The opt-out is re-checked inside the snippet: React's first
              hydration pass cannot know the flag (it is client-only), so
              without this an opted-out device would still fetch the loader. */}
          <Script id="ms-clarity" strategy="afterInteractive">
            {`try{if(!localStorage.getItem('va-disable')){(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(CLARITY_ID)})}}catch(e){}`}
          </Script>
          <ConsentBanner />
        </>
      ) : null}
    </>
  );
}
