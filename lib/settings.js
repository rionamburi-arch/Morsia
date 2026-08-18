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
