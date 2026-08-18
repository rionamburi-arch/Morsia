// Web Audio engine: scheduled playback of segments and a live sidetone for
// keying. Nothing happens at import time; createEngine() is the only entry.
// The AudioContext class is injectable so this is testable without a browser.

const LEVEL = 0.35;   // gain while a tone is on
const RAMP = 0.004;   // seconds; removes clicks
const LEAD = 0.06;    // seconds between play() and the first tone
const TAIL = 0.05;    // seconds the oscillator outlives the last tone

export function createEngine(opts = {}) {
  const AC = Object.hasOwn(opts, 'AudioContextClass')
    ? opts.AudioContextClass
    : globalThis.AudioContext || globalThis.webkitAudioContext;

  let ctx = null;
  let current = null; // { osc, gain } for scheduled playback
  let live = null;    // { osc, gain } for keying
  let tone = 620;

  function ensure() {
    if (!ctx) {
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch {
        return null;
      }
    }
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') ctx.resume();
    return ctx;
  }

  function voice(c, hz) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = hz;
    const gain = c.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(c.destination);
    return { osc, gain };
  }

  function stop() {
    if (!current) return;
    try {
      current.osc.stop();
    } catch {
      /* already stopped */
    }
    current = null;
  }

  /**
   * Schedule `segments` from now + LEAD. Returns { start, total } in context
   * seconds, or null when Web Audio is unavailable. muted → same timeline, no sound.
   */
  function play(segments, { toneHz = tone, muted = false } = {}) {
    const c = ensure();
    if (!c) return null;
    stop();
    tone = toneHz;
    const start = c.currentTime + LEAD;
    let total = 0;
    for (const s of segments) total += s.ms / 1000;
    if (muted || !segments.length) return { start, total };

    const v = voice(c, toneHz);
    let t = start;
    for (const seg of segments) {
      const d = seg.ms / 1000;
      if (seg.on) {
        const r = Math.min(RAMP, d / 4);
        v.gain.gain.setValueAtTime(0, t);
        v.gain.gain.linearRampToValueAtTime(LEVEL, t + r);
        v.gain.gain.setValueAtTime(LEVEL, t + d - r);
        v.gain.gain.linearRampToValueAtTime(0, t + d);
      }
      t += d;
    }
    v.osc.start(start);
    v.osc.stop(t + TAIL);
    current = v;
    return { start, total };
  }

  function keyDown() {
    const c = ensure();
    if (!c || live) return;
    live = voice(c, tone);
    live.osc.start();
    live.gain.gain.linearRampToValueAtTime(LEVEL, c.currentTime + RAMP);
  }

  function keyUp() {
    if (!live || !ctx) return;
    const { osc, gain } = live;
    live = null;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + RAMP + 0.001);
    try {
      osc.stop(now + 0.03);
    } catch {
      /* already stopped */
    }
  }

  function now() {
    return ctx ? ctx.currentTime : 0;
  }

  function setTone(hz) {
    tone = hz;
    if (live) live.osc.frequency.value = hz;
  }

  function dispose() {
    stop();
    keyUp();
    if (ctx && typeof ctx.close === 'function') {
      const p = ctx.close();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    ctx = null;
  }

  return { play, stop, keyDown, keyUp, now, setTone, dispose };
}
