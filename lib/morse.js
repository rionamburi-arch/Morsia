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
  const words = String(text).toUpperCase().split(/\s+/).filter(Boolean);
  const morse = words
    .map((word) => {
      const codes = [];
      for (const ch of word) {
        if (isKnown(ch)) codes.push(TABLE[ch]);
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
  return String(str)
    .replace(/[·•]/g, '.')
    .replace(/[—–−]/g, '-')
    .replace(/\r?\n/g, ' / ')
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
        .map((group) => REVERSE[group] ?? '?')
        .join(''),
    )
    .filter(Boolean)
    .join(' ');
}
