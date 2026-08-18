// Unit maths, Farnsworth gaps, and the segment builder.
// toSegments() is the single source of truth for timing: audio, canvas and WAV
// all read from it. Pure functions — no DOM, no React.

import { TABLE, isKnown } from './morse.js';

/** One Morse unit in ms at a given character speed (PARIS: 50 units per word). */
export function unitMs(wpm) {
  return 1200 / wpm;
}

/**
 * Gap lengths in ms. Standard spacing is 1 / 3 / 7 units. When the effective
 * speed is lower than the character speed, ARRL Farnsworth spacing stretches
 * the character and word gaps (never the intra-character gap).
 */
export function gaps(wpm, effWpm = wpm) {
  const u = unitMs(wpm);
  const e = Math.min(effWpm, wpm);
  if (e >= wpm) return { intra: u, char: 3 * u, word: 7 * u };
  const ta = (60 * wpm - 37.2 * e) / (wpm * e); // seconds of extra delay per PARIS
  return { intra: u, char: (3 * ta / 19) * 1000, word: (7 * ta / 19) * 1000 };
}

/**
 * Text → ordered segments:
 *   { on, ms, kind: 'dit'|'dah'|'intra'|'char'|'word', char, charIndex, wordIndex }
 * dit/dah/intra carry the character they belong to; char/word gaps carry
 * char: null and charIndex: -1. Never two gaps adjacent, no leading/trailing gap.
 */
export function toSegments(text, { wpm, effWpm = wpm } = {}) {
  const u = unitMs(wpm);
  const g = gaps(wpm, effWpm);
  const out = [];
  let charIndex = 0;
  let wordIndex = 0;
  const words = String(text).toUpperCase().split(/\s+/).filter(Boolean);
  for (const word of words) {
    const chars = [...word].filter(isKnown);
    if (!chars.length) continue;
    if (wordIndex > 0) out.push({ on: false, ms: g.word, kind: 'word', char: null, charIndex: -1, wordIndex });
    chars.forEach((ch, ci) => {
      const code = TABLE[ch];
      for (let i = 0; i < code.length; i++) {
        const dah = code[i] === '-';
        out.push({ on: true, ms: dah ? 3 * u : u, kind: dah ? 'dah' : 'dit', char: ch, charIndex, wordIndex });
        if (i < code.length - 1) out.push({ on: false, ms: g.intra, kind: 'intra', char: ch, charIndex, wordIndex });
      }
      if (ci < chars.length - 1) out.push({ on: false, ms: g.char, kind: 'char', char: null, charIndex: -1, wordIndex });
      charIndex++;
    });
    wordIndex++;
  }
  return out;
}

export function totalMs(segments) {
  let t = 0;
  for (const s of segments) t += s.ms;
  return t;
}

/** starts[i] = ms at which segment i begins; starts[n] = total. */
export function cumulativeStarts(segments) {
  const starts = new Float64Array(segments.length + 1);
  for (let i = 0; i < segments.length; i++) starts[i + 1] = starts[i] + segments[i].ms;
  return starts;
}

/** Index of the segment playing at `ms`, or -1 when outside [0, total). Binary search. */
export function indexAtMs(starts, ms) {
  const n = starts.length - 1;
  if (n <= 0 || !(ms >= 0) || ms >= starts[n]) return -1;
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= ms) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
