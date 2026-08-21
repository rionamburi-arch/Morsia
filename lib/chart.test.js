import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TABLE, REVERSE, PROSIGNS, KOCH_ORDER } from './morse.js';
import { patternToSegments, unitMs, totalMs } from './timing.js';
import { LETTERS, NUMBERS, PUNCTUATION, sortLetters, treeNodes } from './chart.js';

test('prosigns are well formed and never corrupt the decode table', () => {
  assert.equal(PROSIGNS.length, 7);
  for (const p of PROSIGNS) {
    assert.match(p.pattern, /^[.-]+$/);
    assert.ok(p.meaning.length > 3, `${p.name} needs a plain-English meaning`);
  }
  const names = PROSIGNS.map((p) => p.name);
  assert.deepEqual(names, ['AR', 'AS', 'BT', 'SK', 'KN', 'SOS', 'HH']);
  // The colliding ones must resolve to punctuation in REVERSE, not to a prosign.
  assert.equal(REVERSE['.-.-.'], '+');
  assert.equal(REVERSE['.-...'], '&');
  assert.equal(REVERSE['-...-'], '=');
  assert.equal(REVERSE['-.--.'], '(');
  for (const p of PROSIGNS) assert.equal(Object.hasOwn(TABLE, p.name) && TABLE[p.name] === p.pattern, false);
});

test('Koch order covers all 26 letters plus the extras it names', () => {
  assert.equal(KOCH_ORDER.length, 40);
  const letters = KOCH_ORDER.filter((c) => /[A-Z]/.test(c));
  assert.equal(new Set(letters).size, 26, 'every letter exactly once');
  assert.equal(KOCH_ORDER[0], 'K');
  assert.equal(KOCH_ORDER[1], 'M');
  for (const c of KOCH_ORDER) assert.ok(Object.hasOwn(TABLE, c), `${c} must exist in TABLE`);
});

test('chart sections come from TABLE and cover the spec', () => {
  assert.equal(LETTERS.length, 26);
  assert.equal(LETTERS[0].char, 'A');
  assert.equal(LETTERS[0].pattern, '.-');
  assert.equal(NUMBERS.length, 10);
  assert.deepEqual(NUMBERS.map((n) => n.char), [...'0123456789']);
  const punct = PUNCTUATION.map((p) => p.char).join('');
  for (const c of `.,?'!/()&:;=+-_"$@`) assert.ok(punct.includes(c), `missing ${c}`);
  for (const row of [...LETTERS, ...NUMBERS, ...PUNCTUATION]) assert.equal(row.pattern, TABLE[row.char]);
});

test('sortLetters: alphabetical, by length, Koch', () => {
  assert.deepEqual(sortLetters('alpha').map((l) => l.char).join(''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const byLen = sortLetters('length');
  assert.deepEqual(byLen.slice(0, 2).map((l) => l.char), ['E', 'T'], 'single-element letters first');
  const lens = byLen.map((l) => l.pattern.length);
  assert.deepEqual(lens, [...lens].sort((a, b) => a - b), 'non-decreasing length');
  assert.equal(byLen.length, 26);
  const koch = sortLetters('koch');
  assert.deepEqual(koch.slice(0, 5).map((l) => l.char), ['K', 'M', 'R', 'S', 'U']);
  assert.equal(koch.length, 26);
  assert.deepEqual(sortLetters('nonsense').map((l) => l.char), sortLetters('alpha').map((l) => l.char));
});

test('treeNodes: dichotomic tree, letters only, depth 4', () => {
  const nodes = treeNodes();
  assert.equal(nodes.pattern, '', 'root is the empty pattern');
  const seen = [];
  const walk = (n, d) => {
    assert.ok(d <= 4, 'never deeper than 4');
    if (n.char) seen.push(n.char);
    if (n.dit) { assert.equal(n.dit.pattern, `${n.pattern}.`); walk(n.dit, d + 1); }
    if (n.dah) { assert.equal(n.dah.pattern, `${n.pattern}-`); walk(n.dah, d + 1); }
  };
  walk(nodes, 0);
  // Every letter whose pattern is 4 elements or fewer appears exactly once.
  const expected = Object.entries(TABLE).filter(([c, p]) => /[A-Z]/.test(c) && p.length <= 4).map(([c]) => c);
  assert.deepEqual(seen.slice().sort(), expected.slice().sort());
  assert.equal(seen.length, 26, 'all 26 letters fit within depth 4');
  assert.equal(nodes.dit.char, 'E');
  assert.equal(nodes.dah.char, 'T');
  assert.equal(nodes.dah.dit.dah.char, 'K', 'K is dah-dit-dah');
});

test('patternToSegments: run-together pattern, no leading or trailing gap', () => {
  const u = unitMs(20);
  const segs = patternToSegments('-.-', { wpm: 20 });
  assert.deepEqual(segs.map((s) => s.kind), ['dah', 'intra', 'dit', 'intra', 'dah']);
  assert.equal(totalMs(segs), 3 * u + u + u + u + 3 * u);
  assert.equal(segs[0].on, true);
  assert.equal(segs.at(-1).on, true);
  assert.deepEqual(patternToSegments('', { wpm: 20 }), []);
  assert.equal(patternToSegments('.', { wpm: 20 }).length, 1);
  // SOS as one prosign is 9 elements, not three letters
  assert.equal(patternToSegments('...---...', { wpm: 20 }).filter((s) => s.on).length, 9);
});
