# Translate slice — design

Date: 2026-08-18
Scope: slices 1–3 of the Morse build order — maths foundation, the Scope canvas, and the Translate landing page wired to the Cadence design. Free Mode, `/m/[slug]`, and Learn are later slices; this spec leaves clean seams for them.

## Context

- Repo is a fresh Next.js 16 App Router scaffold (JavaScript, Tailwind 4, no `lib/` or `components/` yet).
- The visual design is owned by Claude Design, project "Cadence: Morse code learning app UI". Reference copies are in `design/cadence/` (`Cadence Translate.dc.html`, `globals.css`). `support.js` there is the DC runtime — not needed for the port. Do not propose visual alternatives; wire the design to the engine.
- The maths lineage is the earlier single-file prototype `~/Downloads/sidetone-morse-practice (1).html` (unit = 1200/wpm, ARRL Farnsworth, `buildSegments()` → `[{on, dur}]`, one-oscillator audio). This slice ports that into `lib/` with tests.

## Decisions (made during brainstorming)

| Topic | Decision |
|---|---|
| Sections | Separate routes: `/` Translate, `/free`, `/learn`. Shared shell (header/nav) in `app/layout.js`. |
| Settings | WPM (character speed), effective WPM (Farnsworth), tone Hz, letter-labels toggle. Persisted in `localStorage`. |
| Charset | ITU letters, digits, common punctuation `. , ? ' ! / ( ) & : ; = + - _ " $ @`. Unknown characters are skipped in bars/audio and surfaced to the UI. |
| Bar proportions | Exact: dit 1u, dah 3u, intra-gap 1u, char gap 3u, word gap 7u, all derived from one `--unit` token. Design's compressed gaps (9/26/60px) are **not** used. |
| Bars | Canvas, not DOM. `components/Scope.jsx` = two stacked canvases (static: graticule + resting bars + labels; dynamic: sounding bar + playhead). Everything else on the page stays DOM as designed. |
| Overflow | Single row, horizontal auto-scroll keeping the playhead centred (as designed). No wrapping. |
| Share | Copies `origin + /m/<slug>` to clipboard now; the `/m/[slug]` page is a later slice. |
| Architecture | Shell + `SettingsProvider`; page-local message and playback; Scope and design components are pure props-in. |
| Analytics | `@vercel/analytics` + `@vercel/speed-insights` in this slice, behind `lib/track.js`. Never log message content. |

## Files and boundaries

```
lib/
  morse.js        TABLE, REVERSE, encode, decode, normaliseMorse          (pure)
  timing.js       unitMs, gaps, toSegments, totalMs                       (pure)
  slug.js         encodeSlug, decodeSlug (cap + charset validation)       (pure)
  wav.js          segmentsToWav(segments, {toneHz, sampleRate}) → Blob    (pure)
  audio.js        createEngine() → { play, stop, keyDown, keyUp, now, dispose }
                  (Web Audio; nothing runs at import time)
  track.js        track(name, props) → @vercel/analytics if present, else no-op
hooks/
  usePlayer.js    one engine per page: play/stop/repeat/muted/light, clock(), sounding()
components/
  Scope.jsx           rhythm strip canvases — props: segments, wpm, clock, showLabels
  Oscilloscope.jsx    decorative wave canvas — props: sounding
  Header.jsx          logo, nav pill (Link + usePathname), WPM/Hz badge
  StripHeader.jsx     word + dot-dash readout, mute button
  TranslatePanels.jsx two textareas, copy buttons, counts, swap
  Transport.jsx       Play / Stop / Repeat / Light / WAV / Share / Config
  ConfigPopover.jsx   Speed, Effective speed, Tone sliders; Letter labels toggle
  Toast.jsx, Flash.jsx
  SettingsProvider.jsx  context + localStorage persistence
  PlaceholderSection.jsx  the design's "other" card, used by /free and /learn for now
app/
  layout.js       next/font (Archivo, IBM Plex Mono), SettingsProvider, Header, Analytics
  page.js         Translate page — owns text/morse state, composes components
  free/page.js    PlaceholderSection
  learn/page.js   PlaceholderSection
  globals.css     Cadence token file verbatim + new tokens (see below) + design's base rules
next.config.mjs   security headers
```

