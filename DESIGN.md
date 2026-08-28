---
name: Morsia
description: An instrument's reference chart for Morse — a ruled field where width is duration and one amber marks the live measure.
colors:
  ground: "#0C0E0F"
  field: "#121618"
  field-2: "#171D1F"
  g1: "#1B2123"
  g2: "#293134"
  g3: "#3C4649"
  g4: "#566266"
  g5: "#7C888C"
  g6: "#A7B2B5"
  g7: "#DCE3E4"
  reference: "#E8A33C"
  reference-hover: "#F2B457"
  on-reference: "#17120A"
  alert: "#E2482F"
typography:
  display:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.018em"
  subtitle:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  body-small:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  readout-lg:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
    fontFeature: "tabular-nums"
  readout:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
    fontFeature: "tabular-nums"
  label:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.14em"
  scale-numeral:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
rounded:
  square: "0px"
  control: "2px"
spacing:
  hair: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "26px"
  column-x: "28px"
  unit: "22px"
  chart-unit: "6px"
  diagram-unit: "10px"
  measure: "604px"
components:
  button-primary:
    backgroundColor: "{colors.reference}"
    textColor: "{colors.on-reference}"
    typography: "{typography.readout}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.reference-hover}"
    textColor: "{colors.on-reference}"
  button-primary-disabled:
    backgroundColor: "{colors.g2}"
    textColor: "{colors.g4}"
  button-default:
    backgroundColor: "transparent"
    textColor: "{colors.g6}"
    typography: "{typography.readout}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-default-hover:
    backgroundColor: "{colors.field-2}"
    textColor: "{colors.g7}"
  button-default-engaged:
    backgroundColor: "{colors.g2}"
    textColor: "{colors.g7}"
  tool-button:
    backgroundColor: "transparent"
    textColor: "{colors.g5}"
    rounded: "{rounded.control}"
    padding: "8px 4px"
    width: "66px"
  tool-button-engaged:
    backgroundColor: "{colors.g2}"
    textColor: "{colors.g7}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.g5}"
    rounded: "{rounded.control}"
    height: "30px"
    width: "30px"
  field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.g7}"
    rounded: "{rounded.square}"
    padding: "0"
  field-head:
    backgroundColor: "{colors.field}"
    textColor: "{colors.g5}"
    typography: "{typography.label}"
    padding: "10px 14px"
  editor-textarea:
    backgroundColor: "transparent"
    textColor: "{colors.g7}"
    rounded: "{rounded.square}"
    padding: "14px 14px 0"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "{colors.g5}"
    typography: "{typography.readout}"
    rounded: "{rounded.square}"
    padding: "10px 18px 12px"
  nav-tab-current:
    textColor: "{colors.g7}"
---

# Design System: Morsia

## Overview

**Creative North Star: "The Calibration Chart"**

Morsia is drawn as an instrument's reference chart rather than as an app. Morse is a
measurement — a dah is exactly three dits, and every duration in the product derives
from one constant — so the interface is a ruled measuring field with a printed unit
scale, hard-edged blocks sitting on a baseline, and a registration gate that rides the
scale while the message plays. Nothing glows, nothing floats, nothing is rounded off.
The screen is a surface you take a reading from.

The field is near-black (`#0C0E0F`) and the only neutral ramp is a seven-step grey
wedge that the product prints on its own chart page rather than keeping as a private
convention. Colour is rationed to two jobs: one tungsten amber for the value being
measured right now, one red for a value out of range. Every other distinction —
selection, engagement, hover, hierarchy — is made with a step of the wedge and a
hairline rule. Depth is one tonal step plus a 1px rule; there are no cards and no
shadows.

Two voices carry the content. Chivo sets what a person wrote; Martian Mono, with
tabular figures, sets everything the machine reports — units, milliseconds, WPM, Hz,
scale numerals and the Morse itself. The result is dense, quiet and technical without
being cold: a workhorse grotesque keeps the instrument from reading as clinical.

**Key Characteristics:**
- Near-black field with a seven-step calibrated grey wedge as the only neutral ramp
- One accent (tungsten amber) reserved for live measurement; one red for out of range
- Square corners everywhere; 2px only on pressable controls
- Hairline rules and one tonal step in place of cards, borders-with-radius and shadows
- Anything representing Morse is an exact integer multiple of its unit token
- Chivo for human text, Martian Mono with tabular figures for every measured value

## Colors

A near-black instrument field, one calibrated grey ramp, and exactly two chromatic
signals — both of which mean something.

