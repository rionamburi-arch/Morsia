'use client';

// The dichotomic search tree: from the root, a dit goes left and a dah goes
// right. Letters only, depth 4. Edges are labelled with a bar, not a dot or a
// dash character, so it reads as the same language as the grid.

import PatternBars from '@/components/chart/PatternBars';

const EDGE_UNIT = '4px';
const EDGE_H = '8px';

function Node({ node, activePattern, onPlay }) {
  const onPath = activePattern != null && activePattern.startsWith(node.pattern);
  const isActive = activePattern === node.pattern && node.pattern !== '';
  const isRoot = node.pattern === '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 0 auto' }}>
      <button
        type="button"
        disabled={isRoot || !node.char}
        onClick={() => node.char && onPlay(node.char, node.pattern)}
        aria-label={node.char ? `${node.char}, ${node.pattern}` : 'start'}
        title={node.char ? node.pattern : 'start'}
        className={isRoot || !node.char ? undefined : 'tree-node'}
        style={{
          width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 9,
          appearance: 'none', cursor: node.char && !isRoot ? 'pointer' : 'default',
          fontFamily: 'var(--font-mono), monospace', fontSize: 14, fontWeight: 600,
          background: isActive ? 'var(--signal)' : 'transparent',
          border: `1px solid ${onPath ? 'var(--interact-border)' : 'var(--border-soft)'}`,
          color: isActive ? 'var(--on-accent)' : onPath ? 'var(--ink)' : 'var(--muted)',
        }}
      >
        {isRoot ? '•' : node.char || ''}
      </button>

      {(node.dit || node.dah) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 4 }}>
          {[node.dit, node.dah].filter(Boolean).map((child) => {
            const childOnPath = activePattern != null && activePattern.startsWith(child.pattern);
            return (
              <div key={child.pattern} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 0 auto' }}>
                <div
                  aria-hidden="true"
                  style={{ width: 1, height: 10, background: childOnPath ? 'var(--interact)' : 'var(--border-soft)' }}
                />
                <div style={{ padding: '3px 0 5px' }}>
                  <PatternBars
                    pattern={child.pattern.slice(-1)}
                    unit={EDGE_UNIT}
                    height={EDGE_H}
                    color={childOnPath ? 'var(--interact)' : 'var(--muted)'}
                  />
                </div>
                <Node node={child} activePattern={activePattern} onPlay={onPlay} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Tree({ root, activePattern, onPlay }) {
  return (
    <div>
      <div
        style={{ overflowX: 'auto', paddingBottom: 8 }}
        role="group"
        aria-label="Morse decoding tree — dit goes left, dah goes right"
      >
        <div style={{ minWidth: 880, padding: '4px 8px' }}>
          <Node node={root} activePattern={activePattern} onPlay={onPlay} />
        </div>
      </div>
      <p style={{ margin: '6px 2px 0', fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.12em', color: 'var(--muted)' }}>
        SCROLL SIDEWAYS TO SEE THE WHOLE TREE · CLICK A LETTER TO HEAR IT AND LIGHT ITS PATH
      </p>
    </div>
  );
}
