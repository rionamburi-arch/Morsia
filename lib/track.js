// Named product events. Never pass message content — what people translate
// is private and that promise is on the page.

import { track as vercelTrack } from '@vercel/analytics';

export function track(name, props) {
  try {
    vercelTrack(name, props);
  } catch {
    /* analytics must never break the app */
  }
}
