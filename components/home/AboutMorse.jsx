// Server-rendered prose beneath the translator. One column at a readable
// measure, with the cards inline at the point the text refers to them — the
// panel is sized to that column, so there is no space beside the text to leave
// a hole. Same layout at every width.

import Link from 'next/link';
import { TimingRules, WorkedExample } from '@/components/home/TimingDiagram';
import CommonLetters from '@/components/home/CommonLetters';

const MONO = 'var(--font-mono), monospace';

const h2 = { margin: '0 0 14px', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' };
const h3 = { margin: '30px 0 12px', fontSize: 17, fontWeight: 600, color: 'var(--ink)' };
const p = { margin: '0 0 14px', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)' };
const strong = { color: 'var(--ink)', fontWeight: 600 };
const card = { margin: '18px 0 20px' };
const code = { fontFamily: MONO, color: 'var(--ink)' };

export default function AboutMorse() {
  return (
    <section className="content-panel" aria-labelledby="about-morse">
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

      <h3 style={h3}>Where you’ve probably seen it</h3>
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

      <h3 style={h3}>Sending it without any equipment</h3>
      <p style={p}>
        Morse works on anything that can be switched on and off. That’s the entire requirement, and it’s why the code has
        outlived every technology it was invented for.
      </p>
      <p style={p}>
        <span style={strong}>A torch.</span> Short flash for a dot, long flash for a dash, torch off for the gaps. The
        most common mistake is flashing at an even rhythm — the dashes need to be visibly longer, not just slightly.
      </p>
      <p style={p}>
        <span style={strong}>Tapping.</span> On a wall, a pipe, a table. Harder than a torch because a tap is
        instantaneous; you have to convey length through the gap after it rather than the sound itself. Prisoners have
        historically used variations on this for exactly that reason.
      </p>
      <p style={p}>
        <span style={strong}>A car horn, a whistle, a phone flashlight.</span> All the same principle.
      </p>
      <p style={p}>
        <span style={strong}>Blinking</span>, as Denton proved, works too — and it’s the one nobody can take away from
        you.
      </p>

      <h3 style={h3}>If you’re getting a Morse tattoo</h3>
      <p style={p}>
        A lot of Morse tattoos are unreadable, and it’s always the same reason: the spacing.
      </p>
      <p style={p}>
        If you tattoo dots and dashes with even gaps between everything, there’s no way to tell where one letter ends and
        the next begins. <span style={code}>···· ··</span> is HI. <span style={code}>······</span> is nothing — six dots
        in a row isn’t a valid character, and a reader will guess at it. Plenty of people are wearing a permanent string
        of Es.
      </p>
      <p style={p}>
        The rule is the same one that governs everything else here. Gaps inside a letter are one unit. Gaps between
        letters are three. If your design doesn’t make those visibly different, it doesn’t say what you think it says.
      </p>
      <p style={p}>
        Type it into the translator above before you commit to it. The bars show the real spacing, which is exactly what
        a tattoo needs to reproduce.
      </p>

      <h3 style={h3}>What goes wrong</h3>
      <p style={p}>
        Three mistakes account for almost all unreadable Morse, and none of them are about getting the letters right.
      </p>
      <p style={p}>
        <span style={strong}>Letters run together.</span> You know where your letters end, so you don’t leave a long
        enough gap. The receiver doesn’t know, and everything merges into one long pattern. This is the most common
        failure by a distance.
      </p>
      <p style={p}>
        <span style={strong}>Dashes that are too short.</span> A dash is three times a dot, not “a bit longer”. Send it
        at twice the length and you land in the ambiguous middle where the person receiving has to guess.
      </p>
      <p style={p}>
        <span style={strong}>Pausing to think.</span> Stopping mid-letter to remember what comes next inserts a gap where
        there shouldn’t be one, and splits one character into two. It’s why beginners’ sending often comes out as a
        stream of Es and Ts.
      </p>
      <p style={p}>
        All three are rhythm problems rather than accuracy problems, which makes them hard to hear and easy to see. Send
        something in <Link href="/free">Free Mode</Link> and it draws your timing as you go.
      </p>

      <h3 style={h3}>Why some letters are shorter than others</h3>
      <p style={p}>
        E is a single dot. T is a single dash. That isn’t a coincidence — they’re the two most common letters in English,
        and they were given the two shortest signals deliberately.
      </p>
      <p style={p}>
        The story is that Alfred Vail worked out English letter frequencies by counting the type in a printer’s case,
        then assigned the quickest patterns to the letters that appear most. Whether that detail is exact or not, the
        result holds up: the letters you use most take the least time to send. It’s the same idea that turns up a century
        later in data compression.
      </p>
      <div style={card}>
        <CommonLetters />
      </div>

      <h3 style={h3}>What operators say to each other</h3>
      <p style={p}>
        There’s a compressed shorthand that grew up on top of the code, because in Morse every character costs time.
      </p>
      <p style={p}>
        <span style={code}>CQ</span> means “calling anyone” — it’s how you start a conversation with nobody in
        particular. <span style={code}>73</span> means best wishes, and is how most exchanges end.{' '}
        <span style={code}>QSL</span> means “received and understood”. <span style={code}>QTH</span> is your location.
      </p>
      <p style={p}>
        Operators also call the two lengths <em>dit</em> and <em>dah</em> rather than dot and dash, because those words
        sound like what they are. Say <em>di-dah</em> out loud and you’ve said the letter A.
      </p>

      <h3 style={h3}>Where to start</h3>
      <p style={p}>
        Use the <Link href="/chart">chart</Link> to hear each character, not to memorise a table — click any letter and
        it plays. Then send something yourself in <Link href="/free">Free Mode</Link>, which turns your spacebar into a
        key and shows your timing as bars.
      </p>
      <p style={{ ...p, marginBottom: 0 }}>
        Reading Morse off a page is a habit that has to be unlearned later. Start with your ear.
      </p>
    </section>
  );
}
