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
  let master = null;  // master volume; mute ramps it to 0 so the timeline keeps running
  let current = null; // { osc, gain } for scheduled playback
  let side = null;    // ONE persistent sidetone oscillator, gated by its gain (Free Mode keying)
  let sideDown = false;
  let tone = 620;
  let muted = false;

  function ensure() {
    if (!ctx) {
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch {
        return null;
      }
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      const p = ctx.resume();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    return ctx;
  }

  function voice(c, hz) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = hz;
    const gain = c.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(master);
    osc.onended = () => { try { gain.disconnect(); } catch { /* ignore */ } };
    return { osc, gain };
  }

  function stop() {
    if (!current) return;
    const { osc, gain } = current;
    current = null;
    if (ctx) {
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + RAMP);
      try { osc.stop(t + RAMP + 0.01); } catch { /* already stopped */ }
    } else {
      try { osc.stop(); } catch { /* already stopped */ }
    }
  }

  /**
   * Schedule `segments` from now + LEAD. Returns { start, total } in context
   * seconds, or null when Web Audio is unavailable. `muted` sets the mute state
   * (see setMuted): the tone is still scheduled, so unmuting mid-play is audible.
   * Note: start/total are AudioContext seconds, not wall-clock; callers detecting
   * the end with setTimeout should tolerate drift (backgrounded tabs).
   */
  function play(segments, { toneHz = tone, muted: m } = {}) {
    const c = ensure();
    if (!c) return null;
    stop();
    tone = toneHz;
    if (m !== undefined) setMuted(m);
    const start = c.currentTime + LEAD;
    let total = 0;
    for (const s of segments) total += s.ms / 1000;
    if (!segments.length) return { start, total };

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
    if (!c || sideDown) return;
    if (!side) {
      side = voice(c, tone);
      side.osc.start();
    }
    side.osc.frequency.value = tone;
    sideDown = true;
    const now = c.currentTime;
    side.gain.gain.cancelScheduledValues(now);
    side.gain.gain.setValueAtTime(side.gain.gain.value, now);
    side.gain.gain.linearRampToValueAtTime(LEVEL, now + RAMP);
  }

  function keyUp() {
    if (!side || !ctx || !sideDown) return;
    sideDown = false;
    const now = ctx.currentTime;
    side.gain.gain.cancelScheduledValues(now);
    side.gain.gain.setValueAtTime(side.gain.gain.value, now);
    side.gain.gain.linearRampToValueAtTime(0, now + RAMP + 0.001);
  }

  function now() {
    return ctx ? ctx.currentTime : 0;
  }

  /** Mute/unmute without touching the timeline: ramps the master volume. */
  function setMuted(m) {
    muted = !!m;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(muted ? 0 : 1, t + RAMP);
  }

  function setTone(hz) {
    tone = hz;
    if (side) side.osc.frequency.value = hz;
  }

  function dispose() {
    stop();
    keyUp();
    if (side) {
      try {
        side.osc.stop();
      } catch {
        /* already stopped */
      }
      side = null;
      sideDown = false;
    }
    if (ctx && typeof ctx.close === 'function') {
      const p = ctx.close();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    ctx = null;
    master = null;
  }

  return { play, stop, keyDown, keyUp, now, setTone, setMuted, dispose };
}
