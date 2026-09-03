// Server-rendered prose beneath the translator. One column at a readable
// measure, with the cards inline at the point the text refers to them — the
// panel is sized to that column, so there is no space beside the text to leave
// a hole. Same layout at every width.
//
// This panel holds the timing — the thing the translator above is drawing. The
// sections that belong beside another tool live with that tool (/free, /chart)
// and the tattoo advice has its own route; "Keep reading" at the foot links out
// to all three.

import Link from 'next/link';
import { TimingRules, WorkedExample } from '@/components/home/TimingDiagram';
import { Eyebrow, h2, h3, p, strong, card, code } from '@/components/prose';

export default function AboutMorse() {
  return (
    <section className="content-panel" aria-labelledby="about-morse">
      <Eyebrow>ABOUT MORSE CODE</Eyebrow>

      <h2 id="about-morse" style={h2}>Morse code is made of time</h2>
      <p style={p}>
        Everyone writes Morse as dots and dashes, and that notation hides the thing that actually matters. A dot and a
        dash aren’t two symbols. They’re two lengths — one short sound and one that lasts exactly three times as long.
      </p>
      <p style={p}>
        That sounds like a technicality until you try to send something. Get the letters right but the lengths wrong and
        nobody can read it. Get the lengths right and it works even if your signal is a torch being switched on and off
        through fog.
      </p>
      <p style={p}>
        This is why the translator above draws each character as bars sized by how long they last, rather than printing
        dots and dashes. The width on screen is the length in time. It’s the same information every chart gives you, in
        the form the code is actually built from.
      </p>

      <h3 style={h3}>How the timing works</h3>
      <p style={p}>
        Everything is built from one length. Call it a unit — it’s the length of a single dot. Every other duration is a
        multiple of it.
      </p>
      <div style={card}>
        <TimingRules />
      </div>
      <p style={p}>That’s the whole system. Five numbers, and the last three are silences.</p>
      <div style={card}>
        <WorkedExample />
      </div>
      <p style={p}>
        Look at how much of it is silence. In <span style={code}>HI</span> the gaps take as much room as the sounds.
        They’re not spacing — they’re the part that tells you where one letter ends and the next begins. Remove them and{' '}
        <span style={code}>HI</span> is just six dots in a row, which isn’t a word.
      </p>

      <h3 style={h3}>What your name looks like</h3>
      <p style={p}>
        Some names are elegant in Morse and some are a wall. <span style={code}>E</span> is one dot, the shortest
        character there is. <span style={code}>O</span> is three dashes. So Tom comes out short and punchy while Hugh is
        almost all dots, and a name with an O in it takes noticeably longer to send than one without.
      </p>
      <p style={p}>
        Type yours into the translator above and press play. It’s the fastest way to get a feel for why the timing
        matters — you’ll hear the difference between letters immediately, in a way that reading a chart never gives you.
      </p>

      <h3 id="where-youve-seen-it" style={h3}>Where you’ve probably seen it</h3>
      <p style={p}>
        <span style={strong}>The first message.</span> In May 1844 Samuel Morse sent the first public telegraph message
        from Washington to Baltimore. He let Annie Ellsworth, the daughter of a friend, choose the words, and she picked
        a line from the Book of Numbers: <em>What hath God wrought</em>. It’s still the most famous sentence ever sent in
        Morse.
      </p>
      <p style={p}>
        <span style={strong}>The Titanic.</span> When she started sinking in 1912 her operators sent CQD, the old
        distress call, and then SOS as well. SOS had only been the international standard for four years and hadn’t fully
        caught on — the junior operator suggested trying it partly on the grounds that they might not get another chance.
        It’s the moment SOS entered public consciousness.
      </p>
      <p style={p}>
        <span style={strong}>A blinked message.</span> In 1966 an American pilot named Jeremiah Denton, held as a
        prisoner of war in North Vietnam, was put in front of a television camera to say he was being well treated. While
        he spoke, he blinked. Slowly, deliberately, in Morse: T-O-R-T-U-R-E. Nobody in the room noticed. US Naval
        Intelligence, watching the broadcast, did.
      </p>
      <p style={p}>
        <span style={strong}>In music.</span> Rush’s instrumental <em>YYZ</em> opens by playing YYZ in Morse — it’s the
        identifier for Toronto’s airport, which the band heard constantly on the navigation beacon flying home. Once you
        know that happens, you start hearing it in other places.
      </p>

      <h3 style={h3}>Where to start</h3>
      <p style={p}>
        Use the <Link href="/chart">chart</Link> to hear each character, not to memorise a table — click any letter and
        it plays. Then send something yourself in <Link href="/free">Free Mode</Link>, which turns your spacebar into a
        key and shows your timing as bars.
      </p>
      <p style={p}>
        Reading Morse off a page is a habit that has to be unlearned later. Start with your ear.
      </p>

      <h3 style={h3}>Keep reading</h3>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <li style={{ ...p, margin: 0 }}>
          <Link href="/free">Sending Morse without any equipment, and what goes wrong</Link>
        </li>
        <li style={{ ...p, margin: 0 }}>
          <Link href="/chart">Why some letters are shorter than others</Link>
        </li>
        <li style={{ ...p, margin: 0 }}>
          <Link href="/morse-code-tattoo">If you’re getting a Morse code tattoo</Link>
        </li>
      </ul>
    </section>
  );
}
