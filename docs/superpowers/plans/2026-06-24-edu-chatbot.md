# Edu Mini App Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ZaUI restaurant-ordering template with a Zalo Mini App that runs an educational chatbot for Math/Physics/Chemistry/English, using a local question bank with AI fallback.

**Architecture:** Three layers (UI → Chat Service → Provider) plus Zustand+localStorage persistence. Chat service does regex-based intent detection and routes to a `LocalBankProvider` (JSON files) or a generic `AIProvider` (env-configurable OpenAI-compatible endpoint). Math is rendered via KaTeX. UI is bilingual VI/EN.

**Tech Stack:** React 18, TypeScript, Vite 5, Zustand, TanStack Query, Tailwind, zmp-ui, zmp-sdk, KaTeX, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-24-edu-chatbot-design.md`

**Note on git:** This project is not currently a git repository. Task 1 initializes git. Every subsequent "Commit" step depends on Task 1 having run. If you choose not to initialize git, skip the commit steps but still complete the work.

---

## Phase 1: Setup & Cleanup

### Task 1: Initialize git repository

**Files:**
- Create: `.gitignore` (already exists; verify)

- [ ] **Step 1: Initialize git and make initial commit**

```bash
cd "e:/projectVN/edu-mini-app"
git init
git add -A
git commit -m "chore: initial import of ZaUI Menu template"
```

Expected: commit succeeds, no errors. Working tree is now tracked.

- [ ] **Step 2: Add the design doc and plan as a second commit**

```bash
git add docs/superpowers
git commit -m "docs: add design spec and implementation plan"
```

---

### Task 2: Install new dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add runtime dependencies**

```bash
cd "e:/projectVN/edu-mini-app"
pnpm add katex
# or: npm install katex
```

- [ ] **Step 2: Add dev dependencies (Vitest + jsdom for component test potential)**

```bash
pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Add test script to package.json**

Modify `package.json` `scripts`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui"
}
```

Keep existing `dev`, `build`, `lint`, `fix` scripts.

- [ ] **Step 4: Add vitest config block to vite.config.mts**

Append to `vite.config.mts`:
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
// ...existing imports...

export default defineConfig({
  // ...existing config...
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

- [ ] **Step 5: Install and commit**

```bash
pnpm install
git add package.json pnpm-lock.yaml vite.config.mts
git commit -m "chore: add katex and vitest dependencies"
```

---

### Task 3: Remove old template modules and mock data

**Files to delete:**
- `src/modules/merchants/` (whole dir)
- `src/modules/oa/` (whole dir)
- `src/modules/orders/` (whole dir)
- `src/modules/products/` (whole dir)
- `src/pages/menu.tsx`
- `src/pages/orders.tsx`
- `src/pages/orders.view.tsx`
- `src/pages/info.tsx`
- `src/mock/index.json`
- `src/mock/menu-items.json`
- `src/mock/oa.json`
- `src/mock/orders.json`
- `src/mock/sessions.json`
- `src/hooks/use-animate.ts`
- `src/utils/request.ts`
- `docs/preview.webp`
- `docs/qr.webp`
- `src/components/icons/icon-cook-pot.tsx`
- `src/components/icons/icon-location.tsx`
- `src/components/icons/icon-minus.tsx`
- `src/components/icons/icon-note.tsx`
- `src/components/icons/icon-oa-verified.tsx`
- `src/components/icons/icon-post-notif.tsx`
- `src/components/icons/icon-restaurant.tsx`
- `src/components/icons/icon-shopping-cart.tsx`

- [ ] **Step 1: Remove directories**

Windows (PowerShell) — run from project root:
```bash
rm -rf src/modules/merchants src/modules/oa src/modules/orders src/modules/products src/mock
rm -f src/pages/menu.tsx src/pages/orders.tsx src/pages/orders.view.tsx src/pages/info.tsx
rm -f src/hooks/use-animate.ts src/utils/request.ts
rm -f docs/preview.webp docs/qr.webp
rm -f src/components/icons/icon-cook-pot.tsx src/components/icons/icon-location.tsx src/components/icons/icon-minus.tsx src/components/icons/icon-note.tsx src/components/icons/icon-oa-verified.tsx src/components/icons/icon-post-notif.tsx src/components/icons/icon-restaurant.tsx src/components/icons/icon-shopping-cart.tsx
```

- [ ] **Step 2: Verify the four pages and module dirs are gone**

```bash
ls src/pages
ls src/modules 2>&1 || echo "modules dir removed (good)"
```

Expected: `src/pages` shows only `home.tsx`, `chat.tsx`, `settings.tsx` (which don't exist yet — empty dir is fine). `src/modules` may not exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove restaurant template modules, pages, and mock data"
```

---

### Task 4: Slim package.json dependencies and update env

**Files:**
- Modify: `package.json`
- Modify: `.env.development`
- Modify: `.env.production`
- Modify: `app-config.json`

- [ ] **Step 1: Remove unused runtime deps from package.json**

In `package.json` `dependencies`, delete these keys:
- `@formatjs/intl-numberformat`
- `@radix-ui/react-scroll-area`
- `@react-spring/web`
- `@use-gesture/react`
- `@xuannghia/html2canvas`
- `react-qrcode-logo`
- `swiper`
- `resize-observer-polyfill`
- `intersection-observer`

In `devDependencies`, delete:
- `@xuannghia/eslint-config` (only if not used; leave if unsure)

Keep: `react`, `react-dom`, `react-router-dom`, `zustand`, `@tanstack/react-query`, `clsx`, `tailwind-merge`, `class-variance-authority`, `usehooks-ts`, `dayjs`, `immer`, `zmp-ui`, `zmp-sdk`, `react-error-boundary`, `dayjs`, plus all build deps (`vite`, `typescript`, etc.).

- [ ] **Step 2: Update .env files with AI config**

Overwrite `.env.development`:
```
VITE_API_URL=
VITE_AI_API_URL=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=
VITE_AI_MODEL=gpt-4o-mini
```

Overwrite `.env.production` with the same content (values for production set at deploy time).

- [ ] **Step 3: Update app-config.json**

```json
{
  "app": {
    "title": "Edu Chat",
    "textColor": "black",
    "statusBar": "transparent",
    "actionBarHidden": true,
    "hideAndroidBottomNavigationBar": true,
    "hideIOSSafeAreaBottom": true
  },
  "debug": false,
  "pages": [],
  "listSyncJS": ["assets/index.1.0.0.module.js"],
  "listAsyncJS": [],
  "listCSS": [],
  "template": { "name": "edu-chat" }
}
```

- [ ] **Step 4: Run install and commit**

```bash
pnpm install
git add package.json pnpm-lock.yaml .env.development .env.production app-config.json
git commit -m "chore: slim dependencies, add AI env config, update app title"
```

---

### Task 5: Trim src/css/app.scss and update main.ts

**Files:**
- Modify: `src/css/app.scss`
- Modify: `src/main.ts`

- [ ] **Step 1: Replace app.scss with a minimal version**

Overwrite `src/css/app.scss`:
```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

@import 'katex/dist/katex.min.css';

html, body, #app { height: 100%; }
body { @apply bg-background text-foreground antialiased; }
```

- [ ] **Step 2: Update src/main.ts**

Overwrite `src/main.ts`:
```ts
import 'zmp-ui/zaui.css'
import './css/app.scss'
import './polyfills'
import 'dayjs/locale/vi'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './app'

dayjs.locale('vi-VN')
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

const root = createRoot(document.getElementById('app')!)
root.render(React.createElement(App))
```

Note: removed `import 'swiper/css'` since we removed swiper.

- [ ] **Step 3: Commit**

```bash
git add src/css/app.scss src/main.ts
git commit -m "chore: add katex stylesheet, remove swiper import"
```

---

## Phase 2: Foundation (types, constants, i18n, seed data)

### Task 6: Create the type definitions

**Files:**
- Create: `src/providers/types.ts`

- [ ] **Step 1: Write the file**

Create `src/providers/types.ts`:
```ts
export type SubjectId = 'math' | 'physics' | 'chemistry' | 'english';

export interface Subject {
  id: SubjectId;
  name: { vi: string; en: string };
  emoji: string;
  color: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  subject: SubjectId;
  prompt: { vi: string; en: string };
  choices?: string[];
  answer: string;
  explanation?: { vi: string; en: string };
  difficulty: Difficulty;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  subject?: SubjectId;
  questionRef?: string;
  feedback?: 'correct' | 'incorrect' | null;
  createdAt: number;
}

export type Intent =
  | { kind: 'request_question'; subject?: SubjectId; difficulty?: Difficulty }
  | { kind: 'submit_answer'; text: string; questionId?: string }
  | { kind: 'request_explanation'; questionId?: string }
  | { kind: 'request_hint'; questionId?: string }
  | { kind: 'chitchat' };

export interface QuestionProvider {
  readonly name: 'local' | 'ai';
  getQuestion(ctx: { subject: SubjectId; difficulty?: Difficulty; excludeIds?: string[] }): Promise<Question>;
  explain?(q: Question, mode?: 'explain' | 'hint'): Promise<string>;
  evaluateAnswer?(q: Question, userAnswer: string): Promise<{ correct: boolean; feedback: string }>;
  chat?(userText: string, history: ChatMessage[]): Promise<string>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/providers/types.ts
git commit -m "feat: add provider and chat type definitions"
```

---

### Task 7: Create subject constants and update routes

**Files:**
- Create: `src/constants/subjects.ts`
- Modify: `src/constants/routes.ts`
- Delete: any old mock-specific entries in `src/constants/common.ts` (review and keep only generic entries)

- [ ] **Step 1: Write subjects.ts**

Create `src/constants/subjects.ts`:
```ts
import type { Subject, SubjectId } from '../providers/types';

export const SUBJECTS: Subject[] = [
  { id: 'math',      name: { vi: 'Toán',      en: 'Math' },      emoji: '➕', color: 'blue' },
  { id: 'physics',   name: { vi: 'Vật lý',    en: 'Physics' },   emoji: '⚛️', color: 'purple' },
  { id: 'chemistry', name: { vi: 'Hóa học',   en: 'Chemistry' }, emoji: '🧪', color: 'green' },
  { id: 'english',   name: { vi: 'Tiếng Anh', en: 'English' },   emoji: '🅰️', color: 'orange' },
];

export const SUBJECT_BY_ID: Record<SubjectId, Subject> = SUBJECTS.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {} as Record<SubjectId, Subject>);
```

- [ ] **Step 2: Overwrite routes.ts**

