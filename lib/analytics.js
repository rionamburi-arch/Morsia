// The one analytics API. Everything in the app calls track() from here and
// never a vendor SDK directly, so swapping a tool later is one file.
//
// Volume discipline: never call this once per keyed character. Hobby includes
// 50,000 Web Analytics events a month and ten minutes of practice is hundreds
// of characters. Count in local state and emit one `session_summary`
// (see hooks/useSessionSummary.js).

import { track as vercelTrack } from '@vercel/analytics';
import { isOptedOut } from '@/hooks/useOptOut';

/**
 * The complete set of events this app emits.
 *   mode_entered            — a section was opened { mode }
 *   session_summary         — one per session of use { mode, characters, seconds }
 *   chart_character_played  — first character played in a chart session
 *   fullscreen_entered      — Free Mode's fullscreen key
 *   wav_downloaded          — { }
 *   share_clicked           — { }
 */
export const EVENTS = Object.freeze([
  'mode_entered',
  'session_summary',
  'chart_character_played',
  'fullscreen_entered',
  'wav_downloaded',
  'share_clicked',
]);

export const MODES = Object.freeze(['translate', 'free', 'chart', 'learn']);

/** Clarity only accepts strings for tags. */
const asTag = (v) => String(v);

export function track(name, props) {
  if (typeof window === 'undefined') return;
  if (isOptedOut()) return; // this device asked to be left out — both vendors

  if (process.env.NODE_ENV !== 'production' && !EVENTS.includes(name)) {
    console.warn(`[analytics] unknown event "${name}" — add it to EVENTS in lib/analytics.js`);
  }

  try {
    vercelTrack(name, props);
  } catch {
    /* analytics must never throw into the app */
  }

  try {
    // Clarity: a custom event, plus each prop as a filterable tag.
    window.clarity?.('event', name);
    for (const [key, value] of Object.entries(props ?? {})) {
      window.clarity?.('set', key, asTag(value));
    }
  } catch {
    /* ditto */
  }
}

/** Tag the whole session with the section being used, for filtering recordings. */
export function tagMode(mode) {
  if (typeof window === 'undefined' || isOptedOut()) return;
  try {
    window.clarity?.('set', 'mode', asTag(mode));
  } catch {
    /* ignore */
  }
}

/** Consent — Clarity collects nothing until this is called (cookie consent mode). */
export function grantClarityConsent() {
  try {
    window.clarity?.('consent');
  } catch {
    /* ignore */
  }
}
