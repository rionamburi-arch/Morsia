// The tattoo advice, moved off the homepage to the route people search for.
// The section's opening line is the page lede, so the panel picks up from the
// rule itself.

import Link from 'next/link';
import { Eyebrow, p, code } from '@/components/prose';

export default function TattooGuide() {
  return (
    <section className="content-panel" aria-label="Morse tattoo spacing">
      <Eyebrow>MORSE TATTOOS</Eyebrow>

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
      <p style={{ ...p, marginBottom: 0 }}>
        Type it into the <Link href="/">translator</Link> before you commit to it. The bars show the real spacing, which
        is exactly what a tattoo needs to reproduce.
      </p>
    </section>
  );
}
