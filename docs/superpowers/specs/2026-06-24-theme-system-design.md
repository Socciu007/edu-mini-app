# Theme System with Light/Dark Mode — Design

**Date:** 2026-06-24
**Status:** Approved (pending user review of this written spec)
**Project:** `edu-mini-app` (Zalo Mini App)

## 1. Purpose

Add a customizable theme system using a provided color palette for light mode and equivalent dark mode. Theme is auto-detected from OS preference, with a manual override toggle in the User tab. All components are refactored to use semantic tokens (no more hardcoded Tailwind colors) so they adapt to the current theme.

## 2. Scope

### In scope

- Light theme color tokens (per provided palette: #22C55E primary, #0F172A text, etc.)
- Dark theme color tokens (slate-900 background, slate-800 surface, etc.)
- CSS variables in `:root` and `.dark` in `src/css/app.scss`
- Tailwind `darkMode: 'class'` + new semantic color tokens
- Theme store (Zustand) with 3 modes: `light`, `dark`, `system`
- `useThemeEffect` hook to apply the `dark` class to `<html>`
- Theme toggle in User tab (3 buttons: Light / Dark / System)
- localStorage persistence
- FOUC prevention via inline script in `index.html`
- Full refactor of all hardcoded color usage to semantic tokens

### Out of scope (v1)

- High-contrast / accessibility theme
- Custom color picker
- Per-screen theme overrides
- Theme-switch animations
- Cross-device theme sync (localStorage only)
- Print stylesheet
- KaTeX dark-mode adjustments (KaTeX CSS is third-party; acceptable for v1)
- Tests for every refactored component (only theme store + effect + User page)

## 3. Color Tokens

### Light theme (from user palette)

| Token | Hex | RGB | Use case |
|-------|-----|-----|----------|
| `--color-primary-rgb` | #22C55E | 34 197 94 | Primary Green, CTA |
| `--color-primary-pressed` | #15803D | 21 128 61 | Pressed state |
| `--color-primary-foreground` | #FFFFFF | 255 255 255 | Text on primary |
| `--color-secondary` | #10B981 | 16 185 129 | Secondary Green |
| `--color-accent` | #3B82F6 | 59 130 246 | Accent Blue, links |
| `--color-accent-soft` | #DBEAFE | 219 234 254 | Light Blue, info bg |
| `--color-background` | #F0F9FF | 240 249 255 | App background |
| `--color-surface` | #FFFFFF | 255 255 255 | Cards, modals |
| `--color-text` | #0F172A | 15 23 42 | Primary text |
| `--color-text-secondary` | #475569 | 71 85 105 | Subtitles |
| `--color-text-subtle` | #64748B | 100 116 139 | Muted, placeholders |
| `--color-border` | #DCEAF7 | 220 234 247 | Card borders |
| `--color-divider` | #E2E8F0 | 226 232 240 | Dividers |
| `--color-success` | #16A34A | 22 163 74 | Success state |
| `--color-danger` | #DC2626 | 220 38 38 | Danger state |
| `--color-warning` | #CA8A04 | 202 138 4 | Warning state |
| `--color-inactive` | #94A3B8 | 148 163 184 | Inactive elements |
| `--color-inactive-foreground` | #64748B | 100 116 139 | Inactive text |
| `--color-overlay` | #000000 | 0 0 0 | Modal backdrop |
| `--color-tabbar-bg` | #FFFFFF | 255 255 255 | Tab bar background |
| `--color-header-bg` | #FFFFFF | 255 255 255 | Page header background |
| `--color-input-bg` | #FFFFFF | 255 255 255 | Input field background |
| `--color-card-hover` | #F8FAFC | 248 250 252 | Card hover state |
| `--color-code-bg` | #F1F5F9 | 241 245 249 | Code/inline code |

### Dark theme (proposed equivalents)

| Token | Hex | RGB | Notes |
|-------|-----|-----|-------|
| `--color-primary-rgb` | #22C55E | 34 197 94 | Same green (works on dark) |
| `--color-primary-pressed` | #16A34A | 22 163 74 | Slightly lighter |
| `--color-secondary` | #10B981 | 16 185 129 | Same |
| `--color-accent` | #60A5FA | 96 165 250 | Lighter blue for dark |
| `--color-accent-soft` | #1E3A8A | 30 58 138 | Deep blue for dark |
| `--color-background` | #0F172A | 15 23 42 | slate-900 |
| `--color-surface` | #1E293B | 30 41 59 | slate-800 |
| `--color-text` | #F8FAFC | 248 250 252 | slate-50 |
| `--color-text-secondary` | #CBD5E1 | 203 213 225 | slate-300 |
| `--color-text-subtle` | #94A3B8 | 148 163 184 | slate-400 |
| `--color-border` | #334155 | 51 65 85 | slate-700 |
| `--color-divider` | #475569 | 71 85 105 | slate-600 |
| `--color-success` | #22C55E | 34 197 94 | Same |
| `--color-danger` | #F87171 | 248 113 113 | Lighter red |
| `--color-warning` | #FACC15 | 250 204 21 | Lighter yellow |
| `--color-inactive` | #475569 | 71 85 105 | slate-600 |
| `--color-inactive-foreground` | #94A3B8 | 148 163 184 | |
| `--color-tabbar-bg` | #1E293B | 30 41 59 | Match surface |
| `--color-header-bg` | #1E293B | 30 41 59 | Match surface |
| `--color-input-bg` | #334155 | 51 65 85 | slate-700 |
| `--color-card-hover` | #334155 | 51 65 85 | slate-700 |
| `--color-code-bg` | #0F172A | 15 23 42 | Match background |

## 4. Architecture

```
app.scss                    ← :root + .dark with all CSS variables
tailwind.config.js         ← darkMode: 'class' + new color tokens
index.html                  ← inline script for FOUC prevention
src/stores/theme-store.ts   ← Zustand: mode ('light'|'dark'|'system') + persist
src/hooks/use-theme-effect.ts ← apply/remove 'dark' class on <html>
src/pages/user.tsx          ← Theme toggle UI (3 buttons)
```

## 5. Token mapping (hardcoded → semantic)

| Old class | New class |
|-----------|-----------|
| `bg-white` | `bg-surface` (cards) or `bg-background` (page bg) |
| `bg-gray-50`, `bg-gray-100` | `bg-background` |
| `text-gray-500` | `text-text-subtle` |
| `text-gray-700` | `text-text-secondary` |
| `text-gray-900` | `text-text` |
| `border-gray-100`, `border-gray-200` | `border-border` |
| `border-gray-300` | `border-border` |
| `bg-blue-500` | `bg-primary` |
| `text-blue-500` | `text-primary` |
| `bg-yellow-50` | `bg-accent-soft` |
| `text-yellow-800` | `text-warning` |
| `text-green-600` | `text-success` |
| `text-red-600` | `text-danger` |

## 6. Theme store + effect

### `src/stores/theme-store.ts`

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'edu-theme-v1' },
  ),
);
```

### `src/hooks/use-theme-effect.ts`

```ts
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
```

## 7. Theme toggle UI (User tab)

```tsx
<section className="mb-6">
  <h2 className="text-sm font-medium text-text-secondary mb-2">{t('user.theme')}</h2>
  <div className="flex gap-2">
    {(['light', 'dark', 'system'] as const).map((m) => (
      <button
        key={m}
        onClick={() => setMode(m)}
        className={`flex-1 rounded-lg border py-2 text-sm ${
          mode === m
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-text-secondary'
        }`}
      >
        {t(`user.theme${m[0].toUpperCase()}${m.slice(1)}`)}
      </button>
    ))}
  </div>
