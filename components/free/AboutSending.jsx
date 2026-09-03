// The two sections about sending Morse by hand. They moved off the homepage to
// sit under the key itself — "what goes wrong" is a rhythm problem, and this is
// the page where you can watch your own rhythm as you make it.

import Link from 'next/link';
import { Eyebrow, h2, h2Next, p, strong } from '@/components/prose';

export default function AboutSending() {
  return (
    <section className="content-panel" aria-labelledby="sending-by-hand">
      <Eyebrow>SENDING BY HAND</Eyebrow>

      <h2 id="sending-by-hand" style={h2}>Sending it without any equipment</h2>
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
        <span style={strong}>Blinking</span>, as{' '}
        <Link href="/#where-youve-seen-it">Denton</Link> proved, works too — and it’s the one nobody can take away from
        you.
      </p>

      <h2 style={h2Next}>What goes wrong</h2>
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
      <p style={{ ...p, marginBottom: 0 }}>
        All three are rhythm problems rather than accuracy problems, which makes them hard to hear and easy to see. Send
        something in Free Mode and it draws your timing as you go.
      </p>
    </section>
  );
}
