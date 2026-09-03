// Why the alphabet is shaped the way it is, and the shorthand operators send on
// top of it. Both sections moved off the homepage to sit under the chart, which
// is the table they are describing.

import CommonLetters from '@/components/home/CommonLetters';
import { Eyebrow, h2, h2Next, p, card, code } from '@/components/prose';

export default function AboutCharacters() {
  return (
    <section className="content-panel" aria-labelledby="letter-lengths">
      <Eyebrow>ABOUT THE CHARACTERS</Eyebrow>

      <h2 id="letter-lengths" style={h2}>Why some letters are shorter than others</h2>
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

      <h2 style={h2Next}>What operators say to each other</h2>
      <p style={p}>
        There’s a compressed shorthand that grew up on top of the code, because in Morse every character costs time.
      </p>
      <p style={p}>
        <span style={code}>CQ</span> means “calling anyone” — it’s how you start a conversation with nobody in
        particular. <span style={code}>73</span> means best wishes, and is how most exchanges end.{' '}
        <span style={code}>QSL</span> means “received and understood”. <span style={code}>QTH</span> is your location.
      </p>
      <p style={{ ...p, marginBottom: 0 }}>
        Operators also call the two lengths <em>dit</em> and <em>dah</em> rather than dot and dash, because those words
        sound like what they are. Say <em>di-dah</em> out loud and you’ve said the letter A.
      </p>
    </section>
  );
}
