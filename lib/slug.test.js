import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSlug, decodeSlug, SLUG_MAX } from './slug.js';

test('encodeSlug uppercases, keeps table characters, percent-encodes', () => {
  assert.equal(encodeSlug('Hello, world!'), 'HELLO%2C%20WORLD!');
  assert.equal(encodeSlug('  sos   sos  '), 'SOS%20SOS');
});

test('encodeSlug drops unsupported characters and returns "" when nothing survives', () => {
  assert.equal(encodeSlug('a<b>c'), 'ABC');
  assert.equal(encodeSlug('#####'), '');
  assert.equal(encodeSlug(''), '');
});

test('encodeSlug caps at SLUG_MAX characters before encoding', () => {
  const s = decodeURIComponent(encodeSlug('A'.repeat(SLUG_MAX + 50)));
  assert.equal(s.length, SLUG_MAX);
});

test('encodeSlug trims after capping, so a cap-boundary space does not survive', () => {
  const s = decodeURIComponent(encodeSlug('A'.repeat(279) + ' BBBB'));
  assert.ok(!s.endsWith(' '));
  assert.equal(s.length, 279);
});

test('decodeSlug round-trips and uppercases', () => {
  assert.equal(decodeSlug(encodeSlug('Hello, world!')), 'HELLO, WORLD!');
  assert.equal(decodeSlug('hello'), 'HELLO');
});

test('decodeSlug returns null for bad input', () => {
  assert.equal(decodeSlug('%E0%A4%A'), null, 'malformed percent-encoding');
  assert.equal(decodeSlug('HELLO%3Cscript%3E'), null, 'characters outside the table');
  assert.equal(decodeSlug('A'.repeat(SLUG_MAX + 1)), null, 'too long');
  assert.equal(decodeSlug(''), null);
  assert.equal(decodeSlug(undefined), null);
});
