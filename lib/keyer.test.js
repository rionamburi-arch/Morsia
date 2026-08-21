import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createKeyer } from './keyer.js';

// Helper: send a press of `dur` ms starting at `t`, returning all events.
function press(k, t, dur) {
  return [...k.down(t), ...k.up(t + dur)];
}

// Helper: key a whole pattern like '-.-' at a given unit length, starting at t.
// Returns { events, t } where t is the time after the final up.
function key(k, t, pattern, unit) {
  const events = [];
  for (const el of pattern) {
    const dur = el === '-' ? 3 * unit : unit;
    events.push(...press(k, t, dur));
    t += dur + unit; // element gap
  }
  return { events, t };
}

const chars = (events) => events.filter((e) => e.type === 'character').map((e) => e.char).join('');
const els = (events) => events.filter((e) => e.type === 'element').map((e) => e.value).join('');

test('thresholds seed from wpm with the tolerant formulas', () => {
  const k = createKeyer({ wpm: 18 });
  const th = k.thresholds();
  assert.ok(Math.abs(th.unitEst - 1200 / 18) < 1e-9);
  assert.ok(Math.abs(th.ditMax - (2 * 1200) / 18) < 1e-9);
  assert.equal(th.charGap, 350, 'floor wins at 18 wpm (4u = 267)');
  assert.equal(th.wordGap, 900, 'floor wins at 18 wpm (9u = 600)');
  const slow = createKeyer({ wpm: 5 }); // unit 240
  assert.equal(slow.thresholds().charGap, 960);
  assert.equal(slow.thresholds().wordGap, 2160);
});

test('clean K (-.-) at seed pace decodes after the char gap', () => {
  const k = createKeyer({ wpm: 18 });
  const u = 1200 / 18;
  const { events, t } = key(k, 1000, '-.-', u);
  assert.equal(els(events), '-.-');
  assert.equal(chars(events), '', 'not committed until the gap');
  assert.equal(k.pending(), '-.-');
  const committed = k.tick(t + k.thresholds().charGap + 1);
  assert.equal(chars(committed), 'K');
  assert.equal(k.pending(), '');
});

test('the next down also settles a pending character', () => {
  const k = createKeyer({ wpm: 18 });
  const u = 1200 / 18;
  let { t } = key(k, 0, '.', u); // E
  const evs = k.down(t + k.thresholds().charGap + 5);
  assert.equal(chars(evs), 'E');
  k.up(t + k.thresholds().charGap + 5 + u);
});

test('word gap appends exactly one word break, and only after a character', () => {
  const k = createKeyer({ wpm: 18 });
  const u = 1200 / 18;
  const { t } = key(k, 0, '.', u);
  const afterChar = k.tick(t + 400);
  assert.equal(chars(afterChar), 'E');
  const w1 = k.tick(t + 2000);
  assert.equal(w1.filter((e) => e.type === 'word').length, 1);
  const w2 = k.tick(t + 5000);
  assert.equal(w2.length, 0, 'no repeated word breaks while silence continues');
  // silence with nothing sent at all never emits a word
  const fresh = createKeyer({ wpm: 18 });
  assert.equal(fresh.tick(10_000).length, 0);
});

test('sloppy timing still decodes: uneven H with wobbly gaps', () => {
  const k = createKeyer({ wpm: 18 });
  let t = 0;
  const evs = [];
  for (const dur of [55, 90, 48, 110]) {
    evs.push(...press(k, t, dur));
    t += dur + 60 + Math.random() * 40; // gaps 60–100ms, all under charGap 350
  }
  evs.push(...k.tick(t + 400));
  assert.equal(chars(evs), 'H');
});

test('a mid-character hesitation splits the character (that is the lesson)', () => {
  const k = createKeyer({ wpm: 18 });
  let t = 0;
  press(k, t, 50); t += 50;
  t += 400; // hesitation past charGap
  const evs = k.down(t);
  press(k, t, 50);
  const done = k.tick(t + 50 + 400);
  assert.equal(chars([...evs, ...done]), 'EE', 'two Es, not one I');
});

