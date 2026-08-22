import PlaceholderSection from '@/components/PlaceholderSection';

const TITLE = 'Learn Morse Code — Lessons Coming Soon | Morsia';
const DESCRIPTION =
  'Guided Morse code lessons are on the way. Until they land, hear every character on the full chart and practise sending it yourself on the straight key.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/learn' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/learn', type: 'website' },
};

export default function LearnPage() {
  return (
    <PlaceholderSection
      title="Lessons are on the way"
      copy="Guided lessons that teach letters by their rhythm, one shape at a time. Until they land, these two teach the same thing — the chart shows you every shape and lets you hear it, and Free Mode is where you send it back."
      actions={[
        { href: '/chart', label: 'START WITH THE CHART', tone: 'primary' },
        { href: '/free', label: 'TRY KEYING IT YOURSELF', tone: 'secondary' },
      ]}
    />
  );
}