### Primary
- **Tungsten Amber** (`{colors.reference}`): the value being measured right now. The
  sounding block on the strip, the registration gate, the live oscilloscope trace, the
  lit key pad, the live WPM/Hz pip in the header, the focus ring and caret, the range
  slider's accent, and the Play button that starts a measurement. Its hover is a
  single lighter step (`{colors.reference-hover}`); text on top of it is a near-black
  amber-shifted ink (`{colors.on-reference}`), never pure white. Dimmed forms
  (20% fill, 45% line) mark a keyed-down region on the Free Mode scope.

### Secondary
- **Signal Red** (`{colors.alert}`): out of range, and nothing else. Characters with no
  Morse equivalent in the editor footer, and errors. Never decorative, never a brand
  colour, never used for emphasis.

### Neutral
- **Ground** (`{colors.ground}`): the instrument's dark field; the page background.
- **Field** (`{colors.field}`): a measuring field — one step up from ground, the
  background of every ruled region, editor, popover, key and chart cell.
- **Field Well** (`{colors.field-2}`): inset wells and row hover.
- **Step 1–2** (`{colors.g1}`, `{colors.g2}`): the darkest wedge steps. `g2` is the
  hairline rule colour and the engaged-control fill.
- **Step 3** (`{colors.g3}`): strong hairlines, dividers, scrollbar thumb, baseline.
- **Step 4** (`{colors.g4}`): tick marks, minor graticule, hover borders, link underlines.
- **Step 5** (`{colors.g5}`): the lightest line colour and the darkest text colour —
  labels, readouts, scale numerals, major graticule.
- **Step 6** (`{colors.g6}`): running prose and default control text.
- **Step 7** (`{colors.g7}`): primary text, headings, resting Morse blocks. This is
  data ink.

### Named Rules

**The Wedge Rule.** Every neutral in the product is one of the seven calibrated steps
`g1`–`g7`. `g4` and below are line, tick and fill colours only; text is `g5` or above.
The working hierarchy is `g7` for values and headings, `g6` for prose, `g5` for labels
and readouts. No off-ramp greys, no `rgba(255,255,255,0.6)`, no new mid-tone.

**The Live-Measure Rule.** Amber marks a live measurement and the action that starts
one — and nothing else. Selection, engaged state, current tab, hover and emphasis are
all marked with the wedge. This is the system's most easily broken rule: it was
violated in the first build and corrected. If a thing is not being measured at this
instant, it is grey.

**The Out-of-Range Rule.** Red means a value the instrument cannot read. Unsupported
characters and errors. If it is not an error, it is not red.

## Typography

**Display / Body Font:** Chivo (with `system-ui`, `sans-serif`)
**Label / Mono Font:** Martian Mono (with `ui-monospace`, `monospace`)

**Character:** A workhorse grotesque with enough warmth to keep a measuring instrument
from reading as clinical, paired with a wide, engineered mono that is unmistakably a
readout. Headings are tightly tracked (−0.015em to −0.025em) and set at 600; readouts
are widely tracked (0.02em–0.14em), uppercased, and always tabular.

### Hierarchy
- **Display** (600, 30px, 1.2, −0.02em): the page title on a full section page (`/chart`).
- **Headline** (600, 26px, 1.2, −0.025em): the long-form section heads under the tool.
- **Title** (600, 21px, 1.25, −0.018em): a mode's own heading (Free Mode), sub-section heads.
- **Subtitle** (600, 17px, 1.3, −0.015em): chart section heads and prose sub-heads.
- **Body** (400, 15px, 1.7): running prose in step 6, capped at the measure (604px, ~68 characters).
- **Body Small** (400, 14px, 1.6): standfirsts and captions under a heading.
- **Readout Large** (mono 500, 13px, 0.01em, tabular): toast text, decoded output, slider values.
- **Readout** (mono 500, 11px, 0.02em, uppercase, tabular): every measured value —
  ms/unit, seconds, WPM, Hz — plus button and nav-tab captions (0.1em).
- **Label** (mono 500, 10px, 0.14em, uppercase, step 5): a region name set into a rule.
- **Scale Numeral** (mono, 9px, tabular): the printed unit numerals on the measuring field.

### Named Rules

**The Two Voices Rule.** Chivo sets what a person wrote; Martian Mono sets what the
machine reports. Units, milliseconds, WPM, Hz, dot-dash notation, scale numerals,
control captions and region labels are all mono. Prose and headings never are.

