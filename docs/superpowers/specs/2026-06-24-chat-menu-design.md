# Chat Menu Popover — Design

**Date:** 2026-06-24
**Status:** Approved (pending user review of this written spec)
**Project:** `edu-mini-app` (Zalo Mini App)

## 1. Purpose

Add a "menu" icon on the right side of the chat page's `PageHeader`. Clicking the icon opens a dropdown popover with 5 items: 3 actions (New chat, Search chats, Refresh conversation) and 2 sections (Pinned sessions, Conversations) showing the current session.

## 2. Scope

### In scope

- New `ChatMenu` component with dropdown behavior
- New `menu.svg` icon (hamburger / 3 lines)
- New i18n keys in both `vi.json` and `en.json`
- Click-outside-to-close behavior
- Show current session in the "Conversations" section
- "Pinned" section shows empty state (no pinned sessions yet)
- Connect "New chat" and "Refresh" actions to existing `chat-store.reset()`

### Out of scope (v1)

- Real "Search chats" functionality (placeholder no-op for v1)
- Multi-session model (creating, switching, persisting sessions)
- Server-side chat history
- Pinned sessions (UI shown but empty)
- Mobile-specific gestures (swipe to close)
- Animations (fade, scale) on dropdown
- Filter / search within the dropdown

## 3. Component Architecture

### New file: `src/components/chat/chat-menu.tsx`

Self-contained component that handles:
- Open/close state via `useState`
- Click-outside detection via document `mousedown` listener
- Reading messages from `useChatStore`
- Calling `reset()` for "New chat" and "Refresh" actions
- Inline `MenuItem`, `Divider`, `SectionLabel` helper components

### Structure

```tsx
<ChatMenu>  // positioned in the right slot of PageHeader
  <button> {/* trigger: menu icon */} </button>
  {open && (
    <div className="dropdown">  {/* absolute right-0, top-full */}
      <Section title="actions">
        <MenuItem>New chat</MenuItem>
        <MenuItem>Search chats</MenuItem>
        <MenuItem onClick={reset}>Refresh</MenuItem>
      </Section>
      <Divider />
      <SectionLabel>Pinned</SectionLabel>
      <EmptyState>No items yet</EmptyState>
      <Divider />
      <SectionLabel>Conversations</SectionLabel>
      <SessionItem>Current session (truncated)</SessionItem>
    </div>
  )}
</ChatMenu>
```

## 4. API: `ChatMenu` Component

```tsx
export function ChatMenu(): JSX.Element;
```

No props. Self-contained.

## 5. New Icon: `menu.svg`

24×24, simple hamburger / 3 lines icon, using `currentColor`:

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 6H20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
  <path d="M4 12H20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
  <path d="M4 18H20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
</svg>
```

## 6. i18n Additions

Add to both `vi.json` and `en.json` under the `chat` object:

```jsonc
"menu": "Menu",                       // en: "Menu"
"menuNew": "Đoạn hội thoại mới",      // en: "New chat"
"menuSearch": "Tìm kiếm chat",       // en: "Search chats"
"menuRefresh": "Làm mới hội thoại",   // en: "Refresh conversation"
"menuPinned": "Đã ghim",               // en: "Pinned"
"menuConversations": "Hội thoại",     // en: "Conversations"
"menuEmpty": "Chưa có mục nào",        // en: "No items yet"
"menuCurrentSession": "Phiên hiện tại" // en: "Current session"
```

## 7. Behavior Details

| Action | Behavior |
|--------|----------|
| Click trigger | Open dropdown |
| Click outside dropdown | Close dropdown |
| Click "Đoạn hội thoại mới" | Call `reset()`, close dropdown |
| Click "Tìm kiếm chat" | Close dropdown (no-op for v1) |
| Click "Làm mới hội thoại" | Call `reset()`, close dropdown |
| Click "Pinned" item | None (empty state shown) |
| Click "Conversations" item | Close dropdown (placeholder) |

## 8. "Current Session" Display

The Conversations section shows a single item representing the current session. The label is:
- If `messages` has at least one user message: first 40 characters of the first user message, with `…` if truncated
- Otherwise: `t('chat.menuCurrentSession')` ("Phiên hiện tại" / "Current session")

The text is truncated with `truncate` CSS class.

## 9. PageHeader Change

`src/components/page-header.tsx`: no changes needed. The right slot is already `w-16 text-right`, which is plenty of room for the `w-9` (36px) menu button.

## 10. ChatPage Change

In `src/pages/chat.tsx`, update the `<PageHeader>` element to include `<ChatMenu />` in the right slot:

```tsx
<PageHeader
  title={t('tabs.chat')}
  onBack={() => nav('/')}
  right={<ChatMenu />}
/>
```

## 11. File Changes

**New files:**
- `src/components/chat/chat-menu.tsx`
- `src/components/chat/chat-menu.test.tsx`
- `src/static/icons/menu.svg`

**Modified files:**
- `src/pages/chat.tsx` (add ChatMenu to right slot)
- `src/i18n/vi.json` (add 8 keys)
- `src/i18n/en.json` (add 8 keys)

## 12. Tests

Create `src/components/chat/chat-menu.test.tsx` with these tests:

- Renders the menu trigger button
- Clicking trigger opens the dropdown
- Dropdown shows 3 action items: New chat, Search chats, Refresh
- Dropdown shows 2 section labels: Pinned, Conversations
- Click outside the dropdown closes it
- Click "New chat" calls `reset()` and closes the dropdown
- Click "Search chats" closes the dropdown (no-op)
- Click "Refresh" calls `reset()` and closes the dropdown
- When messages are empty, the Conversations item shows "Phiên hiện tại"
- When messages exist, the Conversations item shows first 40 chars of first user message

## 13. Error Handling

| Failure | UX |
|---------|----|
| `localStorage` read fails (chat store already handles) | Falls back to default state |
| `reset()` throws (shouldn't, but) | Dropdown still closes |
| `messages` is undefined | Show fallback "Phiên hiện tại" label |

## 14. Risks

- **Click-outside on mobile**: `mousedown` works for desktop. On mobile, `touchstart` is the equivalent. v1 only handles `mousedown`; users on touch devices can tap outside to close (this should still work because the document listener fires on `touchstart` too in most browsers, OR we can use `pointerdown` as a unified event in v1.1).
- **No keyboard escape**: Pressing Escape doesn't close the dropdown. Acceptable for v1; can add `Escape` handler later.
- **First-render flash**: The dropdown's `open` state defaults to `false`, so no flash on first render.

## 15. Out of Scope (v1)

- Multi-session model (creating, switching, persisting sessions)
- Server-side chat history
- Pinned sessions (UI shown but empty)
- Real "Search chats" search functionality
- Mobile-specific gestures
- Animations on dropdown
- Filter / search within the dropdown
- Keyboard navigation (arrow keys, Escape)
- ARIA roles for the menu (`role="menu"`, `role="menuitem"`)
