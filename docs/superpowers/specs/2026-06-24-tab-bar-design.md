# Tab Bar Navigation — Design

**Date:** 2026-06-24
**Status:** Approved (pending user review of this written spec)
**Project:** `edu-mini-app` (Zalo Mini App)

## 1. Purpose

Replace the current single-page home → chat flow with a **fixed bottom tab bar** providing 4 destinations: Chat, Khảo sát (Survey), Review, User. The User tab replaces the existing Settings page (same content, different label). The home page is deleted; the Chat tab becomes the default entry point with the subject picker shown inline when no subject is selected.

## 2. Scope

### In scope

- 4 fixed bottom tabs: Chat, Khảo sát, Review, User
- Tab bar UI: emoji + Vietnamese label, blue active / gray inactive, white background with border-top
- Chat tab: subject picker inline (Mode A) when no subject, existing chat UI (Mode B) once selected
- Khảo sát tab: 5 random MCQ questions from local bank, 30s per-question timer, score screen
- Review tab: chat history + stats (asked/correct count + accuracy)
- User tab: existing Settings page, renamed
- Delete: `src/pages/home.tsx`
- Rename: `src/pages/settings.tsx` → `src/pages/user.tsx` (and route `/settings` → `/user`)
- Update `src/pages/chat.tsx` to include subject picker
- Update `src/components/chat/chat-header.tsx`: remove "Settings" link, add "Đổi môn" link
- i18n additions for new keys
- Tests for tab bar, survey state machine, review rendering, header changes

### Out of scope (v1)

- Survey results persistence (one-shot per session)
- Review filtering by subject or date
- Tab badges (notification dots)
- Hiding the tab bar on specific routes
- Multiple Survey modes (timed vs untimed)
- Per-subject leaderboard
- Sharing survey scores
- Profile fields (avatar, name, join date)

## 3. High-Level Architecture

```
App
└─ QueryClient + Snackbar
   └─ ZMPRouter
      └─ AnimationRoutes
         └─ ShellLayout (NEW)
            ├─ <Outlet/>        ← renders active page
            └─ <TabBar/> (NEW)  ← fixed bottom
```

`ShellLayout` is a thin wrapper (in `app.tsx`) that adds `pb-16` to its container so page content isn't hidden under the tab bar.

## 4. Routes

| Path | Page | Tab label | Emoji |
|------|------|-----------|-------|
| `/` | ChatPage | Chat | 💬 |
| `/survey` | SurveyPage | Khảo sát | 📝 |
| `/review` | ReviewPage | Review | 📊 |
| `/user` | UserPage (was Settings) | Cá nhân | 👤 |

The `/` route now points to ChatPage (not HomePage). HomePage is deleted.

## 5. File Changes

**New files:**
- `src/components/tab-bar.tsx` — fixed bottom tab bar
- `src/pages/survey.tsx` — Khảo sát page
- `src/pages/review.tsx` — Review page
- `src/components/tab-bar.test.tsx` — tab bar tests
- `src/pages/survey.test.tsx` — survey state machine tests
- `src/pages/review.test.tsx` — review rendering tests

**Modified files:**
- `src/app.tsx` — wrap routes in ShellLayout, remove HomePage route, add 3 new routes, change Settings route to User
- `src/pages/chat.tsx` — render subject picker inline (Mode A) when `activeSubject` undefined, else existing chat UI (Mode B)
- `src/components/chat/chat-header.tsx` — remove "Settings" link, add "Đổi môn" link
- `src/components/chat/chat-header.test.tsx` (new, if not exists) — test "Đổi môn" link
- `src/constants/routes.ts` — add `survey`, `review`, `user`; remove `home`
- `src/i18n/vi.json`, `src/i18n/en.json` — add tab labels + new page strings; rename `settings.*` keys to `user.*`

**Renamed files:**
- `src/pages/settings.tsx` → `src/pages/user.tsx`

**Deleted files:**
- `src/pages/home.tsx`

## 6. Tab Bar Component

`src/components/tab-bar.tsx`:

```tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../i18n/use-translation';

interface TabDef {
  to: string;
  emoji: string;
  labelKey: 'chat' | 'survey' | 'review' | 'user';
}

const TABS: TabDef[] = [
  { to: '/',       emoji: '💬', labelKey: 'chat' },
  { to: '/survey', emoji: '📝', labelKey: 'survey' },
  { to: '/review', emoji: '📊', labelKey: 'review' },
  { to: '/user',   emoji: '👤', labelKey: 'user' },
];

export function TabBar() {
  const { t } = useTranslation();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around pb-[env(safe-area-inset-bottom)] z-50"
      role="navigation"
      aria-label="Main"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-2 text-xs ${
              isActive ? 'text-blue-500' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl leading-none mb-1" aria-hidden="true">{tab.emoji}</span>
          <span>{t(`tabs.${tab.labelKey}`)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

Notes:
- `pb-[env(safe-area-inset-bottom)]` handles iPhone home indicator
- `NavLink` with `end` ensures `/` is only active when literally on the root path
- `z-50` keeps the tab bar above page content

## 7. ShellLayout (in app.tsx)

A thin wrapper rendered as a parent route. The `Outlet` renders the active page; the `TabBar` is fixed-positioned at the bottom.

```tsx
import { Outlet } from 'react-router-dom';
import { TabBar } from './components/tab-bar';

function ShellLayout() {
  return (
    <div className="min-h-screen pb-16">
      <Outlet />
      <TabBar />
    </div>
  );
}

// In the route tree:
<Route element={<ShellLayout />}>
  <Route path="/" element={<ChatPage />} />
  <Route path="/survey" element={<SurveyPage />} />
  <Route path="/review" element={<ReviewPage />} />
  <Route path="/user" element={<UserPage />} />
</Route>
```

## 8. Chat Tab — Two Modes

The Chat tab renders Mode A when `activeSubject` is undefined, Mode B otherwise.

### Mode A: subject picker (default entry)
- Top: language toggle (small, top-right)
- Middle: 🎓 + "Hãy chọn môn học để bắt đầu" + `<SubjectChips/>` (compact, centered)
- No ChatInput visible (no point sending without a subject)
- Click a chip → `setActiveSubject(id)` → re-renders into Mode B

### Mode B: chat interface
- Top: ChatHeader (with new "Đổi môn" link instead of Settings)
- Middle: message list (existing)
- Bottom: ChatInput (existing)
- "Đổi môn" calls `setActiveSubject(undefined)` → re-enters Mode A

## 9. ChatHeader Changes

Remove the "Settings" link, add a "Đổi môn" link:
- Before: `[back]  [subject]  [newSession] [settings]`
- After:  `[back]  [subject]  [newSession] [đổiMôn]`

Both links route to in-app actions (no nav). The tab bar provides access to the User/Settings page.

## 10. Khảo sát Page

`src/pages/survey.tsx` — a self-contained mini-quiz.

### State machine: `idle` → `playing` → `finished`

**`idle` state:**
- Header: "📝 Khảo sát nhanh"
- Description: "Trả lời 5 câu hỏi ngẫu nhiên. Mỗi câu có 30 giây."
- "Bắt đầu" button → picks 5 random MCQ questions, transitions to `playing`

**`playing` state:**
- Progress label: "Câu 2 / 5"
- Timer: 30s countdown, resets on new question
- Question prompt (with KaTeX)
- 4 choice buttons (A/B/C/D)
- Selecting a choice → record answer → auto-advance after 1s
- "Bỏ qua" button (counts as incorrect)
- Timer reaches 0 → mark incorrect, auto-advance

**`finished` state:**
- Score: "Bạn đúng X / 5"
- Per-question summary (✓/✗)
- "Làm lại" button → back to `idle`
- "Về Chat" button → navigate to `/`

### Question selection

Use the existing `LocalBankProvider`. Call `getQuestion({ subject, excludeIds: [] })` repeatedly. Filter to MCQ-only (have `choices`). If fewer than 5 available, show error message and offer retry.

### State (in-page, no global store)

```ts
type SurveyState =
  | { kind: 'idle' }
  | { kind: 'playing'; questions: Question[]; currentIdx: number; answers: (boolean | null)[]; secondsLeft: number }
  | { kind: 'finished'; questions: Question[]; answers: (boolean | null)[] };