**The Tabular Readout Rule.** Every mono readout carries
`font-variant-numeric: tabular-nums`, so a value that changes while playing never
reflows the row it sits in.

## Layout

One centred column at 1180px max, padded `22px 28px 72px` with a 26px gap between
regions; at 560px and below this tightens to `16px 16px 56px` with a 20px gap. Long-form
prose narrows further to the measure (604px, ~68 characters of Chivo at 15px) and stays
at that width at every breakpoint — it is a ruled region with rules above and between
its items, not a card.

The spacing rhythm is 4 / 8 / 12 / 18 / 26px, with 10–16px of internal padding on ruled
heads and control rows. Measured objects do not use this rhythm at all: they are sized in
unit tokens (see the Unit-Multiple Rule).

The chart is a hairline lattice — a grid whose 1px gaps sit on a rule-coloured background
so the cell borders are the grid's own rules, never gaps. It steps 6 → 4 (900px) → 3
(560px) → 2 (460px) columns; the 460px step exists because the digit 0 is five dahs and
overflows a third of the column below that width.

**Breakpoints in use:** 900px (chart columns), 860px (the scale key becomes a
fixed-swatch-column grid so its specimens keep a common left origin), 720px (editors
stack full width with the swap control on the horizontal seam; nav tightens), 560px
(chart to 3 columns; the header drops its WPM/Hz readout, which the transport repeats),
460px (chart to 2 columns).

The header is styled entirely from the stylesheet. Inline styles outrank it and silently
disable every responsive rule, so header geometry never goes in JSX.

## Elevation & Depth

This system is flat. There are no cards, no glows and no drop shadows. Depth is exactly
two devices: one tonal step (ground → field → field well) and a 1px hairline rule. A
region is "raised" by being `field` inside `ground` with a `g2` border; it is "engaged"
by moving one more step to `g2` fill with a `g4` border.

### Shadow Vocabulary
- **Floating banner** (`box-shadow: 0 12px 40px rgb(0 0 0 / 0.35)`): the consent banner
  only. It is the one element that genuinely floats over the page, fixed above the
  content it does not block. Nothing else in the product may take a shadow.

### Named Rules

**The One Step and a Hairline Rule.** Any surface that needs to separate from what is
behind it gets one tonal step and a 1px rule — never a shadow, never a radius, never a
gradient. If two steps are needed to read the separation, the layout is wrong.

## Shapes

Corners are square (`{rounded.square}`). The one exception is `{rounded.control}` (2px)
on pressable objects — buttons, tool switches, icon buttons, the swap control, the
toast — so a thing you can press still reads as an object. Measured blocks, fields,
popovers, the key pad and every chart cell are hard 0.

Borders are always the hairline: `1px solid` in `g2` for a resting rule, `g3` for a
strong rule or control border, `g4` for hover and for tick strips. Dashed 1px in `g3`
marks an implied edge — a tinted gap in a teaching diagram, or the continuation marks at
the edges of a timeline that runs past the viewport. Icons are 1.7px stroke with square
caps and mitre joins, matching the drawing.

**The Unit-Multiple Rule.** Anything representing Morse is an exact integer multiple of
its unit token: `--unit` (22px) on the measuring strip, `--chart-bar-unit` (6px) on the
chart, `--diagram-unit` (10px) in teaching figures (7px for the inline variant). A dit is
1, a dah is 3, gaps are 1 / 3 / 7. Width is duration; an eyeballed width is a false
reading. Audit test: measure any two bars — the dah must be exactly three times the dit,
at every size the product draws.

## Components

### Buttons
- **Shape:** square with a 2px pressable radius (`{rounded.control}`), 1px border.
- **Primary:** amber fill and border, near-black amber ink, mono 11px/0.1em uppercase at
  700, `11px 18px`. Only Play and the two consent/opt-out confirmations use it — it is
  the control that starts a measurement.
- **Default:** transparent on a `g3` border, `g6` mono caption, `10px 16px`.
- **Hover:** `field-2` fill, `g4` border, `g7` text, 140ms linear.
- **Engaged:** `g2` fill with a `g4` border and `g7` text — never amber.
- **Disabled:** `g3` text on a `g2` border, transparent fill.
- **Focus:** a 2px amber outline at 2px offset with no radius, global on `:focus-visible`.

### Tool Switches (transport)
An icon over a 9px mono caption at 0.12em, 66px wide, in a column. Resting `g5`, hover
`field-2`, engaged `g2` fill with `g4` border. They are labelled switches on an
instrument and only mark when actually engaged.

