import PlaceholderSection from '@/components/PlaceholderSection';

export const metadata = { title: 'Learn — Morsia' };

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
