# SVG Icon System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `vite-plugin-svgr`-based SVG icon system with 7 icons and update PageHeader, TabBar, MessageBubble, and Survey to use them.

**Architecture:** Install `vite-plugin-svgr` and add `@` path alias. SVG files in `src/static/icons/` are imported as React components with the `?react` query. All SVGs use `fill="currentColor"` so text-color Tailwind classes work.

**Tech Stack:** React 18, TypeScript, Vite 5, vite-plugin-svgr, Tailwind, zmp-ui.

**Spec:** `docs/superpowers/specs/2026-06-24-icon-system-design.md`

**Test convention reminder:**
- Test files using JSX need `import React from 'react'`
- Test files using `toBeInTheDocument` need `import '@testing-library/jest-dom/vitest'`

---

## Task 1: Setup vite-plugin-svgr + vite config + delete old icons dir

**Files:**
- Modify: `vite.config.mts`
- Modify: `package.json` (auto-updated by npm)
- Delete: `src/components/icons/index.ts`
- Delete: `src/components/icons/types.ts`

- [ ] **Step 1: Install vite-plugin-svgr**

```bash
cd "e:/projectVN/edu-mini-app"
npm install -D vite-plugin-svgr
```

Expected: package.json updated with `vite-plugin-svgr` devDep.

- [ ] **Step 2: Read current vite.config.mts**

```bash
cd "e:/projectVN/edu-mini-app"
cat vite.config.mts
```

- [ ] **Step 3: Update vite.config.mts to include svgr + @ alias**

Replace the entire file content with:

```ts
/// <reference types="vitest" />
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

Note: only include the `svgr()` plugin and `@` alias. Remove any other existing config that conflicts (e.g., old `plugins` array, old `resolve` block). If the existing config has things like `optimizeDeps` or `build` blocks, keep them.

- [ ] **Step 4: Delete old icons directory**

```bash
cd "e:/projectVN/edu-mini-app"
rm -f src/components/icons/index.ts src/components/icons/types.ts
ls src/components/icons 2>&1 || echo "icons dir gone"
```

Expected: either the dir is empty or gone. (The `ls` will fail if the dir doesn't exist, which is fine.)

- [ ] **Step 5: Verify build still works**

```bash
cd "e:/projectVN/edu-mini-app"
npm run build 2>&1 | tail -5
```

Expected: build succeeds (the new config doesn't break anything since we haven't used SVGR yet).

- [ ] **Step 6: Commit**

```bash
git add vite.config.mts package.json package-lock.json src/components/icons
git commit -m "chore: add vite-plugin-svgr, @ alias, remove old icons dir"
```

---

## Task 2: Create the SVG icon files

**Files:**
- Modify: `src/static/icons/arrow-left-circle.svg` (change `fill="black"` → `fill="currentColor"`)
- Create: `src/static/icons/check.svg`
- Create: `src/static/icons/x.svg`
- Create: `src/static/icons/chat.svg`
- Create: `src/static/icons/survey.svg`
- Create: `src/static/icons/review.svg`
- Create: `src/static/icons/user.svg`

- [ ] **Step 1: Update arrow-left-circle.svg to use currentColor**

Overwrite `src/static/icons/arrow-left-circle.svg`:

```xml
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM11.5 7.5C11.7761 7.5 12 7.72386 12 8C12 8.27614 11.7761 8.5 11.5 8.5H5.70711L7.85355 10.6464C8.04882 10.8417 8.04882 11.1583 7.85355 11.3536C7.65829 11.5488 7.34171 11.5488 7.14645 11.3536L4.14645 8.35355C3.95118 8.15829 3.95118 7.84171 4.14645 7.64645L7.14645 4.64645C7.34171 4.45118 7.65829 4.45118 7.85355 4.64645C8.04882 4.84171 8.04882 5.15829 7.85355 5.35355L5.70711 7.5H11.5Z" fill="currentColor"/>
</svg>
```

- [ ] **Step 2: Create check.svg**

Create `src/static/icons/check.svg` (16×16):

```xml
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM11.7071 5.29289C12.0976 5.68342 12.0976 6.31658 11.7071 6.70711L7.70711 10.7071C7.31658 11.0976 6.68342 11.0976 6.29289 10.7071L4.29289 8.70711C3.90237 8.31658 3.90237 7.68342 4.29289 7.29289C4.68342 6.90237 5.31658 6.90237 5.70711 7.29289L7 8.58579L10.2929 5.29289C10.6834 4.90237 11.3166 4.90237 11.7071 5.29289Z" fill="currentColor"/>
</svg>
```

- [ ] **Step 3: Create x.svg**

Create `src/static/icons/x.svg` (16×16):

```xml
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4.70711 4.29289C4.31658 3.90237 3.68342 3.90237 3.29289 4.29289C2.90237 4.68342 2.90237 5.31658 3.29289 5.70711L6.58579 9L3.29289 12.2929C2.90237 12.6834 2.90237 13.3166 3.29289 13.7071C3.68342 14.0976 4.31658 14.0976 4.70711 13.7071L8 10.4142L11.2929 13.7071C11.6834 14.0976 12.3166 14.0976 12.7071 13.7071C13.0976 13.3166 13.0976 12.6834 12.7071 12.2929L9.41421 9L12.7071 5.70711C13.0976 5.31658 13.0976 4.68342 12.7071 4.29289C12.3166 3.90237 11.6834 3.90237 11.2929 4.29289L8 7.58579L4.70711 4.29289Z" fill="currentColor"/>
</svg>
```

- [ ] **Step 4: Create chat.svg**

Create `src/static/icons/chat.svg` (24×24):

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.4774 22 9.02244 21.6617 7.75 21.071L4.07143 22.321C3.95342 22.3586 3.82717 22.3623 3.70754 22.3317C3.58791 22.3012 3.48036 22.2376 3.3973 22.1484C3.31423 22.0592 3.25925 21.9483 3.23844 21.8288C3.21764 21.7094 3.23191 21.5867 3.27986 21.475L4.83929 17.7143C4.30536 16.6254 4 15.3636 4 14H2V12ZM12 4C7.58172 4 4 7.58172 4 12C4 13.3347 4.33102 14.5879 4.90289 15.6804L4.98214 15.8214L4.23214 17.7679L6.17857 17.0179L6.31964 17.0971C7.41211 17.669 8.66532 18 10 18H12C16.4183 18 20 14.4183 20 10C20 7.58172 18.4183 4 12 4ZM8 10C8 10.5523 7.55228 11 7 11C6.44772 11 6 10.5523 6 10C6 9.44772 6.44772 9 7 9C7.55228 9 8 9.44772 8 10ZM13 10C13 10.5523 12.5523 11 12 11C11.4477 11 11 10.5523 11 10C11 9.44772 11.4477 9 12 9C12.5523 9 13 9.44772 13 10ZM18 10C18 10.5523 17.5523 11 17 11C16.4477 11 16 10.5523 16 10C16 9.44772 16.4477 9 17 9C17.5523 9 18 9.44772 18 10Z" fill="currentColor"/>
</svg>
```

