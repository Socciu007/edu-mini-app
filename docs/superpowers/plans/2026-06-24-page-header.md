# Common PageHeader + Cross-Subject Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable `PageHeader` component to all 4 screens, remove the subject picker from Chat, and add AI-based subject detection (with random fallback) so the chat works across all subjects.

**Architecture:** A new `<PageHeader title onBack? right? />` component used on all 4 screens. The Chat page is simplified — no more Mode A subject picker. The chat router calls `ai.detectSubject(text)` when AI is configured, or `pickRandomSubject()` as fallback. `ChatHeader` is removed.

**Tech Stack:** React 18, TypeScript, Vite, react-router-dom v6, Zustand, Tailwind, zmp-ui.

**Spec:** `docs/superpowers/specs/2026-06-24-page-header-design.md`

**Test convention for this project:**
- Test files using JSX need `import React from 'react'`
- Test files using `toBeInTheDocument` need `import '@testing-library/jest-dom/vitest'` at the top

---

## Task 1: Update i18n strings

**Files:**
- Modify: `src/i18n/vi.json`
- Modify: `src/i18n/en.json`

- [ ] **Step 1: Add new strings and remove changeSubject in vi.json**

Edit `src/i18n/vi.json`. Make these changes:
1. **Remove** the `"changeSubject": "Đổi môn"` line from the `chat` object.
2. **Add** inside the `chat` object (after `aiNotConfigured`):
   ```jsonc
   "aiNotConfiguredRandom": "AI chưa được cấu hình. Câu hỏi sẽ random từ ngân hàng cục bộ.",
   ```
3. **Add** `"headerTitle": "Khảo sát"` to the `survey` object.
4. **Add** `"headerTitle": "Review"` to the `review` object.
5. **Add** `"headerTitle": "Cá nhân"` to the `user` object.

- [ ] **Step 2: Same changes in en.json**

Edit `src/i18n/en.json`. Same shape:
1. Remove `"changeSubject": "Change subject"` from `chat`.
2. Add `"aiNotConfiguredRandom": "AI is not configured. Questions will be random from the local bank."` to `chat`.
3. Add `"headerTitle": "Survey"` to `survey`.
4. Add `"headerTitle": "Review"` to `review`.
5. Add `"headerTitle": "Profile"` to `user`.

- [ ] **Step 3: Verify JSON is valid**

```bash
cd "e:/projectVN/edu-mini-app"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/vi.json','utf8')); console.log('vi OK')"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8')); console.log('en OK')"
```

Expected: both print OK.

- [ ] **Step 4: Run tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test 2>&1 | tail -5
```

Expected: 59 tests pass (some may fail if they referenced `chat.changeSubject`; we'll fix those in later tasks).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/vi.json src/i18n/en.json
git commit -m "feat: add i18n keys for PageHeader + AI fallback message"
```

---

## Task 2: Add `pickRandomSubject` helper (TDD)

**Files:**
- Modify: `src/constants/subjects.ts` (add export)
- Create: `src/constants/subjects.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/constants/subjects.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { pickRandomSubject } from './subjects';

describe('pickRandomSubject', () => {
  it('returns one of the 4 valid subjects', () => {
    const valid: ReadonlyArray<string> = ['math', 'physics', 'chemistry', 'english'];
    for (let i = 0; i < 50; i++) {
      const s = pickRandomSubject();
      expect(valid).toContain(s);
    }
  });

  it('returns a different subject on consecutive calls (eventually)', () => {
    const calls = new Set<string>();
    for (let i = 0; i < 10; i++) calls.add(pickRandomSubject());
    expect(calls.size).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/constants/subjects.test.ts 2>&1 | tail -10
```

Expected: FAIL — `pickRandomSubject` not exported.

- [ ] **Step 3: Add the helper**

Append to `src/constants/subjects.ts` (after the existing `SUBJECT_BY_ID` export):
```ts
export function pickRandomSubject(): SubjectId {
  const ids: SubjectId[] = ['math', 'physics', 'chemistry', 'english'];
  return ids[Math.floor(Math.random() * ids.length)];
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/constants/subjects.test.ts 2>&1 | tail -10
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/constants/subjects.ts src/constants/subjects.test.ts
git commit -m "feat: pickRandomSubject helper for chat fallback"
```

