import { useSyncExternalStore } from 'react';

// Initial class is set by the inline script in index.html (avoids a light flash on load).
const listeners = new Set<() => void>();
const isDark = () => document.documentElement.classList.contains('dark');

export function toggleTheme() {
  const dark = !isDark();
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  listeners.forEach((l) => l());
}

export function useIsDark() {
  return useSyncExternalStore((cb) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, isDark);
}
