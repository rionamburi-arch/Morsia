import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from './audio.js';

class FakeParam {
  constructor() { this.value = 0; this.events = []; }
  setValueAtTime(v, t) { this.events.push(['set', v, t]); }
  linearRampToValueAtTime(v, t) { this.events.push(['ramp', v, t]); }
  cancelScheduledValues(t) { this.events.push(['cancel', t]); }
}
class FakeOsc {
  constructor() { this.frequency = new FakeParam(); this.type = ''; this.started = null; this.stopped = null; this.connected = null; }
  connect(n) { this.connected = n; }
  start(t) { this.started = t; }
  stop(t) { this.stopped = t; }
}
class FakeGain {
  constructor() { this.gain = new FakeParam(); this.connected = null; }
  connect(n) { this.connected = n; }
}
class FakeCtx {
  constructor() { this.currentTime = 10; this.state = 'running'; this.destination = {}; this.oscs = []; this.gains = []; this.closed = false; this.resumed = 0; }
  createOscillator() { const o = new FakeOsc(); this.oscs.push(o); return o; }
  createGain() { const g = new FakeGain(); this.gains.push(g); return g; }
  resume() { this.resumed++; this.state = 'running'; return Promise.resolve(); }
  close() { this.closed = true; return Promise.resolve(); }
}

const segs = [
  { on: true, ms: 100 },
  { on: false, ms: 100 },
  { on: true, ms: 100 },
];
let last;
const make = () => createEngine({ AudioContextClass: class extends FakeCtx { constructor() { super(); last = this; } } });

test('play schedules one oscillator with a gain envelope and returns the timeline', () => {
  const e = make();
  const r = e.play(segs, { toneHz: 620 });
  assert.ok(Math.abs(r.start - 10.06) < 1e-9);
  assert.ok(Math.abs(r.total - 0.3) < 1e-9);
  assert.equal(last.oscs.length, 1);
  const o = last.oscs[0];
  assert.equal(o.type, 'sine');
  assert.equal(o.frequency.value, 620);
  assert.equal(o.started, r.start);
  assert.ok(Math.abs(o.stopped - (r.start + 0.3 + 0.05)) < 1e-9);
  assert.equal(o.connected, last.gains[0]);
  assert.equal(last.gains[0].connected, last.destination);
  const g = last.gains[0].gain.events;
  assert.equal(g.length, 8, 'four envelope points per "on" segment');
  assert.deepEqual(g[0].slice(0, 2), ['set', 0]);
  assert.equal(g[1][0], 'ramp');
  assert.ok(g[1][1] > 0 && g[1][1] <= 1);
  assert.equal(g[3][1], 0);
});

test('play with muted schedules nothing but still returns the timeline', () => {
  const e = make();
  const r = e.play(segs, { toneHz: 620, muted: true });
  assert.ok(Math.abs(r.total - 0.3) < 1e-9);
  assert.equal(last.oscs.length, 0);
});

test('play returns null when Web Audio is unavailable', () => {
  const e = createEngine({ AudioContextClass: null });
  assert.equal(e.play(segs, { toneHz: 620 }), null);
  assert.equal(e.now(), 0);
});

test('a second play stops the first; stop is idempotent; now() reads context time', () => {
  const e = make();
  assert.equal(e.now(), 0, 'no context until first play');
  e.play(segs, { toneHz: 620 });
  const first = last.oscs[0];
  e.play(segs, { toneHz: 700 });
  assert.notEqual(first.stopped, null);
  assert.equal(last.oscs[1].frequency.value, 700);
  e.stop();
  e.stop();
  assert.equal(e.now(), 10);
});

test('suspended contexts are resumed on play', () => {
  const e = createEngine({ AudioContextClass: class extends FakeCtx { constructor() { super(); this.state = 'suspended'; last = this; } } });
  e.play(segs, { toneHz: 620 });
  assert.equal(last.resumed, 1);
});

test('keyDown / keyUp drive a live tone; setTone changes pitch', () => {
  const e = make();
  e.setTone(500);
  e.keyDown();
  assert.equal(last.oscs.length, 1);
  assert.equal(last.oscs[0].frequency.value, 500);
  assert.equal(last.oscs[0].started, undefined, 'live tone starts immediately (start() with no arg)');
  e.keyDown();
  assert.equal(last.oscs.length, 1, 'keyDown while down is a no-op');
  e.keyUp();
  assert.notEqual(last.oscs[0].stopped, null);
  const ev = last.gains[0].gain.events;
  assert.equal(ev.at(-1)[0], 'ramp');
  assert.equal(ev.at(-1)[1], 0);
  e.keyUp(); // idempotent
});

test('dispose stops everything and closes the context', () => {
  const e = make();
  e.play(segs, { toneHz: 620 });
  e.dispose();
  assert.notEqual(last.oscs[0].stopped, null);
  assert.equal(last.closed, true);
  assert.equal(e.now(), 0);
});
