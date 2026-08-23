'use client';

// Vercel Analytics and Speed Insights, both filtered through the same
// beforeSend handler so a device that has opted out sends nothing.
//
// This wrapper exists because beforeSend is a function prop, and functions
// cannot cross the server/client boundary — the root layout is a server
// component, so it renders this instead of the two widgets directly.

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { isOptedOut } from '@/hooks/useOptOut';

// Returning null cancels the event. isOptedOut() is guarded, so a browser
// with storage blocked (or an SSR pass) simply reports as opted in.
const beforeSend = (event) => (isOptedOut() ? null : event);

export default function AnalyticsProvider() {
  return (
    <>
      <Analytics beforeSend={beforeSend} />
      <SpeedInsights beforeSend={beforeSend} />
    </>
  );
}
