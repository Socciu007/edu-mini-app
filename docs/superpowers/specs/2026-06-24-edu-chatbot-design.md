# Edu Mini App — Educational Chatbot Design

**Date:** 2026-06-24
**Status:** Approved (pending user review of this written spec)
**Project:** `edu-mini-app` (Zalo Mini App / ZaUI template)

## 1. Purpose

Replace the ZaUI restaurant-ordering template with a mini app chatbot that generates educational questions across four subjects (Toán, Lý, Hóa, Anh) and runs as a conversational Q&A experience. The app works offline with a local question bank and falls back to a configurable AI provider for explanations, hints, open-ended evaluation, and free-form chat.

## 2. Scope

### In scope

- Cleanup of all restaurant/merchant/orders/products template code
- New chatbot with 4 subjects, bilingual UI (VI/EN), KaTeX math rendering
- Local question bank (JSON, ~10 questions per subject, 40 total seed)
- AI provider adapter, env-configurable (OpenAI-compatible endpoint by default)
- Intent detection → provider routing (hybrid: local-first, AI for advanced)
- localStorage persistence of conversation + settings
- Three routes: `/` (home), `/chat`, `/settings`
- Unit + integration tests for the routing logic and provider layer

### Out of scope (v1)

- No user accounts, no server-side persistence
- No voice input/output
- No image-based questions (chemistry diagrams, etc.)
- No languages beyond VI/EN
- No analytics, leaderboard, or sharing
- No deployment config changes beyond what the template provides
- No E2E / UI tests

## 3. High-Level Architecture

Three layers plus a storage layer:

```
┌─────────────────────────────────────────────────────────────┐
│  UI LAYER  (pages, components, i18n)                         │
└──────────────┬───────────────────────────────────────────────┘
               │ uses
┌──────────────▼───────────────────────────────────────────────┐
│  CHAT SERVICE LAYER                                          │
│   - Intent detection (no AI)                                 │
│   - Provider router (hybrid)                                 │
│   - Message orchestration                                    │
└──────────────┬───────────────────────────────────────────────┘
               │ uses
┌──────────────▼───────────────────────────────────────────────┐
│  PROVIDER LAYER                                              │
│   - QuestionProvider interface                               │
│   - LocalBankProvider  (src/data/questions/*.json)           │
│   - AIProvider         (generic fetch → env URL)             │
└──────────────┬───────────────────────────────────────────────┘
               │ persists via
┌──────────────▼───────────────────────────────────────────────┐
│  STORAGE LAYER  (Zustand + localStorage)                     │
└─────────────────────────────────────────────────────────────┘
```

## 4. Final Project Structure

```
edu-mini-app/
├── src/
│   ├── app.tsx                    # Routes: /, /chat, /settings
│   ├── main.ts
│   ├── polyfills.ts
│   ├── shared.d.ts
│   ├── components/
│   │   ├── chat/                  # NEW
│   │   │   ├── message-bubble.tsx
│   │   │   ├── chat-input.tsx
│   │   │   ├── chat-header.tsx
│   │   │   ├── subject-chips.tsx
│   │   │   └── empty-state.tsx
│   │   ├── katex-renderer.tsx     # NEW
│   │   ├── language-toggle.tsx    # NEW
│   │   └── ... (keep useful generic ones: badge, chip, page-container, portal, root-provider, scroll-area)
│   ├── constants/                 # Keep, add: subjects.ts, update routes.ts
│   ├── css/app.scss
│   ├── hooks/                     # Keep: use-toggle, use-controlled-value
│   ├── i18n/                      # NEW
│   │   ├── vi.json
│   │   ├── en.json
│   │   └── use-translation.ts
│   ├── providers/                 # NEW
│   │   ├── types.ts
│   │   ├── local-bank.ts
│   │   ├── ai.ts
│   │   └── index.ts
│   ├── services/                  # NEW
│   │   └── chat/
│   │       ├── intents.ts
│   │       ├── router.ts
│   │       └── index.ts
│   ├── stores/                    # NEW
│   │   ├── chat-store.ts
│   │   └── settings-store.ts
│   ├── data/                      # NEW
│   │   └── questions/
│   │       ├── math.json
│   │       ├── physics.json
│   │       ├── chemistry.json
│   │       └── english.json
│   ├── utils/                     # Keep: clsx, format, storage
│   └── pages/
│       ├── home.tsx               # NEW
│       ├── chat.tsx               # NEW
│       └── settings.tsx           # NEW
├── docs/
│   ├── superpowers/
│   │   └── specs/                 # this file lives here
│   ├── preview.webp               # DELETE
│   └── qr.webp                    # DELETE
├── .env.development               # add VITE_AI_*
├── .env.production
├── app-config.json                # update title
├── index.html
├── package.json                   # add: katex, react-katex
├── README.md                      # rewrite
├── tailwind.config.js
├── tsconfig.json
└── vite.config.mts
```

