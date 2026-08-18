// WAV encoder for the download button. 16-bit mono PCM built straight from
// segments, so its timing can never drift from what audio and the strip play.

const LEVEL = 0.5;
const RAMP_S = 0.005;
const TAIL_S = 0.25;

function writeAscii(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

export function segmentsToWav(segments, { toneHz, sampleRate = 44100 } = {}) {
  if (!(toneHz > 0)) throw new RangeError('toneHz must be > 0');
  if (!(sampleRate > 0)) throw new RangeError('sampleRate must be > 0');
  let totalS = 0;
  for (const s of segments) totalS += s.ms / 1000;
  const n = Math.ceil((totalS + TAIL_S) * sampleRate);
  const pcm = new Float32Array(n);
  const ramp = Math.floor(RAMP_S * sampleRate);

  let t = 0;
  for (const seg of segments) {
    const d = seg.ms / 1000;
    if (seg.on) {
      const s = Math.floor(t * sampleRate);
      const e = Math.min(n, Math.floor((t + d) * sampleRate));
      for (let i = s; i < e; i++) {
        let a = LEVEL;
        if (i - s < ramp) a *= (i - s) / ramp;
        if (e - i < ramp) a *= (e - i) / ramp;
        pcm[i] = Math.sin(2 * Math.PI * toneHz * (i / sampleRate)) * a;
      }
    }
    t += d;
  }

  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  writeAscii(v, 0, 'RIFF');
  v.setUint32(4, 36 + n * 2, true);
  writeAscii(v, 8, 'WAVE');
  writeAscii(v, 12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true); // byte rate
  v.setUint16(32, 2, true); // block align
  v.setUint16(34, 16, true); // bits per sample
  writeAscii(v, 36, 'data');
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

export function wavFilename(text) {
  const base = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 24)
    .replace(/^-|-$/g, '');
  return `${base || 'morse'}.wav`;
}
