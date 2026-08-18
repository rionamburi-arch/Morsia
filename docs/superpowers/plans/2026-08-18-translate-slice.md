# Translate Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Morse maths (`lib/`), the canvas rhythm strip (`Scope.jsx`), and the Translate landing page wired to the Cadence design, plus the shell (routes, settings, header), analytics events, and security headers.

**Architecture:** Pure, tested modules in `lib/` (`toSegments()` is the single timing source). A shared shell in `app/layout.js` with a `useSettings()` store (localStorage). The Translate page owns its message + playback (`usePlayer`), passes segments and a clock to a props-only `Scope` (two stacked canvases). Every design region is one dumb component whose inline `style={{ … var(--token) }}` mirrors the Cadence export so re-exports diff in cleanly.

**Tech Stack:** Next.js 16 App Router (JavaScript), React 19, Tailwind 4 (import only), Web Audio, Canvas 2D, `node:test`, `@vercel/analytics`, `@vercel/speed-insights`.

**Spec:** `docs/superpowers/specs/2026-08-18-translate-slice-design.md`. **Design reference:** `design/cadence/Cadence Translate.dc.html` and `design/cadence/globals.css` (read them; every JSX style below is a port of that markup).

**Deviations from the spec (decided while planning, all small):**
- `SettingsProvider` context is replaced by a `useSettings()` hook over a tiny external store (`useSyncExternalStore`). Same interface (`{ settings, setWpm, setEffWpm, setToneHz, setLabels }`), no provider wrapper. Reason: the repo's `eslint-config-next` enables React Compiler rules (`react-hooks/set-state-in-effect: error`), which forbid the "hydrate from localStorage in an effect" pattern; an external store is the sanctioned way.
- Added `lib/settings.js` (pure defaults/limits/`sanitise`) so the settings maths is testable.
- Added `components/tokens.js` — one `readTokens()` helper shared by `Scope` and `Oscilloscope` (two real uses).
- Added tokens: `--strip-bar-top`, `--playhead`, `--flash-opacity`, and hover utility classes (`.hv-*`) because inline styles cannot express `:hover`.
- `--unit` is set to **22px** so the design's bar sizes (dot 22, dash 66) are kept exactly; only the gaps change to honest 1/3/7.

**Working style:** one task at a time. Each task ends in a commit. Show the diff, wait for acceptance, then move on.

**Conventions for every task:**
- Package manager is **npm** (there is a `package-lock.json`). Never create a bun/pnpm lockfile.
- Tests: `npm test` runs `node --test 'lib/**/*.test.js'`. Tests import with relative paths and `.js` extensions (Node ESM). Components import via the `@/` alias.
- Lint: `npm run lint` (ESLint 9 flat config, `eslint-config-next/core-web-vitals`, React Compiler rules on — do not read `ref.current` during render, do not `setState` synchronously inside `useEffect`).
- Commit messages: conventional commits, ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

## File map

| Path | Responsibility |
|---|---|
| `package.json` | `"type": "module"`, `test` script, Vercel deps |
| `lib/morse.js` (+ `.test.js`) | TABLE, REVERSE, encode, decode, normaliseMorse |
| `lib/timing.js` (+ `.test.js`) | unitMs, gaps, toSegments, totalMs, cumulativeStarts, indexAtMs |
| `lib/slug.js` (+ `.test.js`) | encodeSlug, decodeSlug |
| `lib/wav.js` (+ `.test.js`) | segmentsToWav, wavFilename |
| `lib/audio.js` (+ `.test.js`) | createEngine (Web Audio, injectable context) |
| `lib/settings.js` (+ `.test.js`) | KEY, DEFAULTS, LIMITS, sanitise |
| `lib/track.js` | named-event wrapper over @vercel/analytics |
| `hooks/useSettings.js` | external store + useSyncExternalStore |
| `hooks/usePlayer.js` | engine lifecycle, playing/muted/repeat/light, clock(), sounding() |
| `components/tokens.js` | readTokens() — CSS custom properties → JS, once |
| `components/Scope.jsx` | two stacked canvases: static bars/labels, dynamic sounding bar + playhead |
| `components/Oscilloscope.jsx` | decorative wave canvas |
| `components/Header.jsx` | logo, nav pill (Link + usePathname), WPM/Hz badge |
| `components/PlaceholderSection.jsx` | the design's "other" card for /free and /learn |
| `components/StripHeader.jsx` | word + code readout, mute button |
| `components/TranslatePanels.jsx` | two textareas, copy buttons, counts, swap |
| `components/Transport.jsx` | Play/Stop/Repeat/Light/WAV/Share/Config row |
| `components/ConfigPopover.jsx` | Speed / Effective speed / Tone sliders, labels toggle |
| `components/Toast.jsx`, `components/Flash.jsx` | toast pill; full-screen light flash |
| `app/globals.css` | Cadence tokens + added tokens + base rules + hover classes |
| `app/layout.js` | fonts, shell wrappers, Header, Analytics, SpeedInsights |
| `app/page.js` | Translate page |
| `app/free/page.js`, `app/learn/page.js` | placeholders |
| `next.config.mjs` | security headers |

---

### Task 1: Project setup — module type, test script, analytics deps

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the two Vercel packages**

Run: `npm install @vercel/analytics @vercel/speed-insights`
Expected: both appear under `dependencies` in `package.json`; `package-lock.json` updated; no errors.

- [ ] **Step 2: Add `"type": "module"` and the test script**

Edit `package.json` so it reads (versions of `@vercel/*` will be whatever npm installed — keep those):

```json
{
  "name": "morse",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "node --test 'lib/**/*.test.js'"
  },
  "dependencies": {
    "@vercel/analytics": "<installed version>",
    "@vercel/speed-insights": "<installed version>",
    "next": "16.3.1",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "16.3.1",
    "tailwindcss": "^4"
  }
}
```

(Replace `<installed version>` with the exact strings npm wrote — do not invent versions.)

- [ ] **Step 3: Verify the app still boots and the test runner runs**

Run: `npm test`
Expected: `# tests 0` … `# pass 0` (no test files yet — that's fine; the command must not error).

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: esm package type, node test script, vercel analytics deps

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `lib/morse.js` — table, encode, decode

**Files:**
- Create: `lib/morse.js`
- Create: `lib/morse.test.js`

- [ ] **Step 1: Write the failing tests**

Create `lib/morse.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TABLE, REVERSE, encode, decode, normaliseMorse } from './morse.js';

test('TABLE has 26 letters, 10 digits, 18 punctuation marks, all unique dot-dash codes', () => {
  const keys = Object.keys(TABLE);
  assert.equal(keys.length, 54);
  const codes = Object.values(TABLE);
  assert.equal(new Set(codes).size, 54);
  for (const c of codes) assert.match(c, /^[.-]+$/);
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') assert.ok(TABLE[ch], `missing ${ch}`);
  for (const ch of `.,?'!/()&:;=+-_"$@`) assert.ok(TABLE[ch], `missing ${ch}`);
});

test('REVERSE maps every code back to its character', () => {
  for (const [ch, code] of Object.entries(TABLE)) assert.equal(REVERSE[code], ch);
});

