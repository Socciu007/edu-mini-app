import { useCallback, useMemo } from 'react';
import en from './en.json';
import vi from './vi.json';
import { useSettingsStore } from '../stores/settings-store';

const PACKS = { en, vi } as const;
type Pack = typeof en;
type Key = string;

function resolve(pack: Pack, key: Key): unknown {
  return key.split('.').reduce<unknown>((acc, k) => {
    if (acc && typeof acc === 'object' && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, pack);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`));
}

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);

  const t = useCallback(
    (key: Key, vars?: Record<string, string | number>): string => {
      const primary = resolve(PACKS[language], key);
      if (typeof primary === 'string') return interpolate(primary, vars);
      const fallback = resolve(PACKS[language === 'vi' ? 'en' : 'vi'], key);
      if (typeof fallback === 'string') return interpolate(fallback, vars);
      return key;
    },
    [language],
  );

  // Return a value (string or array) for a key. Falls back to the other
  // language, then to the key itself. Used for arrays like starterPrompts.
  const tValue = useCallback(
    (key: Key): unknown => {
      const primary = resolve(PACKS[language], key);
      if (primary !== undefined) return primary;
      const fallback = resolve(PACKS[language === 'vi' ? 'en' : 'vi'], key);
      if (fallback !== undefined) return fallback;
      return key;
    },
    [language],
  );

  return useMemo(() => ({ t, tValue, language }), [t, tValue, language]);
}