- [ ] **Step 5: Create survey.svg**

Create `src/static/icons/survey.svg` (24×24):

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5 2C3.34315 2 2 3.34315 2 5V21C2 21.5523 2.44772 22 3 22C3.55228 22 4 21.5523 4 21V20H21C21.5523 20 22 19.5523 22 19V5C22 3.34315 20.6569 2 19 2H5ZM4 18V5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V18H4ZM7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8C17 8.55228 16.5523 9 16 9H8C7.44772 9 7 8.55228 7 8ZM7 12C7 11.4477 7.44772 11 8 11H13C13.5523 11 14 11.4477 14 12C14 12.5523 13.5523 13 13 13H8C7.44772 13 7 12.5523 7 12Z" fill="currentColor"/>
</svg>
```

- [ ] **Step 6: Create review.svg**

Create `src/static/icons/review.svg` (24×24):

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M3 13C3 16.866 6.13401 20 10 20H14C17.866 20 21 16.866 21 13V11C21 7.13401 17.866 4 14 4H10C6.13401 4 3 7.13401 3 11V13ZM22 11C22 7.13401 18.866 4 15 4H9C5.13401 4 2 7.13401 2 11V14C2 17.866 5.13401 21 9 21H13C16.866 21 20 17.866 20 14V13C21.1046 13 22 12.1046 22 11ZM8 11C8 11.5523 7.55228 12 7 12C6.44772 12 6 11.5523 6 11C6 10.4477 6.44772 10 7 10C7.55228 10 8 10.4477 8 11ZM13 11C13 11.5523 12.5523 12 12 12C11.4477 12 11 11.5523 11 11C11 10.4477 11.4477 10 12 10C12.5523 10 13 10.4477 13 11ZM17 11C17 11.5523 16.5523 12 16 12C15.4477 12 15 11.5523 15 11C15 10.4477 15.4477 10 16 10C16.5523 10 17 10.4477 17 11Z" fill="currentColor"/>
</svg>
```

- [ ] **Step 7: Create user.svg**

