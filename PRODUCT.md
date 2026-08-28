# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curious hobbyists — people who became interested in Morse code and went
looking for a way to try it. They arrive from search, usually on a phone or a
laptop, with no equipment, no callsign and no intention of getting one. They
are experimenting first and learning second.

Explicitly **not** the primary audience: licensed amateur radio operators and
other Morse professionals. Their needs (contest speeds, real keyers, QSO
practice) may overlap incidentally but never set direction.

## Product Purpose

Morsia is a Morse code translator, chart and practice tool at morsia.app.

It exists because the search results for "learn Morse code" are poor. The good
Morse tools are effectively invisible, and the tools that are easy to find are
bad. Morsia is an attempt to be both findable and good.

Success is someone arriving from a search result, experimenting with Morse
code, and eventually learning it — for fun.

## Positioning

**Every character is drawn as proportional bars: on-screen width equals
duration in time.** A dah is literally three times the width of a dit, and the
gaps are drawn to scale as well. Morse is a rhythm, and the interface shows the
rhythm rather than transliterating it into dots and dashes. No competing tool
does this.

The mechanism holds because one constant governs everything: `UNIT_MS =
1200 / wpm`. Changing the speed rescales the drawn grid, the keying detection
thresholds and the audio playback together, from a single source. `toSegments()`
in `lib/timing.js` is that single timing source; `lib/wav.js` builds exports
from the same segments specifically so an export can never drift from what was
played or drawn.

## Operating Context

- Browser only. Desktop and mobile web, no install, no native app.
- Audio output is needed for the by-ear half of the product; the bars carry the
  same information visually when sound is off or unavailable.
- Free Mode is keyed with the spacebar on desktop and by tapping on touch. It
  uses safe-area insets for a fullscreen key, so it is genuinely meant to be
  used on a phone.
- Sessions are short and casual. Nothing is assigned, graded or resumed.
- Search is the main entry path, so pages must be complete and meaningful in
  their server-rendered HTML. `/chart` is force-static and works with
  JavaScript switched off.

## Capabilities and Constraints

Confirmed capabilities:

- **Translate (`/`)** — text ⇄ Morse both directions, played at any speed, with
  the rhythm drawn as proportional timing bars. WAV export. Share, which copies
  a `/m/<slug>` link.
- **Free Mode (`/free`)** — live oscilloscope keying practice. Detection is
  tolerant and *adaptive*: thresholds seed from the WPM setting, then the unit
  length is re-estimated from the user's own recent presses (owner decision,
  2026-08-20), so a slow or uneven fist still decodes. The drawn grid stays
  WPM-based; only detection follows the user.
- **Chart (`/chart`)** — all 61 characters as bar patterns: 26 letters, 10
  digits, 18 punctuation marks and 7 prosigns. Click any character to hear it.
  Search included.
- **Learn (`/learn`)** — not built. Ships as a placeholder that redirects
  attention to the chart and Free Mode.
- Speed 5–40 WPM, tone 300–1000 Hz, defaults 18 WPM / 620 Hz. Farnsworth
  timing is implemented (`effWpm`, capped at `wpm`): character speed and
  overall speed are separate, which is the standard way to learn by ear.
- Settings persist in `localStorage` only.
- Prosigns decode when keyed in Free Mode.

Technical state — **explicitly not committed** (owner, 2026-08-28). The app
today is free, client-only, has no accounts and no paid tier, but none of that
is a durable constraint. Future work may propose a backend, accounts or
monetisation without contradicting this record.

- Next.js 16 App Router, React 19, JavaScript (not TypeScript), Tailwind v4.
- Deployed on Vercel. Canonical host is the apex `morsia.app`; `www` 308s to it.
- Analytics (Vercel Analytics, Speed Insights, Microsoft Clarity) sit behind
  env and consent gates with a per-device opt-out at `/optout`.

Known defect, recorded not fixed: **Share copies a `/m/<slug>` URL but no
`/m/[slug]` route exists in `app/`, so shared links 404.** `lib/slug.js` is
written and tested; the route that consumes it was never added.

Terminology: dit and dah (not dot and dash) for the elements; *element*,
*character*, *word* for the three gap lengths; *fist* for an individual's
keying rhythm; *prosign* for the procedural signals.

## Brand Commitments

- Name: **Morsia**. Domain: morsia.app. (The design export in `design/cadence/`
  is still named "Cadence" upstream; that is the mockup's name, not the
  product's.)
- Voice, as currently written: plain, concrete, mildly dry, and confident
  without selling. It states what a thing is and moves on ("these two teach the
  same thing"). It does not use hype, exclamation or second-person coaching.
- **Not binding** (owner, 2026-08-28). The above describes the incumbent copy
  and is a reasonable starting point, but future work may adjust the voice. It
  is not a rule to obey.

## Evidence on Hand

Real, in-repo:

- The shipped application itself — the strongest evidence, and the only
  demonstration the product needs.
- `design/cadence/` — reference export of the Claude Design mockup the UI was
  ported from.
- `docs/superpowers/` — specs and plans (translate slice, Free Mode).
- Full unit test coverage over `lib/` (`node --test`).

Absent — future work must not fabricate these: no testimonials, no user
quotes, no named users, no traffic or ranking figures, no press coverage, no
case studies, no awards, no partner or integration claims, no user counts.

## Product Principles

1. **Findability is the product problem.** The tool being good is necessary and
   insufficient; being invisible is the failure mode Morsia exists to fix.
   Current priority is traffic, not features (owner, 2026-08-28).
2. **Show the rhythm, don't transliterate it.** Proportional bars are the
   differentiator. Any surface that reduces Morse to dot-and-dash text is
   giving away the only thing Morsia has.
3. **One timing source.** Everything derives from `UNIT_MS = 1200 / wpm`.
   Drawing, detection and audio must never acquire independent notions of time.
4. **Experiment before instruct.** The visitor gets to make Morse happen within
   seconds of arriving. Lessons, structure and progression come after curiosity,
   never in front of it.
5. **Hobbyist, not operator.** When a decision would serve a licensed operator
   at the expense of a curious beginner, it serves the beginner.

## Accessibility & Inclusion

No named standard and no product-specific requirement (owner, 2026-08-28).
General good practice is expected — contrast, visible focus, labelled controls,
reduced-motion support — but future work is not audited against WCAG or any
other stated conformance target. If that changes, record it here.

Worth knowing rather than requiring: the proportional bars already give the
audio content a visual form, so the differentiator and the access story happen
to be the same mechanism.
