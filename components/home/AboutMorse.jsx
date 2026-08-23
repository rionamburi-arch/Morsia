// Server-rendered prose beneath the translator, laid out as running text with
// its figures alongside: at lg the diagram a paragraph refers to sits next to
// that paragraph, below lg it stacks underneath it. Measure stays at ~68ch.

import Link from 'next/link';
import { TimingRules, WorkedExample, GapFailure } from '@/components/home/TimingDiagram';
import CommonLetters from '@/components/home/CommonLetters';

const MONO = 'var(--font-mono), monospace';

const panel = {
  padding: '26px 30px 28px', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)',
};
const h2 = { margin: '0 0 14px', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' };
const h3 = { margin: '0 0 12px', fontSize: 17, fontWeight: 600, color: 'var(--ink)' };
const p = { margin: '0 0 14px', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)' };
const strong = { color: 'var(--ink)', fontWeight: 600 };

/** One block of prose with its figure beside it (lg) or beneath it (below lg). */
function Block({ aside, children }) {
  return (
    <div className="prose-row">
      <div className="prose-col">{children}</div>
      {aside ? <div className="prose-aside">{aside}</div> : null}
    </div>
  );
}

function PullQuote({ children }) {
  return (
    <blockquote
      style={{
        margin: 0, padding: '18px 20px', borderRadius: 16, border: '1px solid var(--border-soft)',
        borderLeft: '3px solid var(--signal)', background: 'var(--inset-fill)',
        fontSize: 16, lineHeight: 1.5, color: 'var(--ink)',
      }}
    >
      {children}
    </blockquote>
  );
}

function SpeedTable() {
  const rows = [
    ['5 wpm', '240 ms', '720 ms'],
    ['13 wpm', '92 ms', '277 ms'],
    ['20 wpm', '60 ms', '180 ms'],
    ['30 wpm', '40 ms', '120 ms'],
  ];
  const cell = { padding: '8px 10px', fontFamily: MONO, fontSize: 13, color: 'var(--ink)', textAlign: 'left' };
  const head = { ...cell, fontSize: 10, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' };
  return (
    <figure style={{ margin: 0, padding: '14px 12px', borderRadius: 16, border: '1px solid var(--border-soft)', background: 'var(--inset-fill)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th scope="col" style={head}>Speed</th>
            <th scope="col" style={head}>One dit</th>
            <th scope="col" style={head}>One dah</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([speed, dit, dah]) => (
            <tr key={speed} style={{ borderTop: '1px solid var(--border-soft)' }}>
              <th scope="row" style={{ ...cell, fontWeight: 600 }}>{speed}</th>
              <td style={cell}>{dit}</td>
              <td style={cell}>{dah}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export default function AboutMorse() {
  return (
    <section style={panel} aria-labelledby="about-morse">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
        <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
        <span
          style={{
            fontFamily: MONO, fontSize: 'var(--panel-label-size)', fontWeight: 700, letterSpacing: '0.2em',
            color: 'var(--interact)',
          }}
        >
          ABOUT MORSE CODE
        </span>
      </div>

      <Block aside={<PullQuote>Nobody receives Morse by reading. They receive it by ear.</PullQuote>}>
        <h2 id="about-morse" style={h2}>Morse code is a rhythm, not an alphabet</h2>
        <p style={p}>
          Almost every Morse chart on the internet will tell you that A is <span style={{ fontFamily: MONO, color: 'var(--chart-pattern)' }}>·−</span>.
          That notation is a lie of convenience. A is not a dot and a dash — it’s a short sound followed by a long one,{' '}
          <em>di-dah</em>, and the thing you eventually learn to recognise is the shape of that sound, not a pair of
          symbols on a page.
        </p>
        <p style={p}>
          The distinction matters because it decides how you should practise. Dots and dashes were a way of printing Morse
          in a book, and books were how people learned it for a century. But nobody receives Morse by reading. They receive
          it by ear, and the moment you try to translate sound into dots and then dots into letters, you hit a ceiling
          somewhere around five words a minute and stay there.
        </p>
        <p style={p}>
          That’s why this translator draws every character as bars sized by how long they last, and why it decodes in the
          same language — paste dots and dashes in and the text comes back out. The picture <em>is</em> the timing. It’s
          the same information a chart gives you, in a form that matches how the code actually behaves.
        </p>
      </Block>

      <Block aside={<TimingRules />}>
        <h3 style={h3}>How the timing works</h3>
        <p style={p}>
          Everything is built from one length, called a dit. Every other duration in Morse is a multiple of it.
        </p>
        <p style={p}>
          That’s the entire system. Five numbers. Get those proportions right and you’re sending readable Morse at any
          speed; get them wrong and perfect dots and dashes won’t save you.
        </p>
      </Block>

      <Block aside={<WorkedExample />}>
        <p style={p}>
          Here’s the letter C and the word HI at true proportion, so you can see the gaps doing their work.
        </p>
        <p style={p}>
          Notice how much of Morse is silence. In <span style={{ fontFamily: MONO, color: 'var(--ink)' }}>HI</span> the
          gaps take up as much room as the marks. That’s not padding — the gaps are what tell the receiver where one letter
          stops and the next begins, and they carry as much meaning as the sounds do.
        </p>
      </Block>

      <Block aside={<GapFailure />}>
        <h3 style={h3}>What going wrong looks like</h3>
        <p style={p}>
          Three failures account for most unreadable sending, and all three are visible the moment you put your keying on a
          timeline rather than listening to it.
        </p>
        <p style={p}>
          <span style={strong}>Letter gaps that are too short.</span> By far the most common. You know where your letters
          end, so you don’t feel the need to wait, and everything runs together into one long pattern the receiver can’t
          split. <span style={{ fontFamily: MONO, color: 'var(--ink)' }}>HI</span> sent with a one-unit gap isn’t{' '}
          <span style={{ fontFamily: MONO, color: 'var(--ink)' }}>HI</span> — it’s six dits in a row, which decodes as
          nothing at all.
        </p>
        <p style={p}>
          <span style={strong}>Dahs that aren’t long enough.</span> A dah is three dits, not “a bit longer than a dit”.
          Send it at twice the length instead of three times and you sit in the ambiguous middle, where a receiver has to
          guess. Your dits and dahs need to be obviously different lengths, not slightly different ones.
        </p>
        <p style={p}>
          <span style={strong}>Hesitation inside a character.</span> Pausing mid-letter to think inserts a gap where there
          shouldn’t be one, and splits one character into two. This is why beginners’ sending often decodes as a stream of
          Es and Ts — and on the scope it shows up as a hole in the middle of what should be one group of bars.
        </p>
        <p style={p}>
          None of these are accuracy problems. They’re rhythm problems, and you can only see them by looking at your timing
          directly — which is what the strip in <Link href="/free">Free Mode</Link> is for.
        </p>
      </Block>

      <Block aside={<SpeedTable />}>
        <h3 style={h3}>What words per minute actually means</h3>
        <p style={p}>
          Morse speed is measured against a single reference word: PARIS. Sent correctly, including the word gap that
          follows it, PARIS is exactly 50 units long. So the arithmetic is simple — the dit length in milliseconds is 1200
          divided by your speed in words per minute.
        </p>
        <p style={p}>
          Five words a minute is a beginner’s crawl. Thirteen was the old licensing standard in several countries. Twenty
          is what a competent operator sends and what most practice material is pitched at. Contest operators work
          comfortably at thirty to forty, and a few go considerably beyond.
        </p>
        <p style={p}>
          There’s a technique called <span style={strong}>Farnsworth spacing</span> that solves the main problem with
          learning: send each character at full speed, but stretch the gaps between them. You hear what a letter sounds
          like at twenty words a minute from your first day, while still having time to decode it. The alternative —
          learning at five and speeding up — teaches you a sound that doesn’t exist at the speed you actually want, and
          most people who do it have to unlearn it later.
        </p>
      </Block>

      <Block aside={<CommonLetters />}>
        <h3 style={h3}>Why some letters are shorter than others</h3>
        <p style={p}>
          E is one dit. T is one dah. That isn’t arbitrary. The story is that Alfred Vail worked out which letters English
          uses most by counting the type in a printer’s case, then handed the shortest patterns to the most common letters
          — the same logic that turns up a century later in data compression.
        </p>
        <p style={p}>
          Whether or not the printer’s-case detail is exactly true, the result is measurably right: the letters you meet
          most often are the quickest to send, which is why Morse is more efficient than its age suggests.
        </p>
      </Block>

      <Block aside={<PullQuote>Any signal that can be switched on and off will carry it.</PullQuote>}>
        <h3 style={h3}>Where it’s still used</h3>
        <p style={p}>
          Morse survives because it asks for so little. Any signal that can be switched on and off will carry it, and it
          stays readable in noise that would swallow speech entirely — which is why amateur radio operators still use it
          daily, often at power levels of a few watts.
        </p>
        <p style={p}>
          Aviation and marine navigation beacons identify themselves in Morse, so a pilot can confirm which VOR they’re
          tuned to by ear. It stopped being a maritime distress requirement in 1999 and stopped being a licensing
          requirement for US amateurs in 2007, and it has outlived both changes comfortably.
        </p>
        <p style={p}>
          And it remains the thing you fall back on when everything else has failed: a torch, a car horn, a finger tapping
          on a pipe.
        </p>

        <h3 style={{ ...h3, marginTop: 26 }}>Where to start</h3>
        <p style={{ ...p, marginBottom: 0 }}>
          Use the <Link href="/chart">chart</Link> to hear each character rather than to memorise a table — click any
          letter and it plays at your current speed. Then send. <Link href="/free">Free Mode</Link> turns your spacebar
          into a straight key and draws your timing as you go, which is the fastest way to find out that your letter gaps
          are too short.
        </p>
      </Block>
    </section>
  );
}