Create `src/static/icons/user.svg` (24×24):

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11ZM12 13C9.9964 13 8.05734 13.3708 6.44484 14.0391C4.83271 14.7073 3.52359 15.6429 2.75736 16.7787C2.37428 17.346 2 18.1145 2 19V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V19C22 18.1145 21.6257 17.346 21.2426 16.7787C20.4764 15.6429 19.1673 14.7073 17.5552 14.0391C15.9427 13.3708 14.0036 13 12 13Z" fill="currentColor"/>
</svg>
```

- [ ] **Step 8: Verify build still works**

```bash
cd "e:/projectVN/edu-mini-app"
npm run build 2>&1 | tail -5
```

Expected: build succeeds.

- [ ] **Step 9: Commit**

```bash
git add src/static/icons
git commit -m "feat: add 6 new SVG icons + update arrow-left to use currentColor"
```

---

## Task 3: Update PageHeader to use ArrowLeft icon

**Files:**
- Modify: `src/components/page-header.tsx`
- Modify: `src/components/page-header.test.tsx`

- [ ] **Step 1: Read the existing PageHeader test**

```bash
cd "e:/projectVN/edu-mini-app"
cat src/components/page-header.test.tsx
```

- [ ] **Step 2: Update PageHeader to use the icon**

Overwrite `src/components/page-header.tsx`:

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowLeft from '@/static/icons/arrow-left-circle.svg?react';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function PageHeader({ title, onBack, right }: Props) {
  const nav = useNavigate();
  const showBack = Boolean(onBack);
  const handleBack = onBack ?? (() => nav(-1));
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
      {showBack ? (
        <button
          onClick={handleBack}
          className="w-16 text-left flex items-center gap-1"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
      ) : (
        <div className="w-16" />
      )}
      <h1 className="text-lg font-bold flex-1 text-center">{title}</h1>
      <div className="w-16 text-right">{right}</div>
    </header>
  );
}
```

- [ ] **Step 3: Update the PageHeader test**

Replace `src/components/page-header.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageHeader } from './page-header';

function renderAt(path: string, props: React.ComponentProps<typeof PageHeader>) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PageHeader {...props} />
    </MemoryRouter>,
  );
}

describe('PageHeader', () => {
  it('renders the title', () => {
    renderAt('/', { title: 'My Title' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Title');
  });

  it('shows back button when onBack is provided and clicking it calls onBack', () => {
    const onBack = vi.fn();
    renderAt('/', { title: 'Chat', onBack });
    const btn = screen.getByLabelText('Back');
    fireEvent.click(btn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('hides back button when onBack is omitted', () => {
    renderAt('/', { title: 'NoBack' });
    expect(screen.queryByLabelText('Back')).not.toBeInTheDocument();
  });

  it('calls custom onBack when provided', () => {
    const onBack = vi.fn();
    renderAt('/', { title: 'X', onBack });
    fireEvent.click(screen.getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders the right slot', () => {
    renderAt('/', { title: 'Chat', right: <button>New</button> });
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });
});
```

