// One source for the FAQ: every answer is rendered visibly on the page that
// owns it AND used to build that page's FAQPage JSON-LD, so the schema can
// never describe content that is not on the page.
//
// Rule for every answer: `lead` contains the answer. Explanation goes in `body`.

export const FAQ = [
  {
    q: 'How do I translate text to Morse code?',
    lead: 'Type into the plain text panel above and the Morse appears as you type, as bars and as dots and dashes.',
    body: [
      'Press Play to hear it. It works both ways — paste dots and dashes into the Morse panel and the text comes back out, so the same tool decodes as well as encodes.',
    ],
  },
  {
    q: 'What is the Morse code for SOS?',
    lead: 'SOS is · · · − − − · · · — three dots, three dashes, three dots.',
    body: [
      'It is sent as one continuous run with no gaps between the letters, which is why it sounds like a single burst rather than three characters. That was the point: it was chosen in 1906 because the rhythm is unmistakable even through heavy interference.',
    ],
    bars: 'sos',
  },
  {
    q: 'What does SOS stand for?',
    lead: 'Nothing. It isn’t an acronym.',
    body: [
      '“Save Our Souls” and “Save Our Ship” were both invented afterwards to explain a signal chosen purely for how it sounds. The letters were picked because the sequence is unambiguous and easy to send under pressure. The meaning came later.',
    ],
  },
  {
    q: 'What is the difference between a dot and a dash?',
    lead: 'Length, and nothing else. A dot is one unit of time; a dash is exactly three, at the same pitch and volume.',
    body: [
      'That three-to-one ratio is the thing your ear actually learns. It is why this site draws characters as bars sized by duration — the width on screen is the length in time.',
    ],
    bars: 'dotdash',
  },
  {
    q: 'How do I send Morse code with a torch?',
    lead: 'Short flash for a dot, long flash for a dash, torch off for the gaps between them.',
    body: [
      'Keep the dashes visibly three times as long as the dots, and pause noticeably longer between letters than between the flashes inside one. The most common mistake is flashing at an even rhythm, which turns everything into an unreadable string.',
    ],
  },
  {
    q: 'How long does it take to learn Morse code?',
    lead: 'Most people recognise the whole alphabet by ear within a few weeks of daily practice, and can hold a slow conversation within a few months.',
    body: [
      'Twenty minutes a day beats two hours at the weekend. Learning by sound rather than by reading dots off a page makes a bigger difference than anything else.',
    ],
  },
  {
    q: 'Is Morse code still used?',
    lead: 'Yes — mostly by amateur radio operators, who use it daily.',
    body: [
      'It travels further on less power than speech, so a Morse conversation is possible on a few watts where a voice would be lost in the noise. It also survives as the universal fallback: anything that can be switched on and off can carry it.',
    ],
  },
];

/** The tattoo question lives on /morse-code-tattoo, with the rest of that advice. */
export const TATTOO_FAQ = [
  {
    q: 'How do I write my name in Morse code?',
    lead: 'Type it into the translator — each letter converts as you type, and Play sends it at your chosen speed.',
    body: [
      'If you are writing it down or having it tattooed, the spacing is what matters. Leave a gap of one unit between the parts of a letter and three units between letters. Without that difference, there is no way to tell where one letter ends.',
    ],
  },
];

/** The full answer as one string — used for the FAQPage schema. */
export const answerText = (item) => [item.lead, ...item.body].join(' ');