Overwrite `src/constants/routes.ts`:
```ts
export const ROUTES = {
  home: '/',
  chat: '/chat',
  settings: '/settings',
} as const;
```

- [ ] **Step 3: Trim common.ts**

Read the current `src/constants/common.ts`. If it contains any merchant/order/product keys, delete those entries. Keep generic app-wide keys. If in doubt, replace the file with an empty exports:
```ts
export {};
```

- [ ] **Step 4: Commit**

```bash
git add src/constants/subjects.ts src/constants/routes.ts src/constants/common.ts
git commit -m "feat: add subjects catalog and update routes"
```

---

### Task 8: Create i18n strings

**Files:**
- Create: `src/i18n/vi.json`
- Create: `src/i18n/en.json`
- Create: `src/i18n/use-translation.ts`
- Create: `src/i18n/i18n.test.ts`

- [ ] **Step 1: Write vi.json**

Create `src/i18n/vi.json`:
```json
{
  "home": {
    "title": "Trợ lý học tập",
    "subtitle": "Hỏi đáp, luyện tập mỗi ngày",
    "getStarted": "Bắt đầu"
  },
  "chat": {
    "placeholder": "Nhập câu hỏi hoặc đáp án...",
    "send": "Gửi",
    "newSession": "Phiên mới",
    "settings": "Cài đặt",
    "back": "Quay lại",
    "empty": "Hãy chọn môn học và bắt đầu!",
    "starterPrompts": [
      "Cho tôi câu hỏi Toán",
      "Explain photosynthesis",
      "Hóa học lớp 10",
      "Tiếng Anh ngữ pháp"
    ]
  },
  "subjects": {
    "math": "Toán",
    "physics": "Vật lý",
    "chemistry": "Hóa học",
    "english": "Tiếng Anh"
  },
  "settings": {
    "title": "Cài đặt",
    "language": "Ngôn ngữ",
    "languageVi": "Tiếng Việt",
    "languageEn": "English",
    "provider": "Nguồn câu hỏi",
    "providerAuto": "Tự động (ưu tiên cục bộ)",
    "providerLocal": "Chỉ ngân hàng cục bộ",
    "providerAi": "Chỉ AI",
    "reset": "Bắt đầu lại cuộc trò chuyện",
    "about": "Giới thiệu",
    "aiStatus": "Trạng thái AI",
    "aiReady": "Đã cấu hình",
    "aiNotConfigured": "Chưa cấu hình"
  },
  "errors": {
    "aiOffline": "Không kết nối được AI. Thử lại sau.",
    "aiNotConfigured": "AI chưa được cấu hình. Dùng ngân hàng câu hỏi cục bộ.",
    "retry": "Thử lại",
    "storageFull": "Bộ nhớ đầy, không lưu được."
  },
  "feedback": {
    "correct": "Chính xác! 🎉",
    "incorrect": "Chưa đúng. Đáp án: {{answer}}"
  }
}
```

- [ ] **Step 2: Write en.json**

Create `src/i18n/en.json`:
```json
{
  "home": {
    "title": "Study Assistant",
    "subtitle": "Ask, practice, learn every day",
    "getStarted": "Get started"
  },
  "chat": {
    "placeholder": "Type a question or answer...",
    "send": "Send",
    "newSession": "New session",
    "settings": "Settings",
    "back": "Back",
    "empty": "Pick a subject and let's go!",
    "starterPrompts": [
      "Give me a math question",
      "Explain photosynthesis",
      "Chemistry basics",
      "English grammar"
    ]
  },
  "subjects": {
    "math": "Math",
    "physics": "Physics",
    "chemistry": "Chemistry",
    "english": "English"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "languageVi": "Tiếng Việt",
    "languageEn": "English",
    "provider": "Question source",
    "providerAuto": "Auto (prefer local)",
    "providerLocal": "Local bank only",
    "providerAi": "AI only",
    "reset": "Start a new conversation",
    "about": "About",
    "aiStatus": "AI status",
    "aiReady": "Configured",
    "aiNotConfigured": "Not configured"
  },
  "errors": {
    "aiOffline": "AI is unreachable. Try again later.",
    "aiNotConfigured": "AI is not configured. Using local question bank.",
    "retry": "Retry",
    "storageFull": "Storage is full; changes not saved."
  },
  "feedback": {
    "correct": "Correct! 🎉",
    "incorrect": "Not quite. Answer: {{answer}}"
  }
}
```

- [ ] **Step 3: Write the failing test**

Create `src/i18n/i18n.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useTranslation } from './use-translation';
import { useSettingsStore } from '../stores/settings-store';

describe('useTranslation', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi' });
  });

  it('returns Vietnamese strings by default', () => {
    const { t } = useTranslation();
    expect(t('home.title')).toBe('Trợ lý học tập');
  });

  it('returns English strings when language is en', () => {
    useSettingsStore.setState({ language: 'en' });
    const { t } = useTranslation();
    expect(t('home.title')).toBe('Study Assistant');
  });

  it('falls back to other language when key missing', () => {
    useSettingsStore.setState({ language: 'en' });
    // Force a missing key by stubbing a fake language pack — but our packs are complete.
    // Test the fallback by calling t on a non-existent key:
    const { t } = useTranslation();
    expect(t('nope.nada')).toBe('nope.nada');
  });

  it('interpolates {{var}} placeholders', () => {
    useSettingsStore.setState({ language: 'en' });
    const { t } = useTranslation();
    expect(t('feedback.incorrect', { answer: 'x = 4' })).toBe('Not quite. Answer: x = 4');
  });

  it('tValue returns arrays for array keys', () => {
    const { tValue } = useTranslation();
    expect(Array.isArray(tValue('chat.starterPrompts'))).toBe(true);
  });
});
```

- [ ] **Step 4: Run the test, expect it to fail**

```bash
pnpm test
```

Expected: FAIL — `useTranslation` not found, settings-store not found. That's fine.

- [ ] **Step 5: Implement use-translation.ts**

Create `src/i18n/use-translation.ts`:
```ts
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
```

- [ ] **Step 6: Create a stub settings-store so the test file compiles (Task 11 fills it in)**

Create `src/stores/settings-store.ts`:
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'vi' | 'en';
export type ProviderPref = 'auto' | 'local' | 'ai';

interface SettingsState {
  language: Language;
  preferredProvider: ProviderPref;
  setLanguage: (l: Language) => void;
  setProvider: (p: ProviderPref) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'vi',
      preferredProvider: 'auto',
      setLanguage: (language) => set({ language }),
      setProvider: (preferredProvider) => set({ preferredProvider }),
    }),
    { name: 'edu-settings-v1' },
  ),
);
```

- [ ] **Step 7: Run tests, expect pass**

```bash
pnpm test
```

Expected: all 4 i18n tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/i18n src/stores/settings-store.ts
git commit -m "feat: add bilingual i18n with tests"
```

---

### Task 9: Create local question bank seed data

**Files:**
- Create: `src/data/questions/math.json`
- Create: `src/data/questions/physics.json`
- Create: `src/data/questions/chemistry.json`
- Create: `src/data/questions/english.json`
- Create: `src/data/questions/index.ts` (aggregator)

- [ ] **Step 1: Write math.json (10 questions)**

Create `src/data/questions/math.json`:
```json
[
  {
    "id": "math-001", "subject": "math",
    "prompt": { "vi": "Giải phương trình $2x + 5 = 13$.", "en": "Solve $2x + 5 = 13$." },
    "choices": ["x = 3", "x = 4", "x = 5", "x = 6"], "answer": "x = 4",
    "explanation": { "vi": "Trừ 5 cả hai vế: $2x = 8$. Chia 2: $x = 4$.", "en": "Subtract 5: $2x = 8$. Divide by 2: $x = 4$." },
    "difficulty": "easy", "tags": ["algebra", "linear"]
  },
  {
    "id": "math-002", "subject": "math",
    "prompt": { "vi": "Tính $\\sqrt{144}$.", "en": "Compute $\\sqrt{144}$." },
    "choices": ["10", "11", "12", "14"], "answer": "12",
    "explanation": { "vi": "$12^2 = 144$.", "en": "$12^2 = 144$." },
    "difficulty": "easy", "tags": ["arithmetic"]
  },
  {
    "id": "math-003", "subject": "math",
    "prompt": { "vi": "Phân số $\\frac{3}{4} + \\frac{1}{2}$ bằng?", "en": "What is $\\frac{3}{4} + \\frac{1}{2}$?" },
    "choices": ["$\\frac{4}{6}$", "$\\frac{5}{4}$", "$\\frac{7}{4}$", "$\\frac{2}{3}$"], "answer": "$\\frac{5}{4}$",
    "explanation": { "vi": "$\\frac{1}{2} = \\frac{2}{4}$, cộng: $\\frac{5}{4}$.", "en": "$\\frac{1}{2} = \\frac{2}{4}$, sum: $\\frac{5}{4}$." },
    "difficulty": "easy", "tags": ["fractions"]
  },
  {
    "id": "math-004", "subject": "math",
    "prompt": { "vi": "Nghiệm của $x^2 - 5x + 6 = 0$?", "en": "Solve $x^2 - 5x + 6 = 0$." },
    "choices": ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = 0, 5"], "answer": "x = 2, 3",
    "explanation": { "vi": "Phân tích: $(x-2)(x-3) = 0$.", "en": "Factor: $(x-2)(x-3) = 0$." },
    "difficulty": "medium", "tags": ["algebra", "quadratic"]
  },
  {
    "id": "math-005", "subject": "math",
    "prompt": { "vi": "Đạo hàm $f(x) = 3x^2$ là?", "en": "Derivative of $f(x) = 3x^2$?" },
    "choices": ["$3x$", "$6x$", "$6$", "$9x^2$"], "answer": "$6x$",
    "explanation": { "vi": "$(x^n)' = nx^{n-1}$, áp dụng: $6x$.", "en": "Power rule: $6x$." },
    "difficulty": "medium", "tags": ["calculus", "derivative"]
  },
  {
    "id": "math-006", "subject": "math",
    "prompt": { "vi": "$\\log_{10}(1000)$ bằng?", "en": "$\\log_{10}(1000)$ equals?" },
    "choices": ["2", "3", "4", "10"], "answer": "3",
    "explanation": { "vi": "$10^3 = 1000$.", "en": "$10^3 = 1000$." },
    "difficulty": "medium", "tags": ["logarithm"]
  },
  {
    "id": "math-007", "subject": "math",
    "prompt": { "vi": "Diện tích hình tròn bán kính $r = 5$?", "en": "Area of a circle with $r = 5$?" },
    "choices": ["$10\\pi$", "$25\\pi$", "$50\\pi$", "$5\\pi$"], "answer": "$25\\pi$",
    "explanation": { "vi": "$A = \\pi r^2 = 25\\pi$.", "en": "$A = \\pi r^2 = 25\\pi$." },
    "difficulty": "easy", "tags": ["geometry"]
  },
  {
    "id": "math-008", "subject": "math",
    "prompt": { "vi": "Tích phân $\\int_0^1 2x\\,dx$?", "en": "$\\int_0^1 2x\\,dx$?" },
    "choices": ["0", "1", "2", "$\\frac{1}{2}$"], "answer": "1",
    "explanation": { "vi": "$[x^2]_0^1 = 1$.", "en": "$[x^2]_0^1 = 1$." },
    "difficulty": "hard", "tags": ["calculus", "integral"]
  },
  {
    "id": "math-009", "subject": "math",
    "prompt": { "vi": "Số nào là số nguyên tố?", "en": "Which is a prime number?" },
    "choices": ["9", "15", "17", "21"], "answer": "17",
    "explanation": { "vi": "17 chỉ chia hết cho 1 và 17.", "en": "17 is only divisible by 1 and 17." },
    "difficulty": "easy", "tags": ["number-theory"]
  },
  {
    "id": "math-010", "subject": "math",
    "prompt": { "vi": "$\\sin(30°)$ bằng?", "en": "$\\sin(30°)$ equals?" },
    "choices": ["$\\frac{1}{2}$", "$\\frac{\\sqrt{2}}{2}$", "$\\frac{\\sqrt{3}}{2}$", "$1$"], "answer": "$\\frac{1}{2}$",
    "explanation": { "vi": "Giá trị đặc biệt.", "en": "Standard value." },
    "difficulty": "medium", "tags": ["trigonometry"]
  }
]
```

