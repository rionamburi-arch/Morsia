import { test } from 'node:test';
import assert from 'node:assert/strict';
import { segmentsToWav, wavFilename } from './wav.js';

const segs = [
  { on: true, ms: 100 },
  { on: false, ms: 100 },
  { on: true, ms: 100 },
];

const ascii = (view, off, len) => String.fromCharCode(...new Uint8Array(view.buffer, off, len));

test('segmentsToWav writes a valid 16-bit mono PCM header', async () => {
  const blob = segmentsToWav(segs, { toneHz: 620 });
  assert.equal(blob.type, 'audio/wav');
  const sampleRate = 44100;
  const n = Math.ceil((0.3 + 0.25) * sampleRate);
  assert.equal(blob.size, 44 + n * 2);
  const v = new DataView(await blob.arrayBuffer());
  assert.equal(ascii(v, 0, 4), 'RIFF');
  assert.equal(v.getUint32(4, true), 36 + n * 2);
  assert.equal(ascii(v, 8, 4), 'WAVE');
  assert.equal(ascii(v, 12, 4), 'fmt ');
  assert.equal(v.getUint16(20, true), 1, 'PCM');
  assert.equal(v.getUint16(22, true), 1, 'mono');
  assert.equal(v.getUint32(24, true), sampleRate);
  assert.equal(v.getUint16(34, true), 16, 'bits per sample');
  assert.equal(ascii(v, 36, 4), 'data');
  assert.equal(v.getUint32(40, true), n * 2);
});

test('segmentsToWav: tone during "on", silence during "off"', async () => {
  const blob = segmentsToWav(segs, { toneHz: 620, sampleRate: 8000 });
  const v = new DataView(await blob.arrayBuffer());
  const sample = (i) => v.getInt16(44 + i * 2, true);
  // middle of first tone (50 ms @ 8 kHz = sample 400): some sample nearby is loud
  let loud = 0;
  for (let i = 380; i < 420; i++) loud = Math.max(loud, Math.abs(sample(i)));
  assert.ok(loud > 8000, `expected tone, got peak ${loud}`);
  // middle of the gap (150 ms = sample 1200): silent
  for (let i = 1180; i < 1220; i++) assert.equal(sample(i), 0);
});

test('segmentsToWav: empty segments still yields a valid, short file', () => {
  const blob = segmentsToWav([], { toneHz: 620, sampleRate: 8000 });
  assert.equal(blob.size, 44 + Math.ceil(0.25 * 8000) * 2);
});

test('wavFilename slugs the text', () => {
  assert.equal(wavFilename('Hello, World!'), 'hello-world.wav');
  assert.equal(wavFilename('   '), 'morse.wav');
  assert.equal(wavFilename('a'.repeat(40)), 'a'.repeat(24) + '.wav');
});

test('wavFilename strips edge hyphens after capping, not before', () => {
  assert.equal(wavFilename('abcdefghijklmnopqrstuvw xyz'), 'abcdefghijklmnopqrstuvw.wav');
});

test('segmentsToWav guards non-positive toneHz and sampleRate', () => {
  assert.throws(() => segmentsToWav([], {}), RangeError);
});