</section>
```

## 8. FOUC prevention (index.html)

```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('edu-theme-v1');
      var mode = stored ? JSON.parse(stored).state.mode : 'system';
      var isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
</script>
```

## 9. File changes

**New files:**
- `src/stores/theme-store.ts`
- `src/hooks/use-theme-effect.ts`
- `src/stores/theme-store.test.ts`
- `src/hooks/use-theme-effect.test.ts`

**Modified files:**
- `src/css/app.scss` — add `:root` and `.dark` with all CSS variables
- `tailwind.config.js` — add `darkMode: 'class'` + new color tokens
- `index.html` — add inline script
- `src/pages/user.tsx` — add Theme section + import theme store
- `src/pages/user.test.tsx` — add theme toggle tests
- `src/i18n/vi.json` + `src/i18n/en.json` — add `user.theme*` keys
- `src/app.tsx` — call `useThemeEffect()`

**Refactored (semantic tokens):**
- `src/components/page-header.tsx`
- `src/components/tab-bar.tsx`
- `src/components/chat/chat-input.tsx`
- `src/components/chat/message-bubble.tsx`
- `src/components/chat/empty-state.tsx`
- `src/components/language-toggle.tsx`
- `src/pages/chat.tsx`
- `src/pages/survey.tsx`
- `src/pages/review.tsx`

(~9 files; some may not need changes if they don't use hardcoded colors)

## 10. Tests

**New tests:**
- `src/stores/theme-store.test.ts`:
  - Default mode is `'system'`
  - `setMode('dark')` updates the mode
- `src/hooks/use-theme-effect.test.ts`:
  - mode `'dark'` → `<html>` has `dark` class
  - mode `'light'` → `<html>` does not have `dark` class
  - mode `'system'` + OS prefers dark → `dark` class added
  - mode `'system'` + OS prefers light → no `dark` class
- Update `src/pages/user.test.tsx`:
  - 3 theme buttons render
  - Clicking a button changes the mode
  - Active button has the active style

**No new tests** for refactored components (visual verification, not behavioral change).

## 11. Error handling

| Failure | UX |
|---------|----|
| `localStorage` read fails (corrupt) | Inline script falls back to `system`; store falls back to default |
| `matchMedia` not supported | `system` mode behaves like `light` |
| CSS variable not defined | Falls back to `transparent` or `inherit` — no crash |

## 12. Risks

- **jsdom + `matchMedia`**: Tests need to stub `window.matchMedia` (jsdom doesn't fully implement it). Use `vi.stubGlobal` or similar.
- **KaTeX dark mode**: KaTeX CSS is third-party; equations will retain light-mode colors. Acceptable for v1.
- **Zalo Mini App internal styles**: zmp-ui has its own theming but we don't use it in our pages. Not a concern.
- **FOUC**: Inline script prevents flash on first paint. The script must run BEFORE React mounts.

## 13. Out of scope (v1)

- High-contrast / accessibility theme
- Custom color picker
- Per-screen theme overrides
- Theme-switch animations
- Cross-device theme sync
- Print stylesheet
- KaTeX dark-mode adjustments
- Tests for every refactored component