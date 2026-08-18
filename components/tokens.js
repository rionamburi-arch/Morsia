// Reads CSS custom properties from :root into plain JS values so canvases can
// use them. Call it once (mount / resize / theme change) — NEVER inside an
// animation loop. Colours are resolved through a probe element so tokens like
// "rgb(var(--x-rgb) / 0.7)" or color-mix() come back as plain rgb()/rgba().

export function readTokens({ sizes = [], colors = [], strings = [] } = {}) {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const out = {};
  for (const name of sizes) out[name] = parseFloat(cs.getPropertyValue(name)) || 0;
  for (const name of strings) out[name] = cs.getPropertyValue(name).trim();
  if (colors.length) {
    const probe = document.createElement('span');
    probe.style.display = 'none';
    root.appendChild(probe);
    for (const name of colors) {
      probe.style.color = cs.getPropertyValue(name).trim();
      out[name] = getComputedStyle(probe).color;
    }
    probe.remove();
  }
  return out;
}
