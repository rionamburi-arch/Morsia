'use client';

export default function Toast({ message }) {
  return (
    <div role="status" aria-live="polite">
      {message ? (
        <div
          key={message}
          style={{
            position: 'fixed', left: '50%', bottom: 32, transform: 'translate(-50%, 0)', display: 'flex', alignItems: 'center', gap: 9,
            padding: '11px 18px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12.5,
            color: 'var(--ink)', animation: 'cad-toast 260ms cubic-bezier(0.22,1,0.36,1)', zIndex: 40,
          }}
        >
          <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--interact)' }} />
          <span>{message}</span>
        </div>
      ) : null}
    </div>
  );
}
