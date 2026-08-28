---
name: Morsia
description: A dark-panel instrument for reading Morse as time, where bar width is duration.
colors:
  carbon-black: "#1D201F"
  panel-carbon: "#262A29"
  charcoal: "#575761"
  papaya-whip: "#FDF0D5"
  muted-charcoal: "#9A9AA4"
  bubblegum-tint: "#FF82A9"
  cool-sky: "#77B6EA"
  on-accent: "#1D201F"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "34px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.12em"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.2em"
  code:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.06em"
rounded:
  xs: "2px"
  sm: "7px"
  md: "11px"
  lg: "20px"
  xl: "24px"
  pill: "999px"
spacing:
  unit: "22px"
  xs: "6px"
  sm: "9px"
  md: "14px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.bubblegum-tint}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "11px 20px 11px 17px"
  button-primary-hover:
    backgroundColor: "#FF9AB8"
    textColor: "{colors.on-accent}"
  button-transport:
    backgroundColor: "transparent"
    textColor: "{colors.muted-charcoal}"
    rounded: "14px"
    padding: "8px 6px"
    width: "72px"
  button-transport-active:
    backgroundColor: "rgb(119 182 234 / 0.14)"
    textColor: "{colors.cool-sky}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.muted-charcoal}"
    rounded: "{rounded.sm}"
    size: "28px"
  button-icon-hover:
    textColor: "{colors.cool-sky}"
  chip-filter:
    backgroundColor: "transparent"
    textColor: "{colors.muted-charcoal}"
    rounded: "{rounded.pill}"
    padding: "6px 13px"
  chip-filter-selected:
    backgroundColor: "{colors.bubblegum-tint}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "6px 13px"
  panel:
    backgroundColor: "{colors.panel-carbon}"
    textColor: "{colors.papaya-whip}"
    rounded: "{rounded.lg}"
    padding: "20px 24px 16px"
  content-panel:
    backgroundColor: "{colors.panel-carbon}"
    textColor: "{colors.papaya-whip}"
    rounded: "{rounded.xl}"
    padding: "26px 30px 30px"
    width: "596px"
  input-search:
    backgroundColor: "{colors.panel-carbon}"
    textColor: "{colors.papaya-whip}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "{colors.muted-charcoal}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
  nav-tab-active:
    backgroundColor: "{colors.cool-sky}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
---

# Design System: Morsia

## Overview

**Creative North Star: "The Bench Instrument"**

Morsia is drawn as a piece of lab equipment, not as a web page. The reference is
a signal generator or a bench oscilloscope: a dark chassis, panels milled into
it, a readout that is the point of the object, and a small number of coloured
indicators that mean something specific. Nothing here is decorative. Every
colour, every glow and every label is reporting a state.

This matters because the product's whole claim is that Morse is time, not
notation. **Every character is drawn as proportional bars whose on-screen width
equals their duration.** A dah is exactly three times the width of a dit,
because it is exactly three times as long. The gaps are drawn to scale too, so a
seven-unit word gap is visibly seven units of silence. The interface is a
measuring instrument pointed at a rhythm, and it earns the instrument look by
actually being one — `Scope.jsx` computes `pxPerMs = --unit / unitMs(wpm)` and
draws from that single ratio.

The system is flat and dark. Depth comes from tonal layering — a lighter panel
lifted off a darker ground by one hairline border — never from drop shadows.
The one exception is glow, which is not decoration but the readout: a bar
blooms pink at the exact moment it is sounding. Type is quiet and functional,
with monospace reserved for anything the machine is reporting and a humanist
sans for anything a person wrote.

**Key Characteristics:**
- Width equals duration, everywhere, without exception
- Dark chassis, lifted panels, hairline borders, no drop shadows
- Two accent colours with strictly separated jobs, never on the same element
- Monospace eyebrow labels with a leading dot, letterspaced and small
- Generous corner radii (20–24px) on panels, full pills on controls
- Glow used only as a live state readout, and only in pink

## Colors

A dark instrument palette: a near-black carbon ground, a warm off-white for
everything that carries content, and exactly two saturated accents that are
never allowed to blur into each other.

### Primary
- **Bubblegum Tint** (`#FF82A9`): transmission. This is the "sounding right now"
  colour and nothing else. It fills the Play button, lights the bar currently
  being played, draws the oscilloscope trace, and marks a selected chart filter.
  If something is emitting, it is pink.

### Secondary
- **Cool Sky** (`#77B6EA`): state and information. The active nav pill, panel
  eyebrow labels, the swap control, the text caret, slider accents and every
  focus ring. It says "this is where you are" or "you can touch this" — it
  never says "activate".

