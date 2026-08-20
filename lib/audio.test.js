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
  assert.equal(last.gains[0].connected, last.destination, 'gains[0] is the master volume');
  assert.equal(o.connected, last.gains[1]);
  assert.equal(last.gains[1].connected, last.gains[0], 'voice → master → destination');
  const g = last.gains[1].gain.events;
  assert.equal(g.length, 8, 'four envelope points per "on" segment');
  const times = g.map((ev) => ev.at(-1));
  assert.ok(times.every((t, i) => i === 0 || t >= times[i - 1]), 'automation events must be non-decreasing in time');
  assert.deepEqual(g[0], ['set', 0, r.start]);
  assert.equal(g[1][0], 'ramp'); assert.equal(g[1][1], 0.35); assert.ok(Math.abs(g[1][2] - (r.start + 0.004)) < 1e-9);
  assert.deepEqual(g[2].slice(0, 2), ['set', 0.35]); assert.ok(Math.abs(g[2][2] - (r.start + 0.1 - 0.004)) < 1e-9);
  assert.equal(g[3][0], 'ramp'); assert.equal(g[3][1], 0); assert.ok(Math.abs(g[3][2] - (r.start + 0.1)) < 1e-9);
});

test('short tones clamp the ramp to a quarter of the tone', () => {
  const e = make();
  const r = e.play([{ on: true, ms: 8 }], { toneHz: 620 });
  const g = last.gains[1].gain.events;
  const times = g.map((ev) => ev.at(-1));
  assert.ok(times.every((t, i) => i === 0 || t >= times[i - 1]), 'automation events must be non-decreasing in time');
  assert.ok(Math.abs(g[1][2] - (r.start + 0.002)) < 1e-9);
});

test('play with muted still schedules the tone but ramps the master volume to 0', () => {
  const e = make();
  const r = e.play(segs, { toneHz: 620, muted: true });
  assert.ok(Math.abs(r.total - 0.3) < 1e-9);
  assert.equal(last.oscs.length, 1, 'the timeline is scheduled so unmuting mid-play is audible');
  const master = last.gains[0].gain.events;
  assert.deepEqual(master.at(-1).slice(0, 2), ['ramp', 0]);
});

test('setMuted mid-play ramps the master volume down and back up without touching the voice', () => {
  const e = make();
  e.play(segs, { toneHz: 620 });
  const voiceEvents = last.gains[1].gain.events.length;
  const scheduledStop = last.oscs[0].stopped;
  e.setMuted(true);
  assert.deepEqual(last.gains[0].gain.events.at(-1).slice(0, 2), ['ramp', 0]);
  e.setMuted(false);
  assert.deepEqual(last.gains[0].gain.events.at(-1).slice(0, 2), ['ramp', 1]);
  assert.equal(last.gains[1].gain.events.length, voiceEvents, 'voice envelope untouched');
  assert.equal(last.oscs[0].stopped, scheduledStop, 'oscillator keeps its scheduled end; nothing was cut');
});

test('mute state set before the context exists applies when it is created', () => {
  const e = make();
  e.setMuted(true);
  e.play(segs, { toneHz: 620 });
  assert.equal(last.gains[0].gain.value, 0);
});

test('play returns null when Web Audio is unavailable', () => {
  const e = createEngine({ AudioContextClass: null });
  assert.equal(e.play(segs, { toneHz: 620 }), null);
  assert.equal(e.now(), 0);
});

test('a throwing AudioContext constructor makes play return null', () => {
  const e = createEngine({ AudioContextClass: class { constructor() { throw new Error('nope'); } } });
  assert.equal(e.play(segs, { toneHz: 620 }), null);
});

test('a second play stops the first; stop is idempotent; now() reads context time', () => {
  const e = make();
  assert.equal(e.now(), 0, 'no context until first play');
  e.play(segs, { toneHz: 620 });
  const first = last.oscs[0];
  e.play(segs, { toneHz: 700 });
  assert.equal(typeof first.stopped, 'number');
  assert.ok(first.stopped >= 10);
  const firstGainEvents = last.gains[1].gain.events;
  const lastEvent = firstGainEvents.at(-1);
  assert.equal(lastEvent[0], 'ramp');
  assert.equal(lastEvent[1], 0);
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

test('resume rejection is swallowed', async () => {
  class RejectingCtx extends FakeCtx {
    constructor() {
      super();
      this.state = 'suspended';
      last = this;
    }
    resume() {
      return Promise.reject(new Error('boom'));
    }
  }
  const e = createEngine({ AudioContextClass: RejectingCtx });
  const r = e.play(segs, { toneHz: 620 });
  assert.ok(r);
  await new Promise((resolve) => setTimeout(resolve, 0));
});

test('keying gates ONE persistent oscillator; keyUp never destroys it', () => {
  const e = make();
  e.setTone(500);
  e.keyDown();
  assert.equal(last.oscs.length, 1);
  assert.equal(last.oscs[0].frequency.value, 500);
  assert.equal(last.oscs[0].started, undefined, 'sidetone starts immediately (start() with no arg)');
  const gate = last.gains[1].gain;
  assert.deepEqual(gate.events.at(-1).slice(0, 2), ['ramp', 0.35], 'gate ramps up on key-down');
  e.keyDown();
  assert.equal(last.oscs.length, 1, 'keyDown while down is a no-op');
  e.keyUp();
  assert.equal(last.oscs[0].stopped, null, 'oscillator survives key-up — it is gated, not stopped');
  assert.deepEqual(gate.events.at(-1).slice(0, 2), ['ramp', 0], 'gate ramps down on key-up');
  e.keyUp(); // idempotent
  const evCount = gate.events.length;
  e.keyUp();
  assert.equal(gate.events.length, evCount, 'repeated keyUp schedules nothing');
  // second press reuses the same oscillator
  e.setTone(700);
  e.keyDown();
  assert.equal(last.oscs.length, 1, 'no new oscillator per element');
  assert.equal(last.oscs[0].frequency.value, 700, 'setTone retunes the persistent sidetone');
  assert.deepEqual(gate.events.at(-1).slice(0, 2), ['ramp', 0.35]);
  e.dispose();
  assert.notEqual(last.oscs[0].stopped, null, 'dispose stops the sidetone');
});

test('sidetone respects the master mute', () => {
  const e = make();
  e.setMuted(true);
  e.keyDown();
  assert.equal(last.gains[0].gain.value, 0, 'master is silent');
  assert.equal(last.oscs.length, 1, 'timeline still keys so unmuting is instant');
  e.keyUp();
});

test('keyDown anchors the ramp from the current gain value', () => {
  const e = make();
  e.keyDown();
  const ev = last.gains[1].gain.events;
  assert.deepEqual(ev[0], ['cancel', 10]);
  assert.deepEqual(ev[1], ['set', 0, 10]);
  assert.deepEqual(ev[2], ['ramp', 0.35, 10.004]);
});

test('dispose stops everything and closes the context', () => {
  const e = make();
  e.play(segs, { toneHz: 620 });
  e.dispose();
  assert.notEqual(last.oscs[0].stopped, null);
  assert.equal(last.closed, true);
  assert.equal(e.now(), 0);
});