Rules that keep this editable:

- `lib/` imports nothing from React or the DOM. `audio.js` touches Web Audio only inside `createEngine()`; it is unit-testable with a fake context injected via `createEngine({ AudioContextClass })`.
- Components read **only** CSS custom properties for colours, radii, sizes. The design's inline `style="… var(--token) …"` is carried over as inline JSX `style={{}}` objects, one component per design region, so a future re-export can be diffed against the component and pasted in without touching logic.
- Every px value in the design that encodes **time** (bar widths, gaps) becomes `--unit`-derived. Every other px value stays exactly as the design has it.
- `toSegments()` is the single source of truth for durations. Scope, audio, WAV, and the flash all consume its output; none of them recompute timing.
- No abstraction until there are two real uses. `SettingsProvider` qualifies (header badge, config popover, and Free Mode later); nothing else is shared state.

## `lib/morse.js`

- `TABLE`: A–Z, 0–9, and `. , ? ' ! / ( ) & : ; = + - _ " $ @` mapped to ITU code strings using `.` and `-`.
- `REVERSE`: built once from `TABLE`.
- `encode(text) → { morse, unknown }`
  - Uppercases; splits on whitespace into words; each known char → its code; chars joined by one space; words joined by ` / `.
  - `unknown` is an array of the distinct unsupported characters encountered (whitespace excluded), in first-seen order. Empty when all good.
- `normaliseMorse(str) → str`: maps `·`→`.`, `—`/`–`→`-`, strips anything not in `[.\- /\n]`, collapses runs of spaces to one, treats `\n` as a word break. Exported so the Morse textarea and `decode` share it.
- `decode(morse) → text`: normalises, splits words on `/`, letters on single spaces; each group → `REVERSE[group] ?? '?'`; words joined with a space. Never throws.

## `lib/timing.js`

- `unitMs(wpm) = 1200 / wpm` (PARIS standard: PARIS = 50 units).
- `gaps(wpm, effWpm) → { intra, char, word }` in ms.
  - `effWpm >= wpm` (or missing): `{ u, 3u, 7u }`.
  - Otherwise ARRL Farnsworth: `ta = (60·c − 37.2·e) / (c·e)` seconds; `char = 3·ta/19 · 1000`, `word = 7·ta/19 · 1000`, `intra = u`.
- `toSegments(text, { wpm, effWpm }) → Segment[]` where
  `Segment = { on: boolean, ms: number, kind: 'dit'|'dah'|'intra'|'char'|'word', char: string|null, charIndex: number, wordIndex: number }`
  - Walks the same `TABLE` as `encode` (uppercase, split on whitespace); unknown characters contribute nothing.
  - Never two `off` segments adjacent; no leading or trailing gap; empty input → `[]`.
  - `char`/`charIndex` are set on `dit`/`dah`/`intra` segments (the character they belong to) so Scope can label groups; gap segments between characters carry `char: null`.
- `totalMs(segments)`.
- Free-Mode adaptive dit detection will be added here in the Free Mode slice.

## `lib/slug.js`

- `encodeSlug(text)`: trims, collapses whitespace, caps at 280 characters, keeps only characters present in `TABLE` plus space, `encodeURIComponent`s the result. Returns `''` if nothing survives.
- `decodeSlug(slug) → string | null`: `decodeURIComponent` (guarded), same cap and charset check; `null` on any violation. The `/m/[slug]` slice will render `null` as not-found.

## `lib/wav.js`

- `segmentsToWav(segments, { toneHz, sampleRate = 44100 }) → Blob` — 16-bit mono PCM, sine at `toneHz`, amplitude 0.5, 5 ms linear ramps on each `on` segment, 250 ms tail. Header written as in the prototype.
- `wavFilename(text)`: lowercase, non-alphanumerics → `-`, trimmed, max 24 chars, fallback `morse`, plus `.wav`.

