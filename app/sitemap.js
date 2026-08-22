const SITE = 'https://morsia.app';

// One timestamp per build: these are static pages, so "last modified" is the
// last deploy rather than anything per-route.
export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: `${SITE}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/chart`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/free`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/learn`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
