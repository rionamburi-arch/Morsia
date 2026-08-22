// One source for the FAQ: rendered visibly on the homepage AND used to build
// the FAQPage JSON-LD, so the schema can never describe content that is not
// actually on the page.

export const FAQ = [
  {
    q: 'How do I translate text to Morse code?',
    a: 'Type into the plain text panel at the top of this page and the Morse appears as you type, both as bars and as dots and dashes. Press Play to hear it. It works the other way too: type dots and dashes into the Morse panel and the text side fills in, so the same tool decodes as well as encodes.',
  },
  {
    q: 'What is the Morse code for SOS?',
    a: 'SOS is · · · — — — · · · — three dits, three dahs, three dits. It is normally sent as one run-together signal with no gaps between the letters, which is why it sounds like a single distinctive burst rather than three separate characters. It was chosen because that rhythm is unmistakable, not because the letters stand for anything.',
  },
  {
    q: 'How fast is 20 words per minute?',
    a: 'Speed is measured against the word PARIS, which is exactly 50 units of Morse long. At 20 words per minute one unit lasts 60 milliseconds, so a dit is 60ms and a dah is 180ms. Twenty words per minute is the usual target for a competent operator; 5 wpm is a comfortable beginner pace and contest operators work at 30 to 40.',
  },
  {
    q: 'What is the difference between a dit and a dah?',
    a: 'Length, and nothing else. A dit is one unit of time and a dah is exactly three, at the same pitch and volume. That three-to-one ratio is what your ear actually learns, which is why this site draws each character as bars sized by duration instead of printing dots and dashes.',
  },
  {
    q: 'Can I learn Morse code from a chart?',
    a: 'A chart teaches you what the characters are, but not how they sound, and Morse is received by ear. Use the chart to hear each character rather than to memorise a table of dots — then practise sending on the key. Reading dots and dashes off a page is a habit that has to be unlearned later.',
  },
  {
    q: 'Is Morse code still used?',
    a: 'Yes. Amateur radio operators use it every day, often at power levels where speech would be lost in the noise, and aviation and marine navigation beacons still identify themselves in Morse. It survives because it needs so little: a signal that can be switched on and off, and someone at each end who knows the rhythm.',
  },
];