### Neutral
- **Carbon Black** (`#1D201F`): the page ground, and the text colour placed on
  top of either accent (`on-accent`). The chassis.
- **Panel Carbon** (`#262A29`): every lifted surface — translate panels, chart
  cards, the nav rail, popovers, the content column. Exactly one step up from
  the ground.
- **Papaya Whip** (`#FDF0D5`): primary content. All body-weight text at full
  emphasis, and the resting colour of every Morse bar. The warmth is
  deliberate; a pure white would read as a screen, not a panel.
- **Charcoal** (`#575761`): borders and dividers **only**. It is a line colour,
  never a text colour.
- **Muted Charcoal** (`#9A9AA4`): secondary text — prose, labels, counts,
  inactive controls. This is the colour most running text actually uses.

### Named Rules

**The Separation Rule.** Pink and blue never appear on the same element. Pink is
transmission; blue is state and interaction. An element that is both sounding
and selected resolves to pink, because what it is doing outranks where it is.

**The Line-Colour Rule.** Charcoal (`#575761`) draws lines and nothing else.
Muted text is Muted Charcoal (`#9A9AA4`), a full step lighter. Setting text in
the border colour is the fastest way to make this interface look broken.

**The Channel Rule.** Every translucent value derives from a `--*-rgb` channel
triple of a palette colour (`rgb(var(--border-rgb) / 0.55)`). No alpha variant
is ever hand-mixed, so re-tinting the palette re-tints every derived line, fill
and glow with it.

## Typography

**Display / Body Font:** Archivo (with `sans-serif`)
**Label / Code Font:** IBM Plex Mono (with `monospace`)

**Character:** Archivo is a grotesque with enough width to stay legible small
and enough personality to carry a 34px editor. IBM Plex Mono is the machine's
voice. The split is strict and semantic: **the sans is for what a person wrote,
the mono is for what the instrument is reporting.** Plain text is set in
Archivo; the Morse rendering of it is set in Plex Mono. Reading the two panels
side by side, the typeface itself tells you which side is human.

### Hierarchy
- **Display** (500, 34px, 1.3, -0.015em): the plain-text editor when it holds
  focus. Drops to 24px when the Morse side becomes primary.
- **Headline** (600, 24px, -0.02em): section headings in long-form content.
- **Title** (600, 18px, +0.12em): the current word above the rhythm strip. The
  positive tracking is doing timing work — it makes a word read as separated
  characters, matching the bars beneath it.
- **Body** (400, 15px, 1.7): all prose, set in Muted Charcoal. The content
  column is capped at 596px, which measures roughly 68 characters.
- **Label** (700, 10–12px, +0.14em to +0.2em, uppercase, mono): eyebrows,
  transport captions, chart filters, readouts.
- **Code** (400, 21–28px, +0.06em, mono): the Morse editor. Wider tracking than
  ordinary mono because the gaps between groups carry meaning.

### Named Rules

**The Two Voices Rule.** Archivo for what a human wrote, IBM Plex Mono for what
the machine reports. A monospace label on human content, or a sans label on a
readout, breaks the instrument fiction.

**The Eyebrow Rule.** Every panel is introduced by a 5px Cool Sky dot followed
by a mono, 700-weight, `0.2em`-tracked uppercase label in the same blue. It is
the single most repeated device in the system. The dot is `aria-hidden`; it is
punctuation, not content.

**The Tracking-Is-Timing Rule.** Letterspacing is positive and generous on
anything representing Morse or a machine state (`0.06em` to `0.2em`) and
negative on human display type (`-0.015em` to `-0.03em`). Tight type is a
person talking; loose type is a signal.

## Layout

A single centred column, `max-width: 1240px`, padded `26px 32px 56px`, with a
24px stack gap between the header and the page body. There is no sidebar and no
multi-column page chrome anywhere in the product.

**The rhythm strip is the exception that defines the system.** Its horizontal
axis is time, not layout. One Morse unit is `--unit: 22px`, and bars and gaps
are exact integer multiples of it (dit 1, dah 3, gaps 1 / 3 / 7). It scrolls
horizontally and independently of the page, on a spacer box carrying the full
timeline width, with the canvases in a sticky layer. The chart re-states the
same grammar at a smaller scale (`--chart-bar-unit: 6px`) and the teaching
diagrams at a middle one (`--diagram-unit: 10px`). Three sizes, one grammar.

Translate splits 60/40 between the primary and secondary panel, with minimum
widths of 320px and 260px, and the panels reverse order when the direction
swaps. Long-form content narrows to `--measure: 596px` and is centred.

