# Morsia

Text ⇄ Morse translator, chart and trainer that teaches you to read Morse by ear. Lives at morsia.app. Next.js App Router, JavaScript, no backend.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # node --test over lib/
npm run lint
npm run build
```

## Where things live

- `lib/` — pure maths: `morse.js`, `timing.js` (`toSegments()` is the single timing source), `slug.js`, `wav.js`, `audio.js`, `settings.js`
- `hooks/` — `useSettings` (localStorage store), `usePlayer` (audio lifecycle, `clock()`, `sounding()`)
- `components/` — one file per design region; `Scope.jsx` is the two-canvas rhythm strip
- `app/globals.css` — every colour, radius and size token; `--unit` sets the strip's Morse unit
- `design/cadence/` — reference export of the Claude Design mockup the UI is ported from (that project is still named "Cadence" upstream; the app is Morsia)
- `docs/superpowers/` — specs and plans