```

`null` in `answers` means skipped / timed out (counts as incorrect in the score).

## 11. Review Page

`src/pages/review.tsx` — read-only history view.

### Top section — stats card
- Title: "📊 Tổng quan"
- Asked: `chat-store.stats.asked` (or "—" when 0)
- Correct: `chat-store.stats.correct`
- Accuracy: `${(correct/asked*100).toFixed(0)}%` (or "—" when 0)
- v1: no per-subject breakdown (YAGNI)

### Middle section — message list
- Section header: "💬 Lịch sử"
- Reuse `MessageBubble` to render each message from `chat-store.messages`
- Each message has a small timestamp label (relative: "vừa xong", "2 phút trước", ...)

### Empty state
- "Bạn chưa có cuộc trò chuyện nào. Hãy bắt đầu từ tab Chat!"
- Centered card

## 12. User Tab

`src/pages/user.tsx` (renamed from `settings.tsx`):
- Same content as old Settings, with updated labels
- Title: "Cá nhân" / "Profile"
- Sections: language, AI status, provider radio, reset button
- Reset: `useChatStore.reset()` then `navigate('/')`

## 13. i18n Additions

Add to `vi.json` and `en.json`:

```jsonc
"tabs": {
  "chat":   "Chat",      // en: "Chat"
  "survey": "Khảo sát",  // en: "Survey"
  "review": "Review",    // en: "Review"
  "user":   "Cá nhân"    // en: "Profile"
},
"survey": {
  "title": "Khảo sát nhanh",
  "description": "Trả lời 5 câu hỏi ngẫu nhiên. Mỗi câu có 30 giây.",
  "start": "Bắt đầu",
  "progress": "Câu {{current}} / {{total}}",
  "timeLeft": "{{seconds}}s",
  "skip": "Bỏ qua",
  "correct": "Đúng",
  "incorrect": "Sai",
  "scoreTitle": "Kết quả",
  "score": "Bạn đúng {{correct}} / {{total}}",
  "retry": "Làm lại",
  "backToChat": "Về Chat"
},
"review": {
  "title": "Review",
  "stats": "Tổng quan",
  "asked": "Đã làm",
  "correct": "Đúng",
  "accuracy": "Tỷ lệ đúng",
  "history": "Lịch sử",
  "empty": "Bạn chưa có cuộc trò chuyện nào. Hãy bắt đầu từ tab Chat!"
},
"user": {
  "title": "Cá nhân",
  "language": "Ngôn ngữ",
  "provider": "Nguồn câu hỏi",
  "aiStatus": "Trạng thái AI",
  "reset": "Bắt đầu lại cuộc trò chuyện"
}
```

(English version omitted here for brevity — the translator follows the same shape.)

**Rename** the existing `settings.*` keys to `user.*` (no migration needed; we control all callers).

## 14. Error Handling

| Failure | UX |
|---------|----|
| Survey: fewer than 5 MCQ questions | "Chưa có đủ câu hỏi cho khảo sát" message, stay in `idle` |
| Survey: timer goes negative (clock drift) | Clamp to 0, mark incorrect, advance |
| Review: localStorage corrupt | Catch + show empty state, don't crash |
| Survey: `localProvider` throws | Catch + show "Đã xảy ra lỗi, thử lại" with retry button |
| Any unhandled error in a tab page | Caught at route level, shows inline error in the page area, tab bar still works |

## 15. Testing Scope

### Unit / integration tests
- `useTranslation` extended for new keys (add to existing tests)
- `ChatHeader` "Đổi môn" link → calls `setActiveSubject(undefined)`
- `TabBar` highlights the active tab based on `useLocation()` (use `MemoryRouter` in tests)
- `Survey` state machine: `idle` → `playing` (5 questions loaded) → `finished` (score computed)
- `Survey` timer expiry → mark incorrect, advance
- `Review` shows stats correctly from `chat-store`
- `Review` shows empty state when no messages

### Manual smoke
- Click through all 4 tabs, verify each tab loads
- On Chat tab: pick a subject, send a message, get a question, answer it
- On Khảo sát: start a survey, answer questions, see score
- On Review: see the messages and stats from the chat session
- On User: change language, verify it reflects across the app

## 16. Risks & Open Questions

- **`end` prop on NavLink**: If the user navigates to `/chat/something` in the future, the Chat tab will not be active. We don't have nested routes today, so this is safe.
- **Survey timer drift**: Using `setInterval` is OK for a 30s window. If the tab is backgrounded, the timer will fire late but the UI will catch up. Acceptable.
- **localStorage size**: Review tab reuses the existing chat history. If the history grows unbounded, Review will be slow. The chat-store's `partialize` already keeps only the first 200 messages via `recentIds` cap. If full-history growth becomes an issue, add a soft cap (e.g. last 200 messages) in v1.1 — out of scope here.
- **Survey randomness on small bank**: With 40 questions, 5 random picks can repeat occasionally. Acceptable for v1; not a real concern.
- **No back gesture support**: The tab bar uses NavLink (push) by default. Standard browser back goes to the previous tab. This matches user expectations.
