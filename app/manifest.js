// Web app manifest (Next serves this at /manifest.webmanifest).

export default function manifest() {
  return {
    name: 'Morsia — Morse code translator, chart and trainer',
    short_name: 'Morsia',
    description: 'Translate text to Morse code, hear it, key it yourself, and learn to read it by ear.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1D201F',
    theme_color: '#1D201F',
  };
}
