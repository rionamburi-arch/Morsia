// Slugs for /m/[slug] share links. Capped and restricted to the Morse charset
// so a stranger-controlled URL can only ever decode to plain, encodable text.

import { isKnown } from './morse.js';

export const SLUG_MAX = 280;

const allowed = (ch) => ch === ' ' || isKnown(ch);

/** Text → URL slug (already percent-encoded). "" if nothing encodable remains. */
export function encodeSlug(text) {
  const clean = [...String(text).toUpperCase().trim().replace(/\s+/g, ' ')]
    .filter(allowed)
    .join('')
    .slice(0, SLUG_MAX)
    .trim();
  return clean ? encodeURIComponent(clean) : '';
}

/** URL slug → text, or null if it is malformed, too long, or off-charset. */
export function decodeSlug(slug) {
  if (typeof slug !== 'string' || !slug) return null;
  let s;
  try {
    s = decodeURIComponent(slug);
  } catch {
    return null;
  }
  s = s.toUpperCase();
  if (!s || s.length > SLUG_MAX) return null;
  if (![...s].every(allowed)) return null;
  return s;
}
