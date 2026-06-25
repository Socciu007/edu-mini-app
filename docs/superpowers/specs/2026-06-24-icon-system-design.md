# Icon System — Design

**Date:** 2026-06-24
**Status:** Approved (pending user review of this written spec)
**Project:** `edu-mini-app` (Zalo Mini App)

## 1. Purpose

Add a proper SVG icon system so the app can use icons (instead of text like `← Quay lại` or emojis like 💬 📝) for navigation, feedback, and tab indicators. Import SVG files from `src/static/icons/` as React components using `vite-plugin-svgr`.

## 2. Scope

### In scope

- Install and configure `vite-plugin-svgr`
- Add `@` path alias for clean imports
- Create 7 SVG icon files in `src/static/icons/`:
  - `arrow-left-circle.svg` (already exists, keep)
  - `check.svg`
  - `x.svg`
  - `chat.svg`
  - `survey.svg`
  - `review.svg`
  - `user.svg`
- Update `PageHeader` to use the arrow icon (drop `← Quay lại` text)
- Update `TabBar` to use icons instead of emojis
- Update `MessageBubble` to use Check / X icons for feedback indicators
- Update `Survey` finished screen to use Check / X icons per question
- Update tests to reflect icon changes

### Out of scope (v1)

- More icons (settings, refresh, forward, etc.) — add later as needed
- Animated icons
- Icon size variants (e.g., `<Icon size="sm">`)
- Icon theming / dark mode
- Server-side icon loading
- Custom icons authored as JSX (we use SVG files only)
- SVG optimization (SVGO) — accept file sizes as-is

## 3. Architecture

```
src/static/icons/*.svg       ← SVG source files
       ↓ (build)
vite-plugin-svgr              ← transforms to React components
       ↓ (runtime)
import ArrowLeft from '.../arrow-left-circle.svg?react'   ← React component
<ArrowLeft className="w-4 h-4 text-gray-600" />
```

## 4. Setup

### Install plugin

```bash
cd "e:/projectVN/edu-mini-app"
pnpm add -D vite-plugin-svgr
# or: npm install -D vite-plugin-svgr
```

### Update `vite.config.mts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

### Existing `src/components/icons/index.ts` and `types.ts`

The old template left `src/components/icons/index.ts` and `src/components/icons/types.ts` from the restaurant app. These are no longer needed. Delete them.

## 5. Icon Set

All SVGs should:
- Be ~16×16 or 24×24 viewBox
- Use `fill="currentColor"` so text-color Tailwind classes work
- Be minimal — single path or simple shapes

| File | Size | Used by |
|------|------|---------|
| `arrow-left-circle.svg` | 16×16 | PageHeader back button (existing file) |
| `check.svg` | 16×16 | MessageBubble correct, Survey correct per-question |
| `x.svg` | 16×16 | MessageBubble incorrect, Survey incorrect per-question |
| `chat.svg` | 24×24 | TabBar Chat tab |
| `survey.svg` | 24×24 | TabBar Survey tab |
| `review.svg` | 24×24 | TabBar Review tab |
| `user.svg` | 24×24 | TabBar User tab |

## 6. Icon Usage Patterns

### PageHeader

```tsx
import ArrowLeft from '@/static/icons/arrow-left-circle.svg?react';

// In the back button:
<button
  onClick={handleBack}
  className="w-16 text-left"
  aria-label="Back"
>
  <ArrowLeft className="inline w-4 h-4 text-gray-600" />
</button>
```

(The `← Quay lại` text is removed.)

### TabBar

```tsx
import ChatIcon from '@/static/icons/chat.svg?react';
import SurveyIcon from '@/static/icons/survey.svg?react';
import ReviewIcon from '@/static/icons/review.svg?react';
import UserIcon from '@/static/icons/user.svg?react';

interface TabDef {
  to: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  labelKey: 'chat' | 'survey' | 'review' | 'user';
}

const TABS: TabDef[] = [
  { to: '/',       Icon: ChatIcon,   labelKey: 'chat' },
  { to: '/survey', Icon: SurveyIcon, labelKey: 'survey' },
  { to: '/review', Icon: ReviewIcon, labelKey: 'review' },
  { to: '/user',   Icon: UserIcon,   labelKey: 'user' },
];

// In JSX:
<TABS.map(tab => (
  <NavLink ...>
    <tab.Icon className="text-xl ..." aria-hidden="true" />
    {!isActive && <span>{t(`tabs.${tab.labelKey}`)}</span>}
  </NavLink>
))>
```

Icons always render (regardless of active state). Active tab: blue icon + bold label. Inactive tab: gray icon + normal label.

### MessageBubble

```tsx
import CheckIcon from '@/static/icons/check.svg?react';
import XIcon from '@/static/icons/x.svg?react';

// Replace existing emoji feedback indicators:
{message.feedback === 'correct' && (
  <CheckIcon className="inline w-4 h-4 text-green-600" aria-label="Correct" />
)}
{message.feedback === 'incorrect' && (
  <XIcon className="inline w-4 h-4 text-red-600" aria-label="Incorrect" />
)}
```

### Survey finished screen

Replace `✅` / `❌` / `⏭️` with icons:
```tsx
{state.answers[i] === true && <CheckIcon className="text-lg text-green-600" aria-label="Correct" />}
{state.answers[i] === false && <XIcon className="text-lg text-red-600" aria-label="Incorrect" />}
{state.answers[i] === null && <span className="text-gray-400">—</span>}
```

## 7. File Changes

### New files
- `src/static/icons/check.svg`
- `src/static/icons/x.svg`
- `src/static/icons/chat.svg`
- `src/static/icons/survey.svg`
- `src/static/icons/review.svg`
- `src/static/icons/user.svg`

### Modified files
- `vite.config.mts` — add svgr plugin + `@` alias
- `package.json` + `package-lock.json` — add `vite-plugin-svgr` devDep
- `src/components/page-header.tsx` — use ArrowLeft icon, drop text
- `src/components/tab-bar.tsx` — use icons instead of emojis
- `src/components/chat/message-bubble.tsx` — use Check / X icons
- `src/pages/survey.tsx` — use Check / X icons per question

### Deleted files
- `src/components/icons/index.ts`
- `src/components/icons/types.ts`

## 8. Tests

### Updated tests
- `src/components/page-header.test.tsx`:
  - Remove the test that expects "← Quay lại" text (or update it to look for the icon instead)
  - Tests still pass overall

### No new tests needed
- SVG components don't need unit tests (they're data)
- Visual verification happens at build time (vite-plugin-svgr validates)

## 9. Error Handling

| Failure | Behavior |
|---------|----------|
| Missing SVG file | Vite build error at compile time |
| Malformed SVG | SVGR throws at compile time |
| Runtime icon render failure | React throws, caught by error boundary if any |

## 10. Risks

- **`vite-plugin-svgr` version compat**: Plugin v4+ works with Vite 5. If issues arise, we may need to pin a specific version.
- **Authoring SVGs with `currentColor`**: The existing `arrow-left-circle.svg` uses `fill="black"` — this needs to be changed to `fill="currentColor"` for the icon to inherit text color from Tailwind. New SVGs must use `currentColor`.
- **Bundle size**: ~5KB added. Negligible.

## 11. Out of Scope (v1)

- More icons (settings, refresh, forward, home, etc.)
- Animated icons
- Size variants
- Dark mode / theming
- SVG optimization
- Custom JSX-authored icons