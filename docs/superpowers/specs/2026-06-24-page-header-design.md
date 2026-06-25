# Common PageHeader + Cross-Subject Chat — Design

**Date:** 2026-06-24
**Status:** Approved (pending user review of this written spec)
**Project:** `edu-mini-app` (Zalo Mini App)

## 1. Purpose

Two related changes:

1. **Common PageHeader** — a reusable header component (back button + centered title + optional right slot) used on all 4 screens (Chat, Survey, Review, User).
2. **Cross-subject Chat** — remove the subject picker step from the Chat tab. The chat can answer questions from any subject. AI (when configured) auto-detects the subject from the user's text; without AI, the chat falls back to picking a random subject.

## 2. Scope

### In scope

- New `PageHeader` component with `title`, optional `onBack`, optional `right` slot
- All 4 screens use `PageHeader`
- Delete `ChatHeader` component (replaced by `PageHeader`)
- Remove `activeSubject` from chat-store; remove Mode A subject picker from chat page
- Add `AIProvider.detectSubject(text, history)` method
- Add `pickRandomSubject()` helper for fallback
- Update router to detect subject (AI) or pick random (fallback)
- i18n updates: add new strings, remove `chat.changeSubject`
- Tests for PageHeader, updated router/chat tests, removed ChatHeader tests

### Out of scope (v1)

- Per-message subject badge in the chat
- "Filter by subject" toggle in the chat
- Persisting last-detected subject across sessions
- Per-subject stats in Review (Review shows aggregate only)
- localStorage migration (old `activeSubject` field is ignored on read)
- "Reset conversation" confirmation dialog
- Sticky header on scroll behavior

## 3. High-Level Architecture

```
PageHeader (NEW)
└── Used by Chat, Survey, Review, User pages

ChatPage (UPDATED)
└── No more Mode A. Always renders chat UI.
    sendUserMessage → router → AI.detectSubject (if available)
                                  → AI.getQuestion (subject)
                                  → OR localProvider.getQuestion (random subject)
```

## 4. PageHeader API

`src/components/page-header.tsx`:

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;                  // e.g., "Chat", "📊 Review"
  onBack?: () => void;            // optional — omit to hide back button
  right?: React.ReactNode;        // optional right-side actions
}