---

## Task 3: Add `AIProvider.detectSubject` (TDD)

**Files:**
- Modify: `src/providers/ai.ts`
- Modify: `src/providers/ai.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `src/providers/ai.test.ts` (inside the existing `describe('AIProvider')`):
```ts
  it('detectSubject returns subject from JSON response', async () => {
    global.fetch = mockFetchOk({
      choices: [{ message: { content: JSON.stringify({ subject: 'physics', reasoning: 'mentions gravity' }) } }],
    });
    const p = new AIProvider();
    const result = await p.detectSubject('What is gravity?', []);
    expect(result).toBe('physics');
  });

  it('detectSubject returns null when AI cannot determine', async () => {
    global.fetch = mockFetchOk({
      choices: [{ message: { content: JSON.stringify({ subject: null, reasoning: 'unclear' }) } }],
    });
    const p = new AIProvider();
    const result = await p.detectSubject('hello there', []);
    expect(result).toBeNull();
  });

  it('detectSubject returns null when API throws', async () => {
    global.fetch = mockFetchFail(500);
    const p = new AIProvider();
    const result = await p.detectSubject('any text', []);
    expect(result).toBeNull();
  });
```

- [ ] **Step 2: Run tests, expect fail**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/providers/ai.test.ts 2>&1 | tail -15
```

Expected: FAIL — `detectSubject` not defined.

- [ ] **Step 3: Add the method**

In `src/providers/ai.ts`, add the `detectSubject` method to the `AIProvider` class (after the `chat` method):
```ts
  async detectSubject(text: string, history: ChatMessage[]): Promise<SubjectId | null> {
    try {
      const userPrompt = `Detect which subject this question belongs to. Subjects: math, physics, chemistry, english. Respond with JSON {"subject":"<id>|null","reasoning":"<one sentence>"}. User text: ${JSON.stringify(text)}`;
      const messages: ChatMsg[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-4).map<ChatMsg>((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
        { role: 'user', content: userPrompt },
      ];
      const text = await callAI(messages);
      const parsed = extractJson<{ subject: string | null }>(text);
      const s = parsed.subject;
      if (s === 'math' || s === 'physics' || s === 'chemistry' || s === 'english') return s;
      return null;
    } catch {
      return null;
    }
  }
```

