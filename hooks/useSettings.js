'use client';

// Settings live in a tiny external store read via useSyncExternalStore.
// Server render and hydration see DEFAULTS; the first subscriber hydrates
// from localStorage after mount, so markup never mismatches.

import { useSyncExternalStore } from 'react';
import { DEFAULTS, KEY, sanitise } from '@/lib/settings';

let settings = DEFAULTS;
let hydrated = false;
const listeners = new Set();

function emit() {
  for (const l of listeners) l();
}

function hydrate() {
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      settings = sanitise(JSON.parse(raw));
      emit();
    }
  } catch {
    /* private mode, quota, bad JSON — defaults stand */
  }
}

function subscribe(listener) {
  listeners.add(listener);
  if (!hydrated) hydrate();
  return () => listeners.delete(listener);
}

const getSnapshot = () => settings;
const getServerSnapshot = () => DEFAULTS;

let writeTimer = 0;
const WRITE_DELAY_MS = 200;

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable — keep working for the session */
  }
}

export function updateSettings(patch) {
  settings = sanitise({ ...settings, ...patch });
  emit();
  clearTimeout(writeTimer);
  writeTimer = setTimeout(persist, WRITE_DELAY_MS);
}

export function useSettings() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    settings: s,
    setWpm: (v) => updateSettings({ wpm: v }),
    setEffWpm: (v) => updateSettings({ effWpm: v }),
    setToneHz: (v) => updateSettings({ toneHz: v }),
    setLabels: (v) => updateSettings({ labels: v }),
  };
}
