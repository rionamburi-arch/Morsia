import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TABLE, REVERSE, encode, decode, normaliseMorse, decodeKeyed, PROSIGNS } from './morse.js';

test('TABLE has 26 letters, 10 digits, 18 punctuation marks, all unique dot-dash codes', () => {
  const keys = Object.keys(TABLE);
  assert.equal(keys.length, 54);
  const codes = Object.values(TABLE);
  assert.equal(new Set(codes).size, 54);
  for (const c of codes) assert.match(c, /^[.-]+$/);
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') assert.ok(TABLE[ch], `missing ${ch}`);
  for (const ch of `.,?'!/()&:;=+-_"$@`) assert.ok(TABLE[ch], `missing ${ch}`);
});

test('REVERSE maps every code back to its character', () => {
  for (const [ch, code] of Object.entries(TABLE)) assert.equal(REVERSE[code], ch);
});

test('encode: basic words, case-insensitive, words joined by " / "', () => {
  assert.equal(encode('SOS').morse, '... --- ...');
  assert.equal(encode('sos').morse, '... --- ...');
  assert.equal(encode('Hello World').morse, '.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
  assert.deepEqual(encode('SOS').unknown, []);
});

test('encode: unknown characters are skipped and reported once each, in order', () => {
  const r = encode('a#b~#');
  assert.equal(r.morse, '.- -...');
  assert.deepEqual(r.unknown, ['#', '~']);
});

test('encode: empty and whitespace-only input', () => {
  assert.deepEqual(encode(''), { morse: '', unknown: [] });
  assert.deepEqual(encode('   \n '), { morse: '', unknown: [] });
});

test('encode: a word made only of unknown characters produces no separator', () => {
  assert.equal(encode('E ### E').morse, '. / .');
});

test('encode: unicode uppercasing that reports the original character; nullish input', () => {
  assert.deepEqual(encode('café').unknown, ['é']);
  assert.deepEqual(encode(null), { morse: '', unknown: [] });
});

test('normaliseMorse: unicode dots/dashes, junk stripped, spaces collapsed, newline = word break', () => {
  assert.equal(normaliseMorse('· — –'), '. - -');
  assert.equal(normaliseMorse('..x--'), '..--');
  assert.equal(normaliseMorse('.   .'), '. .');
  assert.equal(normaliseMorse('.\n-'), '. / -');
  assert.equal(normaliseMorse('. '), '. ', 'a trailing space must survive so users can type letter gaps');
  assert.equal(normaliseMorse('. .'), '. .');
  assert.equal(normaliseMorse('.\t.'), '. .');
  assert.equal(normaliseMorse('.\r-'), '. / -');
  assert.equal(normaliseMorse('.‐.'), '.-.');
});

test('decode: words on "/", letters on spaces, lenient about spacing and glyphs', () => {
  assert.equal(decode('... --- ...'), 'SOS');
  assert.equal(decode('.... . / .-- ---'), 'HE WO');
  assert.equal(decode('  ...   ---  /  ... '), 'SO S');
  assert.equal(decode('··· −−− ···'), 'SOS');
});

test('decode: unknown groups become "?", never throws, empty gives empty', () => {
  assert.equal(decode('......--'), '?');
  assert.equal(decode(''), '');
  assert.equal(decode('/ / /'), '');
  assert.equal(decode(null), '');
});

test('round trip: every character and a full sentence', () => {
  for (const ch of Object.keys(TABLE)) assert.equal(decode(encode(ch).morse), ch);
  const all = Object.keys(TABLE).join('');
  assert.equal(decode(encode(all).morse), all);
  assert.equal(decode(encode('the quick brown fox').morse), 'THE QUICK BROWN FOX');
});

test('decodeKeyed: characters win, prosigns fill the gaps, decode() is unchanged', () => {
  // patterns no character owns → the prosign
  assert.equal(decodeKeyed('...-.-'), '<SK>');
  assert.equal(decodeKeyed('...---...'), '<SOS>');
  assert.equal(decodeKeyed('........'), '<HH>');
  // patterns a character owns → that character, never the prosign
  assert.equal(decodeKeyed('.-.-.'), '+');
  assert.equal(decodeKeyed('.-...'), '&');
  assert.equal(decodeKeyed('-...-'), '=');
  assert.equal(decodeKeyed('-.--.'), '(');
  assert.equal(decodeKeyed('-.-'), 'K');
  assert.equal(decodeKeyed('......--'), '?');
  // every prosign resolves to something meaningful, never "?"
  for (const p of PROSIGNS) assert.notEqual(decodeKeyed(p.pattern), '?', p.name);
  // the Translate direction is untouched, so text ⇄ morse still round-trips
  assert.equal(decode('...-.-'), '?');
  assert.equal(REVERSE['-.-'], 'K');
});
