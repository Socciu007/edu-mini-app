import { useEffect } from 'react';
import { useThemeStore } from '../stores/theme-store';

export function useThemeEffect() {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const isDark = mode === 'dark' || (mode === 'system' && mql.matches);
      root.classList.toggle('dark', isDark);
    };
    apply();

    if (mode === 'system') {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
  }, [mode]);
}