- [ ] **Step 2: Write physics.json (10 questions)**

Create `src/data/questions/physics.json`:
```json
[
  { "id": "phys-001", "subject": "physics",
    "prompt": { "vi": "Đơn vị SI của lực là?", "en": "SI unit of force?" },
    "choices": ["Joule", "Newton", "Watt", "Pascal"], "answer": "Newton",
    "explanation": { "vi": "Lực đo bằng Newton (N).", "en": "Force is measured in Newtons (N)." },
    "difficulty": "easy", "tags": ["units"] },
  { "id": "phys-002", "subject": "physics",
    "prompt": { "vi": "Gia tốc trọng trường $g \\approx$?", "en": "Gravitational acceleration $g \\approx$?" },
    "choices": ["$9.8$ m/s²", "$6.6$ m/s²", "$12$ m/s²", "$3.1$ m/s²"], "answer": "$9.8$ m/s²",
    "explanation": { "vi": "Gần bề mặt Trái Đất.", "en": "Near Earth's surface." },
    "difficulty": "easy", "tags": ["mechanics"] },
  { "id": "phys-003", "subject": "physics",
    "prompt": { "vi": "Công thức định luật II Newton?", "en": "Newton's 2nd law?" },
    "choices": ["$F = ma$", "$F = mv$", "$E = mc^2$", "$V = IR$"], "answer": "$F = ma$",
    "explanation": { "vi": "Lực = khối lượng × gia tốc.", "en": "Force = mass × acceleration." },
    "difficulty": "easy", "tags": ["mechanics", "newton"] },
  { "id": "phys-004", "subject": "physics",
    "prompt": { "vi": "Tốc độ ánh sáng trong chân không xấp xỉ?", "en": "Speed of light in vacuum (approx)?" },
    "choices": ["$3 \\times 10^5$ m/s", "$3 \\times 10^6$ m/s", "$3 \\times 10^8$ m/s", "$3 \\times 10^{10}$ m/s"], "answer": "$3 \\times 10^8$ m/s",
    "explanation": { "vi": "$c \\approx 3 \\times 10^8$ m/s.", "en": "$c \\approx 3 \\times 10^8$ m/s." },
    "difficulty": "medium", "tags": ["optics"] },
  { "id": "phys-005", "subject": "physics",
    "prompt": { "vi": "Định luật Ohm: $V = $?", "en": "Ohm's law: $V = $?" },
    "choices": ["$IR$", "$I/R$", "$R/I$", "$I + R$"], "answer": "$IR$",
    "explanation": { "vi": "$V = I \\cdot R$.", "en": "$V = I \\cdot R$." },
    "difficulty": "easy", "tags": ["electricity"] },
  { "id": "phys-006", "subject": "physics",
    "prompt": { "vi": "Công thức Einstein nổi tiếng?", "en": "Einstein's famous equation?" },
    "choices": ["$E = mc$", "$E = mc^2$", "$F = ma$", "$p = mv$"], "answer": "$E = mc^2$",
    "explanation": { "vi": "Năng lượng = khối lượng × tốc độ ánh sáng bình phương.", "en": "Energy = mass × speed of light squared." },
    "difficulty": "easy", "tags": ["relativity"] },
  { "id": "phys-007", "subject": "physics",
    "prompt": { "vi": "Đơn vị công suất?", "en": "Unit of power?" },
    "choices": ["Joule", "Watt", "Volt", "Ohm"], "answer": "Watt",
    "explanation": { "vi": "P = W/t, đo bằng Watt.", "en": "P = W/t, measured in Watts." },
    "difficulty": "easy", "tags": ["units"] },
  { "id": "phys-008", "subject": "physics",
    "prompt": { "vi": "Sóng âm truyền nhanh nhất trong?", "en": "Sound travels fastest in?" },
    "choices": ["Khí / Gas", "Chất lỏng / Liquid", "Chất rắn / Solid", "Chân không / Vacuum"], "answer": "Chất rắn / Solid",
    "explanation": { "vi": "Phân tử gần nhau → truyền nhanh hơn.", "en": "Tighter molecules transmit faster." },
    "difficulty": "medium", "tags": ["waves"] },
  { "id": "phys-009", "subject": "physics",
    "prompt": { "vi": "Nhiệt độ đông của nước ở 1 atm?", "en": "Freezing point of water at 1 atm?" },
    "choices": ["0°C", "32°C", "100°C", "-10°C"], "answer": "0°C",
    "explanation": { "vi": "0°C = 273.15 K.", "en": "0°C = 273.15 K." },
    "difficulty": "easy", "tags": ["thermodynamics"] },
  { "id": "phys-010", "subject": "physics",
    "prompt": { "vi": "Hằng số Planck ký hiệu?", "en": "Planck's constant symbol?" },
    "choices": ["$h$", "$c$", "$G$", "$k$"], "answer": "$h$",
    "explanation": { "vi": "$h \\approx 6.626 \\times 10^{-34}$ J·s.", "en": "$h \\approx 6.626 \\times 10^{-34}$ J·s." },
    "difficulty": "hard", "tags": ["quantum"] }
]
```

- [ ] **Step 3: Write chemistry.json (10 questions)**

Create `src/data/questions/chemistry.json`:
```json
[
  { "id": "chem-001", "subject": "chemistry",
    "prompt": { "vi": "Ký hiệu hóa học của vàng?", "en": "Chemical symbol of gold?" },
    "choices": ["Go", "Au", "Ag", "Gd"], "answer": "Au",
    "explanation": { "vi": "Từ Latin 'aurum'.", "en": "From Latin 'aurum'." },
    "difficulty": "easy", "tags": ["periodic-table"] },
  { "id": "chem-002", "subject": "chemistry",
    "prompt": { "vi": "pH của dung dịch trung tính?", "en": "pH of a neutral solution?" },
    "choices": ["0", "7", "14", "1"], "answer": "7",
    "explanation": { "vi": "pH 7 là trung tính.", "en": "pH 7 is neutral." },
    "difficulty": "easy", "tags": ["acids-bases"] },
  { "id": "chem-003", "subject": "chemistry",
    "prompt": { "vi": "Công thức nước?", "en": "Formula of water?" },
    "choices": ["H2O", "CO2", "O2", "H2O2"], "answer": "H2O",
    "explanation": { "vi": "2 hydrogen + 1 oxygen.", "en": "2 hydrogens + 1 oxygen." },
    "difficulty": "easy", "tags": ["formulas"] },
  { "id": "chem-004", "subject": "chemistry",
    "prompt": { "vi": "Khí nào chiếm nhiều nhất trong không khí?", "en": "Most abundant gas in air?" },
    "choices": ["Oxygen", "Nitrogen", "CO2", "Argon"], "answer": "Nitrogen",
    "explanation": { "vi": "N2 ~78%.", "en": "N2 ~78%." },
    "difficulty": "easy", "tags": ["atmosphere"] },
  { "id": "chem-005", "subject": "chemistry",
    "prompt": { "vi": "NaCl là muối gì?", "en": "NaCl is what salt?" },
    "choices": ["Muối kali / Potassium salt", "Muối ăn / Table salt", "Muối đồng / Copper salt", "Muối sắt / Iron salt"], "answer": "Muối ăn / Table salt",
    "explanation": { "vi": "Sodium chloride.", "en": "Sodium chloride." },
    "difficulty": "easy", "tags": ["formulas"] },
  { "id": "chem-006", "subject": "chemistry",
    "prompt": { "vi": "Số hiệu nguyên tử của Carbon?", "en": "Atomic number of Carbon?" },
    "choices": ["6", "8", "12", "14"], "answer": "6",
    "explanation": { "vi": "6 proton.", "en": "6 protons." },
    "difficulty": "easy", "tags": ["periodic-table"] },
  { "id": "chem-007", "subject": "chemistry",
    "prompt": { "vi": "Phản ứng cháy cần khí gì?", "en": "Combustion needs which gas?" },
    "choices": ["N2", "CO2", "O2", "H2"], "answer": "O2",
    "explanation": { "vi": "Cần oxy để cháy.", "en": "Needs oxygen." },
    "difficulty": "easy", "tags": ["reactions"] },
  { "id": "chem-008", "subject": "chemistry",
    "prompt": { "vi": "Axit mạnh nhất trong các axit sau?", "en": "Strongest acid?" },
    "choices": ["CH3COOH", "H2CO3", "HCl", "H3PO4"], "answer": "HCl",
    "explanation": { "vi": "HCl phân li hoàn toàn.", "en": "HCl fully dissociates." },
    "difficulty": "medium", "tags": ["acids-bases"] },
  { "id": "chem-009", "subject": "chemistry",
    "prompt": { "vi": "CO2 có bao nhiêu nguyên tử?", "en": "How many atoms in CO2?" },
    "choices": ["2", "3", "4", "1"], "answer": "3",
    "explanation": { "vi": "1 C + 2 O = 3 nguyên tử.", "en": "1 C + 2 O = 3 atoms." },
    "difficulty": "easy", "tags": ["formulas"] },
  { "id": "chem-010", "subject": "chemistry",
    "prompt": { "vi": "Liên kết hóa học trong NaCl?", "en": "Bond type in NaCl?" },
    "choices": ["Cộng hóa trị / Covalent", "Ion / Ionic", "Kim loại / Metallic", "Hydro / Hydrogen"], "answer": "Ion / Ionic",
    "explanation": { "vi": "Na+ và Cl-.", "en": "Na+ and Cl-." },
    "difficulty": "medium", "tags": ["bonding"] }
]
```