export function PageHeader({ title, onBack, right }: Props) {
  const nav = useNavigate();
  const handleBack = onBack ?? (() => nav(-1));
  const showBack = Boolean(onBack);
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

Layout: 3-column flex with fixed-width sides (64px each) and flexible title. The title stays visually centered regardless of back/right content.

## 5. PageHeader Usage Per Screen

| Screen | Title | Back | Right |
|--------|-------|------|-------|
| Chat | "Chat" | yes | "Phiên mới" button |
| Survey | "📝 Khảo sát" | yes | (none) |
| Review | "📊 Review" | yes | (none) |
| User | "👤 Cá nhân" | yes | (none) |

All 4 screens show the back button. Default `onBack` is `nav(-1)`. User tab can override `onBack={() => nav('/')}` to always go home.

## 6. Chat Flow (Cross-Subject)

1. User opens Chat tab → empty state with starter prompts (no subject picker)
2. User sends message or clicks a starter prompt
3. Router detects intent (`request_question`, `submit_answer`, `chitchat`, etc.)
4. For `request_question`:
   - If intent has subject (e.g., from explicit "Toán" mention) → use it
   - Else if AI configured → call `ai.detectSubject(text, history)` → use returned subject (or null)
   - Else → `pickRandomSubject()` (any subject)
5. `localProvider.getQuestion({ subject, excludeIds })` → return question
6. User answers → existing flow (MCQ local check, open-ended AI evaluation)

### Subject detection

**New method on AIProvider** (`src/providers/ai.ts`):

```ts
async detectSubject(text: string, history: ChatMessage[]): Promise<SubjectId | null> {
  const userPrompt = `Detect which subject this question belongs to. Subjects: math, physics, chemistry, english. Respond with JSON {"subject":"<id>|null","reasoning":"<one sentence>"}. User text: ${JSON.stringify(text)}`;
  // ... same callAI pattern, returns parsed subject or null
}
```

AI returns a subject ID or `null` if it can't determine.

**Fallback** (`src/constants/subjects.ts`):

```ts
export function pickRandomSubject(): SubjectId {
  const ids: SubjectId[] = ['math', 'physics', 'chemistry', 'english'];
  return ids[Math.floor(Math.random() * ids.length)];
}
```

### Router update (`src/services/chat/router.ts`)

For `request_question` intent with no subject:

```ts
if (intent.kind === 'request_question') {
  let subject = intent.subject;
  
  if (!subject && hasAiConfig()) {
    try {
      subject = (await getProvider('ai').detectSubject(userText, ctx.history)) ?? undefined;
    } catch (e) {
      log.warn('detectSubject failed', e);
    }
  }
  
  if (!subject) subject = pickRandomSubject();
  
  const q = await localProvider.getQuestion({ subject, excludeIds: ctx.recentIds });
  // ... return as before
}
```

The router no longer needs `ctx.activeSubject`.

## 7. ChatStore Changes (`src/stores/chat-store.ts`)

Remove:
- `activeSubject` field
- `setActiveSubject` action
- All references in `sendUserMessage`

Keep:
- `messages`, `recentQuestionIds`, `stats`
- `sendUserMessage`, `reset`

### localStorage migration

Old data shape:
```json
{ "messages": [...], "activeSubject": "math", "recentQuestionIds": [...], "stats": {...} }
```

New `partialize` only writes the new shape. Old `activeSubject` is ignored on read — no migration needed.

## 8. ChatPage Update (`src/pages/chat.tsx`)

- No more Mode A branch — always render chat UI
- New structure:
  ```tsx
  <PageHeader title="Chat" onBack={() => nav('/')} right={<NewSessionButton />} />
  {!aiReady && <AiNotConfiguredBanner />}
  <MessageList />
  <ChatInput />
  ```
- `NewSessionButton` calls `useChatStore.reset()`

## 9. File Changes

**New files:**
- `src/components/page-header.tsx`
- `src/components/page-header.test.tsx`

**Modified files:**
- `src/pages/chat.tsx` — remove Mode A, use PageHeader
- `src/pages/survey.tsx` — add PageHeader at the top
- `src/pages/review.tsx` — replace inline header with PageHeader
- `src/pages/user.tsx` — replace inline header with PageHeader
- `src/services/chat/router.ts` — add subject detection
- `src/providers/ai.ts` — add `detectSubject`
- `src/stores/chat-store.ts` — remove `activeSubject`
- `src/constants/subjects.ts` — add `pickRandomSubject`
- `src/i18n/vi.json`, `src/i18n/en.json` — new strings

**Deleted files:**
- `src/components/chat/chat-header.tsx`
- `src/components/chat/chat-header.test.tsx`

## 10. i18n Additions

Add to both `vi.json` and `en.json`:

```jsonc
"chat": {
  // remove "changeSubject"
  "aiNotConfiguredRandom": "AI chưa được cấu hình. Câu hỏi sẽ random từ ngân hàng cục bộ."
  // en: "AI is not configured. Questions will be random from the local bank."
},
"survey": { "headerTitle": "Khảo sát" },  // en: "Survey"
"review": { "headerTitle": "Review" },
"user": { "headerTitle": "Cá nhân" }      // en: "Profile"
```

## 11. Error Handling

| Failure | UX |
|---------|----|
| AI `detectSubject` returns null | Fall back to `pickRandomSubject()` |
| AI `detectSubject` throws | Catch, log, fall back to random |
| AI `getQuestion` throws | Catch, return bot message: "Không kết nối được AI. Thử lại sau." + Retry button |
| Local provider throws (no questions) | Return bot message: "Chưa có câu hỏi." |
| `nav(-1)` with no history | Harmless no-op |
| PageHeader receives no `title` | TypeScript prevents (required prop) |

## 12. Testing Scope

**New tests:**
- `PageHeader`: renders title, shows back button by default, hides when `onBack` is omitted, renders `right` slot, default `onBack` calls `nav(-1)`
- `pickRandomSubject`: returns one of 4 valid subjects

**Updated tests:**
- `Router`: `request_question` without subject falls back to random; with AI configured, calls `detectSubject`
- `ChatPage`: no Mode A — page renders chat UI immediately
- `chat-store.test`: remove `activeSubject` references

**Deleted tests:**
- `chat-header.test.tsx` (ChatHeader removed)

### Test count delta
- New: ~5 tests (PageHeader) + 1 test (pickRandomSubject)
- Updated: ~5 tests
- Deleted: 4 tests (chat-header)
- Net: ~7 tests added, 4 removed → roughly 60 tests total

## 13. Risks & Open Questions

- **AI detection accuracy**: AI may mis-detect subject (e.g., a physics question phrased mathematically). Acceptable for v1 — the question is still served, just from the "wrong" subject. Future: let user manually override.
- **Empty chat history for AI**: `detectSubject` gets an empty history on first message. System prompt is sufficient — history is only a hint.
- **Subject emoji + name on each question**: Chat already sets `message.subject`. The `MessageBubble` doesn't currently show it. Adding a small badge per question is out of scope for v1 (would be a polish improvement).
- **Review tab with cross-subject history**: Review shows all messages. The `chat-store.stats` counts all subjects together (no per-subject breakdown). Acceptable for v1.