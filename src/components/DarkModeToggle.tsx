'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'greenscore-dark';

// The source of truth is the `dark-mode` class on <body>, set before first
// paint by the script in layout.tsx. Watch it so every toggle stays in sync.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
const isDark = () => document.body.classList.contains('dark-mode');
const onServer = () => false;

export function DarkModeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, onServer);

  function toggle() {
    const next = document.body.classList.toggle('dark-mode');
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
    } catch {
      // Private browsing may block storage; the toggle still works for this page.
    }
  }

  return (
    <button
      id="darkModeToggle"
      type="button"
      className="dark-mode-btn"
      title="Toggle dark mode"
      aria-label="Dark mode"
      aria-pressed={dark}
      onClick={toggle}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
