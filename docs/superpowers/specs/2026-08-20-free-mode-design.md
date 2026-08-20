# Free Mode — design

Date: 2026-08-20. Source: owner's build spec (verbatim intent), adjusted to this repo. Supersedes nothing in the Translate slice.

## Corrections to the spec's assumptions

- **JavaScript, not TypeScript** (AGENTS.md mandate). Files are `.js` / `.jsx`.
- `lib/morse.js` (TABLE + REVERSE, decode-by-pattern via REVERSE) and `lib/audio.js` (sidetone, 5 ms ramps, master-gain mute) already exist — extended, not duplicated.
- Palette hexes in the spec are approximations; the CSS tokens in `app/globals.css` are the truth (`--surface` is the panel colour, etc.). Reused, never redeclared.
- Styling values live as tokens per project rules (`--scope-h`, `--lamp-w`, …).

## Decisions made with the owner (2026-08-20)

1. **Detection is adaptive, seeded from WPM.** Thresholds start at the spec's tolerant formulas (`ditMax = 2u`, `charGap = max(4u, 350)`, `wordGap = max(9u, 900)` with `u = 1200/wpm`), then `u` is re-estimated from the user's own recent presses (min-cluster estimate over the last 8 presses ≥30 ms, geometric-mid split, clamped to 0.5–3× the seed). One early misread for a much-slower fist is acceptable; after the first dit/dah pair it locks on. `setWpm` re-seeds and clears history. Grid, window and the UNIT label stay WPM-based.
2. **WHAT YOU SENT has copy + clear buttons** (Translate's icon-button style). Clear resets the keyer, marks, readout and analytics session.

## Everything else — per the owner's spec

Live oscilloscope on canvas (x = real elapsed time, write head at the right edge, marks rise from a baseline to ~42% height, static ruler grid every 3 units, 42-unit window, rAF pauses when idle); tolerant keying with `element`/`character`/`word` events from a pure `lib/keyer.js`; one persistent oscillator gated by a GainNode (no per-press oscillators); lamp panel as visual sidetone (not a button); readout band with `/` separators (live pending pattern appended); status `— IDLE — / — SENDING — / — KEYED ·− —` with `UNIT n MS`, mute and expand in the scope's chrome row; fullscreen = whole viewport is the key (Fullscreen API where supported, always the fixed `100dvh` CSS layer, iOS-safe), 400 ms letter reveal falling into the readout (skipped under reduced motion), exit affordance fades after 2 s, Escape exits; spacebar (no auto-repeat, preventDefault, ignored when an interactive element has focus) + pointer keying; `pointercancel`/`blur`/tab-hidden = key-up; `touch-action: none`, `overscroll-behavior: none`, no text selection on key surfaces; mobile stack with lamp at ~90px and scope clamped ~30vh; analytics `free_keyed` (first character), `characters_sent` + `session_duration` (mode: free) on clear/leave.

## Structure

```
lib/keyer.js                pure timing state machine + adaptive estimate (tests)
lib/audio.js                keyDown/keyUp become gate-on-persistent-oscillator (tests updated)
hooks/useKeyer.js           wires keyer ⇄ pointer/keyboard/audio/analytics; owns marks ref
components/free/Scope.jsx   canvas oscilloscope + chrome row + readout band
components/free/LampPanel.jsx
components/free/SentPanel.jsx
components/free/FullscreenKey.jsx
app/free/page.js            assembly (client); app/free/layout.js carries metadata
```

## Acceptance (owner's list, unchanged)

1. `····` fast vs slow → visibly different spacing. 2. WPM change live-rescales grid/window/thresholds, no remount. 3. Sloppy timing decodes; hesitation shows as a gap. 4. Fullscreen works on iOS Safari via fallback. 5. No audible clicks. 6. Alt-tab mid-press leaves no open mark. 7. Nothing scrolls/zooms while keying on a phone.
