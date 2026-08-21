// Free Mode's timing state machine. Pure: timestamps in, events out.
// No DOM, no React, no audio.
//
// Detection is tolerant and ADAPTIVE (owner decision, 2026-08-20): thresholds
// seed from the WPM setting, then the unit length is re-estimated from the
// user's own recent presses so a slow or fast fist still decodes. The visible
// grid/window stay WPM-based — only detection follows the user.
//
// Events: { type: 'element', value: '.'|'-', ms }
//         { type: 'character', pattern, char }
//         { type: 'word' }

import { decodeKeyed } from './morse.js';

const HISTORY = 8;        // presses considered for the estimate
const MIN_EST_MS = 30;    // shorter presses key a dit but don't teach the estimate
const SPREAD = 2.4;       // max/min ratio before presses count as two clusters — ordinary dit wobble (~2x) must not
const CLAMP_LO = 0.5;     // × seed
const CLAMP_HI = 4;       // × seed — leaves room for a genuinely slow beginner fist
const CHAR_GAP_FLOOR_MS = 350;
const WORD_GAP_FLOOR_MS = 900;

export function createKeyer({ wpm = 18 } = {}) {
  let seed = 1200 / wpm;
  let unitEst = seed;
  let history = [];       // recent press durations, newest last

  let isDown = false;
  let downAt = 0;
  let lastUpAt = null;    // end of the last press, null until something was keyed
  let pattern = '';       // in-flight elements
  let awaitingWord = false; // a character was committed; one word break may follow

  function thresholds() {
    return {
      unitEst,
      ditMax: unitEst * 2,
      charGap: Math.max(unitEst * 4, CHAR_GAP_FLOOR_MS),
      wordGap: Math.max(unitEst * 9, WORD_GAP_FLOOR_MS),
    };
  }

  /** Re-estimate the unit from the min cluster of recent presses. */
  function adapt(dur) {
    if (dur < MIN_EST_MS) return;
    history.push(dur);
    if (history.length > HISTORY) history.shift();
    const min = Math.min(...history);
    const max = Math.max(...history);
    if (max / min < SPREAD) return; // one cluster only — keep the current estimate
    // Split off the MIN cluster (not the geometric midpoint): a single long
    // accidental hold must not drag dah durations into the "dits".
    const dits = history.filter((d) => d <= min * SPREAD);
    const mean = dits.reduce((a, b) => a + b, 0) / dits.length;
    unitEst = Math.min(seed * CLAMP_HI, Math.max(seed * CLAMP_LO, mean));
  }

  /** Commit whatever silence has earned by time t. Never runs while down. */
  function settle(t) {
    const out = [];
    if (lastUpAt == null) return out;
    const silence = t - lastUpAt;
    const th = thresholds();
    if (pattern && silence >= th.charGap) {
      out.push({ type: 'character', pattern, char: decodeKeyed(pattern) });
      pattern = '';
      awaitingWord = true;
    }
    if (awaitingWord && !pattern && silence >= th.wordGap) {
      out.push({ type: 'word' });
      awaitingWord = false;
    }
    return out;
  }

  function down(t) {
    if (isDown) return [];
    const out = settle(t);
    isDown = true;
    downAt = t;
    return out;
  }

  function up(t) {
    if (!isDown) return [];
    isDown = false;
    const ms = t - downAt;
    if (ms <= 0) return [];
    adapt(ms);
    const value = ms <= thresholds().ditMax ? '.' : '-';
    pattern += value;
    lastUpAt = t;
    return [{ type: 'element', value, ms }];
  }

  function tick(t) {
    if (isDown) return [];
    return settle(t);
  }

  function setWpm(w) {
    seed = 1200 / w;
    unitEst = seed;
    history = [];
  }

  function reset() {
    history = [];
    unitEst = seed;
    isDown = false;
    lastUpAt = null;
    pattern = '';
    awaitingWord = false;
  }

  return {
    down,
    up,
    tick,
    setWpm,
    reset,
    thresholds,
    pending: () => pattern,
    isDown: () => isDown,
  };
}