The 5 tests remain the same as before (they don't directly test for text content, so they still pass).

- [ ] **Step 4: Run tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/page-header.test.tsx 2>&1 | tail -10
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/page-header.tsx src/components/page-header.test.tsx
git commit -m "feat: PageHeader uses ArrowLeft SVG icon"
```

---

## Task 4: Update TabBar to use SVG icons instead of emojis

**Files:**
- Modify: `src/components/tab-bar.tsx`
- Modify: `src/components/tab-bar.test.tsx`

- [ ] **Step 1: Read existing TabBar**

```bash
cd "e:/projectVN/edu-mini-app"
cat src/components/tab-bar.tsx
```

- [ ] **Step 2: Overwrite TabBar with icons**

Overwrite `src/components/tab-bar.tsx`:

```tsx
import React from 'react'
import { NavLink } from 'react-router-dom'

import { useTranslation } from '../i18n/use-translation'
import ChatIcon from '@/static/icons/chat.svg?react'
import SurveyIcon from '@/static/icons/survey.svg?react'
import ReviewIcon from '@/static/icons/review.svg?react'
import UserIcon from '@/static/icons/user.svg?react'

interface TabDef {
  to: string
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  labelKey: 'chat' | 'survey' | 'review' | 'user'
}

const TABS: TabDef[] = [
  { to: '/',       Icon: ChatIcon,   labelKey: 'chat' },
  { to: '/survey', Icon: SurveyIcon, labelKey: 'survey' },
  { to: '/review', Icon: ReviewIcon, labelKey: 'review' },
  { to: '/user',   Icon: UserIcon,   labelKey: 'user' },
]

export function TabBar() {
  const { t } = useTranslation()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-gray-200 flex justify-around pb-[env(safe-area-inset-bottom)] z-50"
      role="navigation"
      aria-label="Main"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `tab-item flex flex-col items-center justify-center flex-1 py-2 text-xs ${
              isActive ? 'text-blue-500 font-semibold is-active' : 'text-gray-500 font-normal'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <tab.Icon className="w-5 h-5 mb-1" aria-hidden="true" />
              {!isActive && <span>{t(`tabs.${tab.labelKey}`)}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 3: Run TabBar tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/tab-bar.test.tsx 2>&1 | tail -10
```

Expected: 5 tests pass (tests don't directly test for emoji or icons, they test labels and active state).

- [ ] **Step 4: Commit**

```bash
git add src/components/tab-bar.tsx
git commit -m "feat: TabBar uses SVG icons instead of emojis"
```

---

## Task 5: Update MessageBubble and Survey to use Check/X icons

**Files:**
- Modify: `src/components/chat/message-bubble.tsx`
- Modify: `src/pages/survey.tsx`

- [ ] **Step 1: Read MessageBubble**

```bash
cd "e:/projectVN/edu-mini-app"
cat src/components/chat/message-bubble.tsx
```

- [ ] **Step 2: Update MessageBubble to use icons**

Overwrite `src/components/chat/message-bubble.tsx`:

```tsx
import React from 'react';
import { KatexRenderer } from '../katex-renderer';
import CheckIcon from '@/static/icons/check.svg?react';
import XIcon from '@/static/icons/x.svg?react';
import type { ChatMessage } from '../../providers/types';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message.feedback === 'correct' && (
          <CheckIcon
            className="inline w-4 h-4 mb-1 text-green-600"
            aria-label="Correct"
          />
        )}
        {message.feedback === 'incorrect' && (
          <XIcon
            className="inline w-4 h-4 mb-1 text-red-600"
            aria-label="Incorrect"
          />
        )}
        <KatexRenderer>{message.content}</KatexRenderer>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Read Survey finished screen JSX**

```bash
cd "e:/projectVN/edu-mini-app"
grep -n "answers\[i\]" src/pages/survey.tsx
```

- [ ] **Step 4: Update Survey finished screen to use icons**

In `src/pages/survey.tsx`, find the per-question feedback block:

```tsx
<span className="text-lg">
  {state.answers[i] === true ? '✅' : state.answers[i] === false ? '❌' : '⏭️'}
</span>
```

Replace with:

```tsx
{state.answers[i] === true ? (
  <CheckIcon className="w-5 h-5 text-green-600" aria-label="Correct" />
) : state.answers[i] === false ? (
  <XIcon className="w-5 h-5 text-red-600" aria-label="Incorrect" />
) : (
  <span className="text-gray-400 text-lg">—</span>
)}
```

Also add the imports at the top of `src/pages/survey.tsx` (next to the other imports from `@/static/icons/...`):

```tsx
import CheckIcon from '@/static/icons/check.svg?react';
import XIcon from '@/static/icons/x.svg?react';
```

- [ ] **Step 5: Run all tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test 2>&1 | tail -5
```

Expected: all 66 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/chat/message-bubble.tsx src/pages/survey.tsx
git commit -m "feat: MessageBubble and Survey use Check/X SVG icons"
```

---

## Task 6: Final integration verification

- [ ] **Step 1: Run all tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test 2>&1 | tail -5
```

Expected: 66 tests pass.

- [ ] **Step 2: Run a production build**

```bash
cd "e:/projectVN/edu-mini-app"
npm run build 2>&1 | tail -5
```

Expected: build succeeds.

- [ ] **Step 3: Manual smoke test**

```bash
cd "e:/projectVN/edu-mini-app"
npm run dev &>/tmp/dev.log &
sleep 4
curl -s http://localhost:3000 | head -10
pkill -f "vite dev" 2>/dev/null
echo "DONE"
```

Expected: HTML response. Then open `http://localhost:3000` in a browser and verify:
- TabBar icons render (chat, survey, review, user)
- PageHeader back button shows arrow icon
- Answer correctly → green check icon next to message
- Answer incorrectly → red X icon next to message
- Survey finished screen → green check / red X / dash for skipped

---

## Self-Review Notes

Spec coverage:
- §4 Setup → Task 1
- §5 Icon set (7 files) → Task 2
- §6 Usage patterns → Tasks 3, 4, 5
- §7 File changes → All tasks
- §8 Tests → Task 3 (PageHeader test unchanged since it doesn't check text directly)
- §9 Error handling → covered by Vite build
- §10 Risks → addressed: currentColor used in all SVGs

Type consistency:
- `TabDef` interface uses `Icon: React.FC<React.SVGProps<SVGSVGElement>>` consistently
- Imports use `@/static/icons/...svg?react` pattern throughout
- No placeholders found