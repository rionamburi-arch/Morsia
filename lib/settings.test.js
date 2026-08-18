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
