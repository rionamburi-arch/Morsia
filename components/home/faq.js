// One source for the FAQ: rendered visibly on the homepage AND used to build
// the FAQPage JSON-LD, so the schema can never describe content that is not on
// the page.
//
// Rule for every answer: `lead` contains the answer. Explanation goes in `body`.
// That is what a scanning reader needs, and it is what gets extracted as a
// snippet or an AI Overview citation.

export const FAQ = [
  {
    q: 'How do I translate text to Morse code?',
    lead: 'Type into the plain text panel above and the Morse appears as you type, as bars and as dots and dashes.',
    body: [
      'Press Play to hear it at your chosen speed and tone. It runs both ways — paste dots and dashes into the Morse panel and the text side fills in, so the same tool decodes as well as encodes.',
    ],
  },
  {
    q: 'What is the Morse code for SOS?',
    lead: 'SOS is · · · — — — · · · — three dits, three dahs, three dits.',
    body: [
      'It is sent as one continuous signal with no gaps between the letters, which is why it sounds like a single distinctive burst rather than three characters. That run-together form is the whole point: it was chosen in 1906 because the rhythm is unmistakable even through heavy interference.',
    ],
    bars: 'sos',
  },
  {
    q: 'What does SOS stand for?',
    lead: 'Nothing. It is not an acronym.',
    body: [
      '“Save Our Souls” and “Save Our Ship” were both invented afterwards to explain a signal that was picked purely for how it sounds. The letters were chosen because that particular sequence is unambiguous and easy to send under pressure — the meaning was attached later.',
    ],
  },
  {
    q: 'How fast is 20 words per minute?',
    lead: 'At 20 wpm a dit lasts 60 milliseconds and a dah lasts 180.',
    body: [
      'Speed is measured against the word PARIS, which is exactly 50 units of Morse long, so the dit length is always 1200 divided by the words per minute. Twenty is the usual target for a competent operator; five is a comfortable beginner pace and contest operators work at thirty to forty.',
    ],
  },
  {
    q: 'What is the difference between a dit and a dah?',
    lead: 'Length, and nothing else — a dit is one unit of time, a dah is exactly three, at identical pitch and volume.',
    body: [
      'That three-to-one ratio is what your ear learns to hear. It is also why this site draws characters as bars sized by duration rather than printing dots and dashes: the width on screen is the length in time.',
    ],
    bars: 'ditdah',
  },
  {
    q: 'How long does it take to learn Morse code?',
    lead: 'Most people can recognise the full alphabet by ear within a few weeks of daily practice, and reach a usable 15–20 words per minute in a few months.',
    body: [
      'The variable is not talent, it is method. Practising twenty minutes a day beats two hours at the weekend, and learning characters at full speed with stretched gaps — Farnsworth spacing — is consistently faster than learning slowly and speeding up.',
    ],
  },
  {
    q: 'Can I learn Morse code from a chart?',
    lead: 'A chart teaches you what the characters are, but not what they sound like, and Morse is received by ear.',
    body: [
      'Use it to hear each character, not to memorise a table of dots. Reading Morse visually is a habit that has to be unlearned later, and it is the single most common reason people stall at a few words a minute.',
    ],
  },
  {
    q: 'Is Morse code still used?',
    lead: 'Yes — daily, mostly by amateur radio operators.',
    body: [
      'It carries further on less power than voice, so a conversation possible on a few watts of Morse would be inaudible as speech. Aviation and marine beacons still identify themselves in Morse, and it remains a fallback whenever a signal can be switched on and off but nothing more sophisticated is available.',
    ],
  },
];

/** The full answer as one string — used for the FAQPage schema. */
export const answerText = (item) => [item.lead, ...item.body].join(' ');
