// Character table, encode, decode. Pure functions — no DOM, no React.

export const TABLE = Object.freeze({
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
});

export const REVERSE = Object.freeze(
  Object.fromEntries(Object.entries(TABLE).map(([ch, code]) => [code, ch])),
);

export function isKnown(ch) {
  return Object.hasOwn(TABLE, ch);
}

/**
 * Text → { morse, unknown }.
 * Letters within a word are separated by one space, words by " / ".
 * Unsupported characters are skipped and listed (distinct, first-seen order).
 */
export function encode(text) {
  const unknown = [];
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const morse = words
    .map((word) => {
      const codes = [];
      for (const ch of word) {
        const up = ch.toUpperCase();
        if (isKnown(up)) codes.push(TABLE[up]);
        else if (!unknown.includes(ch)) unknown.push(ch);
      }
      return codes.join(' ');
    })
    .filter(Boolean)
    .join(' / ');
  return { morse, unknown };
}

/**
 * Sanitise user-typed Morse: unicode dots/dashes → ASCII, newline → word break,
 * anything else dropped, runs of spaces collapsed. Does NOT trim, so a trailing
 * space typed as a letter gap survives.
 */
export function normaliseMorse(str) {
  return String(str ?? '')
    .replace(/[·•∙⋅]/g, '.')
    .replace(/[—–−‐‑‒―]/g, '-')
    .replace(/\r\n?|\n/g, ' / ')
    .replace(/\s/g, ' ')
    .replace(/[^.\-/ ]/g, '')
    .replace(/ {2,}/g, ' ');
}

/** Morse → text. Unknown groups become "?". Never throws. */
export function decode(morse) {
  return normaliseMorse(morse)
    .split('/')
    .map((word) =>
      word
        .trim()
        .split(/ +/)
        .filter(Boolean)
        .map((group) => (Object.hasOwn(REVERSE, group) ? REVERSE[group] : '?'))
        .join(''),
    )
    .filter(Boolean)
    .join(' ');
}

/** Display form of a dot-dash pattern: '.-' → '·−'. */
export function prettyPattern(pattern) {
  return String(pattern).replaceAll('.', '·').replaceAll('-', '−');
}

/**
 * Prosigns — procedural signals keyed as ONE run-together character.
 *
 * Deliberately NOT part of TABLE: several share a pattern with a punctuation
 * mark (AR = "+", AS = "&", BT = "=", KN = "("), so folding them in would
 * break REVERSE's one-pattern-one-character contract and corrupt decode().
 */
export const PROSIGNS = Object.freeze([
  { name: 'AR', pattern: '.-.-.', meaning: 'End of message' },
  { name: 'AS', pattern: '.-...', meaning: 'Wait — stand by' },
  { name: 'BT', pattern: '-...-', meaning: 'New paragraph / break' },
  { name: 'SK', pattern: '...-.-', meaning: 'End of contact' },
  { name: 'KN', pattern: '-.--.', meaning: 'Go ahead — named station only' },
  { name: 'SOS', pattern: '...---...', meaning: 'Distress call' },
  { name: 'HH', pattern: '........', meaning: 'Error — disregard, start the word again' },
]);

/**
 * Koch's learning sequence — the original ordering from Ludwig Koch's 1936
 * method, as used by LCWO and G4FON (K M R S U A P T L O W I . N J E F 0 Y ,
 * V G 5 / Q 9 Z H 3 8 B ? 4 2 7 C 1 D 6 X). Several near-identical orderings
 * circulate; this is that one, named so it can be compared.
 */
export const KOCH_ORDER = Object.freeze([
  'K', 'M', 'R', 'S', 'U', 'A', 'P', 'T', 'L', 'O', 'W', 'I', '.', 'N', 'J', 'E',
  'F', '0', 'Y', ',', 'V', 'G', '5', '/', 'Q', '9', 'Z', 'H', '3', '8', 'B', '?',
  '4', '2', '7', 'C', '1', 'D', '6', 'X',
]);

const PROSIGN_BY_PATTERN = new Map(PROSIGNS.map((p) => [p.pattern, p.name]));

/**
 * What a run-together pattern keyed by hand means (Free Mode).
 *
 * Real characters win — keying ".-.-." gives "+", because that is a character
 * someone might actually want. Prosigns fill the gaps where no character owns
 * the pattern (SK, SOS, the eight-dit error), shown angle-bracketed the way
 * operators write them: <SK>. Unknown patterns are still "?".
 *
 * decode() deliberately does NOT use this: the Translate panels must round-trip.
 */
export function decodeKeyed(pattern) {
  if (Object.hasOwn(REVERSE, pattern)) return REVERSE[pattern];
  const prosign = PROSIGN_BY_PATTERN.get(pattern);
  return prosign ? `<${prosign}>` : '?';
}