## `lib/audio.js`

`createEngine({ AudioContextClass } = {})`:

- `play(segments, { toneHz, muted }) → { start, total } | null`
  - Lazily creates the context (first call must come from a user gesture) and resumes it if suspended. Returns `null` when Web Audio is unavailable.
  - Stops anything already playing. One `OscillatorNode` (sine, `toneHz`) → one `GainNode` → destination. Gain envelope scheduled straight from `segments`: for each `on` segment, ramp 0→1 over `min(4 ms, ms/4)`, hold, ramp back to 0. `off` segments only advance time.
  - `muted: true` schedules no audio but still returns `{ start, total }` so the Scope and Flash run silently.
- `stop()` — stops the oscillator; safe to call anytime.
- `now()` — context `currentTime` (0 if no context).
- `keyDown()` / `keyUp()` — live sidetone for Free Mode later (same ramps).
- `setTone(hz)` — applied to the next play/keyDown.
- `dispose()` — closes the context.

## `hooks/usePlayer.js`

- Creates one engine in a ref; disposes on unmount.
- State: `playing`, `muted`, `repeat`, `light`. Actions: `play(segments)`, `stop()`, `toggleMute`, `toggleRepeat`, `toggleLight`.
- Keeps `segmentsRef`, `startRef`, `totalRef` so `clock()` and `sounding()` are stable functions that never cause re-renders:
  - `clock()` → seconds since play start, or `null` when not playing.
  - `sounding()` → `true` iff the segment under `clock()` has `on: true`.
- End detection: `setTimeout(total·1000 + 60)`; on end → if `repeat`, `play` again with the same segments, else `playing = false`.
- Toggling mute while playing stops audio; playing continues visually.
- Fires nothing itself; the page fires analytics.

## `components/Scope.jsx`

Props: `segments`, `wpm`, `clock`, `showLabels`. No other inputs.

- **Sizing tokens** (read once, cached): `--unit` (px per Morse unit), `--bar-h`, `--bar-radius`, `--strip-label-size`, `--strip-label-gap`, `--strip-pad-x`. **Colour tokens**: `--bar-rest`, `--bar-active`, `--bar-active-glow`, `--bar-active-core`, `--baseline`, `--muted`, `--border-soft`. Font: `--font-mono`.
- `pxPerMs = unitPx / unitMs(wpm)`. Bar x-positions are cumulative `ms × pxPerMs`. At standard spacing this yields exactly 1/3/7; with Farnsworth on, gaps draw wider because that *is* the time.
- **Layout**: a wrapper `div` with `overflow-x: auto; overflow-y: hidden; scrollbar-width: none`; inside, a positioned box of width `max(containerWidth, totalMs × pxPerMs + 2·padX)` and height `barH + labelGap + labelSize`; two `<canvas>` elements absolutely stacked, sized to that box × DPR (DPR capped at 2). Content is centred when narrower than the container (as designed).
- **Static canvas** draws: baseline; faint graticule ticks at every unit; each `on` segment as a rounded rect in `--bar-rest`; when `showLabels`, the character under each group in `--font-mono` `--muted`. Redrawn only when `segments`, `wpm`, `showLabels`, container width, DPR, or tokens change.
- **Dynamic canvas**: a `requestAnimationFrame` loop that runs **only while `clock` is non-null** and is cancelled when it becomes null (one final clear). Each frame: read `t = clock()`, binary-search the segment under `t`, clear, if that segment is `on` redraw its rect in `--bar-active` with `shadowBlur` glow (`--bar-active-glow` / `--bar-active-core`), draw a 1px playhead line at `t × pxPerMs`. If the playhead is outside the middle 60% of the visible wrapper, `scrollTo` to recentre (smooth unless reduced-motion), throttled to at most one call per 250 ms.
- **Tokens**: `getComputedStyle(root)` once on mount and again on `ResizeObserver` callbacks and `matchMedia('(prefers-reduced-motion)')` changes, stored in a ref. **Never inside the loop.**
- **Reduced motion**: playhead still moves; glow off; scroll not smooth.
- Guards: zero-size container → no drawing; `segments = []` → static canvas shows only the baseline.
- Exposes nothing imperative; the page controls it entirely through props.