Responsive behaviour is breakpoint-driven and specific rather than fluid:
- **900px / 560px** — the chart grid steps 6 → 4 → 3 columns (wide cards 3 → 2 → 1).
- **720px** — nav pills lose their 106px minimum and shrink to 12px type; the
  wordmark drops to 21px.
- **520px** — the header badge is removed outright.
- The nav rail scrolls horizontally with hidden scrollbars and auto-centres the
  active pill, because four pills must never wrap at 375px.
- The header reserves `min-height` (46px, 52px above 720px) so the webfont swap
  cannot shift the page beneath it.

Long-form content is deliberately **identical at every breakpoint** — one
column that was already the width of its measure, so mobile is the same layout
rather than a reflow.

### Named Rules

**The Integer-Unit Rule.** Anything representing Morse is an exact multiple of
its unit token. Never a fraction, never an eyeballed value. Width is duration,
so an arbitrary width is a lie about time.

## Elevation & Depth

**This system has no drop shadows.** Depth is tonal: Panel Carbon (`#262A29`)
sits one step above Carbon Black (`#1D201F`), and a single hairline border
separates them. That border does all the lifting a shadow would.

The one true drop shadow in the codebase belongs to the consent banner
(`0 12px 40px rgb(0 0 0 / 0.35)`), which is genuinely floating over the page
rather than set into it. Treat it as the documented exception, not a licence.

Glow is the system's only other depth effect, and it is a **readout, not a
material**. The sounding bar carries a two-stage pink bloom (`--bar-glow-outer:
46px`, `--bar-glow-inner: 12px`) and the strip sits in a faint pink wash
(`--strip-bloom`, 12% signal). Free Mode's key pad lamps in Papaya Whip
(`--lamp-glow: 0 0 28px rgb(var(--ink-rgb) / 0.45)`) while held.

### Named Rules

**The Glow-Means-Live Rule.** Glow appears only where something is happening
right now, and outside Free Mode's lamp it is always pink. A glow on a resting
element is a false reading.

**The Flat-Chassis Rule.** Surfaces are flat. Lift comes from one tonal step
plus one hairline border. Reach for a shadow and you have left the instrument.

## Shapes

Rounded, but not soft. The radius scale is wide and its steps are meaningful:

- **2px** (`--chart-bar-radius`) — chart bars, logo blocks. Nearly square, so a
  6px-wide dit still reads as a measured block.
- **7px** (`--bar-radius`) — the rhythm strip's bars.
- **9–11px** — small icon buttons.
- **14–18px** — transport buttons, popovers, inset figures.
- **20–24px** — panels, cards, the content column. The system's signature.
- **999px** — every pill: nav tabs, Play, chart filters, the search field, the
  header badge.

Borders are always exactly `1px`, in Charcoal at full strength for panel edges
or at `0.55` alpha (`--border-soft`) for quieter outlines. There are no 2px
borders and no dashed or dotted strokes anywhere.

The recurring silhouette is **a rounded panel on a dark ground with a hairline
edge**, restated at every scale from a 28px icon button to the 596px content
column.

### Named Rules

**The Pill-Or-Panel Rule.** Interactive controls are pills (`999px`). Content
containers are 20–24px panels. A 999px content card or a 20px nav tab reads as
a mistake in this system.

## Components

### Buttons

- **Shape:** full pill (999px) for primary actions; 14px rounded rect for
  transport controls; 9–11px squares for icon buttons.
- **Primary (Play):** Bubblegum Tint fill, Carbon Black text, mono 12px 700 at
  `0.1em`, padding `11px 20px 11px 17px`, asymmetric to balance the leading
  icon. No border. Hover lightens the fill (`--signal-bright`, 86% signal mixed
  with white).
- **Transport:** 72px-wide column, icon above a 9px mono `0.14em` caption,
  transparent at rest with Muted Charcoal content. Active state fills with 14%
  Cool Sky and turns the content blue. Transitions `180ms`.
- **Icon:** 28px square, 9px radius, transparent, 1px Charcoal border, Muted
  Charcoal glyph. Hover moves both glyph and border to Cool Sky.
- **Focus:** a global `2px` Cool Sky outline at `3px` offset, on `:focus-visible`
  only.
- **Distinctive behaviour:** buttons and nav tabs call `preventDefault()` on
  `pointerdown` so a mouse click never leaves focus behind — otherwise Free
  Mode's spacebar would paint a focus ring on the last thing clicked.
  Keyboard focus is unaffected.

### Chips (chart filters)

- **Style:** pill, `6px 13px`, mono 10px uppercase at `0.14em`.
- **Unselected:** transparent, 1px Charcoal border, Muted Charcoal text.
- **Selected:** Bubblegum Tint fill and border, Carbon Black text.

### Cards / Containers