test('encode: basic words, case-insensitive, words joined by " / "', () => {
  assert.equal(encode('SOS').morse, '... --- ...');
  assert.equal(encode('sos').morse, '... --- ...');
  assert.equal(encode('Hello World').morse, '.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
  assert.deepEqual(encode('SOS').unknown, []);
});

test('encode: unknown characters are skipped and reported once each, in order', () => {
  const r = encode('a#b~#');
  assert.equal(r.morse, '.- -...');
  assert.deepEqual(r.unknown, ['#', '~']);
});

test('encode: empty and whitespace-only input', () => {
  assert.deepEqual(encode(''), { morse: '', unknown: [] });
  assert.deepEqual(encode('   \n '), { morse: '', unknown: [] });
});

test('encode: a word made only of unknown characters produces no separator', () => {
  assert.equal(encode('E ### E').morse, '. / .');
});

test('normaliseMorse: unicode dots/dashes, junk stripped, spaces collapsed, newline = word break', () => {
  assert.equal(normaliseMorse('· — –'), '. - -');
  assert.equal(normaliseMorse('..x--'), '..--');
  assert.equal(normaliseMorse('.   .'), '. .');
  assert.equal(normaliseMorse('.\n-'), '. / -');
  assert.equal(normaliseMorse('. '), '. ', 'a trailing space must survive so users can type letter gaps');
});

test('decode: words on "/", letters on spaces, lenient about spacing and glyphs', () => {
  assert.equal(decode('... --- ...'), 'SOS');
  assert.equal(decode('.... . / .-- ---'), 'HE WO');
  assert.equal(decode('  ...   ---  /  ... '), 'SO S');
  assert.equal(decode('··· −−− ···'), 'SOS');
});

test('decode: unknown groups become "?", never throws, empty gives empty', () => {
  assert.equal(decode('......--'), '?');
  assert.equal(decode(''), '');
  assert.equal(decode('/ / /'), '');
});

test('round trip: every character and a full sentence', () => {
  for (const ch of Object.keys(TABLE)) assert.equal(decode(encode(ch).morse), ch);
  const all = Object.keys(TABLE).join('');
  assert.equal(decode(encode(all).morse), all);
  assert.equal(decode(encode('the quick brown fox').morse), 'THE QUICK BROWN FOX');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../lib/morse.js'`.

- [ ] **Step 3: Implement `lib/morse.js`**

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all `morse` tests pass (`# fail 0`).

- [ ] **Step 5: Commit**

```bash
git add lib/morse.js lib/morse.test.js
git commit -m "feat(lib): morse table, encode, decode, normaliseMorse

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `lib/timing.js` — units, Farnsworth gaps, toSegments

**Files:**
- Create: `lib/timing.js`
- Create: `lib/timing.test.js`

- [ ] **Step 1: Write the failing tests**

Create `lib/timing.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unitMs, gaps, toSegments, totalMs, cumulativeStarts, indexAtMs } from './timing.js';

const near = (a, b, eps = 0.05) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test('unitMs follows PARIS: 1200 / wpm', () => {
  assert.equal(unitMs(20), 60);
  assert.equal(unitMs(12), 100);
});

test('gaps: standard spacing is 1 / 3 / 7 units', () => {
  assert.deepEqual(gaps(20), { intra: 60, char: 180, word: 420 });
  assert.deepEqual(gaps(20, 20), { intra: 60, char: 180, word: 420 });
  assert.deepEqual(gaps(20, 25), { intra: 60, char: 180, word: 420 }, 'effective > character speed clamps to standard');
});

test('gaps: ARRL Farnsworth at 18/10 wpm', () => {
  const g = gaps(18, 10);
  near(g.intra, 1200 / 18);
  near(g.char, 621.05);
  near(g.word, 1449.12);
});

test('toSegments: PARIS is 43 units alone, 50 per word in a stream', () => {
  const u = unitMs(20);
  near(totalMs(toSegments('PARIS', { wpm: 20 })), 43 * u);
  near(totalMs(toSegments('PARIS PARIS', { wpm: 20 })), 93 * u);
});

test('toSegments: single dit carries kind/char/indices', () => {
  assert.deepEqual(toSegments('E', { wpm: 20 }), [
    { on: true, ms: 60, kind: 'dit', char: 'E', charIndex: 0, wordIndex: 0 },
  ]);
});

test('toSegments: intra, char and word gaps in the right places', () => {
  const kinds = (t) => toSegments(t, { wpm: 20 }).map((s) => s.kind);
  assert.deepEqual(kinds('A'), ['dit', 'intra', 'dah']);
  assert.deepEqual(kinds('EE'), ['dit', 'char', 'dit']);
  assert.deepEqual(kinds('E E'), ['dit', 'word', 'dit']);
  assert.deepEqual(kinds('E # E'), ['dit', 'word', 'dit'], 'unknown chars leave no double gaps');
  assert.deepEqual(kinds('#'), []);
  assert.deepEqual(kinds(''), []);
});

test('toSegments: charIndex increments per known char, wordIndex per word with content', () => {
  const segs = toSegments('EE #  E', { wpm: 20 });
  const on = segs.filter((s) => s.on);
  assert.deepEqual(on.map((s) => s.charIndex), [0, 1, 2]);
  assert.deepEqual(on.map((s) => s.wordIndex), [0, 0, 1]);
  const gap = segs.filter((s) => !s.on);
  assert.ok(gap.every((s) => s.char === null || s.kind === 'intra'));
});

test('toSegments: never two gaps adjacent, never starts or ends with a gap', () => {
  const segs = toSegments('HELLO WORLD, SOS! 73', { wpm: 25, effWpm: 12 });
  assert.ok(segs.length > 0);
  assert.equal(segs[0].on, true);
  assert.equal(segs[segs.length - 1].on, true);
  for (let i = 1; i < segs.length; i++) assert.ok(segs[i].on || segs[i - 1].on, `two gaps at ${i}`);
});

test('toSegments: Farnsworth widens char/word gaps but not intra gaps', () => {
  const segs = toSegments('EE E', { wpm: 18, effWpm: 10 });
  const byKind = Object.fromEntries(segs.filter((s) => !s.on).map((s) => [s.kind, s.ms]));
  near(byKind.char, 621.05);
  near(byKind.word, 1449.12);
  const a = toSegments('A', { wpm: 18, effWpm: 10 });
  near(a[1].ms, 1200 / 18);
});

test('cumulativeStarts / indexAtMs', () => {
  const segs = [{ on: true, ms: 60 }, { on: false, ms: 60 }, { on: true, ms: 180 }];
  const starts = cumulativeStarts(segs);
  assert.deepEqual(Array.from(starts), [0, 60, 120, 300]);
  assert.equal(indexAtMs(starts, 0), 0);
  assert.equal(indexAtMs(starts, 59.9), 0);
  assert.equal(indexAtMs(starts, 60), 1);
  assert.equal(indexAtMs(starts, 299), 2);
  assert.equal(indexAtMs(starts, 300), -1);
  assert.equal(indexAtMs(starts, -1), -1);
  assert.equal(indexAtMs(cumulativeStarts([]), 0), -1);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../lib/timing.js'`.

- [ ] **Step 3: Implement `lib/timing.js`**

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all pass (`# fail 0`).

- [ ] **Step 5: Commit**

```bash
git add lib/timing.js lib/timing.test.js
git commit -m "feat(lib): unit maths, Farnsworth gaps, toSegments

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: `lib/slug.js` — share-link slug encode/decode

**Files:**
- Create: `lib/slug.js`
- Create: `lib/slug.test.js`

- [ ] **Step 1: Write the failing tests**

Create `lib/slug.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSlug, decodeSlug, SLUG_MAX } from './slug.js';

test('encodeSlug uppercases, keeps table characters, percent-encodes', () => {
  assert.equal(encodeSlug('Hello, world!'), 'HELLO%2C%20WORLD!');
  assert.equal(encodeSlug('  sos   sos  '), 'SOS%20SOS');
});

test('encodeSlug drops unsupported characters and returns "" when nothing survives', () => {
  assert.equal(encodeSlug('a<b>c'), 'ABC');
  assert.equal(encodeSlug('#####'), '');
  assert.equal(encodeSlug(''), '');
});

test('encodeSlug caps at SLUG_MAX characters before encoding', () => {
  const s = decodeURIComponent(encodeSlug('A'.repeat(SLUG_MAX + 50)));
  assert.equal(s.length, SLUG_MAX);
});

test('decodeSlug round-trips and uppercases', () => {
  assert.equal(decodeSlug(encodeSlug('Hello, world!')), 'HELLO, WORLD!');
  assert.equal(decodeSlug('hello'), 'HELLO');
});

test('decodeSlug returns null for bad input', () => {
  assert.equal(decodeSlug('%E0%A4%A'), null, 'malformed percent-encoding');
  assert.equal(decodeSlug('HELLO%3Cscript%3E'), null, 'characters outside the table');
  assert.equal(decodeSlug('A'.repeat(SLUG_MAX + 1)), null, 'too long');
  assert.equal(decodeSlug(''), null);
  assert.equal(decodeSlug(undefined), null);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../lib/slug.js'`.

- [ ] **Step 3: Implement `lib/slug.js`**

```js
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
    .trim()
    .slice(0, SLUG_MAX);
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/slug.js lib/slug.test.js
git commit -m "feat(lib): share-link slug encode/decode with cap and charset guard

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: `lib/wav.js` — WAV encoder

**Files:**
- Create: `lib/wav.js`
- Create: `lib/wav.test.js`

- [ ] **Step 1: Write the failing tests**

Create `lib/wav.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { segmentsToWav, wavFilename } from './wav.js';

const segs = [
  { on: true, ms: 100 },
  { on: false, ms: 100 },
  { on: true, ms: 100 },
];

const ascii = (view, off, len) => String.fromCharCode(...new Uint8Array(view.buffer, off, len));

test('segmentsToWav writes a valid 16-bit mono PCM header', async () => {
  const blob = segmentsToWav(segs, { toneHz: 620 });
  assert.equal(blob.type, 'audio/wav');
  const sampleRate = 44100;
  const n = Math.ceil((0.3 + 0.25) * sampleRate);
  assert.equal(blob.size, 44 + n * 2);
  const v = new DataView(await blob.arrayBuffer());
  assert.equal(ascii(v, 0, 4), 'RIFF');
  assert.equal(v.getUint32(4, true), 36 + n * 2);
  assert.equal(ascii(v, 8, 4), 'WAVE');
  assert.equal(ascii(v, 12, 4), 'fmt ');
  assert.equal(v.getUint16(20, true), 1, 'PCM');
  assert.equal(v.getUint16(22, true), 1, 'mono');
  assert.equal(v.getUint32(24, true), sampleRate);
  assert.equal(v.getUint16(34, true), 16, 'bits per sample');
  assert.equal(ascii(v, 36, 4), 'data');
  assert.equal(v.getUint32(40, true), n * 2);
});

test('segmentsToWav: tone during "on", silence during "off"', async () => {
  const blob = segmentsToWav(segs, { toneHz: 620, sampleRate: 8000 });
  const v = new DataView(await blob.arrayBuffer());
  const sample = (i) => v.getInt16(44 + i * 2, true);
  // middle of first tone (50 ms @ 8 kHz = sample 400): some sample nearby is loud
  let loud = 0;
  for (let i = 380; i < 420; i++) loud = Math.max(loud, Math.abs(sample(i)));
  assert.ok(loud > 8000, `expected tone, got peak ${loud}`);
  // middle of the gap (150 ms = sample 1200): silent
  for (let i = 1180; i < 1220; i++) assert.equal(sample(i), 0);
});

test('segmentsToWav: empty segments still yields a valid, short file', () => {
  const blob = segmentsToWav([], { toneHz: 620, sampleRate: 8000 });
  assert.equal(blob.size, 44 + Math.ceil(0.25 * 8000) * 2);
});

test('wavFilename slugs the text', () => {
  assert.equal(wavFilename('Hello, World!'), 'hello-world.wav');
  assert.equal(wavFilename('   '), 'morse.wav');
  assert.equal(wavFilename('a'.repeat(40)), 'a'.repeat(24) + '.wav');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../lib/wav.js'`.

- [ ] **Step 3: Implement `lib/wav.js`**

```js
// WAV encoder for the download button. 16-bit mono PCM built straight from
// segments, so it can never drift from what audio and the strip play.

const LEVEL = 0.5;
const RAMP_S = 0.005;
const TAIL_S = 0.25;

function writeAscii(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

export function segmentsToWav(segments, { toneHz, sampleRate = 44100 } = {}) {
  let totalS = 0;
  for (const s of segments) totalS += s.ms / 1000;
  const n = Math.ceil((totalS + TAIL_S) * sampleRate);
  const pcm = new Float32Array(n);
  const ramp = Math.floor(RAMP_S * sampleRate);

  let t = 0;
  for (const seg of segments) {
    const d = seg.ms / 1000;
    if (seg.on) {
      const s = Math.floor(t * sampleRate);
      const e = Math.min(n, Math.floor((t + d) * sampleRate));
      for (let i = s; i < e; i++) {
        let a = LEVEL;
        if (i - s < ramp) a *= (i - s) / ramp;
        if (e - i < ramp) a *= (e - i) / ramp;
        pcm[i] = Math.sin(2 * Math.PI * toneHz * (i / sampleRate)) * a;
      }
    }
    t += d;
  }

  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  writeAscii(v, 0, 'RIFF');
  v.setUint32(4, 36 + n * 2, true);
  writeAscii(v, 8, 'WAVE');
  writeAscii(v, 12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true); // byte rate
  v.setUint16(32, 2, true); // block align
  v.setUint16(34, 16, true); // bits per sample
  writeAscii(v, 36, 'data');
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

export function wavFilename(text) {
  const base = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return `${base || 'morse'}.wav`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/wav.js lib/wav.test.js
git commit -m "feat(lib): WAV encoder from segments

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: `lib/audio.js` — Web Audio engine factory

**Files:**
- Create: `lib/audio.js`
- Create: `lib/audio.test.js`

- [ ] **Step 1: Write the failing tests (with a fake AudioContext)**

Create `lib/audio.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from './audio.js';

class FakeParam {
  constructor() { this.value = 0; this.events = []; }
  setValueAtTime(v, t) { this.events.push(['set', v, t]); }
  linearRampToValueAtTime(v, t) { this.events.push(['ramp', v, t]); }
  cancelScheduledValues(t) { this.events.push(['cancel', t]); }
}
class FakeOsc {
  constructor() { this.frequency = new FakeParam(); this.type = ''; this.started = null; this.stopped = null; this.connected = null; }
  connect(n) { this.connected = n; }
  start(t) { this.started = t; }
  stop(t) { this.stopped = t; }
}
class FakeGain {
  constructor() { this.gain = new FakeParam(); this.connected = null; }
  connect(n) { this.connected = n; }
}
class FakeCtx {
  constructor() { this.currentTime = 10; this.state = 'running'; this.destination = {}; this.oscs = []; this.gains = []; this.closed = false; this.resumed = 0; }
  createOscillator() { const o = new FakeOsc(); this.oscs.push(o); return o; }
  createGain() { const g = new FakeGain(); this.gains.push(g); return g; }
  resume() { this.resumed++; this.state = 'running'; return Promise.resolve(); }
  close() { this.closed = true; return Promise.resolve(); }
}

const segs = [
  { on: true, ms: 100 },
  { on: false, ms: 100 },
  { on: true, ms: 100 },
];
let last;
const make = () => createEngine({ AudioContextClass: class extends FakeCtx { constructor() { super(); last = this; } } });

test('play schedules one oscillator with a gain envelope and returns the timeline', () => {
  const e = make();
  const r = e.play(segs, { toneHz: 620 });
  assert.ok(Math.abs(r.start - 10.06) < 1e-9);
  assert.ok(Math.abs(r.total - 0.3) < 1e-9);
  assert.equal(last.oscs.length, 1);
  const o = last.oscs[0];
  assert.equal(o.type, 'sine');
  assert.equal(o.frequency.value, 620);
  assert.equal(o.started, r.start);
  assert.ok(Math.abs(o.stopped - (r.start + 0.3 + 0.05)) < 1e-9);
  assert.equal(o.connected, last.gains[0]);
  assert.equal(last.gains[0].connected, last.destination);
  const g = last.gains[0].gain.events;
  assert.equal(g.length, 8, 'four envelope points per "on" segment');
  assert.deepEqual(g[0].slice(0, 2), ['set', 0]);
  assert.equal(g[1][0], 'ramp');
  assert.ok(g[1][1] > 0 && g[1][1] <= 1);
  assert.equal(g[3][1], 0);
});

test('play with muted schedules nothing but still returns the timeline', () => {
  const e = make();
  const r = e.play(segs, { toneHz: 620, muted: true });
  assert.ok(Math.abs(r.total - 0.3) < 1e-9);
  assert.equal(last.oscs.length, 0);
});

test('play returns null when Web Audio is unavailable', () => {
  const e = createEngine({ AudioContextClass: null });
  assert.equal(e.play(segs, { toneHz: 620 }), null);
  assert.equal(e.now(), 0);
});

test('a second play stops the first; stop is idempotent; now() reads context time', () => {
  const e = make();
  assert.equal(e.now(), 0, 'no context until first play');
  e.play(segs, { toneHz: 620 });
  const first = last.oscs[0];
  e.play(segs, { toneHz: 700 });
  assert.notEqual(first.stopped, null);
  assert.equal(last.oscs[1].frequency.value, 700);
  e.stop();
  e.stop();
  assert.equal(e.now(), 10);
});

test('suspended contexts are resumed on play', () => {
  const e = createEngine({ AudioContextClass: class extends FakeCtx { constructor() { super(); this.state = 'suspended'; last = this; } } });
  e.play(segs, { toneHz: 620 });
  assert.equal(last.resumed, 1);
});

test('keyDown / keyUp drive a live tone; setTone changes pitch', () => {
  const e = make();
  e.setTone(500);
  e.keyDown();
  assert.equal(last.oscs.length, 1);
  assert.equal(last.oscs[0].frequency.value, 500);
  assert.equal(last.oscs[0].started, undefined, 'live tone starts immediately (start() with no arg)');
  e.keyDown();
  assert.equal(last.oscs.length, 1, 'keyDown while down is a no-op');
  e.keyUp();
  assert.notEqual(last.oscs[0].stopped, null);
  const ev = last.gains[0].gain.events;
  assert.equal(ev.at(-1)[0], 'ramp');
  assert.equal(ev.at(-1)[1], 0);
  e.keyUp(); // idempotent
});

test('dispose stops everything and closes the context', () => {
  const e = make();
  e.play(segs, { toneHz: 620 });
  e.dispose();
  assert.notEqual(last.oscs[0].stopped, null);
  assert.equal(last.closed, true);
  assert.equal(e.now(), 0);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../lib/audio.js'`.

- [ ] **Step 3: Implement `lib/audio.js`**

```js
// Web Audio engine: scheduled playback of segments and a live sidetone for
// keying. Nothing happens at import time; createEngine() is the only entry.
// The AudioContext class is injectable so this is testable without a browser.

const LEVEL = 0.35;   // gain while a tone is on
const RAMP = 0.004;   // seconds; removes clicks
const LEAD = 0.06;    // seconds between play() and the first tone
const TAIL = 0.05;    // seconds the oscillator outlives the last tone

export function createEngine(opts = {}) {
  const AC = Object.hasOwn(opts, 'AudioContextClass')
    ? opts.AudioContextClass
    : globalThis.AudioContext || globalThis.webkitAudioContext;

  let ctx = null;
  let current = null; // { osc, gain } for scheduled playback
  let live = null;    // { osc, gain } for keying
  let tone = 620;

  function ensure() {
    if (!ctx) {
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch {
        return null;
      }
    }
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') ctx.resume();
    return ctx;
  }

  function voice(c, hz) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = hz;
    const gain = c.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(c.destination);
    return { osc, gain };
  }

  function stop() {
    if (!current) return;
    try {
      current.osc.stop();
    } catch {
      /* already stopped */
    }
    current = null;
  }

  /**
   * Schedule `segments` from now + LEAD. Returns { start, total } in context
   * seconds, or null when Web Audio is unavailable. muted → same timeline, no sound.
   */
  function play(segments, { toneHz = tone, muted = false } = {}) {
    const c = ensure();
    if (!c) return null;
    stop();
    tone = toneHz;
    const start = c.currentTime + LEAD;
    let total = 0;
    for (const s of segments) total += s.ms / 1000;
    if (muted || !segments.length) return { start, total };

    const v = voice(c, toneHz);
    let t = start;
    for (const seg of segments) {
      const d = seg.ms / 1000;
      if (seg.on) {
        const r = Math.min(RAMP, d / 4);
        v.gain.gain.setValueAtTime(0, t);
        v.gain.gain.linearRampToValueAtTime(LEVEL, t + r);
        v.gain.gain.setValueAtTime(LEVEL, t + d - r);
        v.gain.gain.linearRampToValueAtTime(0, t + d);
      }
      t += d;
    }
    v.osc.start(start);
    v.osc.stop(t + TAIL);
    current = v;
    return { start, total };
  }

  function keyDown() {
    const c = ensure();
    if (!c || live) return;
    live = voice(c, tone);
    live.osc.start();
    live.gain.gain.linearRampToValueAtTime(LEVEL, c.currentTime + RAMP);
  }

  function keyUp() {
    if (!live || !ctx) return;
    const { osc, gain } = live;
    live = null;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + RAMP + 0.001);
    try {
      osc.stop(now + 0.03);
    } catch {
      /* already stopped */
    }
  }

  function now() {
    return ctx ? ctx.currentTime : 0;
  }

  function setTone(hz) {
    tone = hz;
    if (live) live.osc.frequency.value = hz;
  }

  function dispose() {
    stop();
    keyUp();
    if (ctx && typeof ctx.close === 'function') {
      const p = ctx.close();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    ctx = null;
  }

  return { play, stop, keyDown, keyUp, now, setTone, dispose };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/audio.js lib/audio.test.js
git commit -m "feat(lib): Web Audio engine factory with injectable context

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: `lib/settings.js` — defaults, limits, sanitise

**Files:**
- Create: `lib/settings.js`
- Create: `lib/settings.test.js`

- [ ] **Step 1: Write the failing tests**

Create `lib/settings.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, LIMITS, KEY, sanitise } from './settings.js';

test('defaults match the design', () => {
  assert.deepEqual(DEFAULTS, { wpm: 18, effWpm: 18, toneHz: 620, labels: true });
  assert.equal(KEY, 'morse:settings');
  assert.deepEqual(LIMITS.wpm, [5, 40]);
  assert.deepEqual(LIMITS.toneHz, [300, 1000]);
});

test('sanitise: garbage falls back to defaults', () => {
  assert.deepEqual(sanitise(null), DEFAULTS);
  assert.deepEqual(sanitise('x'), DEFAULTS);
  assert.deepEqual(sanitise({ wpm: 'fast', toneHz: NaN, labels: 'no' }), DEFAULTS);
});

test('sanitise: clamps and rounds', () => {
  assert.equal(sanitise({ wpm: 100 }).wpm, 40);
  assert.equal(sanitise({ wpm: 1 }).wpm, 5);
  assert.equal(sanitise({ wpm: 12.6 }).wpm, 13);
  assert.equal(sanitise({ toneHz: 5000 }).toneHz, 1000);
  assert.equal(sanitise({ labels: false }).labels, false);
});

test('sanitise: effective speed can never exceed character speed', () => {
  const s = sanitise({ wpm: 10, effWpm: 18 });
  assert.equal(s.effWpm, 10);
  const t = sanitise({ wpm: 30, effWpm: 12 });
  assert.equal(t.effWpm, 12);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../lib/settings.js'`.

- [ ] **Step 3: Implement `lib/settings.js`**

```js
// User settings: defaults, limits, and the sanitiser used for anything that
// arrives from localStorage or a slider. Pure.

export const KEY = 'morse:settings';

export const DEFAULTS = Object.freeze({ wpm: 18, effWpm: 18, toneHz: 620, labels: true });

export const LIMITS = Object.freeze({
  wpm: Object.freeze([5, 40]),
  effWpm: Object.freeze([5, 40]),
  toneHz: Object.freeze([300, 1000]),
});

const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));

/** Any input → a valid settings object. effWpm is capped at wpm. */
export function sanitise(raw) {
  const s = { ...DEFAULTS };
  if (raw && typeof raw === 'object') {
    if (Number.isFinite(raw.wpm)) s.wpm = clamp(Math.round(raw.wpm), LIMITS.wpm);
    if (Number.isFinite(raw.effWpm)) s.effWpm = clamp(Math.round(raw.effWpm), LIMITS.effWpm);
    if (Number.isFinite(raw.toneHz)) s.toneHz = clamp(Math.round(raw.toneHz), LIMITS.toneHz);
    if (typeof raw.labels === 'boolean') s.labels = raw.labels;
  }
  s.effWpm = Math.min(s.effWpm, s.wpm);
  return s;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/settings.js lib/settings.test.js
git commit -m "feat(lib): settings defaults, limits, sanitise

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: `app/globals.css` + `app/layout.js` — tokens, fonts, shell wrappers

**Files:**
- Modify: `app/globals.css` (replace entirely)
- Modify: `app/layout.js` (replace entirely)
- Modify: `app/page.js` (temporary minimal page so the shell can be seen)

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

/* ============================================================
   Cadence — colour system
   Every colour in the app resolves from this file.
   Source of truth: design/cadence/globals.css (Claude Design export).

   PALETTE
     ground     Carbon Black    page background
     surface    lifted carbon   panels + strip box
     border     Charcoal        borders and dividers ONLY, never text
     ink        Papaya Whip     primary text + Morse bars at rest
     muted      light charcoal  secondary text, labels, counts
     signal     Bubblegum       "transmitting" — sounding bar, Play
     interact   Cool Sky        "you can touch this" — active tab,
                                swap circle, focus, sliders
     on-accent  Carbon Black    text/icons on top of pink or blue

   Pink and blue never appear on the same element.
   ============================================================ */

:root {
  /* ---------- PALETTE ---------- */
  --ground: #1D201F;
  --surface: #262A29;
  --border: #575761;
  --ink: #FDF0D5;
  --muted: #9A9AA4;
  --signal: #FF82A9;
  --interact: #77B6EA;
  --on-accent: #1D201F;

  /* channels, so alpha variants stay tied to the palette above */
  --ground-rgb: 29 32 31;
  --surface-rgb: 38 42 41;
  --border-rgb: 87 87 97;
  --ink-rgb: 253 240 213;
  --muted-rgb: 154 154 164;
  --signal-rgb: 255 130 169;
  --interact-rgb: 119 182 234;

  /* ---------- LINES ---------- */
  --border-soft: rgb(var(--border-rgb) / 0.55);   /* quiet outlines */
  --rule: rgb(var(--border-rgb) / 0.55);          /* transport separator */
  --divider: rgb(var(--border-rgb) / 0.70);       /* vertical divider */
  --baseline: rgb(var(--border-rgb) / 0.85);      /* line the bars sit on */

  /* ---------- FILLS & STATES ---------- */
  --hover-tint: rgb(var(--border-rgb) / 0.26);
  --inset-fill: rgb(var(--border-rgb) / 0.20);
  --pressed-fill: rgb(var(--border-rgb) / 0.45);  /* mute engaged */
  --placeholder: rgb(var(--muted-rgb) / 0.55);
  --selection: rgb(var(--interact-rgb) / 0.30);

  /* interaction (blue) — never combined with pink on one element */
  --interact-fill: rgb(var(--interact-rgb) / 0.14);
  --interact-border: rgb(var(--interact-rgb) / 0.50);
  --interact-bright: color-mix(in srgb, var(--interact) 88%, white);
  --focus: var(--interact);

  /* transmission (pink) */
  --signal-bright: color-mix(in srgb, var(--signal) 86%, white);

  /* ---------- RHYTHM STRIP ----------
     The only place glow is allowed, and that glow is pink. */
  --strip-bloom: rgb(var(--signal-rgb) / 0.12);
  --bar-rest: var(--ink);
  --bar-active: var(--signal);
  --bar-active-glow: rgb(var(--signal-rgb) / 0.70);
  --bar-active-core: rgb(var(--signal-rgb) / 0.55);

  /* ---------- OSCILLOSCOPE (read by the canvas) ---------- */
  --wave: rgb(var(--signal-rgb) / 0.95);
  --wave-ghost: rgb(var(--signal-rgb) / 0.30);
  --wave-glow: rgb(var(--signal-rgb) / 0.55);
  --wave-ghost-glow: rgb(var(--signal-rgb) / 0.28);

  /* ---------- MISC ---------- */
  --flash: var(--signal);                          /* Light mode screen flash */
  --logo-a: var(--ink);
  --logo-b: var(--ink);
  --logo-c: var(--signal);
  --placeholder-bar: rgb(var(--ink-rgb) / 0.50);
  --placeholder-bar-dim: rgb(var(--ink-rgb) / 0.26);
  --placeholder-bar-signal: rgb(var(--signal-rgb) / 0.55);

  /* ============================================================
     Added for the engine (not in the Claude Design export)
     ============================================================ */

  /* Rhythm strip geometry — read once by components/Scope.jsx.
     Bars and gaps are all multiples of --unit: dit 1, dah 3, gap 1 / 3 / 7. */
  --unit: 22px;               /* one Morse unit; the design's dot width */
  --bar-h: 78px;              /* bar height (design) */
  --bar-radius: 7px;          /* design's "Rounded"; 2px for "Sharp" */
  --strip-bar-top: 6px;       /* headroom above the bars for the glow */
  --strip-label-size: 11px;   /* letter label font size */
  --strip-label-gap: 11px;    /* space between baseline and labels */
  --strip-pad-x: 12px;        /* horizontal padding inside the strip */
  --playhead: rgb(var(--ink-rgb) / 0.75);
  --flash-opacity: 0.1;       /* Light mode flash strength */

  /* Fonts are set on <html> by next/font in app/layout.js:
     --font-sans (Archivo), --font-mono (IBM Plex Mono). */
}

/* ---------- base rules (from the design's <style>) ---------- */
html, body { margin: 0; padding: 0; background: var(--ground); }
body {
  font-family: var(--font-sans), Archivo, sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
* { box-sizing: border-box; }
a { color: var(--interact); text-decoration: none; }
a:hover { color: var(--interact-bright); }
button { font-family: inherit; }
textarea { font-family: inherit; }
textarea::placeholder { color: var(--placeholder); }
::selection { background: var(--selection); }
input[type="range"] { accent-color: var(--interact); }
:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }

@keyframes cad-breathe { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
@keyframes cad-toast { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }

/* ---------- hover states ----------
   The design expressed these as style-hover="…" on inline-styled elements.
   Inline styles cannot express :hover, so they live here; !important lets
   them win over the inline state colours they sit on top of. */
.hv-ink:hover { color: var(--ink) !important; }
.hv-icon:hover { color: var(--interact) !important; border-color: var(--interact-border) !important; }
.hv-tint:hover { background: var(--hover-tint) !important; }
.hv-tint-ink:hover { background: var(--hover-tint) !important; color: var(--ink) !important; }
.hv-signal:hover { background: var(--signal-bright) !important; }
.hv-interact:hover { background: var(--interact-bright) !important; }

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Replace `app/layout.js`**

```jsx
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
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
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Replace `app/page.js` with a temporary placeholder** (the real page comes in Task 21)

```jsx
export default function TranslatePage() {
  return <main style={{ color: 'var(--muted)' }}>Translate — coming in the next steps.</main>;
}
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev` (leave it running in a background terminal for the rest of the plan) and open `http://localhost:3000`.
Expected: Carbon Black page, muted grey text in Archivo, no console errors. Fonts self-hosted (Network tab: `/_next/static/media/*.woff2`, nothing from googleapis).

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.js app/page.js
git commit -m "feat(app): Cadence tokens, base rules, fonts, shell wrappers

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: `hooks/useSettings.js` — settings store

**Files:**
- Create: `hooks/useSettings.js`

- [ ] **Step 1: Create the hook**

```js
'use client';

// Settings live in a tiny external store read via useSyncExternalStore.
// Server render and hydration see DEFAULTS; the first subscriber hydrates
// from localStorage after mount, so markup never mismatches.

import { useSyncExternalStore } from 'react';
import { DEFAULTS, KEY, sanitise } from '@/lib/settings';

let settings = DEFAULTS;
let hydrated = false;
const listeners = new Set();

function emit() {
  for (const l of listeners) l();
}

function hydrate() {
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      settings = sanitise(JSON.parse(raw));
      emit();
    }
  } catch {
    /* private mode, quota, bad JSON — defaults stand */
  }
}

function subscribe(listener) {
  listeners.add(listener);
  if (!hydrated) hydrate();
  return () => listeners.delete(listener);
}

const getSnapshot = () => settings;
const getServerSnapshot = () => DEFAULTS;

export function updateSettings(patch) {
  settings = sanitise({ ...settings, ...patch });
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable — keep working for the session */
  }
  emit();
}

export function useSettings() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    settings: s,
    setWpm: (v) => updateSettings({ wpm: v }),
    setEffWpm: (v) => updateSettings({ effWpm: v }),
    setToneHz: (v) => updateSettings({ toneHz: v }),
    setLabels: (v) => updateSettings({ labels: v }),
  };
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/useSettings.js
git commit -m "feat(hooks): useSettings store with localStorage persistence

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: `lib/track.js` + Analytics in the layout

**Files:**
- Create: `lib/track.js`
- Modify: `app/layout.js`

- [ ] **Step 1: Create `lib/track.js`**

```js
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
```

- [ ] **Step 2: Add `<Analytics/>` and `<SpeedInsights/>` to `app/layout.js`**

Add these imports at the top:

```jsx
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
```

And change the body to:

```jsx
      <body>
        {/* Shell wrappers ported from design/cadence/Cadence Translate.dc.html */}
        <div style={{ minHeight: '100vh', background: 'var(--ground)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 32px 56px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {children}
          </div>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
```

- [ ] **Step 3: Verify**

Run: `npm run lint` → no errors. Reload `http://localhost:3000` → no console errors (in dev, Vercel Analytics logs a debug line — that's expected).

- [ ] **Step 4: Commit**

```bash
git add lib/track.js app/layout.js
git commit -m "feat: analytics wrapper and Vercel Analytics/Speed Insights

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: `Header`, `PlaceholderSection`, `/free`, `/learn`, wired into the layout

**Files:**
- Create: `components/Header.jsx`
- Create: `components/PlaceholderSection.jsx`
- Create: `app/free/page.js`
- Create: `app/learn/page.js`
- Modify: `app/layout.js`

- [ ] **Step 1: Create `components/Header.jsx`** (port of the design's `<header>`)

```jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';
import { track } from '@/lib/track';

const TABS = [
  { href: '/', label: 'Translate', mode: 'translate' },
  { href: '/free', label: 'Free Mode', mode: 'free' },
  { href: '/learn', label: 'Learn', mode: 'learn' },
];

function activeIndex(pathname) {
  if (pathname.startsWith('/free')) return 1;
  if (pathname.startsWith('/learn')) return 2;
  return 0;
}

export default function Header() {
  const pathname = usePathname() || '/';
  const idx = activeIndex(pathname);
  const { settings } = useSettings();

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 4, height: 20 }}>
          <div style={{ width: 7, height: 18, borderRadius: 2, background: 'var(--logo-a)' }} />
          <div style={{ width: 21, height: 18, borderRadius: 2, background: 'var(--logo-b)' }} />
          <div style={{ width: 7, height: 18, borderRadius: 2, background: 'var(--logo-c)' }} />
        </div>
        <div style={{ fontSize: 27, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)' }}>Cadence</div>
      </div>

      <nav aria-label="Sections" style={{ position: 'relative', display: 'flex', alignItems: 'stretch', padding: 5, borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 5, bottom: 5, left: 5, width: 'calc((100% - 10px) / 3)', borderRadius: 999,
            background: 'var(--interact)', transition: 'transform 380ms cubic-bezier(0.22,1,0.36,1)',
            transform: `translateX(${idx * 100}%)`,
          }}
        />
        {TABS.map((tab, i) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={i === idx ? 'page' : undefined}
            onClick={() => { if (i !== idx) track('mode_switched', { to: tab.mode }); }}
            style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 500, padding: '8px 20px', minWidth: 112, borderRadius: 999,
              transition: 'color 220ms', color: i === idx ? 'var(--on-accent)' : 'var(--muted)', textDecoration: 'none',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-soft)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>
        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)', animation: 'cad-breathe 2.6s ease-in-out infinite' }} />
        <span>{settings.wpm} WPM</span>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span>{settings.toneHz} Hz</span>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `components/PlaceholderSection.jsx`** (port of the design's "other" card)

```jsx
import Link from 'next/link';

export default function PlaceholderSection({ title, copy }) {
  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: 460 }}>
      <div style={{ maxWidth: 420, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: 40, borderRadius: 22, background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div aria-hidden="true" style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 8, height: 24, borderRadius: 3, background: 'var(--placeholder-bar)' }} />
          <div style={{ width: 26, height: 24, borderRadius: 3, background: 'var(--placeholder-bar-dim)' }} />
          <div style={{ width: 8, height: 24, borderRadius: 3, background: 'var(--placeholder-bar-signal)' }} />
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{title}</h1>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>{copy}</p>
        <Link
          href="/"
          style={{ marginTop: 4, padding: '11px 20px', borderRadius: 999, background: 'var(--interact-fill)', border: '1px solid var(--interact-border)', color: 'var(--interact)', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textDecoration: 'none' }}
        >
          BACK TO TRANSLATE
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create the two placeholder routes**

`app/free/page.js`:

```jsx
import PlaceholderSection from '@/components/PlaceholderSection';

export const metadata = { title: 'Free Mode — Cadence' };

export default function FreePage() {
  return (
    <PlaceholderSection
      title="Free Mode"
      copy="Tap out your own rhythm with the spacebar and watch it resolve into letters."
    />
  );
}
```

`app/learn/page.js`:

```jsx
import PlaceholderSection from '@/components/PlaceholderSection';

export const metadata = { title: 'Learn — Cadence' };

export default function LearnPage() {
  return (
    <PlaceholderSection
      title="Learn"
      copy="Guided lessons that teach letters by their rhythm, one shape at a time."
    />
  );
}
```

- [ ] **Step 4: Render `Header` in the layout**

In `app/layout.js` add `import Header from '@/components/Header';` and put `<Header />` directly above `{children}` inside the inner wrapper:

```jsx
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 32px 56px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Header />
            {children}
          </div>
```

- [ ] **Step 5: Verify**

Open `http://localhost:3000`, `/free`, `/learn`: header renders, blue pill slides to the active tab, badge reads `18 WPM / 620 Hz`, placeholder cards show on `/free` and `/learn`, "BACK TO TRANSLATE" returns home. Keyboard: Tab through the three links → visible blue focus ring.
Run: `npm run lint` → no errors.

- [ ] **Step 6: Commit**

```bash
git add components/Header.jsx components/PlaceholderSection.jsx app/free/page.js app/learn/page.js app/layout.js
git commit -m "feat(shell): header with route-driven nav, placeholder /free and /learn

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: `hooks/usePlayer.js`

**Files:**
- Create: `hooks/usePlayer.js`

- [ ] **Step 1: Create the hook**

```js
'use client';

// One audio engine per page. Owns playing / muted / repeat / light and exposes
// two stable, render-free functions for canvases: clock() and sounding().

import { useCallback, useEffect, useRef, useState } from 'react';
import { createEngine } from '@/lib/audio';
import { cumulativeStarts, indexAtMs } from '@/lib/timing';

const END_SLACK_MS = 60;

export default function usePlayer({ toneHz }) {
  const engineRef = useRef(null);
  const runRef = useRef(null); // { segments, starts, start, total, timer }
  const optsRef = useRef({ toneHz, muted: false, repeat: false });

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    optsRef.current = { toneHz, muted, repeat };
  }, [toneHz, muted, repeat]);

  useEffect(() => {
    return () => {
      if (runRef.current) clearTimeout(runRef.current.timer);
      runRef.current = null;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    if (runRef.current) clearTimeout(runRef.current.timer);
    runRef.current = null;
    engineRef.current?.stop();
    setPlaying(false);
  }, []);

  /** Returns false when Web Audio is unavailable. */
  const play = useCallback((segments) => {
    if (!engineRef.current) engineRef.current = createEngine();
    const engine = engineRef.current;

    const run = (segs) => {
      const { toneHz: hz, muted: m } = optsRef.current;
      const res = engine.play(segs, { toneHz: hz, muted: m });
      if (!res) return false;
      if (runRef.current) clearTimeout(runRef.current.timer);
      const r = { segments: segs, starts: cumulativeStarts(segs), start: res.start, total: res.total, timer: 0 };
      r.timer = setTimeout(() => {
        if (runRef.current !== r) return;
        if (optsRef.current.repeat) {
          run(segs);
        } else {
          runRef.current = null;
          setPlaying(false);
        }
      }, res.total * 1000 + END_SLACK_MS);
      runRef.current = r;
      return true;
    };

    const ok = run(segments);
    setPlaying(ok);
    return ok;
  }, []);

  const toggleMute = useCallback(() => {
    const next = !optsRef.current.muted;
    if (next) engineRef.current?.stop(); // silence now; the strip keeps moving
    setMuted(next);
  }, []);

  const toggleRepeat = useCallback(() => setRepeat((r) => !r), []);
  const toggleLight = useCallback(() => setLight((l) => !l), []);

  /** Seconds since the current run started, or null when idle. */
  const clock = useCallback(() => {
    const r = runRef.current;
    if (!r || !engineRef.current) return null;
    return engineRef.current.now() - r.start;
  }, []);

  /** True while the segment under the clock is a tone. */
  const sounding = useCallback(() => {
    const r = runRef.current;
    if (!r || !engineRef.current) return false;
    const ms = (engineRef.current.now() - r.start) * 1000;
    const i = indexAtMs(r.starts, ms);
    return i >= 0 && r.segments[i].on;
  }, []);

  return { playing, muted, repeat, light, play, stop, toggleMute, toggleRepeat, toggleLight, clock, sounding };
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors. (If `react-hooks/refs` complains about `engineRef.current?.dispose()` inside the cleanup, that is a false positive on the optional call — rewrite as `const e = engineRef.current; if (e) e.dispose();`.)

- [ ] **Step 3: Commit**

```bash
git add hooks/usePlayer.js
git commit -m "feat(hooks): usePlayer — playback state, clock and sounding probes

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: `components/tokens.js` — read CSS tokens once

**Files:**
- Create: `components/tokens.js`

- [ ] **Step 1: Create the helper**

```js
// Reads CSS custom properties from :root into plain JS values so canvases can
// use them. Call it once (mount / resize / theme change) — NEVER inside an
// animation loop. Colours are resolved through a probe element so tokens like
// "rgb(var(--x-rgb) / 0.7)" or color-mix() come back as plain rgb()/rgba().

export function readTokens({ sizes = [], colors = [], strings = [] } = {}) {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const out = {};
  for (const name of sizes) out[name] = parseFloat(cs.getPropertyValue(name)) || 0;
  for (const name of strings) out[name] = cs.getPropertyValue(name).trim();
  if (colors.length) {
    const probe = document.createElement('span');
    probe.style.display = 'none';
    root.appendChild(probe);
    for (const name of colors) {
      probe.style.color = cs.getPropertyValue(name).trim();
      out[name] = getComputedStyle(probe).color;
    }
    probe.remove();
  }
  return out;
}
```

- [ ] **Step 2: Lint and commit**

Run: `npm run lint` → no errors.

```bash
git add components/tokens.js
git commit -m "feat(components): readTokens helper for canvas colour/size tokens

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 14: `components/Scope.jsx` — the rhythm strip

**Files:**
- Create: `components/Scope.jsx`
- Modify: `app/page.js` (temporary harness so the strip is visible)

- [ ] **Step 1: Create `components/Scope.jsx`**

```jsx
'use client';

// The rhythm strip. Two stacked canvases:
//   static  — baseline, unit graticule, resting bars, letter labels
//             (redrawn only when segments / wpm / labels / size / tokens change)
//   dynamic — the sounding bar and playhead (rAF only while `clock` is given)
// Props in, nothing else. Bars and gaps are exact multiples of --unit.
// Tokens are read once (mount, resize, motion-pref change) — never in the loop.

import { useEffect, useRef } from 'react';
import { unitMs, cumulativeStarts, indexAtMs } from '@/lib/timing';
import { readTokens } from '@/components/tokens';

const SIZES = ['--unit', '--bar-h', '--bar-radius', '--strip-bar-top', '--strip-label-size', '--strip-label-gap', '--strip-pad-x'];
const COLORS = ['--bar-rest', '--bar-active', '--bar-active-glow', '--bar-active-core', '--baseline', '--muted', '--border-soft', '--playhead'];
const STRINGS = ['--font-mono'];

function roundedRect(g, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + rr, y);
  g.arcTo(x + w, y, x + w, y + h, rr);
  g.arcTo(x + w, y + h, x, y + h, rr);
  g.arcTo(x, y + h, x, y, rr);
  g.arcTo(x, y, x + w, y, rr);
  g.closePath();
}

function computeLayout(segments, wpm, tk, wrapWidth) {
  const pxPerMs = tk['--unit'] / unitMs(wpm);
  const starts = cumulativeStarts(segments);
  const totalPx = starts[segments.length] * pxPerMs;
  const width = Math.max(wrapWidth, totalPx + 2 * tk['--strip-pad-x']);
  const height = tk['--strip-bar-top'] + tk['--bar-h'] + 1 + tk['--strip-label-gap'] + tk['--strip-label-size'] + 4;
  return {
    pxPerMs,
    starts,
    totalPx,
    width,
    height,
    offsetX: (width - totalPx) / 2, // centred when short, padded when scrolling
    dpr: Math.min(2, window.devicePixelRatio || 1),
  };
}

function sizeCanvas(canvas, geom) {
  canvas.width = Math.round(geom.width * geom.dpr);
  canvas.height = Math.round(geom.height * geom.dpr);
  canvas.style.width = `${geom.width}px`;
  canvas.style.height = `${geom.height}px`;
  canvas.getContext('2d').setTransform(geom.dpr, 0, 0, geom.dpr, 0, 0);
}

function clearCanvas(canvas) {
  const g = canvas.getContext('2d');
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, canvas.width, canvas.height);
  g.restore();
}

function drawStatic(canvas, geom, tk, segments, showLabels) {
  const g = canvas.getContext('2d');
  const { width, height, offsetX, pxPerMs, starts, totalPx } = geom;
  const barTop = tk['--strip-bar-top'];
  const barH = tk['--bar-h'];
  const baseY = barTop + barH;
  g.clearRect(0, 0, width, height);

  g.fillStyle = tk['--baseline'];
  g.fillRect(0, baseY, width, 1);

  if (totalPx > 0) {
    g.fillStyle = tk['--border-soft'];
    for (let x = offsetX; x <= offsetX + totalPx + 0.5; x += tk['--unit']) {
      g.fillRect(Math.round(x), baseY + 1, 1, 3);
    }
  }

  g.fillStyle = tk['--bar-rest'];
  const groups = new Map(); // charIndex → { char, x0, x1 }
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (!s.on) continue;
    const x = offsetX + starts[i] * pxPerMs;
    const w = s.ms * pxPerMs;
    roundedRect(g, x, barTop, w, barH, tk['--bar-radius']);
    g.fill();
    const grp = groups.get(s.charIndex);
    if (grp) grp.x1 = x + w;
    else groups.set(s.charIndex, { char: s.char, x0: x, x1: x + w });
  }

  if (showLabels && groups.size) {
    g.fillStyle = tk['--muted'];
    g.font = `${tk['--strip-label-size']}px ${tk['--font-mono'] || 'monospace'}`;
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    const y = baseY + 1 + tk['--strip-label-gap'] + tk['--strip-label-size'];
    for (const grp of groups.values()) g.fillText(grp.char, (grp.x0 + grp.x1) / 2, y);
  }
}

/** Draws the sounding bar + playhead for time tSec; returns the playhead x. */
function drawDynamic(canvas, geom, tk, segments, tSec, reduced) {
  const g = canvas.getContext('2d');
  const { width, height, offsetX, pxPerMs, starts } = geom;
  const barTop = tk['--strip-bar-top'];
  const barH = tk['--bar-h'];
  g.clearRect(0, 0, width, height);

  const ms = tSec * 1000;
  const i = indexAtMs(starts, ms);
  if (i >= 0 && segments[i].on) {
    const x = offsetX + starts[i] * pxPerMs;
    const w = segments[i].ms * pxPerMs;
    g.fillStyle = tk['--bar-active'];
    if (!reduced) {
      g.shadowColor = tk['--bar-active-glow'];
      g.shadowBlur = 24;
    }
    roundedRect(g, x, barTop, w, barH, tk['--bar-radius']);
    g.fill();
    if (!reduced) {
      g.shadowColor = tk['--bar-active-core'];
      g.shadowBlur = 8;
      g.fill();
    }
    g.shadowBlur = 0;
  }

  const total = starts[starts.length - 1];
  const px = offsetX + Math.max(0, Math.min(ms, total)) * pxPerMs;
  g.fillStyle = tk['--playhead'];
  g.fillRect(Math.round(px), 0, 1, barTop + barH + 1);
  return px;
}

export default function Scope({ segments, wpm, clock, showLabels }) {
  const wrapRef = useRef(null);
  const boxRef = useRef(null);
  const staticRef = useRef(null);
  const dynRef = useRef(null);
  const stateRef = useRef({ tokens: null, geom: null, reduced: false, props: { segments, wpm, showLabels } });
  const redrawRef = useRef(null);

  // Tokens + geometry: read on mount and again on resize / motion-pref change.
  useEffect(() => {
    const wrap = wrapRef.current;
    const st = stateRef.current;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const layout = () => {
      const wrapWidth = wrap.clientWidth;
      if (!wrapWidth || !st.tokens) return;
      const { segments: segs, wpm: w, showLabels: labels } = st.props;
      const geom = computeLayout(segs, w, st.tokens, wrapWidth);
      st.geom = geom;
      boxRef.current.style.width = `${geom.width}px`;
      boxRef.current.style.height = `${geom.height}px`;
      sizeCanvas(staticRef.current, geom);
      sizeCanvas(dynRef.current, geom);
      drawStatic(staticRef.current, geom, st.tokens, segs, labels);
    };

    const refresh = () => {
      st.tokens = readTokens({ sizes: SIZES, colors: COLORS, strings: STRINGS });
      st.reduced = mq.matches;
      layout();
    };

    redrawRef.current = layout;
    refresh();
    const ro = new ResizeObserver(refresh);
    ro.observe(wrap);
    mq.addEventListener('change', refresh);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', refresh);
      redrawRef.current = null;
    };
  }, []);

  // Static layer follows the message / speed / label toggle.
  useEffect(() => {
    stateRef.current.props = { segments, wpm, showLabels };
    const redraw = redrawRef.current;
    if (redraw) redraw();
  }, [segments, wpm, showLabels]);

  // Dynamic layer: rAF only while a clock is supplied.
  useEffect(() => {
    const canvas = dynRef.current;
    const wrap = wrapRef.current;
    const st = stateRef.current;
    if (!clock) {
      clearCanvas(canvas);
      return undefined;
    }
    let raf = 0;
    let lastScroll = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const geom = st.geom;
      const tk = st.tokens;
      if (!geom || !tk) return;
      const t = clock();
      if (t == null) return;
      const px = drawDynamic(canvas, geom, tk, st.props.segments, t, st.reduced);

      // Keep the playhead in the middle 60% of the viewport (throttled).
      const vis = wrap.clientWidth;
      if (wrap.scrollWidth > vis + 1) {
        const rel = px - wrap.scrollLeft;
        const now = performance.now();
        if ((rel < vis * 0.2 || rel > vis * 0.8) && now - lastScroll > 250) {
          lastScroll = now;
          wrap.scrollTo({ left: Math.max(0, px - vis / 2), behavior: st.reduced ? 'auto' : 'smooth' });
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      clearCanvas(canvas);
    };
  }, [clock]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="Rhythm of the message as timing bars"
      style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}
    >
      <div
        ref={boxRef}
        style={{
          position: 'relative',
          height: 'calc(var(--strip-bar-top) + var(--bar-h) + 1px + var(--strip-label-gap) + var(--strip-label-size) + 4px)',
        }}
      >
        <canvas ref={staticRef} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, display: 'block' }} />
        <canvas ref={dynRef} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, display: 'block' }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Temporary harness in `app/page.js`** (replaced in Task 21)

```jsx
'use client';

import { useMemo, useState } from 'react';
import { toSegments } from '@/lib/timing';
import Scope from '@/components/Scope';

export default function TranslatePage() {
  const [text, setText] = useState('PARIS');
  const segments = useMemo(() => toSegments(text, { wpm: 18 }), [text]);
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section style={{ borderRadius: 24, padding: '18px 26px 14px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <Scope segments={segments} wpm={18} clock={null} showLabels />
      </section>
      <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ color: 'var(--ink)', background: 'var(--surface)', padding: 12 }} />
    </main>
  );
}
```

- [ ] **Step 3: Verify proportions on screen**

Open `http://localhost:3000`. Expected: Papaya-Whip bars for PARIS with labels `P A R I S` under each group, baseline, faint ticks. In DevTools, measure with the ruler (or `document.querySelector('canvas').getBoundingClientRect()` and count): a dot is 22px wide, a dash 66px, gap inside a letter 22px, gap between letters 66px. Type a space and a word: word gap = 154px. Type a long sentence: the strip scrolls horizontally, no wrapping, page never scrolls sideways. Toggle nothing yet — no rAF should be running (Performance panel idle).
Run: `npm run lint` → no errors.

- [ ] **Step 4: Commit**

```bash
git add components/Scope.jsx app/page.js
git commit -m "feat(components): Scope — two-canvas rhythm strip with exact unit proportions

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 15: `components/Oscilloscope.jsx`

**Files:**
- Create: `components/Oscilloscope.jsx`

- [ ] **Step 1: Create the component** (port of the design's `draw()`)

```jsx
'use client';

// Decorative wave under the strip (from the design). Its own small rAF; the
// envelope eases toward 1 while sounding() is true, 0.2 otherwise. Purely
// cosmetic — removable without touching anything else.

import { useEffect, useRef } from 'react';
import { readTokens } from '@/components/tokens';

const COLORS = ['--wave', '--wave-ghost', '--wave-glow', '--wave-ghost-glow'];

export default function Oscilloscope({ sounding }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv.getContext('2d');
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let tk = readTokens({ colors: COLORS });
    let w = 0;
    let h = 0;
    let env = 0.05;
    let ph = 0;
    let raf = 0;

    const fit = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (!w || !h) return;
      g.clearRect(0, 0, w, h);
      const mid = h / 2;
      const amp = h * 0.38 * Math.max(0.18, env);
      const freq = 0.016 + env * 0.04;
      for (let pass = 1; pass >= 0; pass--) {
        g.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const taper = 1 - Math.pow(Math.abs(x - w / 2) / (w / 2), 4) * 0.25;
          const y = mid + Math.sin(x * freq - ph + pass * 1.1) * amp * taper * (pass ? 0.5 : 1);
          if (x === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.lineWidth = pass ? 1 : 2;
        g.strokeStyle = pass ? tk['--wave-ghost'] : tk['--wave'];
        g.shadowColor = pass ? tk['--wave-ghost-glow'] : tk['--wave-glow'];
        g.shadowBlur = pass ? 8 : 6 + 16 * env;
        g.stroke();
      }
      g.shadowBlur = 0;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const target = sounding() ? 1 : 0.2;
      env += (target - env) * 0.16;
      ph += 0.05 + env * 0.1;
      draw();
    };

    const refresh = () => {
      tk = readTokens({ colors: COLORS });
      fit();
      if (mq.matches) {
        env = 0.2;
        draw();
      }
    };

    refresh();
    const ro = new ResizeObserver(refresh);
    ro.observe(cv);
    if (!mq.matches) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [sounding]);

  return <canvas ref={ref} aria-hidden="true" style={{ display: 'block', width: '100%', height: '56px', marginTop: '6px' }} />;
}
```

- [ ] **Step 2: Lint and commit**

Run: `npm run lint` → no errors.

```bash
git add components/Oscilloscope.jsx
git commit -m "feat(components): Oscilloscope wave canvas

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 16: `components/StripHeader.jsx`

**Files:**
- Create: `components/StripHeader.jsx`

- [ ] **Step 1: Create the component** (port of the strip's header row)

```jsx
'use client';

export default function StripHeader({ word, code, muted, onToggleMute }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{word}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{code}</div>
      </div>
      <button
        type="button"
        onClick={onToggleMute}
        title={muted ? 'Unmute' : 'Mute'}
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
        className="hv-ink"
        style={{
          flex: '0 0 auto', width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 11, cursor: 'pointer',
          appearance: 'none', background: muted ? 'var(--pressed-fill)' : 'transparent', border: '1px solid var(--border)',
          color: muted ? 'var(--ink)' : 'var(--muted)', transition: 'color 200ms, background 200ms',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4z" />
          <path d={muted ? 'M17 9l4 6M21 9l-4 6' : 'M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12'} />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Lint and commit**

Run: `npm run lint` → no errors.

```bash
git add components/StripHeader.jsx
git commit -m "feat(components): StripHeader readout and mute

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 17: `components/TranslatePanels.jsx`

**Files:**
- Create: `components/TranslatePanels.jsx`

- [ ] **Step 1: Create the component** (port of the two-panel section + swap)

```jsx
'use client';

const MONO = 'var(--font-mono)';

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H5.5A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15" />
    </svg>
  );
}

function PanelHead({ label, copyTitle, onCopy }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink)' }} />
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted)' }}>{label}</span>
      </div>
      <button
        type="button"
        onClick={onCopy}
        title={copyTitle}
        aria-label={copyTitle}
        className="hv-icon"
        style={{
          width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 9, cursor: 'pointer', appearance: 'none',
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', transition: 'color 180ms, border-color 180ms',
        }}
      >
        <CopyIcon />
      </button>
    </div>
  );
}

const panelBase = {
  display: 'flex', flexDirection: 'column', gap: 14, minHeight: 214, padding: '20px 24px 16px',
  borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)',
};

const textareaBase = {
  flex: '1 1 auto', width: '100%', minHeight: 116, resize: 'none', border: 0, outline: 'none',
  background: 'transparent', color: 'var(--ink)', caretColor: 'var(--interact)',
};

export default function TranslatePanels({
  text, morse, unknown, swapDeg,
  onTextChange, onMorseChange, onCopyText, onCopyMorse, onSwap,
}) {
  const charCount = text.length;
  const signalCount = (morse.match(/[.-]/g) || []).length;
  const unsupported = unknown.length ? ` · ${unknown.length} UNSUPPORTED (${unknown.join(', ')})` : '';

  return (
    <section aria-label="Translator" style={{ position: 'relative', display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', gap: 18 }}>
      <div style={{ ...panelBase, flex: '1 1 calc(60% - 9px)', maxWidth: 'calc(60% - 9px)', minWidth: 320 }}>
        <PanelHead label="PLAIN TEXT" copyTitle="Copy text" onCopy={onCopyText} />
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          spellCheck={false}
          placeholder="Type anything…"
          aria-label="Plain text"
          style={{ ...textareaBase, fontSize: 34, fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.015em' }}
        />
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)' }}>{charCount} CHARS</div>
      </div>

      <div style={{ ...panelBase, flex: '1 1 calc(40% - 9px)', maxWidth: 'calc(40% - 9px)', minWidth: 260 }}>
        <PanelHead label="MORSE CODE" copyTitle="Copy morse" onCopy={onCopyMorse} />
        <textarea
          value={morse}
          onChange={(e) => onMorseChange(e.target.value)}
          spellCheck={false}
          placeholder="· − · ·"
          aria-label="Morse code"
          style={{ ...textareaBase, fontFamily: MONO, fontSize: 21, lineHeight: 1.5, letterSpacing: '0.06em' }}
        />
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)' }}>
          {signalCount} SIGNALS{unsupported}
        </div>
      </div>

      <button
        type="button"
        onClick={onSwap}
        title="Swap"
        aria-label="Swap text and Morse"
        className="hv-interact"
        style={{
          position: 'absolute', left: '60%', top: '50%', width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: '50%',
          cursor: 'pointer', appearance: 'none', background: 'var(--interact)', border: 0, color: 'var(--on-accent)', zIndex: 3,
          transition: 'background 240ms, transform 300ms cubic-bezier(0.22,1,0.36,1)',
          transform: `translate(-50%, -50%) rotate(${swapDeg}deg)`,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5" />
        </svg>
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Lint and commit**

Run: `npm run lint` → no errors.

```bash
git add components/TranslatePanels.jsx
git commit -m "feat(components): TranslatePanels — text/morse editors, copy, swap

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 18: `components/Transport.jsx` + `components/ConfigPopover.jsx`

**Files:**
- Create: `components/Transport.jsx`
- Create: `components/ConfigPopover.jsx`

- [ ] **Step 1: Create `components/Transport.jsx`** (port of the transport row; the popover renders as `children` because it is absolutely positioned inside this section)

```jsx
'use client';

const MONO = 'var(--font-mono)';

function ToolButton({ label, active, hover, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active === undefined ? undefined : active}
      className={hover}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 72, padding: '8px 6px', borderRadius: 14,
        cursor: 'pointer', appearance: 'none', fontFamily: 'inherit', transition: 'color 180ms, background 180ms',
        background: active ? 'var(--interact-fill)' : 'transparent',
        border: `1px solid ${active ? 'var(--interact-border)' : 'transparent'}`,
        color: active ? 'var(--interact)' : 'var(--muted)',
      }}
    >
      {children}
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em' }}>{label}</span>
    </button>
  );
}

const icon = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };

export default function Transport({
  onPlay, onStop,
  repeat, onToggleRepeat,
  light, onToggleLight,
  onWav, onShare,
  cfgOpen, onToggleCfg,
  children,
}) {
  return (
    <section
      aria-label="Transport"
      style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 4, paddingTop: 18, borderTop: '1px solid var(--rule)' }}
    >
      <button
        type="button"
        onClick={onPlay}
        className="hv-signal"
        style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '11px 20px 11px 17px', marginRight: 8, borderRadius: 999, cursor: 'pointer',
          appearance: 'none', fontFamily: 'inherit', background: 'var(--signal)', border: 0, color: 'var(--on-accent)',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', transition: 'background 180ms',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>
        <span>PLAY</span>
      </button>

      <ToolButton label="STOP" hover="hv-tint-ink" onClick={onStop}>
        <svg {...icon}><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
      </ToolButton>

      <ToolButton label="REPEAT" hover="hv-tint" active={repeat} onClick={onToggleRepeat}>
        <svg {...icon}><path d="M17 2l3 3-3 3" /><path d="M20 5H8a4 4 0 0 0-4 4v1" /><path d="M7 22l-3-3 3-3" /><path d="M4 19h12a4 4 0 0 0 4-4v-1" /></svg>
      </ToolButton>

      <ToolButton label="LIGHT" hover="hv-tint" active={light} onClick={onToggleLight}>
        <svg {...icon}><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" /></svg>
      </ToolButton>

      <div aria-hidden="true" style={{ width: 1, height: 26, margin: '0 8px', background: 'var(--divider)' }} />

      <ToolButton label="WAV" hover="hv-tint-ink" onClick={onWav}>
        <svg {...icon} strokeWidth={1.9}><path d="M3 12h2M8 7v10M13 4v16M18 9v6M21 12h0" /></svg>
      </ToolButton>

      <ToolButton label="SHARE" hover="hv-tint-ink" onClick={onShare}>
        <svg {...icon}><path d="M12 3v11" /><path d="m8 7 4-4 4 4" /><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>
      </ToolButton>

      <ToolButton label="CONFIG" hover="hv-tint" active={cfgOpen} onClick={onToggleCfg}>
        <svg {...icon}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2.2" /><circle cx="10" cy="17" r="2.2" /></svg>
      </ToolButton>

      {children}
    </section>
  );
}
```

- [ ] **Step 2: Create `components/ConfigPopover.jsx`** (design's popover + the Effective speed slider)

```jsx
'use client';

import { useId } from 'react';
import { LIMITS } from '@/lib/settings';

const MONO = 'var(--font-mono)';

function Slider({ label, value, unit, min, max, step, onChange }) {
  const id = useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--muted)' }}>
        <label htmlFor={id}>{label}</label>
        <span style={{ fontFamily: MONO, color: 'var(--ink)' }}>{value} {unit}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', height: 4 }}
      />
    </div>
  );
}

export default function ConfigPopover({ open, settings, setWpm, setEffWpm, setToneHz, setLabels }) {
  return (
    <div
      role="group"
      aria-label="Playback settings"
      style={{
        position: 'absolute', right: 0, bottom: 78, width: 292, padding: 20, borderRadius: 18, background: 'var(--surface)',
        border: '1px solid var(--border)', display: open ? 'flex' : 'none', flexDirection: 'column', gap: 18, zIndex: 6,
      }}
    >
      <Slider label="Speed" value={settings.wpm} unit="wpm" min={LIMITS.wpm[0]} max={LIMITS.wpm[1]} step={1} onChange={setWpm} />
      <Slider label="Effective speed" value={settings.effWpm} unit="wpm" min={LIMITS.effWpm[0]} max={settings.wpm} step={1} onChange={setEffWpm} />
      <Slider label="Tone" value={settings.toneHz} unit="Hz" min={LIMITS.toneHz[0]} max={LIMITS.toneHz[1]} step={10} onChange={setToneHz} />
      <button
        type="button"
        onClick={() => setLabels(!settings.labels)}
        aria-pressed={settings.labels}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
          appearance: 'none', background: 'var(--inset-fill)', border: '1px solid var(--border-soft)', color: 'var(--muted)', fontFamily: 'inherit', fontSize: 12.5,
        }}
      >
        <span>Letter labels</span>
        <span aria-hidden="true" style={{ width: 34, height: 18, borderRadius: 999, background: settings.labels ? 'var(--interact)' : 'var(--pressed-fill)', position: 'relative', transition: 'background 200ms' }}>
          <span style={{ position: 'absolute', top: 2, left: 2, width: 14, height: 14, borderRadius: '50%', background: settings.labels ? 'var(--on-accent)' : 'var(--muted)', transition: 'transform 220ms cubic-bezier(0.22,1,0.36,1)', transform: `translateX(${settings.labels ? 16 : 0}px)` }} />
        </span>
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Lint and commit**

Run: `npm run lint` → no errors.

```bash
git add components/Transport.jsx components/ConfigPopover.jsx
git commit -m "feat(components): Transport row and ConfigPopover with Farnsworth slider

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 19: `components/Toast.jsx` + `components/Flash.jsx`

**Files:**
- Create: `components/Toast.jsx`
- Create: `components/Flash.jsx`

- [ ] **Step 1: Create `components/Toast.jsx`**

```jsx
'use client';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      key={message}
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', left: '50%', bottom: 32, transform: 'translate(-50%, 0)', display: 'flex', alignItems: 'center', gap: 9,
        padding: '11px 18px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12.5,
        color: 'var(--ink)', animation: 'cad-toast 260ms cubic-bezier(0.22,1,0.36,1)', zIndex: 40,
      }}
    >
      <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
      <span>{message}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/Flash.jsx`** (opacity driven from rAF, no per-frame React state)

```jsx
'use client';

import { useEffect, useRef } from 'react';

export default function Flash({ enabled, sounding }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!enabled) {
      el.style.opacity = '0';
      return undefined;
    }
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      el.style.opacity = sounding() ? 'var(--flash-opacity)' : '0';
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.style.opacity = '0';
    };
  }, [enabled, sounding]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'var(--flash)', opacity: 0, transition: 'opacity 60ms linear', zIndex: 30 }}
    />
  );
}
```

- [ ] **Step 3: Lint and commit**

Run: `npm run lint` → no errors.

```bash
git add components/Toast.jsx components/Flash.jsx
git commit -m "feat(components): Toast and Flash

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 20: `next.config.mjs` — security headers

**Files:**
- Modify: `next.config.mjs`

- [ ] **Step 1: Replace `next.config.mjs`**

```js
const isDev = process.env.NODE_ENV !== 'production';

// 'unsafe-inline' for scripts is required by Next's inline bootstrap in this
// setup; tighten to a nonce later if the build allows. 'unsafe-eval' and the
// ws: sources are dev-only (HMR).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com${isDev ? ' ws://localhost:* ws://127.0.0.1:*' : ''}`,
  "img-src 'self' data:",
  "font-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify**

Restart `npm run dev` (config changes need a restart). Then:

Run: `curl -sI http://localhost:3000/ | grep -i -E "content-security-policy|x-content-type-options|referrer-policy"`
Expected: three header lines. Reload the page: no CSP violations in the console, HMR still works (edit a file, see it update), fonts and analytics script load.

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "feat: security headers (CSP, nosniff, referrer policy)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 21: `app/page.js` — the Translate page, fully wired

**Files:**
- Modify: `app/page.js` (replace the harness)

- [ ] **Step 1: Write the page**

```jsx
'use client';

// Translate. Owns the message (text ⇄ morse) and its playback; every visual
// region is a props-only component. Timing comes from toSegments() only.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { encode, decode, normaliseMorse } from '@/lib/morse';
import { toSegments } from '@/lib/timing';
import { segmentsToWav, wavFilename } from '@/lib/wav';
import { encodeSlug } from '@/lib/slug';
import { track } from '@/lib/track';
import { useSettings } from '@/hooks/useSettings';
import usePlayer from '@/hooks/usePlayer';
import Scope from '@/components/Scope';
import Oscilloscope from '@/components/Oscilloscope';
import StripHeader from '@/components/StripHeader';
import TranslatePanels from '@/components/TranslatePanels';
import Transport from '@/components/Transport';
import ConfigPopover from '@/components/ConfigPopover';
import Toast from '@/components/Toast';
import Flash from '@/components/Flash';

const PLACEHOLDER = 'MORSE';
const TOAST_MS = 2300;

export default function TranslatePage() {
  const { settings, setWpm, setEffWpm, setToneHz, setLabels } = useSettings();
  const { wpm, effWpm, toneHz, labels } = settings;
  const player = usePlayer({ toneHz });

  const [text, setText] = useState(PLACEHOLDER);
  const [morse, setMorse] = useState(() => encode(PLACEHOLDER).morse);
  const [unknown, setUnknown] = useState([]);
  const [swapDeg, setSwapDeg] = useState(0);
  const [cfgOpen, setCfgOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(0);

  const source = text.trim() ? text.trim().toUpperCase() : PLACEHOLDER;
  const segments = useMemo(() => toSegments(source, { wpm, effWpm }), [source, wpm, effWpm]);
  const stripCode = useMemo(() => encode(source).morse, [source]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), TOAST_MS);
  }, []);

  const copy = async (str, okMsg) => {
    try {
      await navigator.clipboard.writeText(str);
      showToast(okMsg);
    } catch {
      showToast("Couldn't copy");
    }
  };

  // --- message editing ---
  const onTextChange = (v) => {
    setText(v);
    const r = encode(v);
    setMorse(r.morse);
    setUnknown(r.unknown);
  };
  const onMorseChange = (raw) => {
    const v = normaliseMorse(raw);
    setMorse(v);
    setText(decode(v));
    setUnknown([]);
  };
  const onSwap = () => {
    const t = decode(morse);
    const m = encode(text).morse;
    setText(t || text);
    setMorse(m || morse);
    setUnknown([]);
    setSwapDeg((d) => d + 180);
  };

  // --- transport ---
  const onPlay = () => {
    if (player.play(segments)) track('translate_played');
    else showToast('Audio unavailable in this browser');
  };
  const onToggleLight = () => {
    if (!player.light) track('flash_used');
    player.toggleLight();
  };
  const onWav = () => {
    const blob = segmentsToWav(segments, { toneHz });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = wavFilename(source);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    showToast('WAV exported');
    track('wav_downloaded');
  };
  const onShare = () => {
    const slug = encodeSlug(source);
    copy(`${window.location.origin}/m/${slug}`, 'Link copied');
    track('link_shared');
  };
  const onToggleCfg = () => {
    if (!cfgOpen) track('settings_opened');
    setCfgOpen((o) => !o);
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section
        aria-label="Rhythm strip"
        style={{ borderRadius: 24, padding: '18px 26px 14px', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'inset 0 0 100px var(--strip-bloom)' }}
      >
        <StripHeader word={source} code={stripCode} muted={player.muted} onToggleMute={player.toggleMute} />
        <div style={{ marginTop: 14 }}>
          <Scope segments={segments} wpm={wpm} clock={player.playing ? player.clock : null} showLabels={labels} />
        </div>
        <Oscilloscope sounding={player.sounding} />
      </section>

      <TranslatePanels
        text={text}
        morse={morse}
        unknown={unknown}
        swapDeg={swapDeg}
        onTextChange={onTextChange}
        onMorseChange={onMorseChange}
        onCopyText={() => copy(text, 'Text copied')}
        onCopyMorse={() => copy(morse, 'Morse copied')}
        onSwap={onSwap}
      />

      <Transport
        onPlay={onPlay}
        onStop={player.stop}
        repeat={player.repeat}
        onToggleRepeat={player.toggleRepeat}
        light={player.light}
        onToggleLight={onToggleLight}
        onWav={onWav}
        onShare={onShare}
        cfgOpen={cfgOpen}
        onToggleCfg={onToggleCfg}
      >
        <ConfigPopover open={cfgOpen} settings={settings} setWpm={setWpm} setEffWpm={setEffWpm} setToneHz={setToneHz} setLabels={setLabels} />
      </Transport>

      <Flash enabled={player.light && player.playing} sounding={player.sounding} />
      <Toast message={toast} />
    </main>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual verification checklist** (dev server at `http://localhost:3000`; do every line)

1. Page shows header, strip with `MORSE` bars + labels, wave, two panels (`MORSE` / `-- --- .-. ... .`), transport. No console errors.
2. Type in PLAIN TEXT: Morse panel updates live; strip redraws; SIGNALS count updates. Type `#` → count line shows `… · 1 UNSUPPORTED (#)`.
3. Type in MORSE CODE (`... --- ...`): text panel shows `SOS`; a trailing space is not eaten while typing; `·`/`—` are accepted.
4. **Play**: tone at 620 Hz, pink bar sweeps in sync with the sound, playhead line moves, wave lifts while sounding. Ends cleanly; `playing` state returns (Scope loop stops — Performance panel idle).
5. Play a long sentence: strip auto-scrolls to keep the playhead centred, smooth.
6. **Stop** mid-play: sound stops, pink bar clears.
7. **Repeat** on: playback loops; off: stops at end.
8. **Mute** during play: sound stops, bar keeps sweeping. Play while muted: strip runs silently.
9. **Light** on + Play: screen tints pink on each tone. Off: no tint.
10. **Config**: Speed slider changes gap/bar widths on the strip (unit stays 22px, timing scales) and audio speed; Effective speed below Speed widens letter/word gaps visibly and audibly (Farnsworth); Tone changes pitch; Letter labels toggle hides/shows labels. Reload → settings persisted; header badge matches.
11. **WAV**: downloads `morse.wav` (or slugged text), plays back in a media player with the same rhythm.
12. **Share**: toast "Link copied"; clipboard contains `http://localhost:3000/m/MORSE` (encoded).
13. Copy buttons → toasts. Swap → rotates, panels re-derive.
14. Nav to `/free` and back: playback stopped on leave, no errors.
15. Keyboard only: Tab reaches every control with a visible ring; Space/Enter activates.
16. `curl -sI http://localhost:3000/ | grep -i content-security-policy` still present.

- [ ] **Step 4: Run everything**

Run: `npm test` → all pass. Run: `npm run lint` → clean. Run: `npm run build` → succeeds (then restart `npm run dev` if you keep working).

- [ ] **Step 5: Commit**

```bash
git add app/page.js
git commit -m "feat(translate): wire the Translate page to the engine, Scope and design components

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 22: Wrap-up — README note and open items for the user

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the scaffold README with project notes**

```md
# Cadence (Morse)

Text ⇄ Morse translator that teaches you to read Morse by ear. Next.js App Router, JavaScript, no backend.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # node --test over lib/
npm run lint
npm run build
```

## Where things live

- `lib/` — pure maths: `morse.js`, `timing.js` (`toSegments()` is the single timing source), `slug.js`, `wav.js`, `audio.js`, `settings.js`
- `hooks/` — `useSettings` (localStorage store), `usePlayer` (audio lifecycle, `clock()`, `sounding()`)
- `components/` — one file per design region; `Scope.jsx` is the two-canvas rhythm strip
- `app/globals.css` — every colour, radius and size token; `--unit` sets the strip's Morse unit
- `design/cadence/` — reference export of the Claude Design mockup the UI is ported from
- `docs/superpowers/` — specs and plans
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: project README

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 3: Report these open items to the user** (do not change them unilaterally — they are design decisions):

- The design's mute button (34px), copy buttons (28px), transport tool buttons (~55px tall but 72px wide) and nav links (~33px tall) are below the brief's 44px minimum touch target. Options: accept for now, or ask Claude Design for larger hit areas.
- On viewports narrower than ~700px the design's panels keep `max-width: calc(60% - 9px)` / `calc(40% - 9px)`, so they cannot go full-width. A mobile pass is needed in the design.
- Editing the text while playback is running redraws the strip against the new message while the audio finishes the old one. Options: stop playback on edit, or leave.
- Share links point at `/m/<slug>`, which 404s until the share-links slice.

---

## Self-review (done while writing)

**Spec coverage:** decisions table → Tasks 8/11 (routes/shell), 7/9/18 (settings incl. Farnsworth), 2 (charset), 14 (exact proportions, canvas, single-row scroll), 21 (share = /m/ link), 10/21 (analytics events: translate_played, mode_switched (Task 11), settings_opened, wav_downloaded, link_shared, flash_used), 20 (headers). Files list → every entry has a task (SettingsProvider → useSettings, noted). Error handling → 6 (null engine), 21 (toasts), 2 (decode never throws), 9 (localStorage guarded), 14 (zero-width guard). Testing → 2–7 have `node:test` files; 21 has the manual checklist.

**Placeholders:** none; every code step is complete. Task 1 has `<installed version>` deliberately, with the instruction to copy npm's output.

**Type consistency:** `encode() → { morse, unknown }` used identically in Tasks 2, 3, 21; `toSegments(text, { wpm, effWpm })` in 3, 14, 21; `Segment` fields (`on, ms, kind, char, charIndex, wordIndex`) in 3, 5, 6, 14; `createEngine().play(segments, { toneHz, muted }) → { start, total } | null` in 6 and 12; `usePlayer` returns `{ playing, muted, repeat, light, play, stop, toggleMute, toggleRepeat, toggleLight, clock, sounding }` used in 21; `useSettings()` returns `{ settings, setWpm, setEffWpm, setToneHz, setLabels }` used in 11, 18, 21; `readTokens({ sizes, colors, strings })` in 13, 14, 15; `Scope` props `segments, wpm, clock, showLabels` in 14 and 21; `LIMITS.wpm/effWpm/toneHz` in 7 and 18.
