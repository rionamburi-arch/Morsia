// Server-rendered prose beneath the translator. It exists because a bare tool
// reads as a thin page — but it is written to be worth reading on its own.

import Link from 'next/link';
import PatternBars from '@/components/chart/PatternBars';
import { TABLE } from '@/lib/morse';
import { FAQ } from '@/components/home/faq';

const MONO = 'var(--font-mono), monospace';
const COMMON = ['E', 'T', 'A', 'I', 'N', 'M', 'S', 'O'];

const panel = {
  padding: '26px 30px 28px', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)',
};
const h2 = { margin: '0 0 12px', fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' };
const h3 = { margin: '26px 0 10px', fontSize: 15, fontWeight: 600, color: 'var(--ink)' };
const p = { margin: '0 0 14px', maxWidth: '68ch', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)' };

function Eyebrow({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
      <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
      <span
        style={{
          fontFamily: MONO, fontSize: 'var(--panel-label-size)', fontWeight: 700, letterSpacing: '0.2em',
          color: 'var(--interact)',
        }}
      >
        {children}
      </span>
    </div>
  );
}

export default function AboutMorse() {
  return (
    <>
      <section style={panel} aria-labelledby="about-morse">
        <Eyebrow>ABOUT MORSE CODE</Eyebrow>

        <h2 id="about-morse" style={h2}>Morse code is a rhythm, not an alphabet</h2>
        <p style={p}>
          Each letter is a short pattern of sounds — dits and dahs — and what your ear learns is not “dot dash” but the
          shape of the sound: <em>di-dah</em> for A, <em>dah-di-di-dit</em> for B. That is why this translator draws every
          character as bars sized by how long they last instead of printing punctuation. The picture is the timing.
        </p>
        <p style={p}>
          Samuel Morse and Alfred Vail built the original code for the telegraph in the 1840s. The version almost everyone
          uses today is International Morse, settled in 1865 and still defined by the ITU. It survives because it asks for
          so little: a signal that can be switched on and off, and someone at each end who knows the rhythm. Amateur radio
          operators use it daily, often at power levels where speech would be lost in the noise, and aviation and marine
          beacons still identify themselves in Morse. It is also the thing you fall back on when everything else fails — a
          torch, a car horn, a finger tapping on a pipe.
        </p>

        <h3 style={h3}>How the timing works</h3>
        <p style={p}>
          Everything is built from one length, the dit. Every other duration is a multiple of it:
        </p>
        <ul style={{ ...p, paddingLeft: 20 }}>
          <li>a <strong style={{ color: 'var(--ink)' }}>dit</strong> is 1 unit long</li>
          <li>a <strong style={{ color: 'var(--ink)' }}>dah</strong> is 3 units</li>
          <li>the gap <strong style={{ color: 'var(--ink)' }}>between elements</strong> inside a letter is 1 unit</li>
          <li>the gap <strong style={{ color: 'var(--ink)' }}>between letters</strong> is 3 units</li>
          <li>the gap <strong style={{ color: 'var(--ink)' }}>between words</strong> is 7 units</li>
        </ul>
        <p style={p}>
          That is the whole system. Get those proportions right and you are sending readable Morse at any speed; get them
          wrong and no amount of accuracy in the dots and dashes will rescue it. It is why operators talk about someone’s
          “fist” — the personal rhythm that makes their sending recognisable from across a band.
        </p>
        <p style={p}>
          The classic beginner’s mistake is letter gaps that are too short, so words run together into one long pattern the
          receiver cannot split. If you key something in{' '}
          <Link href="/free">Free Mode</Link> and it comes back as gibberish, that is usually why — and you will see it on
          the strip as bars that should be further apart than they are.
        </p>

        <h3 style={h3}>What words per minute means</h3>
        <p style={p}>
          Speed is quoted in words per minute, measured against the word PARIS, which is exactly 50 units long including
          the word gap that follows it. So 20 wpm is 1,000 units a minute and one unit lasts 60 milliseconds. Five wpm is a
          beginner’s crawl, 20 wpm is the usual target for a competent operator and the speed most practice material is
          pitched at, and contest operators work comfortably at 30 to 40.
        </p>
        <p style={p}>
          There is a trick worth knowing called Farnsworth spacing: send each character at full speed but stretch the gaps
          between them. You learn what a letter sounds like at the speed you will eventually need, without the pressure of
          decoding it in real time. The speed controls here do exactly that — character speed and effective speed are set
          separately.
        </p>

        <h3 style={h3}>The letters you will meet first</h3>
        <p style={p}>
          E and T are a single element each, which is no accident: Morse and Vail counted the type in a printer’s case to
          work out which letters English leans on hardest, and gave the common ones the shortest patterns.
        </p>
        <ul
          style={{ listStyle: 'none', margin: '0 0 14px', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 10 }}
        >
          {COMMON.map((char) => (
            <li
              key={char}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', borderRadius: 12,
                border: '1px solid var(--border-soft)',
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{char}</span>
              <PatternBars pattern={TABLE[char]} />
            </li>
          ))}
        </ul>
        <p style={{ ...p, marginBottom: 0 }}>
          The full set — every letter, number, punctuation mark and prosign — is on the{' '}
          <Link href="/chart">Morse code chart</Link>, where you can click any character to hear it. When you would rather
          send than read, <Link href="/free">Free Mode</Link> turns your spacebar into a straight key.
        </p>
      </section>

      <section style={panel} aria-labelledby="faq">
        <Eyebrow>QUESTIONS</Eyebrow>
        <h2 id="faq" style={h2}>Common questions</h2>
        <dl style={{ margin: 0 }}>
          {FAQ.map((item) => (
            <div key={item.q} style={{ marginTop: 18 }}>
              <dt style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{item.q}</dt>
              <dd style={{ ...p, margin: 0 }}>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