- **Corner style:** 20px for translate panels and Free Mode panels; 24px for
  chart cards and the content column.
- **Background:** Panel Carbon. **Border:** 1px Charcoal (`--border-soft` where
  the edge should recede). **Shadow:** none — see Elevation & Depth.
- **Internal padding:** `20px 24px 16px` for translate panels, `26px 30px 30px`
  for the content column, tightening to `22px 20px 24px` below 560px.
- **Header:** every panel opens with the eyebrow — 5px Cool Sky dot, 9px gap,
  mono 12px 700 `0.2em` uppercase label in Cool Sky.

### Inputs / Fields

- **Editors:** borderless and background-less, sitting directly inside the
  panel. `resize: none`, `min-height: 116px`.
- **Focus:** deliberately **no ring on the editors** (owner's call) — the Cool
  Sky caret is the focus indicator. Buttons and links keep their rings.
- **Placeholder:** Muted Charcoal at 55%.
- **Selection:** Cool Sky at 30%.
- **Search:** the exception — a pill field with a Panel Carbon fill and a 1px
  Charcoal border.

### Navigation

- **Style:** four pills in a Panel Carbon rail (999px, 5px padding, `--border-soft`).
- **Active:** an absolutely-positioned Cool Sky pill that slides between tabs on
  `transform` over `380ms cubic-bezier(0.22,1,0.36,1)`. The tab itself only
  transitions colour (220ms) from Muted Charcoal to Carbon Black.
- **Mobile:** the rail scrolls horizontally with hidden scrollbars and centres
  the active pill on route change.

### The Rhythm Strip (signature component)

The product's reason to exist, and the component every other decision serves.

- Two stacked canvases sized to the **visible viewport**, never the whole
  message — a long message would blow past the browser's canvas size limit. A
  spacer box carries the full timeline width so the wrapper scrolls natively
  while the canvases sit in a sticky layer and draw translated by `-scrollLeft`.
- **Static layer:** baseline, unit graticule, resting bars in Papaya Whip,
  letter labels at 11px with `0.12em` tracking.
- **Dynamic layer:** the sounding bar and the playhead, on `requestAnimationFrame`
  only while playing.
- Bars are `--bar-h: 78px`, `7px` radius, sitting on an 85%-alpha Charcoal
  baseline with `6px` of headroom for the glow.
- The sounding bar is Bubblegum Tint with a 70%-alpha outer bloom and a
  55%-alpha core; the playhead is Papaya Whip at 75%.
- **Tokens are read once** — on mount, resize, DPR change and motion-preference
  change — via `readTokens()`, and never inside the animation loop.

### Oscilloscope (signature component, Free Mode)

A live pink trace (`--wave`, 95% signal) with a 30%-alpha ghost of the previous
pass behind it, both carrying their own glow values. Height is
`clamp(200px, 30vh, 340px)` so the surrounding panels stay visible while keying.
The key pad is a 120px circle that lamps Papaya Whip while held.

## Do's and Don'ts

### Do:
- **Do** derive every Morse dimension from its unit token — `--unit` (22px) on
  the strip, `--chart-bar-unit` (6px) on the chart, `--diagram-unit` (10px) in
  diagrams — as exact integer multiples.
- **Do** introduce every panel with the eyebrow: 5px Cool Sky dot, 9px gap, mono
  12px 700 `0.2em` uppercase Cool Sky label.
- **Do** set human-written content in Archivo and machine-reported content in
  IBM Plex Mono.
- **Do** build translucency from the `--*-rgb` channel triples so alpha variants
  stay tied to the palette.
- **Do** lift surfaces with one tonal step plus one 1px hairline border.
- **Do** reserve Bubblegum Tint for transmission and Cool Sky for state,
  interaction and focus.
- **Do** read canvas tokens once per mount/resize via `readTokens()`.
- **Do** keep the content column at `--measure` (596px) and identical across
  breakpoints.

### Don't:
- **Don't** set text in Charcoal (`#575761`). It is a line colour. Muted text is
  `#9A9AA4`.
- **Don't** put pink and blue on the same element.
- **Don't** add drop shadows. The consent banner is the one documented exception.
- **Don't** glow anything that is not live right now.
- **Don't** use pure black or pure white — the ground is warm-tinted carbon and
  the ink is Papaya Whip.
- **Don't** draw a Morse element at an arbitrary width. Width is duration; an
  eyeballed width is a false reading.
- **Don't** add a focus ring to the editors — the Cool Sky caret is the
  indicator, by owner's decision.
- **Don't** let the four nav pills wrap; the rail scrolls instead.
- **Don't** introduce a third accent colour. Two accents with separated jobs is
  the system.