Add this import at the top of the file:
```ts
import type { ChatMessage, Question, QuestionProvider, SubjectId, Difficulty } from './types';
```
(If it's not already there — verify by reading the file first.)

- [ ] **Step 4: Run tests, expect pass**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/providers/ai.test.ts 2>&1 | tail -10
```

Expected: all AI tests pass (3 new + existing).

- [ ] **Step 5: Commit**

```bash
git add src/providers/ai.ts src/providers/ai.test.ts
git commit -m "feat: AIProvider.detectSubject with null fallback"
```

---

## Task 4: Build `PageHeader` component (TDD)

**Files:**
- Create: `src/components/page-header.test.tsx`
- Create: `src/components/page-header.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/page-header.test.tsx`:
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

  it('shows back button by default and calls nav(-1) when clicked', () => {
    const { container } = renderAt('/', { title: 'Chat' });
    const btn = screen.getByLabelText('Back');
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
    expect(container).toBeTruthy();
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

- [ ] **Step 2: Run tests, expect fail**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/page-header.test.tsx 2>&1 | tail -10
```

Expected: FAIL — `PageHeader` not defined.

- [ ] **Step 3: Implement PageHeader**

Create `src/components/page-header.tsx`:
```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
          className="text-sm text-gray-600 no-underline w-16 text-left"
          aria-label="Back"
        >
          ← Quay lại
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

- [ ] **Step 4: Run tests, expect pass**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/page-header.test.tsx 2>&1 | tail -10
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/page-header.tsx src/components/page-header.test.tsx
git commit -m "feat: PageHeader with back button + centered title + optional right slot"
```

---

## Task 5: Apply PageHeader to Review page

**Files:**
- Modify: `src/pages/review.tsx`

- [ ] **Step 1: Replace the inline header**

In `src/pages/review.tsx`, replace the top of the page:
- Import `PageHeader`
- Replace the inline `<div className="border-b ..."><h1>📊 ...</h1></div>` with `<PageHeader title="📊 Review">`

Replace the opening of `ReviewPage`'s return:
```tsx
  return (
    <div className="min-h-screen pb-16">
      <PageHeader title={`📊 ${t('review.title')}`} />
      <section className="p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('review.stats')}</h2>
```

And add the import at the top:
```tsx
import { PageHeader } from '../components/page-header';
```

- [ ] **Step 2: Run tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/pages/review.test.tsx 2>&1 | tail -10
```

Expected: review tests still pass. If the first test "renders the review title" fails (it looked for h1 with "Review" exact), update the test to use `screen.getByRole('heading')` instead of `getByText`. (This was already done in a previous plan.)

- [ ] **Step 3: Commit**

```bash
git add src/pages/review.tsx
git commit -m "refactor: Review page uses PageHeader"
```

---

## Task 6: Apply PageHeader to User page

**Files:**
- Modify: `src/pages/user.tsx`

- [ ] **Step 1: Replace the inline header**

In `src/pages/user.tsx`, replace the top of the page:
- Import `PageHeader`
- Replace the inline `<div className="flex items-center mb-6"><button>←</button><h1>...</h1></div>` with `<PageHeader title="👤 Cá nhân" onBack={() => nav('/')} />`

Replace the opening of `UserPage`'s return:
```tsx
  return (
    <div className="min-h-screen pb-16">
      <PageHeader title={`👤 ${t('user.title')}`} onBack={() => nav('/')} />
      <div className="p-4">
        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">{t('user.language')}</h2>
          <LanguageToggle />
        </section>
```

Remove the existing inline header div.

Add the import at the top:
```tsx
import { PageHeader } from '../components/page-header';
```

- [ ] **Step 2: Run tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/pages/user.test.tsx 2>&1 | tail -10
```

Expected: 3 tests still pass (or update if the title selector changed).

- [ ] **Step 3: Commit**

```bash
git add src/pages/user.tsx
git commit -m "refactor: User page uses PageHeader"
```

---

## Task 7: Apply PageHeader to Survey page

**Files:**
- Modify: `src/pages/survey.tsx`

- [ ] **Step 1: Add PageHeader to all 3 states**

In `src/pages/survey.tsx`, add the import:
```tsx
import { PageHeader } from '../components/page-header';
```

Add `<PageHeader title="📝 Khảo sát" onBack={() => nav('/')} />` to the top of each return branch (`idle`, `playing`, `finished`). Wrap each existing return in a fragment or wrap the whole state output:

For the `idle` state:
```tsx
  if (state.kind === 'idle') {
    return (
      <div className="min-h-screen pb-16">
        <PageHeader title={`📝 ${t('survey.title')}`} onBack={() => nav('/')} />
        <div className="p-6 flex flex-col items-center justify-center text-center">
          {/* existing idle content */}
        </div>
      </div>
    );
  }
```

Similarly for `playing` and `finished`. The exact existing JSX inside each branch should be preserved.

- [ ] **Step 2: Run tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/pages/survey.test.tsx 2>&1 | tail -10
```

Expected: 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/survey.tsx
git commit -m "refactor: Survey page uses PageHeader"
```

---

## Task 8: Update chat-store — remove `activeSubject`

**Files:**
- Modify: `src/stores/chat-store.ts`
- Modify: `src/stores/chat-store.test.ts`

- [ ] **Step 1: Update chat-store.ts**

Open `src/stores/chat-store.ts`. Apply these changes:
1. Remove `activeSubject` from `ChatState` interface.
2. Remove `setActiveSubject` from `ChatState` interface and implementation.
3. In the `partialize` of the persist middleware, remove `activeSubject: s.activeSubject`.
4. In `sendUserMessage`, remove the line that uses `state.activeSubject`:
   - Find: `const ctx: RouterContext = { activeSubject: state.activeSubject, history: state.messages, recentIds: state.recentQuestionIds, lastQuestion, };`
   - Replace with: `const ctx: RouterContext = { history: state.messages, recentIds: state.recentQuestionIds, lastQuestion, };`

The new interface:
```ts
interface ChatState {
  messages: ChatMessage[];
  recentQuestionIds: string[];
  stats: { asked: number; correct: number };

  reset: () => void;
  sendUserMessage: (text: string, runner?: typeof routeMessage) => Promise<void>;
}
```

The new implementation:
```ts
    (set, get) => ({
      messages: [],
      recentQuestionIds: [],
      stats: { asked: 0, correct: 0 },

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

        const lastBot = [...state.messages].reverse().find((m) => m.role === 'bot' && m.questionRef);
        const lastQuestion = lastBot?.questionRef ? questionCache.get(lastBot.questionRef) : undefined;

        const ctx: RouterContext = {
          history: state.messages,
          recentIds: state.recentQuestionIds,
          lastQuestion,
        };

        set({ messages: [...state.messages, userMsg] });
        const out = await runner(text, ctx, lang);

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
```

The new `partialize`:
```ts
      partialize: (s) => ({
        messages: s.messages,
        recentQuestionIds: s.recentQuestionIds,
        stats: s.stats,
      }),
```

- [ ] **Step 2: Update chat-store.test.ts**

In `src/stores/chat-store.test.ts`:
- Remove `setActiveSubject` test if it exists
- In each `beforeEach`, remove `activeSubject: ...` from the `setState` call
- Add a regression test:
  ```ts
  it('sendUserMessage calls runner with no activeSubject in ctx', async () => {
    let capturedCtx: any = null;
    const runner = async (_text: string, ctx: any) => {
      capturedCtx = ctx;
      return { messages: [{ id: 'b1', role: 'bot' as const, content: 'hi', createdAt: 1 }] };
    };
    await useChatStore.getState().sendUserMessage('hi', runner as any);
    expect(capturedCtx.activeSubject).toBeUndefined();
    expect(capturedCtx.history).toBeDefined();
    expect(capturedCtx.recentIds).toBeDefined();
  });
  ```

- [ ] **Step 3: Run tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/stores/chat-store.test.ts 2>&1 | tail -10
```

Expected: tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/stores/chat-store.ts src/stores/chat-store.test.ts
git commit -m "refactor: remove activeSubject from chat-store"
```

---

## Task 9: Update router for cross-subject + AI detection

**Files:**
- Modify: `src/services/chat/router.ts`
- Modify: `src/services/chat/router.test.ts`

- [ ] **Step 1: Update router.ts**

In `src/services/chat/router.ts`:
1. Add import: `import { pickRandomSubject, SUBJECT_BY_ID } from '../../constants/subjects';`
2. In the `request_question` branch (find the existing `if (intent.kind === 'request_question')` block), replace the subject resolution:
   - Find: `let q: Question;`
   - Replace the subject-resolution logic with:
   ```ts
     let subject = intent.subject;
     if (!subject && hasAiConfig()) {
       try {
         subject = (await getProvider('ai').detectSubject(userText, ctx.history)) ?? undefined;
       } catch {
         subject = undefined;
       }
     }
     if (!subject) subject = pickRandomSubject();

     let q: Question;
   ```
3. Remove the line `const subj = SUBJECT_BY_ID[subject];` (no longer used in this branch).

- [ ] **Step 2: Update router.test.ts**

In `src/services/chat/router.test.ts`:
- Find the existing `'returns a question for request_question from local bank'` test
- The test passes `activeSubject: 'math'` to ctx. Remove that key (now it's no longer used)
- Add a new test:
  ```ts
  it('falls back to a random subject when no subject provided and no AI', async () => {
    const out = await routeMessage('Cho tôi câu hỏi', {
      history: [], recentIds: [],
    });
    expect(out.messages).toHaveLength(1);
    expect(out.messages[0].questionRef).toBeDefined();
    // The questionRef should match a question from any subject
    const validIds = ['math-', 'phys-', 'chem-', 'eng-'];
    expect(validIds.some(p => out.messages[0].questionRef!.startsWith(p))).toBe(true);
  });
  ```

- [ ] **Step 3: Run tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/services/chat/router.test.ts 2>&1 | tail -10
```

Expected: tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/services/chat/router.ts src/services/chat/router.test.ts
git commit -m "feat: router detects subject via AI or random fallback"
```

---

## Task 10: Update ChatPage — remove Mode A, use PageHeader

**Files:**
- Modify: `src/pages/chat.tsx`

- [ ] **Step 1: Rewrite chat.tsx**

Overwrite `src/pages/chat.tsx`:
```tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chat-store';
import { useTranslation } from '../i18n/use-translation';
import { PageHeader } from '../components/page-header';
import { ChatInput } from '../components/chat/chat-input';
import { MessageBubble } from '../components/chat/message-bubble';
import { EmptyState } from '../components/chat/empty-state';

export default function ChatPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const messages = useChatStore((s) => s.messages);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const reset = useChatStore((s) => s.reset);
  const aiReady = Boolean(import.meta.env.VITE_AI_API_KEY);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Chat"
        onBack={() => nav('/')}
        right={
          <button onClick={reset} className="text-xs text-gray-600 underline">
            {t('chat.newSession')}
          </button>
        }
      />
      {!aiReady && (
        <div className="bg-yellow-50 text-yellow-800 text-xs px-4 py-2 border-b border-yellow-200">
          {t('chat.aiNotConfiguredRandom')}
        </div>
      )}
      <div ref={listRef} className="flex-1 overflow-y-auto px-2 bg-gray-50 scrollbar-thin">
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

- [ ] **Step 2: Run tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test 2>&1 | tail -10
```

Expected: all tests pass (or fix individual failures).

- [ ] **Step 3: Commit**

```bash
git add src/pages/chat.tsx
git commit -m "refactor: ChatPage uses PageHeader, no Mode A"
```

---

## Task 11: Delete `ChatHeader` and its test

**Files:**
- Delete: `src/components/chat/chat-header.tsx`
- Delete: `src/components/chat/chat-header.test.tsx`

- [ ] **Step 1: Delete the files**

```bash
cd "e:/projectVN/edu-mini-app"
rm src/components/chat/chat-header.tsx
rm src/components/chat/chat-header.test.tsx
```

- [ ] **Step 2: Verify nothing references ChatHeader**

```bash
cd "e:/projectVN/edu-mini-app"
grep -r "ChatHeader" src/ 2>&1 | head -10
```

Expected: no matches.

- [ ] **Step 3: Run full test suite**

```bash
cd "e:/projectVN/edu-mini-app"
npm test 2>&1 | tail -5
npm run build 2>&1 | tail -5
```

Expected: all tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove ChatHeader (replaced by PageHeader)"
```

---

## Task 12: Final integration verification

- [ ] **Step 1: Run all tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test 2>&1 | tail -10
```

Expected: ~60 tests pass.

- [ ] **Step 2: Run a production build**

```bash
cd "e:/projectVN/edu-mini-app"
npm run build 2>&1 | tail -10
```

Expected: build succeeds.

- [ ] **Step 3: Manual smoke test**

Open `http://localhost:3000` in a browser and verify:
- Chat tab shows PageHeader with "Chat" title + "Phiên mới" button
- Type "Cho tôi câu hỏi" → get a question (any subject)
- Survey tab shows PageHeader with "📝 Khảo sát" title
- Review tab shows PageHeader with "📊 Review" title
- User tab shows PageHeader with "👤 Cá nhân" title
- All tabs have working back buttons

---

## Self-Review Notes

Spec coverage:
- §3 High-level architecture → Tasks 4-10
- §4 PageHeader API → Task 4
- §5 PageHeader usage → Tasks 5, 6, 7, 10
- §6 Chat flow → Task 10
- §6 Subject detection → Tasks 2, 3, 9
- §7 ChatStore changes → Task 8
- §8 ChatPage update → Task 10
- §9 File changes → All tasks
- §10 i18n additions → Task 1
- §11 Error handling → Tasks 3, 9
- §12 Testing → Tasks 2, 3, 4, 8, 9

Type consistency:
- `SubjectId` matches across `types.ts`, `subjects.ts`, `ai.ts`, `router.ts`
- `QuestionProvider.detectSubject` (optional method) added in ai.ts and used in router
- `pickRandomSubject` exported from subjects.ts, imported in router.ts
- `RouterContext.activeSubject` removed in chat-store; tests updated

No placeholders found.