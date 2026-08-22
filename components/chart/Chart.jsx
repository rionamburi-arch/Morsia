'use client';

// The chart's interactive layer. It renders the whole table on the server too
// (client components are server-rendered for the initial HTML), so the page is
// complete and readable with JavaScript switched off; search, sorting, audio
// and the tree are what JavaScript adds on top.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NUMBERS, PUNCTUATION, SORTS, sortLetters } from '@/lib/chart';
import { PROSIGNS, normaliseMorse, prettyPattern } from '@/lib/morse';
import { patternToSegments } from '@/lib/timing';
import { useSettings } from '@/hooks/useSettings';
import usePlayer from '@/hooks/usePlayer';
import PatternBars from '@/components/chart/PatternBars';
import Toast from '@/components/Toast';

const MONO = 'var(--font-mono), monospace';
const TOAST_MS = 1800;

function Eyebrow({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
      <span
        style={{
          fontFamily: MONO, fontSize: 'var(--panel-label-size)', fontWeight: 700, letterSpacing: '0.2em',
          color: 'var(--interact)',
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Segmented({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            onPointerDown={(e) => e.preventDefault()}
            aria-pressed={on}
            style={{
              appearance: 'none', cursor: 'pointer', borderRadius: 999, padding: '6px 13px',
              fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              background: on ? 'var(--signal)' : 'transparent',
              border: `1px solid ${on ? 'var(--signal)' : 'var(--border)'}`,
              color: on ? 'var(--on-accent)' : 'var(--muted)',
              transition: 'background 160ms, color 160ms, border-color 160ms',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H5.5A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15" />
    </svg>
  );
}

function Cell({ row, cellRef, onPlay, onCopy }) {
  return (
    <div
      ref={cellRef}
      className="chart-cell"
      style={{
        position: 'relative', borderRadius: 14, border: '1px solid var(--border-soft)',
        background: 'transparent', overflow: 'hidden',
      }}
    >
      <button
        type="button"
        data-cell
        onClick={() => onPlay(row)}
        aria-label={`Play ${row.label}, ${prettyPattern(row.pattern)}${row.meaning ? `, ${row.meaning}` : ''}`}
        style={{
          appearance: 'none', background: 'transparent', border: 0, cursor: 'pointer', width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 9,
          padding: '13px 14px 12px', textAlign: 'left', color: 'inherit',
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: row.label.length > 2 ? 20 : 24, fontWeight: 600, lineHeight: 1, color: 'var(--ink)' }}>
          {row.label}
        </span>
        <PatternBars pattern={row.pattern} />
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', color: 'var(--chart-pattern)' }}>
          {prettyPattern(row.pattern)}
        </span>
        {row.meaning ? (
          <span style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--muted)' }}>{row.meaning}</span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => onCopy(row.pattern)}
        onPointerDown={(e) => e.preventDefault()}
        title={`Copy ${row.pattern}`}
        aria-label={`Copy the pattern for ${row.label}`}
        className="hv-icon"
        style={{
          position: 'absolute', top: 8, right: 8, width: 24, height: 24, display: 'grid', placeItems: 'center',
          borderRadius: 7, appearance: 'none', cursor: 'pointer', background: 'transparent',
          border: '1px solid var(--border-soft)', color: 'var(--muted)', transition: 'color 180ms, border-color 180ms',
        }}
      >
        <CopyIcon />
      </button>
    </div>
  );
}

/** Arrow keys move between cells; Enter/Space play (they are buttons). */
function onGridKeyDown(e) {
  const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const cells = [...e.currentTarget.querySelectorAll('[data-cell]')];
  const i = cells.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  // Column count from viewport rects — offsetTop is 0 for every cell, since
  // each one's offsetParent is its own position:relative wrapper.
  const firstTop = cells[0].getBoundingClientRect().top;
  const wrapAt = cells.findIndex((c) => c.getBoundingClientRect().top > firstTop + 1);
  const cols = wrapAt > 0 ? wrapAt : cells.length;
  const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
  let next = e.key === 'Home' ? 0 : e.key === 'End' ? cells.length - 1 : i + delta[e.key];
  next = Math.max(0, Math.min(cells.length - 1, next));
  cells[next]?.focus();
}

export default function Chart() {
  const { settings } = useSettings();
  const { wpm, toneHz } = settings;
  const player = usePlayer({ toneHz });

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('alpha');
  const [active, setActive] = useState(null); // { id, pattern }
  const [toast, setToast] = useState('');

  const cellsRef = useRef(new Map());
  const activeElRef = useRef(null);
  const searchRef = useRef(null);
  const toastTimer = useRef(0);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Autofocus the search on desktop only — on a phone it pops the keyboard
  // over the content the moment the page loads.
  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches && window.matchMedia('(hover: hover)').matches) {
      searchRef.current?.focus();
    }
  }, []);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), TOAST_MS);
  }, []);

  const sections = useMemo(() => {
    const asRow = (r) => ({ id: `${r.char}`, label: r.char, pattern: r.pattern });
    return [
      { id: 'letters', label: 'LETTERS', rows: sortLetters(sort).map(asRow), sortable: true },
      { id: 'numbers', label: 'NUMBERS', rows: NUMBERS.map(asRow) },
      { id: 'punctuation', label: 'PUNCTUATION', rows: PUNCTUATION.map(asRow) },
      {
        id: 'prosigns',
        label: 'PROSIGNS',
        wide: true,
        rows: PROSIGNS.map((p) => ({ id: p.name, label: p.name, pattern: p.pattern, meaning: p.meaning })),
      },
    ];
  }, [sort]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return sections;
    const lower = q.toLowerCase();
    const asPattern = normaliseMorse(q).replace(/[^.-]/g, '');
    return sections.map((s) => ({
      ...s,
      rows: s.rows.filter(
        (r) =>
          r.label.toLowerCase().startsWith(lower) ||
          (asPattern && r.pattern.startsWith(asPattern)) ||
          (r.meaning && r.meaning.toLowerCase().includes(lower)),
      ),
    }));
  }, [sections, query]);

  const total = filtered.reduce((n, s) => n + s.rows.length, 0);

  const play = useCallback(
    (row) => {
      const key = `${row.id}`;
      activeElRef.current = cellsRef.current.get(key) || null;
      setActive({ id: key, pattern: row.pattern });
      if (!player.play(patternToSegments(row.pattern, { wpm }))) {
        showToast('Audio unavailable in this browser');
      }
    },
    [player, wpm, showToast],
  );

  const copy = useCallback(
    async (pattern) => {
      try {
        await navigator.clipboard.writeText(pattern);
        showToast(`Copied ${prettyPattern(pattern)}`);
      } catch {
        showToast("Couldn't copy");
      }
    },
    [showToast],
  );

  // The row flashes in time with the audio, like the Free Mode lamp. Reduced
  // motion keeps the sound and drops the flash.
  const { playing, sounding } = player;
  useEffect(() => {
    const el = activeElRef.current;
    if (!playing || !el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    let last = null;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const next = sounding() ? 'var(--chart-flash)' : 'transparent';
      if (next !== last) {
        last = next;
        el.style.background = next;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.style.background = 'transparent';
    };
  }, [playing, sounding, active]);

  const registerCell = useCallback(
    (key) => (el) => {
      if (el) cellsRef.current.set(key, el);
      else cellsRef.current.delete(key);
    },
    [],
  );

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <label style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
            Search the chart
          </span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a letter or a pattern — try K or -.-"
            spellCheck={false}
            style={{
              flex: '1 1 auto', minWidth: 0, appearance: 'none', background: 'transparent', border: 0, outline: 'none',
              color: 'var(--ink)', fontSize: 14, caretColor: 'var(--signal)',
            }}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              onPointerDown={(e) => e.preventDefault()}
              aria-label="Clear search"
              style={{ appearance: 'none', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--muted)', fontSize: 16, lineHeight: 1 }}
            >
              ×
            </button>
          ) : null}
        </label>
      </div>

          {total === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              Nothing matches “{query}”. Try a letter, a number, or a pattern like <span style={{ fontFamily: MONO }}>-.-</span>.
            </p>
          ) : null}

          {filtered.map((section) =>
            section.rows.length ? (
              <section
                key={section.id}
                aria-label={section.label}
                style={{ padding: '18px 20px 18px', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                  <Eyebrow>{section.label}</Eyebrow>
                  {section.sortable ? <Segmented label="Sort letters" options={SORTS} value={sort} onChange={setSort} /> : null}
                </div>
                <div className={section.wide ? 'chart-grid-wide' : 'chart-grid'} onKeyDown={onGridKeyDown}>
                  {section.rows.map((row) => (
                    <Cell
                      key={`${section.id}:${row.id}`}
                      row={row}
                      cellRef={registerCell(`${row.id}`)}
                      onPlay={play}
                      onCopy={copy}
                    />
                  ))}
                </div>
              </section>
            ) : null,
      )}

      <Toast message={toast} />
    </>
  );
}