### Cleanup — files / dirs to delete

| Path | Reason |
|------|--------|
| `src/modules/merchants/` | restaurant-specific |
| `src/modules/oa/` | Zalo OA follow dialog |
| `src/modules/orders/` | cart + order history |
| `src/modules/products/` | menu products |
| `src/pages/menu.tsx` | replaced by `/chat` |
| `src/pages/orders.tsx` | not needed |
| `src/pages/orders.view.tsx` | not needed |
| `src/pages/info.tsx` | replaced by `/` (home) + `/settings` |
| `src/mock/*` (all json) | replaced by `src/data/questions/` |
| `src/components/icons/*` (most) | only keep icons actually used in new UI |
| `src/hooks/use-animate.ts` | used by old merchant header only |
| `src/utils/request.ts` (old API endpoints) | replaced by new AI client |
| `docs/preview.webp`, `docs/qr.webp` | old template screenshots |
| `README.md` (rewrite, don't just edit) | describes old template |
| `zmp-cli.json` (`template` field) | update or leave — not strictly required |

## 5. Data Model

`src/providers/types.ts`:

```ts
export type SubjectId = 'math' | 'physics' | 'chemistry' | 'english';

export interface Subject {
  id: SubjectId;
  name: { vi: string; en: string };
  emoji: string;
  color: string;        // tailwind color name
}

export interface Question {
  id: string;
  subject: SubjectId;
  prompt: { vi: string; en: string };      // markdown + $...$ math
  choices?: string[];                      // optional MCQ
  answer: string;                          // canonical answer
  explanation?: { vi: string; en: string };
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;                         // markdown + $...$
  subject?: SubjectId;
  questionRef?: string;                    // id of a Question, if applicable
  feedback?: 'correct' | 'incorrect' | null;
  createdAt: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Intent =
  | { kind: 'request_question'; subject?: SubjectId; difficulty?: Difficulty }
  | { kind: 'submit_answer'; text: string; questionId?: string }
  | { kind: 'request_explanation'; questionId?: string }
  | { kind: 'request_hint'; questionId?: string }
  | { kind: 'chitchat' };

export interface QuestionProvider {
  readonly name: 'local' | 'ai';
  getQuestion(ctx: { subject: SubjectId; difficulty?: Difficulty; excludeIds?: string[] }): Promise<Question>;
  explain?(q: Question, userText?: string): Promise<string>;
  evaluateAnswer?(q: Question, userAnswer: string): Promise<{ correct: boolean; feedback: string }>;
  chat?(userText: string, history: ChatMessage[]): Promise<string>;
}
```

## 6. Provider Layer

### Local bank provider (`src/providers/local-bank.ts`)

- Eagerly imports all `src/data/questions/*.json` at build time (Vite handles).
- `getQuestion` uses a per-session shuffled index — non-repeating within a session, random across sessions. Honors `excludeIds`.
- `explain` / `evaluateAnswer` / `chat` are NOT implemented — return `undefined`. The chat service falls back to AI for those.

### AI provider (`src/providers/ai.ts`)

- Generic, env-driven. Reads:
  - `VITE_AI_API_URL` — full chat-completions-style endpoint (OpenAI-compatible)
  - `VITE_AI_API_KEY` — bearer token
  - `VITE_AI_MODEL` — model name (default `gpt-4o-mini`)
- Sends a system prompt that:
  - Forces responses in the user's active language (VI/EN)
  - Constrains output to a JSON schema per intent (Question shape, or `{correct, feedback}`)
  - Permits `$...$` LaTeX inside `prompt` / `explanation`
- Failure handling:
  - Network error → throws; service catches and surfaces a friendly toast
  - Non-JSON → tries to extract the first JSON block; otherwise wraps the raw text in a "fallback" bot message
  - 4xx/rate limit → surfaces a localized error string

### Provider factory (`src/providers/index.ts`)

```ts
export function getProvider(name?: 'local' | 'ai'): QuestionProvider {
  if (name === 'local' || !hasAiConfig()) return new LocalBankProvider(allQuestions);
  if (name === 'ai') return new AIProvider();
  return new LocalBankProvider(allQuestions);
}

export function hasAiConfig(): boolean {
  return Boolean(import.meta.env.VITE_AI_API_KEY);
}
```

The hybrid composition (local-first with AI fallback) lives in the **chat service**, not in a single provider.

## 7. Chat Service

### Intent detection (`src/services/chat/intents.ts`)

Regex-based, no AI call. Key patterns:

- "Cho tôi câu hỏi / Give me a question" → `request_question`
- "Thêm / Another / Next" → `request_question` for current subject
- "Giải thích / Explain / Why / Tại sao" → `request_explanation` for last question
- "Gợi ý / Hint" → `request_hint` for last question
- Short reply (length < 200) when a question is active → `submit_answer`
- `^[a-d]$` reply when current question has choices → `submit_answer` (MCQ letter)
- Otherwise → `chitchat`

### Router (`src/services/chat/router.ts`)

`routeMessage(userText, ctx)` returns the bot messages to append.

| Intent | Primary | Fallback |
|--------|---------|----------|
| `request_question` | local bank | AI |
| `submit_answer` (MCQ) | local check | — |
| `submit_answer` (open) | AI `evaluateAnswer` | — |
| `request_explanation` | AI | local `explanation` if present |
| `request_hint` | AI | local `explanation` truncated |
| `chitchat` | AI `chat` | canned "I can only help with subjects" string |

If `VITE_AI_API_KEY` is missing, all AI paths surface a localized "AI chưa được cấu hình. Dùng ngân hàng câu hỏi cục bộ." message; local bank still works fully.

## 8. State Management (Zustand)

### `chat-store.ts`

```ts
interface ChatState {
  messages: ChatMessage[];
  activeSubject?: SubjectId;
  recentQuestionIds: string[];
  stats: { asked: number; correct: number };

  sendUserMessage(text: string): Promise<void>;
  reset(): void;
}
```

`sendUserMessage`:
1. Append user message
2. `await routeMessage(...)`
3. Append returned bot messages
4. Update `recentQuestionIds`, `stats`
5. Persist to localStorage (debounced 300ms)

### `settings-store.ts`

```ts
interface SettingsState {
  language: 'vi' | 'en';
  preferredProvider: 'auto' | 'local' | 'ai';
  setLanguage(lang: 'vi' | 'en'): void;
  setProvider(p: 'auto' | 'local' | 'ai'): void;
}
```

Both stores use Zustand's `persist` middleware (keys `edu-chat-v1`, `edu-settings-v1`).

## 9. localStorage Schema (versioned)

```jsonc
// edu-chat-v1
{
  "version": 1,
  "state": {
    "messages": [...],
    "activeSubject": "math",
    "recentQuestionIds": ["math-001"],
    "stats": { "asked": 5, "correct": 3 }
  }
}

// edu-settings-v1
{
  "version": 1,
  "state": {
    "language": "vi",
    "preferredProvider": "auto"
  }
}
```

## 10. UI

### Routes

| Path | Page | Purpose |
|------|------|---------|
| `/` | `home.tsx` | Welcome — 4 subject chips, "Bắt đầu / Get started", language toggle, brief description |
| `/chat` | `chat.tsx` | Main chat — header, message list, sticky input |
| `/settings` | `settings.tsx` | Language, provider preference, "Reset conversation", "About" |

All wrapped in existing `PageContainer` + `ZMPRouter` + `AnimationRoutes`.

### Components

- `MessageBubble.tsx` — renders markdown + KaTeX, distinguishes user vs bot styling
- `ChatInput.tsx` — text field + send. Enter to send, Shift+Enter newline. Disabled during in-flight request.
- `ChatHeader.tsx` — back, active subject chip, overflow menu (Settings, New session)
- `SubjectChips.tsx` — horizontal scrollable subject chips
- `EmptyState.tsx` — starter prompts
- `KatexRenderer.tsx` — splits string on `$...$`/`$$...$$`, renders math + text, sanitizes input
- `LanguageToggle.tsx` — two-state pill VI | EN, reads/writes settings-store

## 11. i18n

Tiny custom i18n — no `react-i18next`.

- `src/i18n/vi.json`, `src/i18n/en.json` — flat key/value, namespaced by section (`home.*`, `chat.*`, `subjects.*`, `errors.*`, `settings.*`).
- `src/i18n/use-translation.ts` — `useT()` returns `t(key)`. Resolves via `settings-store.language`. Falls back to the other language, then returns the key itself (so missing translations are obvious in dev).

All user-visible strings in new code MUST go through `t()`.

## 12. Configuration

### `.env.development` and `.env.production`

```
VITE_AI_API_URL=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=
VITE_AI_MODEL=gpt-4o-mini
```

### In-app Settings

Read-only display of:
- Active provider badge ("AI" if key set, "Chỉ dùng ngân hàng cục bộ" otherwise)
- Configured model + endpoint (no in-app editing — done via env at build time)

## 13. Error Handling

| Failure | UX |
|---------|----|
| AI network / 5xx | Bot message: "Không kết nối được AI. Thử lại sau." + retry button on failed message |
| AI malformed JSON | Wrapped as "fallback" bot message; console warning |
| AI key missing | "AI chưa được cấu hình. Dùng ngân hàng câu hỏi cục bộ." non-blocking notice in chat header |
| KaTeX parse error | Renders raw text, console warning |
| localStorage quota | Catch + toast, continue in-memory only |
| localStorage corrupt / version mismatch | Wipe and start fresh; console log |

## 14. Observability

No external analytics. `console.debug` for: provider chosen per intent, AI request/response timing, fallback events. Gated on `import.meta.env.DEV` for easy removal in prod.

## 15. Testing Scope

### Unit (high value)

- `detectIntent` — table-driven test for all intent kinds + edge cases
- `LocalBankProvider.getQuestion` — non-repetition, subject filtering, exclude list
- MCQ answer evaluation

### Integration

- `routeMessage('submit_answer', mcqContext)` → correct/incorrect bot message
- `routeMessage('request_question', noLocalMatch)` → AI fallback (mocked fetch)

### Not in scope

- E2E / UI tests

## 16. Dependencies

### New

- `katex` (math rendering core)
- `react-katex` (React bindings) — or direct `katex` if `react-katex` is unmaintained

### Removed (via `package.json` cleanup)

- `@xuannghia/html2canvas` (used by old share feature)
- `react-qrcode-logo` (used by old merchant page)
- `swiper` (used by old menu carousel)
- `@react-spring/web`, `@use-gesture/react` (used by old cart animation)
- `@radix-ui/react-scroll-area` (used by old merchant layout)

## 17. Risks & Open Questions

- **AI vendor lock-in:** mitigated by adapter pattern + OpenAI-compatible default; switching to Anthropic/Google is a 50-line change in `ai.ts`.
- **Vietnamese quality of seed questions:** need real exam-style samples. 40 questions is a starting point; growth path is editing the JSON files.
- **KaTeX in `react-katex` maintenance:** if the wrapper is stale, drop it and call `katex.renderToString` directly. ~30 lines.
- **localStorage size:** chat history could grow unbounded. Add a soft cap (e.g. last 200 messages) in v1.1 if needed.
- **Quiz mode / progress tracking:** explicitly out of v1. `stats` field is in place to grow into it.