### Ruled Fields (in place of cards)
- **Corner Style:** square (0).
- **Background:** `field` on `ground`.
- **Border:** 1px `g2`.
- **Shadow:** none — see Elevation & Depth.
- **Head:** a `10px 14px` row with a mono label at 10px/0.14em uppercase in `g5`, closed
  by a 1px bottom rule. The label names a region the way a technical drawing calls one
  out; it never sits above a heading.
- **Foot:** a mono 10px/0.1em uppercase count row above a 1px top rule.

### Inputs / Fields
Editors are borderless textareas inside the ruled field: transparent, no focus ring, and
an amber caret which is what marks focus. Primary editor sets 32px/500 Chivo, the
secondary 22px; the Morse editor sets 15–20px mono at 0.04em. Placeholders are `g5` at
full opacity. Range sliders are 4px tall with an amber accent. Error state is carried as
red text in the field's foot, not as a red border.

### Navigation
Mono 11px/0.1em uppercase tabs in `g5`, `10px 18px 12px`, on a shared 1px bottom rule.
Hover lifts to `g7`; the current tab is `g7` and is marked by a 2px `g7` block underline
that is measured from the real tab and moved by `scaleX` over 320ms
`cubic-bezier(0.16, 1, 0.3, 1)`. The row scrolls horizontally on narrow screens with the
scrollbar hidden; below 720px the tabs drop to 10px and tighten to `10px 12px 12px`.
The wordmark is itself a measured object: three blocks at 1 / 3 / 1 units on a rule — the
letter R, with the final dit in amber.

### The Measuring Field (signature)
The translate scope is the product's thesis made literal. A ruled field spans the column:
a printed unit scale across the top edge (a 1px rule with minor ticks every unit at 4px
and major ticks plus a mono numeral every five units at 8px), a graticule of 1px verticals
behind the blocks (`g4` minor, `g5` major) drawn at real contrast rather than hinted, a
`g3` baseline, and the message as square `g7` blocks 84px tall on that baseline. During
playback the sounding block fills amber and a registration gate rides the scale — a 1px
amber vertical with 7px crosshair caps above and below the field. When the timeline runs
past the viewport, dashed 1px continuation marks stand at the edges. The head of the
field states what is being measured on the left and the reading (`ms/unit`, seconds) on
the right.

### The Scale Key and Tone Wedge
The chart states its own scale above the fold — a dot, a dash and the gap between them at
`--diagram-unit`, each specimen on a common 34px left origin so they can be compared —
and prints the seven-step wedge itself as a real device at the page foot, in 34px
swatches. The system's ramp is on the page, not hidden in a stylesheet.

## Do's and Don'ts

### Do:
- **Do** take every grey from the wedge (`g1`–`g7`), keep `g4` and below for lines and
  ticks, and set text at `g5` or above.
- **Do** reserve amber (`{colors.reference}`) for a live measurement and the control that
  starts one, and mark selection, engagement and hover with a wedge step instead.
- **Do** size anything representing Morse as an exact integer multiple of its unit token
  (22px strip, 6px chart, 10px diagram): dit 1, dah 3, gaps 1 / 3 / 7.
- **Do** separate surfaces with one tonal step plus a 1px hairline rule.
- **Do** set every measured value in Martian Mono with `tabular-nums`, and everything a
  person wrote in Chivo.
- **Do** label a region with a mono 10px/0.14em uppercase label set into its head rule.
- **Do** put header and responsive geometry in the stylesheet; inline styles outrank it
  and silently disable breakpoints.
- **Do** cap long-form prose at the measure (604px) and rule it above and between.

### Don't:
- **Don't** put an eyebrow, kicker or dot-and-caps label above a heading. If a label is a
  section's only heading, make it a real `h1`/`h2`.
- **Don't** add a card, a drop shadow or a glow. The consent banner's
  `0 12px 40px rgb(0 0 0 / 0.35)` is the single documented exception because it genuinely
  floats.
- **Don't** round a corner. 2px on pressable controls; 0 everywhere else, and 0 on every
  measured block.
- **Don't** use amber for hover, for the current nav tab, for emphasis, or for a
  decorative dot on something that isn't live.
- **Don't** use red for anything except a value the instrument cannot read.
- **Don't** introduce a grey outside the wedge, including translucent whites.
- **Don't** eyeball a bar width or a gap; if it isn't a unit multiple it is a false reading.