- [ ] **Step 4: Write english.json (10 questions)**

Create `src/data/questions/english.json`:
```json
[
  { "id": "eng-001", "subject": "english",
    "prompt": { "vi": "Past simple của 'go'?", "en": "Past simple of 'go'?" },
    "choices": ["goed", "went", "gone", "going"], "answer": "went",
    "explanation": { "vi": "Bất quy tắc.", "en": "Irregular verb." },
    "difficulty": "easy", "tags": ["grammar", "verbs"] },
  { "id": "eng-002", "subject": "english",
    "prompt": { "vi": "Chọn từ đúng: 'She ___ a teacher.'", "en": "Choose: 'She ___ a teacher.'" },
    "choices": ["is", "are", "am", "be"], "answer": "is",
    "explanation": { "vi": "She + is.", "en": "She + is." },
    "difficulty": "easy", "tags": ["grammar", "to-be"] },
  { "id": "eng-003", "subject": "english",
    "prompt": { "vi": "Nghĩa của 'happy'?", "en": "Meaning of 'happy'?" },
    "choices": ["buồn / sad", "vui / glad", "giận / angry", "mệt / tired"], "answer": "vui / glad",
    "explanation": { "vi": "Happy = vui vẻ.", "en": "Happy = feeling pleasure." },
    "difficulty": "easy", "tags": ["vocabulary"] },
  { "id": "eng-004", "subject": "english",
    "prompt": { "vi": "Comparative của 'big'?", "en": "Comparative of 'big'?" },
    "choices": ["biger", "bigger", "biggest", "more big"], "answer": "bigger",
    "explanation": { "vi": "Tính từ ngắn + -er.", "en": "Short adj + -er." },
    "difficulty": "easy", "tags": ["grammar", "comparatives"] },
  { "id": "eng-005", "subject": "english",
    "prompt": { "vi": "'I ___ to school every day.'", "en": "'I ___ to school every day.'" },
    "choices": ["go", "goes", "going", "went"], "answer": "go",
    "explanation": { "vi": "I + V (hiện tại đơn).", "en": "I + base form." },
    "difficulty": "easy", "tags": ["grammar", "present-simple"] },
  { "id": "eng-006", "subject": "english",
    "prompt": { "vi": "Trái nghĩa của 'hot'?", "en": "Opposite of 'hot'?" },
    "choices": ["warm", "cold", "cool", "boiling"], "answer": "cold",
    "explanation": { "vi": "Hot ↔ cold.", "en": "Hot ↔ cold." },
    "difficulty": "easy", "tags": ["vocabulary"] },
  { "id": "eng-007", "subject": "english",
    "prompt": { "vi": "Chọn giới từ: 'I was born ___ March.'", "en": "Choose preposition: 'I was born ___ March.'" },
    "choices": ["in", "on", "at", "by"], "answer": "in",
    "explanation": { "vi": "In + tháng.", "en": "In + month." },
    "difficulty": "medium", "tags": ["grammar", "prepositions"] },
  { "id": "eng-008", "subject": "english",
    "prompt": { "vi": "If it rains, I ___ stay home.", "en": "If it rains, I ___ stay home." },
    "choices": ["will", "would", "am", "have"], "answer": "will",
    "explanation": { "vi": "First conditional: will + V.", "en": "First conditional." },
    "difficulty": "medium", "tags": ["grammar", "conditionals"] },
  { "id": "eng-009", "subject": "english",
    "prompt": { "vi": "Nghĩa của 'begin'?", "en": "Meaning of 'begin'?" },
    "choices": ["kết thúc / end", "bắt đầu / start", "tiếp tục / continue", "trì hoãn / delay"], "answer": "bắt đầu / start",
    "explanation": { "vi": "Begin = start.", "en": "Begin = start." },
    "difficulty": "easy", "tags": ["vocabulary"] },
  { "id": "eng-010", "subject": "english",
    "prompt": { "vi": "Plural của 'child'?", "en": "Plural of 'child'?" },
    "choices": ["childs", "children", "childes", "childer"], "answer": "children",
    "explanation": { "vi": "Bất quy tắc.", "en": "Irregular plural." },
    "difficulty": "easy", "tags": ["vocabulary", "plurals"] }
]
```

- [ ] **Step 5: Write the aggregator**

Create `src/data/questions/index.ts`:
```ts
import math from './math.json';
import physics from './physics.json';
import chemistry from './chemistry.json';
import english from './english.json';
import type { Question } from '../../providers/types';

export const ALL_QUESTIONS: Question[] = [
  ...(math as Question[]),
  ...(physics as Question[]),
  ...(chemistry as Question[]),
  ...(english as Question[]),
];
```

- [ ] **Step 6: Commit**

```bash
git add src/data/questions
git commit -m "feat: seed 40 questions across 4 subjects"
```

---

## Phase 3: Provider Layer

### Task 10: Implement LocalBankProvider (TDD)

**Files:**
- Create: `src/providers/local-bank.test.ts`
- Create: `src/providers/local-bank.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/providers/local-bank.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { LocalBankProvider } from './local-bank';
import type { Question } from './types';

const sample: Question[] = [
  { id: 'a', subject: 'math', prompt: { vi: '1', en: '1' }, answer: '1', difficulty: 'easy' },
  { id: 'b', subject: 'math', prompt: { vi: '2', en: '2' }, answer: '2', difficulty: 'medium' },
  { id: 'c', subject: 'physics', prompt: { vi: '3', en: '3' }, answer: '3', difficulty: 'easy' },
];

describe('LocalBankProvider', () => {
  it('returns a question for the requested subject', async () => {
    const p = new LocalBankProvider(sample);
    const q = await p.getQuestion({ subject: 'math' });
    expect(q.subject).toBe('math');
  });

  it('does not return the same question twice in a row', async () => {
    const p = new LocalBankProvider([sample[0], sample[1]]);
    const q1 = await p.getQuestion({ subject: 'math' });
    const q2 = await p.getQuestion({ subject: 'math' });
    expect(q1.id).not.toBe(q2.id);
  });

  it('honors excludeIds', async () => {
    const p = new LocalBankProvider([sample[0], sample[1]]);
    const q = await p.getQuestion({ subject: 'math', excludeIds: ['a'] });
    expect(q.id).toBe('b');
  });

  it('throws when no questions match', async () => {
    const p = new LocalBankProvider(sample);
    await expect(p.getQuestion({ subject: 'english' })).rejects.toThrow();
  });

  it('explain is not implemented', () => {
    const p = new LocalBankProvider(sample);
    expect(p.explain).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests, expect fail**

```bash
pnpm test
```

Expected: FAIL — `LocalBankProvider` not defined.

- [ ] **Step 3: Implement LocalBankProvider**

Create `src/providers/local-bank.ts`:
```ts
import type { Question, QuestionProvider, SubjectId, Difficulty } from './types';

export class LocalBankProvider implements QuestionProvider {
  readonly name = 'local' as const;

  // Per-instance shuffled index for non-repetition
  private queue: Map<SubjectId, string[]>;

  constructor(private readonly all: Question[]) {
    this.queue = new Map();
  }

  private shuffledIdsFor(subject: SubjectId): string[] {
    const ids = this.all.filter((q) => q.subject === subject).map((q) => q.id);
    // Fisher-Yates with Math.random — non-deterministic; that's fine for UX
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  }

  private refillQueue(subject: SubjectId) {
    this.queue.set(subject, this.shuffledIdsFor(subject));
  }

  async getQuestion(ctx: { subject: SubjectId; difficulty?: Difficulty; excludeIds?: string[] }): Promise<Question> {
    let queue = this.queue.get(ctx.subject);
    if (!queue || queue.length === 0) {
      this.refillQueue(ctx.subject);
      queue = this.queue.get(ctx.subject)!;
    }

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (ctx.excludeIds?.includes(id)) continue;
      const q = this.all.find((x) => x.id === id);
      if (q) return q;
    }
    throw new Error(`No questions available for subject: ${ctx.subject}`);
  }
}
```

- [ ] **Step 4: Run tests, expect pass**

```bash
pnpm test
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/providers/local-bank.ts src/providers/local-bank.test.ts
git commit -m "feat: LocalBankProvider with non-repeating queue and exclude support"
```

---

### Task 11: Implement AIProvider (TDD with mocked fetch)

**Files:**
- Create: `src/providers/ai.test.ts`
- Create: `src/providers/ai.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/providers/ai.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIProvider } from './ai';
import type { Question } from './types';

const sampleQuestion: Question = {
  id: 'math-001', subject: 'math',
  prompt: { vi: 'Giải $2x=4$', en: 'Solve $2x=4$' },
  answer: 'x = 2', difficulty: 'easy',
};

function mockFetchOk(jsonBody: unknown) {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => jsonBody,
  } as Response));
}

function mockFetchFail(status = 500, body = 'oops') {
  return vi.fn(async () => ({
    ok: false,
    status,
    text: async () => body,
  } as Response));
}

describe('AIProvider', () => {
  beforeEach(() => {
    process.env.VITE_AI_API_URL = 'https://example.test/v1/chat';
    process.env.VITE_AI_API_KEY = 'test-key';
    process.env.VITE_AI_MODEL = 'gpt-test';
  });

  it('throws when API key missing', async () => {
    delete process.env.VITE_AI_API_KEY;
    const p = new AIProvider();
    await expect(p.getQuestion({ subject: 'math' })).rejects.toThrow(/not configured/i);
  });

  it('parses a JSON question from the response', async () => {
    const fakeQuestion = { id: 'q1', subject: 'math', prompt: { vi: 'p', en: 'p' }, answer: 'a', difficulty: 'easy' };
    global.fetch = mockFetchOk({
      choices: [{ message: { content: JSON.stringify(fakeQuestion) } }],
    });
    const p = new AIProvider();
    const q = await p.getQuestion({ subject: 'math' });
    expect(q.id).toBe('q1');
  });

  it('surfaces a friendly error on 5xx', async () => {
    global.fetch = mockFetchFail(503);
    const p = new AIProvider();
    await expect(p.getQuestion({ subject: 'math' })).rejects.toThrow(/unreachable/i);
  });

  it('evaluateAnswer returns correct/feedback', async () => {
    global.fetch = mockFetchOk({
      choices: [{ message: { content: JSON.stringify({ correct: true, feedback: 'Good' }) } }],
    });
    const p = new AIProvider();
    const res = await p.evaluateAnswer!(sampleQuestion, 'x = 2');
    expect(res.correct).toBe(true);
    expect(res.feedback).toBe('Good');
  });
});
```

- [ ] **Step 2: Run tests, expect fail**

```bash
pnpm test
```

Expected: FAIL — `AIProvider` not defined.

- [ ] **Step 3: Implement AIProvider**

Create `src/providers/ai.ts`:
```ts
import type { ChatMessage, Question, QuestionProvider, SubjectId, Difficulty } from './types';

