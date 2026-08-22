import FreeMode from '@/components/free/FreeMode';

const TITLE = 'Morse Code Practice — Key It Yourself | Morsia';
const DESCRIPTION =
  'Practise sending Morse with your spacebar or a tap. A live oscilloscope shows your timing as it happens, and tolerant decoding adapts to your own rhythm.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/free' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/free', type: 'website' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function FreePage() {
  return <FreeMode />;
}
