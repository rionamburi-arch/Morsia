'use client';

// The analytics opt-out flag. Vercel's documented pattern is a `va-disable`
// key in localStorage that beforeSend checks; this wraps it so every read is
// guarded (SSR has no localStorage, and some browsers block it entirely) and
// so the /optout page can re-render the moment the flag changes.

import { useSyncExternalStore } from 'react';

export const KEY = 'va-disable';

const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

/** True when this device has asked to be left out of analytics. */
export function isOptedOut() {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(window.localStorage.getItem(KEY));
  } catch {
    return false; // storage blocked — count the visit rather than crash
  }
}

export function setOptedOut(value) {
  try {
    if (value) window.localStorage.setItem(KEY, '1');
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: nothing we can persist */
  }
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  // Another tab flipping the flag should update this one too.
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/** Server render assumes tracking is on, then corrects after hydration. */
export function useOptOut() {
  return useSyncExternalStore(subscribe, isOptedOut, () => false);
}
