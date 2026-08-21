// Chart sections, sorting and the dichotomic tree — all derived from the one
// table in morse.js. Pure: no DOM, no React.

import { TABLE, KOCH_ORDER } from './morse.js';

const row = (char) => ({ char, pattern: TABLE[char] });
const isLetter = (c) => /^[A-Z]$/.test(c);
const isDigit = (c) => /^[0-9]$/.test(c);

export const LETTERS = Object.freeze(Object.keys(TABLE).filter(isLetter).map(row));
export const NUMBERS = Object.freeze(Object.keys(TABLE).filter(isDigit).map(row));
export const PUNCTUATION = Object.freeze(
  Object.keys(TABLE).filter((c) => !isLetter(c) && !isDigit(c)).map(row),
);

export const SORTS = Object.freeze([
  { id: 'alpha', label: 'A–Z' },
  { id: 'length', label: 'By length' },
  { id: 'koch', label: 'Koch order' },
]);

const kochIndex = new Map(KOCH_ORDER.map((c, i) => [c, i]));

/** Letters in the requested order. Unknown mode falls back to alphabetical. */
export function sortLetters(mode) {
  const letters = [...LETTERS];
  if (mode === 'length') {
    return letters.sort((a, b) => a.pattern.length - b.pattern.length || a.char.localeCompare(b.char));
  }
  if (mode === 'koch') {
    return letters.sort((a, b) => (kochIndex.get(a.char) ?? 99) - (kochIndex.get(b.char) ?? 99));
  }
  return letters.sort((a, b) => a.char.localeCompare(b.char));
}