test('adapts to a slower fist: after one dit/dah pair, 160ms presses read as dits', () => {
  const k = createKeyer({ wpm: 18 }); // seed 66.7, ditMax 133
  let t = 0;
  const first = press(k, t, 160); t += 560; // misread as dah — acceptable, once
  assert.equal(els(first), '-');
  const second = press(k, t, 480); t += 560; // real dah establishes the spread
  assert.equal(els(second), '-');
  const third = press(k, t, 160); t += 560; // now reads as a dit
  assert.equal(els(third), '.');
  assert.ok(k.thresholds().unitEst > 120, `unitEst tracked the user (${k.thresholds().unitEst})`);
  const fourth = press(k, t, 480);
  assert.equal(els(fourth), '-');
});

test('adaptation is clamped and ignores sub-30ms taps for estimation', () => {
  const k = createKeyer({ wpm: 18 });
  let t = 0;
  for (let i = 0; i < 8; i++) { press(k, t, 10); t += 500; } // storm of taps
  assert.ok(k.thresholds().unitEst >= 0.5 * (1200 / 18) - 1e-9, 'estimate never collapses');
  const k2 = createKeyer({ wpm: 40 }); // seed 30
  let t2 = 0;
  for (let i = 0; i < 8; i++) { press(k2, t2, 500); t2 += 300; press(k2, t2, 1500); t2 += 300; }
  assert.ok(k2.thresholds().unitEst <= 4 * 30 + 1e-9, 'estimate capped at 4× seed');
});

test('setWpm re-seeds live: thresholds change without a new keyer', () => {
  const k = createKeyer({ wpm: 18 });
  press(k, 0, 160); press(k, 700, 480); // adapted away from seed
  k.setWpm(5);
  const th = k.thresholds();
  assert.ok(Math.abs(th.unitEst - 240) < 1e-9, 'history cleared, new seed');
  assert.equal(th.charGap, 960);
});

test('guards: repeated down ignored, up without down ignored, unknown pattern → ?', () => {
  const k = createKeyer({ wpm: 18 });
  assert.equal(k.up(100).length, 0);
  k.down(200);
  assert.equal(k.down(210).length, 0, 'auto-repeat swallowed');
  k.up(260);
  // 7 dits is neither a character nor a prosign (8 dits is the error signal)
  const k2 = createKeyer({ wpm: 18 });
  let t = 0;
  for (let i = 0; i < 7; i++) { press(k2, t, 50); t += 110; }
  const evs = k2.tick(t + 400);
  assert.equal(chars(evs), '?');
});

test('tick while the key is down never commits', () => {
  const k = createKeyer({ wpm: 18 });
  press(k, 0, 60);
  k.down(100);
  assert.equal(k.tick(5000).length, 0);
  const evs = k.up(5060);
  assert.equal(els(evs), '-');
});

test('reset clears everything', () => {
  const k = createKeyer({ wpm: 18 });
  press(k, 0, 60);
  k.reset();
  assert.equal(k.pending(), '');
  assert.equal(k.tick(10_000).length, 0);
});

test('element events carry their measured duration', () => {
  const k = createKeyer({ wpm: 18 });
  const evs = press(k, 0, 42);
  assert.equal(evs[0].type, 'element');
  assert.equal(evs[0].ms, 42);
});

test('keying a prosign decodes to the prosign, not to "?"', () => {
  const k = createKeyer({ wpm: 18 });
  const u = 1200 / 18;
  // SOS keyed as one run-together character
  const { t } = key(k, 0, '...---...', u);
  const evs = k.tick(t + 400);
  assert.equal(chars(evs), '<SOS>');
  // SK, and the eight-dit error signal
  const k2 = createKeyer({ wpm: 18 });
  const a = key(k2, 0, '...-.-', u);
  assert.equal(chars(k2.tick(a.t + 400)), '<SK>');
  const k3 = createKeyer({ wpm: 18 });
  const b = key(k3, 0, '........', u);
  assert.equal(chars(k3.tick(b.t + 400)), '<HH>');
  // a pattern a real character owns still gives that character
  const k4 = createKeyer({ wpm: 18 });
  const c = key(k4, 0, '.-.-.', u);
  assert.equal(chars(k4.tick(c.t + 400)), '+');
});
