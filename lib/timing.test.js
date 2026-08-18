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