const SYSTEM_PROMPT = `You are an educational question generator for Vietnamese students. Respond in the user's language (Vietnamese or English). Output strict JSON only. For questions, output shape: {"id":"ai-<random>","subject":"<id>","prompt":{"vi":"...","en":"..."},"choices":[...],"answer":"...","explanation":{"vi":"...","en":"..."},"difficulty":"<level>","tags":[...]}. For answer evaluation, output: {"correct":<bool>,"feedback":"<text>"}. For explanation/hint, output: {"text":"<markdown with $...$ LaTeX>"}. For chitchat, output: {"text":"<reply>"}. LaTeX inside strings is allowed.`;

function envConfig() {
  return {
    url: import.meta.env.VITE_AI_API_URL as string | undefined,
    key: import.meta.env.VITE_AI_API_KEY as string | undefined,
    model: (import.meta.env.VITE_AI_MODEL as string | undefined) ?? 'gpt-4o-mini',
  };
}

function extractJson<T>(text: string): T {
  // Try direct parse, else first {...} block
  try { return JSON.parse(text) as T; } catch { /* fall through */ }
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('AI returned non-JSON response');
  return JSON.parse(m[0]) as T;
}

interface ChatMsg { role: 'system' | 'user' | 'assistant'; content: string }

async function callAI(messages: ChatMsg[]): Promise<string> {
  const { url, key, model } = envConfig();
  if (!url || !key) throw new Error('AI is not configured (missing VITE_AI_API_KEY / VITE_AI_API_URL)');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature: 0.4 }),
  });
  if (!res.ok) {
    if (res.status >= 500) throw new Error('AI is unreachable');
    const body = await res.text().catch(() => '');
    throw new Error(`AI error ${res.status}: ${body.slice(0, 120)}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices?.[0]?.message?.content ?? '';
}

export class AIProvider implements QuestionProvider {
  readonly name = 'ai' as const;

  private uid() { return Math.random().toString(36).slice(2, 10); }

  async getQuestion(ctx: { subject: SubjectId; difficulty?: Difficulty }): Promise<Question> {
    const userPrompt = `Generate a ${ctx.difficulty ?? 'medium'} difficulty ${ctx.subject} question. Output JSON only.`;
    const text = await callAI([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }]);
    const parsed = extractJson<Partial<Question>>(text);
    return {
      id: parsed.id ?? `ai-${this.uid()}`,
      subject: ctx.subject,
      prompt: parsed.prompt ?? { vi: '', en: '' },
      choices: parsed.choices,
      answer: parsed.answer ?? '',
      explanation: parsed.explanation,
      difficulty: ctx.difficulty ?? 'medium',
      tags: parsed.tags,
    };
  }

  async explain(q: Question, mode: 'explain' | 'hint' = 'explain'): Promise<string> {
    const userPrompt = `${mode === 'hint' ? 'Give a short hint' : 'Explain step by step'} for this question: ${JSON.stringify(q)}. Output JSON {"text":"..."} only.`;
    const text = await callAI([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }]);
    const { text: body } = extractJson<{ text: string }>(text);
    return body;
  }

  async evaluateAnswer(q: Question, userAnswer: string): Promise<{ correct: boolean; feedback: string }> {
    const userPrompt = `Question: ${JSON.stringify(q)}\nStudent answer: ${userAnswer}\nOutput JSON {"correct":<bool>,"feedback":"<text>"} only.`;
    const text = await callAI([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }]);
    return extractJson<{ correct: boolean; feedback: string }>(text);
  }

  async chat(userText: string, history: ChatMessage[]): Promise<string> {
    const messages: ChatMsg[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map<ChatMsg>((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      { role: 'user', content: userText },
    ];
    const text = await callAI(messages);
    const { text: body } = extractJson<{ text: string }>(text);
    return body;
  }
}
```

- [ ] **Step 4: Run tests, expect pass**

```bash
pnpm test
```

Expected: all AIProvider tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/providers/ai.ts src/providers/ai.test.ts
git commit -m "feat: AIProvider with env config, JSON extraction, and chitchat"
```

---

### Task 12: Implement provider factory

**Files:**
- Create: `src/providers/index.ts`
- Create: `src/providers/index.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/providers/index.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getProvider, hasAiConfig } from './index';

describe('providers factory', () => {
  beforeEach(() => {
    delete process.env.VITE_AI_API_KEY;
  });

  it('returns local provider when no key', () => {
    expect(hasAiConfig()).toBe(false);
    expect(getProvider().name).toBe('local');
  });

  it('returns AI provider when explicitly requested and key set', () => {
    process.env.VITE_AI_API_KEY = 'x';
    expect(getProvider('ai').name).toBe('ai');
  });

  it('falls back to local when AI requested but no key', () => {
    expect(getProvider('ai').name).toBe('local');
  });
});
```

- [ ] **Step 2: Run tests, expect fail**

```bash
pnpm test
```

Expected: FAIL — `getProvider` not defined.

- [ ] **Step 3: Implement the factory**

Create `src/providers/index.ts`:
```ts
import { LocalBankProvider } from './local-bank';
import { AIProvider } from './ai';
import type { QuestionProvider } from './types';
import { ALL_QUESTIONS } from '../data/questions';

const local = new LocalBankProvider(ALL_QUESTIONS);

export function hasAiConfig(): boolean {
  return Boolean(import.meta.env.VITE_AI_API_KEY);
}

export function getProvider(name?: 'local' | 'ai'): QuestionProvider {
  if (name === 'ai' && hasAiConfig()) return new AIProvider();
  return local;
}

export { local as localProvider };
```

- [ ] **Step 4: Run tests, expect pass**

```bash
pnpm test
```

Expected: 3 factory tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/providers/index.ts src/providers/index.test.ts
git commit -m "feat: provider factory with env-driven selection"
```

---

## Phase 4: Chat Service (intents + router)

### Task 13: Implement detectIntent (TDD)

**Files:**
- Create: `src/services/chat/intents.test.ts`
- Create: `src/services/chat/intents.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/services/chat/intents.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { detectIntent } from './intents';
import type { Question } from '../../providers/types';

const q: Question = {
  id: 'math-001', subject: 'math',
  prompt: { vi: '?', en: '?' },
  choices: ['A', 'B', 'C', 'D'], answer: 'A', difficulty: 'easy',
};

describe('detectIntent', () => {
  it('detects request_question (VI)', () => {
    expect(detectIntent('Cho tôi câu hỏi Toán', { activeSubject: 'math' })).toEqual({
      kind: 'request_question', subject: 'math',
    });
  });

  it('detects request_question (EN)', () => {
    expect(detectIntent('Please give me a question', { activeSubject: 'physics' })).toEqual({
      kind: 'request_question', subject: 'physics',
    });
  });

  it('detects request_explanation (VI) with lastQuestion', () => {
    const i = detectIntent('Giải thích đi', { lastQuestion: q });
    expect(i.kind).toBe('request_explanation');
  });

  it('detects request_hint (EN)', () => {
    const i = detectIntent('hint', { lastQuestion: q });
    expect(i.kind).toBe('request_hint');
  });

  it('detects MCQ answer A/B/C/D', () => {
    const i = detectIntent('B', { lastQuestion: q });
    expect(i).toEqual({ kind: 'submit_answer', text: 'B', questionId: 'math-001' });
  });

  it('detects open-ended short answer as submit_answer', () => {
    const i = detectIntent('x = 4', { lastQuestion: q });
    expect(i).toEqual({ kind: 'submit_answer', text: 'x = 4', questionId: 'math-001' });
  });

  it('falls back to chitchat for long free text', () => {
    const long = 'This is a long free-form text that should be treated as chitchat because the user is asking for help, not answering a multiple choice question.';
    expect(detectIntent(long, { lastQuestion: q }).kind).toBe('chitchat');
  });

  it('chitchat when no lastQuestion and no keywords', () => {
    expect(detectIntent('Hello there', {}).kind).toBe('chitchat');
  });
});
```

- [ ] **Step 2: Run tests, expect fail**

```bash
pnpm test
```

Expected: FAIL — `detectIntent` not defined.

- [ ] **Step 3: Implement detectIntent**

Create `src/services/chat/intents.ts`:
```ts
import type { Intent, Question, SubjectId } from '../../providers/types';

interface Ctx {
  lastQuestion?: Question;
  activeSubject?: SubjectId;
}

const REQUEST_QUESTION = /^(cho tôi|hãy cho|please\s*give|give\s*me).*(câu hỏi|question)/i;
const REQUEST_ANOTHER = /^(thêm|another|next|tiếp theo)/i;
const EXPLAIN = /(giải thích|explain|why|tại sao)/i;
const HINT = /(gợi ý|hint)/i;
const MCQ_LETTER = /^[a-d]$/i;

export function detectIntent(text: string, ctx: Ctx): Intent {
  const t = text.trim();

  if (REQUEST_QUESTION.test(t)) {
    return { kind: 'request_question', subject: ctx.activeSubject };
  }
  if (REQUEST_ANOTHER.test(t) && ctx.lastQuestion) {
    return { kind: 'request_question', subject: ctx.lastQuestion.subject };
  }
  if (EXPLAIN.test(t) && ctx.lastQuestion) {
    return { kind: 'request_explanation', questionId: ctx.lastQuestion.id };
  }
  if (HINT.test(t) && ctx.lastQuestion) {
    return { kind: 'request_hint', questionId: ctx.lastQuestion.id };
  }
  if (ctx.lastQuestion && MCQ_LETTER.test(t) && ctx.lastQuestion.choices) {
    return { kind: 'submit_answer', text: t.toUpperCase(), questionId: ctx.lastQuestion.id };
  }
  if (ctx.lastQuestion && t.length > 0 && t.length < 200) {
    return { kind: 'submit_answer', text: t, questionId: ctx.lastQuestion.id };
  }
  return { kind: 'chitchat' };
}
```

- [ ] **Step 4: Run tests, expect pass**

```bash
pnpm test
```

Expected: 8 intent tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/chat/intents.ts src/services/chat/intents.test.ts
git commit -m "feat: regex-based intent detection with 8 cases covered"
```

---

### Task 14: Implement router (TDD)

**Files:**
- Create: `src/services/chat/router.test.ts`
- Create: `src/services/chat/router.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/services/chat/router.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { routeMessage } from './router';
import { ALL_QUESTIONS } from '../../data/questions';
import type { ChatMessage, Question } from '../../providers/types';

const mathQ: Question = ALL_QUESTIONS.find((q) => q.id === 'math-001')!;
const openQ: Question = { ...mathQ, choices: undefined };

function msg(role: 'user' | 'bot', content: string, questionRef?: string): ChatMessage {
  return { id: `${role}-${content}`, role, content, questionRef, createdAt: Date.now() };
}

describe('routeMessage', () => {
  beforeEach(() => {
    delete process.env.VITE_AI_API_KEY;
  });

  it('returns a question for request_question from local bank', async () => {
    const out = await routeMessage('Cho tôi câu hỏi Toán', {
      activeSubject: 'math', history: [], recentIds: [],
    });
    expect(out.messages).toHaveLength(1);
    expect(out.messages[0].role).toBe('bot');
    expect(out.messages[0].questionRef).toBeDefined();
    expect(out.messages[0].subject).toBe('math');
  });

  it('scores MCQ answer correctly', async () => {
    const history: ChatMessage[] = [msg('bot', 'pick one', 'math-001')];
    const out = await routeMessage('B', {
      activeSubject: 'math', history, recentIds: ['math-001'], lastQuestion: mathQ,
    });
    expect(out.messages[0].feedback).toBe('correct');
  });

  it('scores MCQ answer incorrectly', async () => {
    const history: ChatMessage[] = [msg('bot', 'pick one', 'math-001')];
    const out = await routeMessage('A', {
      activeSubject: 'math', history, recentIds: ['math-001'], lastQuestion: mathQ,
    });
    expect(out.messages[0].feedback).toBe('incorrect');
  });

  it('uses AI for explain when key set; else uses local explanation', async () => {
    const history: ChatMessage[] = [msg('bot', '?', 'math-001')];
    const out = await routeMessage('Giải thích', {
      activeSubject: 'math', history, recentIds: ['math-001'], lastQuestion: mathQ,
    });
    expect(out.messages[0].role).toBe('bot');
    expect(out.messages[0].content.length).toBeGreaterThan(0);
  });

  it('falls back gracefully when no providers match and no AI', async () => {
    const out = await routeMessage('blah blah blah blah', {
      activeSubject: 'english', history: [], recentIds: [],
    });
    // chitchat with no AI → canned string
    expect(out.messages[0].role).toBe('bot');
    expect(out.messages[0].content.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests, expect fail**

```bash
pnpm test
```

Expected: FAIL — `routeMessage` not defined.

- [ ] **Step 3: Implement routeMessage**

Create `src/services/chat/router.ts`:
```ts
import { detectIntent } from './intents';
import { getProvider, hasAiConfig, localProvider } from '../../providers';
import { SUBJECT_BY_ID } from '../../constants/subjects';
import { rememberQuestion } from '../../stores/chat-store';
import type { ChatMessage, Intent, Question, SubjectId } from '../../providers/types';

export interface RouterContext {
  activeSubject?: SubjectId;
  history: ChatMessage[];
  recentIds: string[];
  lastQuestion?: Question;
}

const LANG_KEY = (lang: 'vi' | 'en') => (lang === 'en' ? 'en' : 'vi');

function uid(prefix = 'm') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function botAsks(q: Question, lang: 'vi' | 'en'): ChatMessage {
  // Cache the full Question so answer evaluation can find it later
  rememberQuestion(q);
  const prompt = q.prompt[LANG_KEY(lang)];
  const choicesBlock = q.choices?.length
    ? '\n\n' + q.choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`).join('\n')
    : '';
  return {
    id: uid('bot'),
    role: 'bot',
    content: prompt + choicesBlock,
    subject: q.subject,
    questionRef: q.id,
    feedback: null,
    createdAt: Date.now(),
  };
}

function botFeedback(correct: boolean, q: Question, lang: 'vi' | 'en', extra?: string): ChatMessage {
  const head = correct ? (lang === 'en' ? 'Correct! 🎉' : 'Chính xác! 🎉') : (lang === 'en' ? `Not quite. Answer: ${q.answer}` : `Chưa đúng. Đáp án: ${q.answer}`);
  const tail = extra ? `\n\n${extra}` : '';
  return {
    id: uid('bot'),
    role: 'bot',
    content: head + tail,
    subject: q.subject,
    questionRef: q.id,
    feedback: correct ? 'correct' : 'incorrect',
    createdAt: Date.now(),
  };
}

export async function routeMessage(
  userText: string,
  ctx: RouterContext,
  lang: 'vi' | 'en' = 'vi',
): Promise<{ messages: ChatMessage[] }> {
  const intent: Intent = detectIntent(userText, ctx);
  const subject = (intent.kind === 'request_question' && intent.subject) || ctx.activeSubject || 'math';
  const subj = SUBJECT_BY_ID[subject];

  if (intent.kind === 'request_question') {
    let q: Question;
    try {
      q = await localProvider.getQuestion({ subject, excludeIds: ctx.recentIds });
    } catch {
      if (hasAiConfig()) {
        q = await getProvider('ai').getQuestion({ subject, difficulty: intent.difficulty });
      } else {
        return { messages: [{ id: uid('bot'), role: 'bot', content: lang === 'en' ? 'No questions available for this subject yet.' : 'Chưa có câu hỏi cho môn này.', subject, createdAt: Date.now() }] };
      }
    }
    return { messages: [botAsks(q, lang)] };
  }

  if (intent.kind === 'submit_answer') {
    const q = ctx.lastQuestion;
    if (!q) return { messages: [{ id: uid('bot'), role: 'bot', content: lang === 'en' ? 'Please ask a question first.' : 'Hãy hỏi một câu trước nhé.', createdAt: Date.now() }] };
    if (q.choices) {
      const letter = intent.text.trim().toUpperCase();
      const idx = letter.charCodeAt(0) - 65;
      const correct = q.choices[idx] === q.answer;
      return { messages: [botFeedback(correct, q, lang, q.explanation?.[LANG_KEY(lang)])] };
    }
    if (hasAiConfig()) {
      try {
        const { correct, feedback } = await getProvider('ai').evaluateAnswer!(q, intent.text);
        return { messages: [botFeedback(correct, q, lang, feedback)] };
      } catch {
        return { messages: [botFeedback(false, q, lang, lang === 'en' ? 'Could not reach AI.' : 'Không kết nối được AI.')] };
      }
    }
    return { messages: [botFeedback(false, q, lang, lang === 'en' ? 'AI not configured to grade open answers.' : 'AI chưa được cấu hình để chấm câu trả lời.')] };
  }

  if (intent.kind === 'request_explanation' || intent.kind === 'request_hint') {
    const q = ctx.lastQuestion;
    if (!q) return { messages: [{ id: uid('bot'), role: 'bot', content: lang === 'en' ? 'No active question.' : 'Chưa có câu hỏi nào.', createdAt: Date.now() }] };
    if (hasAiConfig()) {
      try {
        const text = await getProvider('ai').explain!(q, intent.kind === 'request_hint' ? 'hint' : 'explain');
        return { messages: [{ id: uid('bot'), role: 'bot', content: text, subject: q.subject, questionRef: q.id, createdAt: Date.now() }] };
      } catch { /* fall through to local */ }
    }
    const localText = q.explanation?.[LANG_KEY(lang)] ?? q.answer;
    const prefix = intent.kind === 'request_hint' ? (lang === 'en' ? 'Hint: ' : 'Gợi ý: ') : (lang === 'en' ? 'Explanation: ' : 'Giải thích: ');
    return { messages: [{ id: uid('bot'), role: 'bot', content: prefix + localText, subject: q.subject, questionRef: q.id, createdAt: Date.now() }] };
  }

  // chitchat
  if (hasAiConfig()) {
    try {
      const text = await getProvider('ai').chat!(userText, ctx.history);
      return { messages: [{ id: uid('bot'), role: 'bot', content: text, createdAt: Date.now() }] };
    } catch { /* fall through */ }
  }
  return {
    messages: [{
      id: uid('bot'),
      role: 'bot',
      content: lang === 'en'
        ? 'I can help with Math, Physics, Chemistry, or English. Try: "Give me a math question".'
        : 'Tôi có thể giúp Toán, Lý, Hóa, Anh. Thử: "Cho tôi câu hỏi Toán".',
      createdAt: Date.now(),
    }],
  };
}
```

- [ ] **Step 4: Run tests, expect pass**

```bash
pnpm test
```

Expected: all router tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/chat/router.ts src/services/chat/router.test.ts
git commit -m "feat: chat router with hybrid local+AI flow"
```

---

### Task 14b: Add dev observability logs

**Files:**
- Modify: `src/services/chat/router.ts`
- Create: `src/utils/log.ts`

- [ ] **Step 1: Write the logger utility**

Create `src/utils/log.ts`:
```ts
const enabled = import.meta.env.DEV;

export const log = {
  info: (...args: unknown[]) => { if (enabled) console.debug('[edu]', ...args); },
  warn: (...args: unknown[]) => { if (enabled) console.warn('[edu]', ...args); },
};
```

- [ ] **Step 2: Instrument the router**

In `src/services/chat/router.ts`, at the top of `routeMessage`, add:
```ts
import { log } from '../../utils/log';
// ...
export async function routeMessage(userText: string, ctx: RouterContext, lang: 'vi' | 'en' = 'vi') {
  const t0 = Date.now();
  const intent: Intent = detectIntent(userText, ctx);
  log.info('intent', intent.kind, 'lang', lang);
  // ... existing switch ...
  // at the end, before each return, add:
  log.info('response', out.messages.length, 'ms', Date.now() - t0);
  return out;
}
```

Apply this near each `return { messages: ... }` in the function (one log per branch is enough).

- [ ] **Step 3: Commit**

```bash
git add src/utils/log.ts src/services/chat/router.ts
git commit -m "feat: add dev-only logging for router and provider selection"
```

---

### Task 15: Create service index

**Files:**
- Create: `src/services/chat/index.ts`

- [ ] **Step 1: Write the barrel**

```ts
export { detectIntent } from './intents';
export { routeMessage } from './router';
export type { RouterContext } from './router';
```

- [ ] **Step 2: Commit**

```bash
git add src/services/chat/index.ts
git commit -m "feat: chat service barrel export"
```

---

## Phase 5: State (chat store)

### Task 16: Implement chat-store (TDD)

**Files:**
- Create: `src/stores/chat-store.test.ts`
- Create: `src/stores/chat-store.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/stores/chat-store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chat-store';
import type { ChatMessage } from '../providers/types';

const fakeRunner = async () => ({
  messages: [{ id: 'bot-1', role: 'bot' as const, content: 'hi', createdAt: 1 }],
});

describe('chat-store', () => {
  beforeEach(() => {
    useChatStore.setState({ messages: [], activeSubject: undefined, recentQuestionIds: [], stats: { asked: 0, correct: 0 } });
  });

  it('resets the conversation', () => {
    useChatStore.setState({ messages: [{ id: 'x', role: 'user', content: 'a', createdAt: 0 }] });
    useChatStore.getState().reset();
    expect(useChatStore.getState().messages).toEqual([]);
  });

  it('sets active subject', () => {
    useChatStore.getState().setActiveSubject('physics');
    expect(useChatStore.getState().activeSubject).toBe('physics');
  });

  it('sendUserMessage appends user and bot messages', async () => {
    await useChatStore.getState().sendUserMessage('hello', fakeRunner as any);
    const msgs = useChatStore.getState().messages;
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[1].role).toBe('bot');
  });

  it('sendUserMessage updates stats from bot feedback', async () => {
    const runner = async () => ({
      messages: [
        { id: 'b1', role: 'bot' as const, content: 'q', questionRef: 'q1', feedback: null, createdAt: 1 },
        { id: 'b2', role: 'bot' as const, content: 'right!', questionRef: 'q1', feedback: 'correct' as const, createdAt: 2 },
      ] as ChatMessage[],
    });
    await useChatStore.getState().sendUserMessage('B', runner as any);
    const s = useChatStore.getState().stats;
    expect(s.asked).toBe(1);
    expect(s.correct).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests, expect fail**

```bash
pnpm test
```

Expected: FAIL.

- [ ] **Step 3: Implement chat-store**

Create `src/stores/chat-store.ts`:
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { routeMessage, type RouterContext } from '../services/chat';
import type { ChatMessage, Question, SubjectId } from '../providers/types';
import { useSettingsStore } from './settings-store';

interface ChatState {
  messages: ChatMessage[];
  activeSubject?: SubjectId;
  recentQuestionIds: string[];
  stats: { asked: number; correct: number };

  setActiveSubject: (s: SubjectId | undefined) => void;
  reset: () => void;
  sendUserMessage: (text: string, runner?: typeof routeMessage) => Promise<void>;
}

function findLastQuestion(messages: ChatMessage[]): Question | undefined {
  // We don't store the full Question object in chat-store (only id), so we
  // rely on caller to look it up. To keep this self-contained, we store a
  // cached map of last questions in module scope.
  return undefined;
}

// Module-scope cache: last seen question per id, populated by the caller.
const questionCache: Map<string, Question> = new Map();
export function rememberQuestion(q: Question) { questionCache.set(q.id, q); }

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      activeSubject: undefined,
      recentQuestionIds: [],
      stats: { asked: 0, correct: 0 },

      setActiveSubject: (s) => set({ activeSubject: s }),

      reset: () => set({ messages: [], recentQuestionIds: [], stats: { asked: 0, correct: 0 } }),

      sendUserMessage: async (text, runner = routeMessage) => {
        const userMsg: ChatMessage = {
          id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'user',
          content: text,
          createdAt: Date.now(),
        };
        const state = get();
        const lang = useSettingsStore.getState().language;

        // Find last question message
        const lastBot = [...state.messages].reverse().find((m) => m.role === 'bot' && m.questionRef);
        const lastQuestion = lastBot?.questionRef ? questionCache.get(lastBot.questionRef) : undefined;

        const ctx: RouterContext = {
          activeSubject: state.activeSubject,
          history: state.messages,
          recentIds: state.recentQuestionIds,
          lastQuestion,
        };

        set({ messages: [...state.messages, userMsg] });
        const out = await runner(text, ctx, lang);

        // Cache any newly-asked questions
        for (const m of out.messages) {
          if (m.questionRef && !questionCache.has(m.questionRef)) {
            // We don't have the full Question here; we trust the caller to call rememberQuestion externally.
          }
        }

        const newMsgs = [...get().messages, ...out.messages];
        const newRecent = out.messages
          .filter((m) => m.questionRef)
          .map((m) => m.questionRef!)
          .concat(state.recentQuestionIds)
          .slice(0, 50);
        const asked = out.messages.filter((m) => m.questionRef).length;
        const correct = out.messages.filter((m) => m.feedback === 'correct').length;
        set({
          messages: newMsgs,
          recentQuestionIds: newRecent,
          stats: {
            asked: state.stats.asked + asked,
            correct: state.stats.correct + correct,
          },
        });
      },
    }),
    {
      name: 'edu-chat-v1',
      partialize: (s) => ({
        messages: s.messages,
        activeSubject: s.activeSubject,
        recentQuestionIds: s.recentQuestionIds,
        stats: s.stats,
      }),
    },
  ),
);
```

- [ ] **Step 4: Run tests, expect pass**

```bash
pnpm test
```

Expected: chat-store tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/stores/chat-store.ts src/stores/chat-store.test.ts
git commit -m "feat: chat store with persistence and stats"
```

---

## Phase 6: UI Components & Pages

### Task 17: Build KatexRenderer

**Files:**
- Create: `src/components/katex-renderer.tsx`
- Create: `src/components/katex-renderer.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/katex-renderer.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import katex from 'katex';
import { KatexRenderer } from './katex-renderer';

describe('KatexRenderer', () => {
  it('renders plain text', () => {
    render(<KatexRenderer>{'Hello world'}</KatexRenderer>);
    expect(screen.getByText(/Hello world/)).toBeInTheDocument();
  });

  it('renders inline math', () => {
    const { container } = render(<KatexRenderer>{'Solve $2 + 2$'}</KatexRenderer>);
    expect(container.querySelector('.katex')).not.toBeNull();
  });

  it('renders block math', () => {
    const { container } = render(<KatexRenderer>{'$$x = 2$$'}</KatexRenderer>);
    expect(container.querySelector('.katex-display')).not.toBeNull();
  });

  it('falls back gracefully on bad LaTeX', () => {
    // Force a render error by stubbing katex.renderToString to throw
    const katexSpy = vi.spyOn(katex, 'renderToString').mockImplementation(() => { throw new Error('boom'); });
    const { container } = render(<KatexRenderer>{'$x$'}</KatexRenderer>);
    expect(container.textContent).toContain('x');
    katexSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests, expect fail**

```bash
pnpm test
```

Expected: FAIL.

- [ ] **Step 3: Implement KatexRenderer**

Create `src/components/katex-renderer.tsx`:
```tsx
import katex from 'katex';
import { useMemo } from 'react';

interface Part {
  kind: 'text' | 'math';
  value: string;
  display: boolean;
}

function parse(input: string): Part[] {
  const parts: Part[] = [];
  const re = /(\$\$([^$]+)\$\$|\$([^$]+)\$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) {
    if (m.index > last) parts.push({ kind: 'text', value: input.slice(last, m.index), display: false });
    if (m[2] !== undefined) parts.push({ kind: 'math', value: m[2].trim(), display: true });
    else if (m[3] !== undefined) parts.push({ kind: 'math', value: m[3].trim(), display: false });
    last = m.index + m[0].length;
  }
  if (last < input.length) parts.push({ kind: 'text', value: input.slice(last), display: false });
  return parts;
}

export function KatexRenderer({ children }: { children: string }) {
  const parts = useMemo(() => parse(children), [children]);
  return (
    <>
      {parts.map((p, i) => {
        if (p.kind === 'text') {
          return <span key={i} dangerouslySetInnerHTML={{ __html: p.value.replace(/\n/g, '<br/>') }} />;
        }
        try {
          const html = katex.renderToString(p.value, { displayMode: p.display, throwOnError: false });
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {
          return <span key={i}>{p.value}</span>;
        }
      })}
    </>
  );
}
```

- [ ] **Step 4: Run tests, expect pass**

```bash
pnpm test
```

Expected: 4 KatexRenderer tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/katex-renderer.tsx src/components/katex-renderer.test.tsx
git commit -m "feat: KatexRenderer for inline and block math"
```

---

### Task 18: Build LanguageToggle

**Files:**
- Create: `src/components/language-toggle.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useSettingsStore } from '../stores/settings-store';

export function LanguageToggle() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <div className="inline-flex rounded-full border border-gray-300 overflow-hidden text-sm">
      <button
        aria-pressed={language === 'vi'}
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1 ${language === 'vi' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
      >
        VI
      </button>
      <button
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
      >
        EN
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/language-toggle.tsx
git commit -m "feat: LanguageToggle pill component"
```

---

### Task 19: Build SubjectChips

**Files:**
- Create: `src/components/chat/subject-chips.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { SUBJECTS } from '../../constants/subjects';
import type { SubjectId } from '../../providers/types';
import { useTranslation } from '../../i18n/use-translation';

interface Props {
  active?: SubjectId;
  onPick: (id: SubjectId) => void;
}

export function SubjectChips({ active, onPick }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2">
      {SUBJECTS.map((s) => (
        <button
          key={s.id}
          onClick={() => onPick(s.id)}
          className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm whitespace-nowrap border ${
            active === s.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          <span>{s.emoji}</span>
          <span>{t(`subjects.${s.id}`)}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/subject-chips.tsx
git commit -m "feat: SubjectChips horizontal scrollable selector"
```

---

### Task 20: Build MessageBubble

**Files:**
- Create: `src/components/chat/message-bubble.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { KatexRenderer } from '../katex-renderer';
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
        {message.feedback === 'correct' && <div className="text-xs mb-1 opacity-75">✅</div>}
        {message.feedback === 'incorrect' && <div className="text-xs mb-1 opacity-75">❌</div>}
        <KatexRenderer>{message.content}</KatexRenderer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/message-bubble.tsx
git commit -m "feat: MessageBubble with KaTeX rendering and feedback icons"
```

---

### Task 21: Build ChatInput

**Files:**
- Create: `src/components/chat/chat-input.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useState } from 'react';
import { useTranslation } from '../../i18n/use-translation';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="flex items-center gap-2 border-t border-gray-200 p-2 bg-white">
      <textarea
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={t('chat.placeholder')}
        className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={disabled}
      />
      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="rounded-lg bg-blue-500 text-white px-4 py-2 text-sm disabled:opacity-50"
      >
        {t('chat.send')}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/chat-input.tsx
git commit -m "feat: ChatInput with Enter to send and Shift+Enter newline"
```

---

### Task 22: Build ChatHeader

**Files:**
- Create: `src/components/chat/chat-header.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/use-translation';
import { SUBJECT_BY_ID } from '../../constants/subjects';
import type { SubjectId } from '../../providers/types';

interface Props {
  activeSubject?: SubjectId;
  onNewSession: () => void;
}

export function ChatHeader({ activeSubject, onNewSession }: Props) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const subj = activeSubject ? SUBJECT_BY_ID[activeSubject] : undefined;

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
      <button onClick={() => nav(-1)} className="text-sm text-gray-600">
        ← {t('chat.back')}
      </button>
      <div className="flex items-center gap-2">
        {subj && <span className="text-lg">{subj.emoji}</span>}
        <span className="font-medium">{subj ? t(`subjects.${subj.id}`) : 'Edu Chat'}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNewSession} className="text-xs text-gray-600 underline">
          {t('chat.newSession')}
        </button>
        <button onClick={() => nav('/settings')} className="text-xs text-gray-600 underline">
          {t('chat.settings')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/chat-header.tsx
git commit -m "feat: ChatHeader with back, subject, and overflow"
```

---

### Task 23: Build EmptyState

**Files:**
- Create: `src/components/chat/empty-state.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useTranslation } from '../../i18n/use-translation';

interface Props {
  onPickPrompt: (text: string) => void;
}

export function EmptyState({ onPickPrompt }: Props) {
  const { t, tValue } = useTranslation();
  const prompts = tValue('chat.starterPrompts') as unknown;
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center text-gray-500">
      <div className="text-5xl mb-4">🎓</div>
      <p className="mb-6">{t('chat.empty')}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.isArray(prompts) && (prompts as string[]).map((p, i) => (
          <button
            key={i}
            onClick={() => onPickPrompt(p)}
            className="rounded-full border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/empty-state.tsx
git commit -m "feat: EmptyState with starter prompts"
```

---

### Task 24: Build Home page

**Files:**
- Create: `src/pages/home.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/use-translation';
import { LanguageToggle } from '../components/language-toggle';
import { SubjectChips } from '../components/chat/subject-chips';
import { useChatStore } from '../stores/chat-store';
import type { SubjectId } from '../providers/types';

export default function HomePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const setActiveSubject = useChatStore((s) => s.setActiveSubject);
  const activeSubject = useChatStore((s) => s.activeSubject);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">🎓</div>
        <h1 className="text-2xl font-bold mb-2">{t('home.title')}</h1>
        <p className="text-gray-500 mb-8">{t('home.subtitle')}</p>
        <SubjectChips
          active={activeSubject}
          onPick={(id: SubjectId) => setActiveSubject(id)}
        />
        <button
          onClick={() => nav('/chat')}
          disabled={!activeSubject}
          className="mt-8 rounded-full bg-blue-500 text-white px-8 py-3 text-sm font-medium disabled:opacity-50"
        >
          {t('home.getStarted')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/home.tsx
git commit -m "feat: home page with subject picker and language toggle"
```

---

### Task 25: Build Chat page

**Files:**
- Create: `src/pages/chat.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chat-store';
import { useSettingsStore } from '../stores/settings-store';
import { ChatHeader } from '../components/chat/chat-header';
import { ChatInput } from '../components/chat/chat-input';
import { MessageBubble } from '../components/chat/message-bubble';
import { EmptyState } from '../components/chat/empty-state';
import { useTranslation } from '../i18n/use-translation';

export default function ChatPage() {
  const { t } = useTranslation();
  const messages = useChatStore((s) => s.messages);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const activeSubject = useChatStore((s) => s.activeSubject);
  const reset = useChatStore((s) => s.reset);
  const preferredProvider = useSettingsStore((s) => s.preferredProvider);
  const language = useSettingsStore((s) => s.language);
  const aiReady = Boolean(import.meta.env.VITE_AI_API_KEY);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [messages.length]);

  return (
    <div className="h-screen flex flex-col">
      <ChatHeader activeSubject={activeSubject} onNewSession={reset} />
      {!aiReady && (
        <div className="bg-yellow-50 text-yellow-800 text-xs px-4 py-2 border-b border-yellow-200">
          {t('errors.aiNotConfigured')}
        </div>
      )}
      <div ref={listRef} className="flex-1 overflow-y-auto px-2 bg-gray-50">
        {messages.length === 0 ? (
          <EmptyState onPickPrompt={(p) => sendUserMessage(p)} />
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>
      <ChatInput onSend={(text) => sendUserMessage(text)} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/chat.tsx
git commit -m "feat: chat page with header, list, input, AI status banner"
```

---

### Task 26: Build Settings page

**Files:**
- Create: `src/pages/settings.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settings-store';
import { useChatStore } from '../stores/chat-store';
import { useTranslation } from '../i18n/use-translation';
import { LanguageToggle } from '../components/language-toggle';

export default function SettingsPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const preferredProvider = useSettingsStore((s) => s.preferredProvider);
  const setProvider = useSettingsStore((s) => s.setProvider);
  const resetChat = useChatStore((s) => s.reset);
  const aiReady = Boolean(import.meta.env.VITE_AI_API_KEY);

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => nav(-1)} className="text-sm text-gray-600 mr-4">←</button>
        <h1 className="text-lg font-bold">{t('settings.title')}</h1>
      </div>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('settings.language')}</h2>
        <LanguageToggle />
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('settings.aiStatus')}</h2>
        <div className={`text-sm ${aiReady ? 'text-green-600' : 'text-yellow-600'}`}>
          {aiReady ? `✅ ${t('settings.aiReady')}` : `⚠️ ${t('settings.aiNotConfigured')}`}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Model: {(import.meta.env.VITE_AI_MODEL as string) || 'gpt-4o-mini'}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('settings.provider')}</h2>
        <div className="flex flex-col gap-2">
          {(['auto', 'local', 'ai'] as const).map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="provider"
                checked={preferredProvider === p}
                onChange={() => setProvider(p)}
              />
              {t(`settings.provider${p[0].toUpperCase()}${p.slice(1)}` as any)}
            </label>
          ))}
        </div>
      </section>

      <button
        onClick={() => { resetChat(); nav('/'); }}
        className="w-full rounded-lg border border-red-300 text-red-600 py-2 text-sm"
      >
        {t('settings.reset')}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/settings.tsx
git commit -m "feat: settings page with language, provider, AI status, reset"
```

---

### Task 27: Wire up app.tsx routes

**Files:**
- Modify: `src/app.tsx`

- [ ] **Step 1: Replace app.tsx**

Overwrite `src/app.tsx`:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { Route } from 'react-router-dom'
import { AnimationRoutes, App, SnackbarProvider, ZMPRouter } from 'zmp-ui'

import HomePage from './pages/home'
import ChatPage from './pages/chat'
import SettingsPage from './pages/settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2 },
  },
})

const MyApp = () => {
  return (
    <App>
      <Suspense>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <ZMPRouter>
              <AnimationRoutes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </AnimationRoutes>
            </ZMPRouter>
          </SnackbarProvider>
        </QueryClientProvider>
      </Suspense>
    </App>
  )
}
export default MyApp
```

- [ ] **Step 2: Run the dev build to verify it compiles**

```bash
pnpm build
```

Expected: build succeeds, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/app.tsx
git commit -m "feat: wire up home, chat, and settings routes"
```

---

## Phase 7: Polish & Verification

### Task 28: Rewrite README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Overwrite README**

```markdown
# Edu Chat — Mini App

Educational chatbot mini app for Zalo. Pick a subject (Math, Physics, Chemistry, English), chat in Vietnamese or English, get questions and explanations from a local question bank with optional AI fallback.

## Stack

React 18, TypeScript, Vite 5, Zustand, Tailwind, zmp-ui, KaTeX.

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` in your browser.

## Configuration

Copy `.env.development` and set:

```
VITE_AI_API_URL=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=sk-...
VITE_AI_MODEL=gpt-4o-mini
```

If `VITE_AI_API_KEY` is empty, the app uses the local question bank only.

## Testing

```bash
pnpm test
```

## Adding Questions

Edit files in `src/data/questions/<subject>.json`. Each question follows the `Question` type in `src/providers/types.ts`.

## Spec & Plan

- Design: `docs/superpowers/specs/2026-06-24-edu-chatbot-design.md`
- Plan: `docs/superpowers/plans/2026-06-24-edu-chatbot.md`
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for the new chatbot app"
```

---

### Task 29: Final integration verification

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run a production build**

```bash
pnpm build
```

Expected: build succeeds with no TypeScript errors and no warnings about missing imports.

- [ ] **Step 3: Start the dev server in the background and smoke-test**

```bash
pnpm dev &
sleep 4
curl -s http://localhost:3000 | head -30
```

Expected: HTML response with the app div.

- [ ] **Step 4: Manual browser check**

Open `http://localhost:3000` in a browser and verify:
- Home page renders with 4 subject chips and language toggle
- Selecting a subject and clicking "Bắt đầu" navigates to `/chat`
- Sending "Cho tôi câu hỏi Toán" returns a math question with a KaTeX formula
- Answering with the correct letter shows "Chính xác! 🎉"
- Settings page shows correct AI status and language switcher works

- [ ] **Step 5: Commit any final fixes**

If any fixes were needed during smoke test, commit them:
```bash
git add -A
git commit -m "fix: smoke-test fixes"
```

---

## Self-Review Notes

The plan covers every section of the spec:
- §3 Architecture → Tasks 6, 10–15
- §4 Project structure → Tasks 3, 4, 7, 24–27
- §5 Data model → Task 6
- §6 Provider layer → Tasks 10–12
- §7 Chat service → Tasks 13–15
- §8 State management → Tasks 8, 16
- §9 localStorage schema → Tasks 8, 16
- §10 UI → Tasks 17–27
- §11 i18n → Task 8
- §12 Configuration → Task 4
- §13 Error handling → Tasks 11, 14
- §14 Observability → Task 14b
- §15 Testing scope → tasks throughout have tests
- §16 Dependencies → Task 2
- §17 Risks → flagged inline in EmptyState (i18n array case) and noted in commit messages