## `components/Oscilloscope.jsx`

Props: `sounding` (fn → bool). Own rAF loop always running while mounted (as designed — the wave idles), envelope eases toward 1 when sounding, 0.2 otherwise; draws the two-pass sine from the design using `--wave`, `--wave-ghost`, `--wave-glow`, `--wave-ghost-glow`, tokens cached the same way as Scope. Under reduced motion the wave is static. Purely decorative; can be removed without touching anything else.

## Settings and shell

`SettingsProvider`:

- Defaults `{ wpm: 18, effWpm: 18, toneHz: 620, labels: true }` (design defaults). Ranges: wpm 5–40, effWpm 5–wpm (clamped whenever wpm changes), tone 300–1000.
- SSR renders defaults; after mount, hydrates from `localStorage['morse:settings']` (guarded JSON parse, values clamped) and writes back on change. No hydration mismatch.
- Exposes `{ settings, setWpm, setEffWpm, setToneHz, setLabels }`.

`Header`: logo (three token-coloured bars + wordmark), nav pill — three `<Link>`s to `/`, `/free`, `/learn`, active one derived from `usePathname()`, the sliding indicator positioned by index as designed; clicking fires `mode_switched { to }`. WPM/Hz badge reads settings. Every link is a 44px-min target with a focus ring (the design's `:focus-visible` rule).

`app/layout.js`: `next/font/google` for Archivo (400–700) and IBM Plex Mono (400, 500) exposed as `--font-sans` and `--font-mono` on `<html>`; the design's `font-family` strings become `var(--font-sans)` / `var(--font-mono)`. Wraps children in `SettingsProvider`, renders `Header`, `<Analytics/>`, `<SpeedInsights/>`.

`app/globals.css`: the Cadence token block verbatim, then added tokens with comments:

```
--unit: 14px;             /* one Morse unit on the strip */
--bar-h: 78px;            /* from the design */
--bar-radius: 7px;        /* design's "Rounded"; 2px = "Sharp" */
--strip-label-size: 11px; --strip-label-gap: 11px; --strip-pad-x: 12px;
--font-sans / --font-mono set by next/font
```

plus the design's base rules (`html, body`, `a`, `textarea`, `::selection`, range accent, `:focus-visible`, `cad-breathe`, `cad-toast`) and a `prefers-reduced-motion` block that zeroes the transitions/animations. Tailwind's `@import` stays for utilities; nothing in the design depends on it.

`next.config.mjs` headers on all routes: `Content-Security-Policy` (`default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. `'unsafe-inline'` for scripts is required by Next's inline bootstrap in this setup; if the build works with a nonce later, tighten it. In development only (`process.env.NODE_ENV !== 'production'`) `script-src` also gets `'unsafe-eval'`, which `next dev` HMR needs.

## Translate page (`app/page.js`)

State: `text`, `morse`, `unknown` (from `encode`), `toast`, `cfgOpen`, `swapSpin`.

- Editing text: `setText(v)`; `{ morse, unknown } = encode(v)`; `setMorse(morse)`.
- Editing morse: `v = normaliseMorse(raw)`; `setMorse(v)`; `setText(decode(v))`; `unknown = []`.
- `source = text.trim() ? text.trim().toUpperCase() : 'MORSE'` — the design's placeholder message when empty.
- `segments = useMemo(() => toSegments(source, { wpm, effWpm }), [source, wpm, effWpm])`.
- StripHeader shows `source` and `encode(source).morse`; mute toggles `player.muted`.
- `Scope segments={segments} wpm={wpm} clock={player.clock} showLabels={labels}`.
- `Oscilloscope sounding={player.sounding}`; `Flash sounding={player.sounding} enabled={player.light}` — Flash sets the overlay's opacity from its own rAF (no React state per frame).
- Panels: counts are `text.length` CHARS and number of `.`/`-` in `morse` SIGNALS; when `unknown.length`, the Morse panel's count line reads e.g. `12 SIGNALS · 2 UNSUPPORTED (#, ~)`. Copy buttons → clipboard + toast. Swap: `text ↔ decode/encode` as designed, spin +180.
- Transport:
  - Play → `player.play(segments)`; `track('translate_played')`. If the engine returns `null` → toast "Audio unavailable in this browser".
  - Stop, Repeat, Light (`track('flash_used')` when turned on).
  - WAV → `segmentsToWav(segments, { toneHz })`, download via object URL, toast, `track('wav_downloaded')`.
  - Share → `navigator.clipboard.writeText(location.origin + '/m/' + encodeSlug(source))`; toast "Link copied"; `track('link_shared')`. Clipboard rejection → toast "Couldn't copy".
  - Config → popover open/close; opening fires `track('settings_opened')`. Sliders bound to settings; Effective speed slider max follows Speed.
- Toast: single message, replaces the previous, auto-hides after 2.3 s.
- Playback stops on unmount (route change) via `usePlayer` cleanup.

`/free` and `/learn`: render `PlaceholderSection` with the design's copy and a "Back to Translate" link. No flag needed — they're honest placeholders until their slices.

## Error handling

- Web Audio missing / context creation fails → `play` returns `null`; UI toasts; Scope simply never gets a clock.
- Clipboard API missing or rejected → toast; nothing else changes.
- `decode` and `encode` never throw; garbage in the Morse box decodes to `?`s.
- `localStorage` unavailable (private mode) → settings still work for the session.
- Scope with zero-width container (hidden tab) → skips drawing until `ResizeObserver` reports a size.

## Testing

- `lib/`: `node --test lib/*.test.js` (Node's built-in runner, no dependencies). `npm test` script added.
  - `morse`: every TABLE code is unique and uses only `.`/`-`; `encode`→`decode` round-trips every character and multi-word strings; `unknown` reports distinct unsupported chars; `normaliseMorse` maps `·`/`—`, collapses spaces, keeps `/`; `decode` of unknown groups gives `?`.
  - `timing`: `unitMs(20) = 60`; `PARIS` at any wpm totals exactly 50 units; `gaps` standard vs Farnsworth known values (e.g. 18/10); segments never have adjacent gaps, no leading/trailing gap, `kind` and `char` set as specified; empty input → `[]`.
  - `slug`: cap, charset filtering, round-trip, `decodeSlug` returns `null` on bad input (including malformed percent-encoding).
  - `wav`: header fields (RIFF/WAVE, sample rate, byte length = 44 + 2·n), duration = total + 250 ms.
  - `audio`: with a fake `AudioContextClass`, `play` schedules one oscillator with the right number of gain ramps, returns `{start, total}` matching `totalMs`, `muted` schedules nothing but returns the timeline, `stop` is idempotent.
- Components: no test framework in this slice; verified by running the app (`next dev`), the linter (`next lint`), and a manual checklist per step: strip proportions measured on screen against `--unit`, playhead follows audio, mute keeps the strip moving, Farnsworth widens gaps, labels toggle, nav pill follows route, settings persist across reload, headers present in the response.

## Working style

One change at a time: each step in the implementation plan is one file (plus its test), shown as a diff and accepted before the next. Suggested order: `morse.js` → `timing.js` → `slug.js` → `wav.js` → `audio.js` → `globals.css` tokens/fonts/layout → `SettingsProvider` → `Header` + placeholder routes → `usePlayer` → `Scope` → `Oscilloscope` → `StripHeader` → `TranslatePanels` → `Transport` + `ConfigPopover` → `Toast`/`Flash` → `page.js` wiring → `track.js` + analytics → `next.config.mjs` headers.

## Out of scope (later slices)

Free Mode keying and adaptive dit detection; `/m/[slug]` page, OG cards, `share_link_visited`; Learn; `free_keyed`; canvas row-wrapping; prosigns and accented characters.
