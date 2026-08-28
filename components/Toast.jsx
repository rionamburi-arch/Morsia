'use client';

export default function Toast({ message }) {
  return (
    <div role="status" aria-live="polite">
      {message ? (
        <div
          key={message}
          className="t-readout-lg"
          style={{
            position: 'fixed', left: '50%', bottom: 28, transform: 'translate(-50%, 0)', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', borderRadius: 'var(--r-1)', background: 'var(--field)', border: '1px solid var(--rule-strong)',
            color: 'var(--ink)', animation: 'morsia-toast 240ms cubic-bezier(0.16,1,0.3,1)', zIndex: 40,
          }}
        >
          <span aria-hidden="true" style={{ width: 5, height: 5, background: 'var(--reference)' }} />
          <span>{message}</span>
        </div>
      ) : null}
    </div>
  );
}
