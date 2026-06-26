# User Page Redesign — Design

**Date:** 2026-06-24
**Status:** Approved (pending user review of this written spec)
**Project:** `edu-mini-app` (Zalo Mini App)

## 1. Purpose

Redesign the User page (`src/pages/user.tsx`) to follow the layout pattern from the provided sample: a gradient header at the top, 3 quick action icons in a row, a promotional banner, and two grid sections (4 + 8) for navigation. The current User page (form-style with Language/Theme/AI/Provider/Reset sections) is replaced with a more visual, app-grid layout.

## 2. Scope

### In scope

- Full rewrite of `src/pages/user.tsx` with the new layout
- 13 new SVG icon files in `src/static/icons/`
- New i18n keys in both `vi.json` and `en.json`
- Updated tests in `src/pages/user.test.tsx`
- Use theme tokens (`accent`, `primary`) for the gradient instead of Tailwind default teal/cyan
- The existing old sections (Language, Theme, AI Status, Provider, Reset) are removed — their functionality is replaced by the 8-icon grid

### Out of scope (v1)

- Real authentication (login button is a placeholder)
- Real avatar image (placeholder circle is fine)
- Real contact info (`1900-xxxx` is a placeholder)
- Function tile click handlers (they're buttons but do nothing yet — just labels)
- Real favorites feature
- Real "Môn học" content / "Bài tập" content / etc. — just labeled placeholders for now
- Per-screen empty state for the user page

## 3. Page Layout

```
┌─────────────────────────────┐
│ Gradient header (accent →    │ ← Avatar, title, subtitle, login btn
│ primary, full-width)         │
├─────────────────────────────┤
│ 3 quick action icons (row)   │ ← Khảo sát / Yêu thích / Review
│ (overlapping the header)    │
├─────────────────────────────┤
│ AI Tutor banner card         │ ← Icon + text + "Dùng ngay" CTA
├─────────────────────────────┤
│ "Chức năng thường dùng"      │ ← 4-icon grid (Môn / Bài tập / Bài giảng / Thi thử)
├─────────────────────────────┤
│ "Chức năng khác"            │ ← 8-icon grid (2 rows × 4)
├─────────────────────────────┤
│ Footer info                  │ ← Support + copyright
└─────────────────────────────┘
```

## 4. Component Architecture

Extract the repeating patterns into small components:

- `src/components/user/user-avatar.tsx` — circular avatar placeholder (just a styled div for now)
- `src/components/user/quick-action.tsx` — single quick action item (icon + label, wraps `NavLink`)
- `src/components/user/function-tile.tsx` — single function tile (icon + label, button)
- `src/components/user/gradient-header.tsx` — the gradient header at the top (avatar + title + subtitle + login button)
- `src/components/user/info-banner.tsx` — the AI Tutor banner (gradient card with icon + text + CTA)

The page itself composes these.

## 5. Header (gradient)

```tsx
<header
  className="px-6 pt-8 pb-12 text-white"
  style={{ background: 'linear-gradient(to bottom right, var(--color-accent), var(--color-primary))' }}
>
  <div className="flex items-center gap-4 mb-4">
    <div className="w-16 h-16 rounded-full bg-white/30 border-2 border-white" />
    <div>
      <h1 className="text-2xl font-bold">{t('user.loginTitle')}</h1>
      <p className="text-sm text-white/80">{t('user.loginSubtitle')}</p>
    </div>
  </div>
  <button className="w-full bg-white text-primary font-medium py-2 rounded-lg">
    {t('user.loginButton')}
  </button>
</header>
```

The `-mt-6` on the quick actions card overlaps the header to create a layered effect.

## 6. Quick Actions (3 items)

```tsx
<div className="px-4 -mt-6 relative z-10">
  <div className="bg-surface rounded-xl shadow-sm p-4 flex justify-around">
    {QUICK_ACTIONS.map((a) => (
      <NavLink key={a.label} to={a.to} className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center">
          <a.Icon className="w-6 h-6 text-primary" />
        </div>
        <span className="text-xs text-text-secondary">{a.label}</span>
      </NavLink>
    ))}
  </div>
</div>
```

Items:
1. **Khảo sát** → `/survey` (uses existing `SurveyIcon`)
2. **Yêu thích** → `/review` (placeholder route for now) (uses new `StarIcon`)
3. **Review** → `/review` (uses existing `ReviewIcon`)

## 7. AI Tutor Banner

```tsx
<div className="px-4 mt-4">
  <div
    className="rounded-xl p-4 flex items-center gap-3 text-white"
    style={{ background: 'linear-gradient(to right, var(--color-accent), var(--color-primary))' }}
  >
    <BotIcon className="w-10 h-10" />
    <div className="flex-1">
      <h3 className="font-semibold">{t('user.aiBanner.title')}</h3>
      <p className="text-xs text-white/80">{t('user.aiBanner.subtitle')}</p>
    </div>
    <button className="bg-white text-primary font-medium px-3 py-1 rounded-lg text-sm">
      {t('user.aiBanner.cta')}
    </button>
  </div>
</div>
```

## 8. Common Functions (4 items)

```tsx
<section className="px-4 mt-6">
  <h2 className="text-sm font-semibold text-text mb-3">{t('user.commonFunctions')}</h2>
  <div className="bg-surface rounded-xl p-4 grid grid-cols-4 gap-4">
    {COMMON_FUNCTIONS.map((f) => (
      <button key={f.label} className="flex flex-col items-center gap-1">
        <f.Icon className="w-7 h-7 text-text" />
        <span className="text-xs text-text-secondary">{f.label}</span>
      </button>
    ))}
  </div>
</section>
```

Items:
1. **Môn học** (BookIcon)
2. **Bài tập** (PencilIcon)
3. **Bài giảng** (LectureIcon)
4. **Thi thử** (TestIcon)

## 9. Other Functions (8 items, 2 rows of 4)

```tsx
<section className="px-4 mt-6">
  <h2 className="text-sm font-semibold text-text mb-3">{t('user.otherFunctions')}</h2>
  <div className="bg-surface rounded-xl p-4 grid grid-cols-4 gap-4">
    {OTHER_FUNCTIONS.map((f) => (
      <button key={f.label} className="flex flex-col items-center gap-1">
        <f.Icon className="w-7 h-7 text-text" />
        <span className="text-xs text-text-secondary">{f.label}</span>
      </button>
    ))}
  </div>
</section>
```

Items (replaces old Language/Theme/AI/Provider/Reset sections):
1. **Cài đặt** (SettingsIcon)
2. **Ngôn ngữ** (GlobeIcon)
3. **Theme** (ThemeIcon — half moon)
4. **Reset** (RefreshIcon)
5. **AI** (BotIcon)
6. **Bảo mật** (LockIcon)
7. **Hỗ trợ** (HelpIcon)
8. **Đánh giá** (RateIcon)

## 10. Footer

```tsx
<footer className="px-4 mt-6 pb-8 text-xs text-text-subtle text-center space-y-1">
  <p>{t('user.footer.support')}</p>
  <p>{t('user.footer.copyright')}</p>
</footer>
```

## 11. New SVG Icons (13 files)

All in `src/static/icons/`, all 24×24, using `currentColor`. Style: simple line/outline icons (Lucide-style) for consistency with the existing icon system.

| File | Shape |
|------|-------|
| `star.svg` | 5-point star outline |
| `book.svg` | Open book outline |
| `pencil.svg` | Pencil outline |
| `lecture.svg` | Person at board outline |
| `test.svg` | Clipboard with check |
| `settings.svg` | Gear/cog |
| `globe.svg` | Globe with meridians |
| `theme.svg` | Half moon (light/dark) |
| `refresh.svg` | Circular arrow |
| `bot.svg` | Robot/chatbot face |
| `lock.svg` | Padlock |
| `help.svg` | Question mark in circle |
| `rate.svg` | Star with rays/lines |

## 12. i18n Additions

Add to both `vi.json` and `en.json` inside the `user` object:

```jsonc
"user": {
  // existing keys preserved (header title, language, theme, etc.)
  "loginTitle": "Đăng nhập / Đăng ký",   // en: "Sign in / Sign up"
  "loginSubtitle": "Xem thêm thông tin",  // en: "View more info"
  "loginButton": "Đăng nhập ngay",          // en: "Sign in now"
  "favorite": "Yêu thích",                  // en: "Favorites"
  "aiBanner": {
    "title": "Trợ lý AI 24/7",            // en: "AI Tutor 24/7"
    "subtitle": "Hỏi đáp bất kỳ lúc nào", // en: "Ask anything, anytime"
    "cta": "Dùng ngay"                    // en: "Try now"
  },
  "commonFunctions": "Chức năng thường dùng",   // en: "Common functions"
  "subjects": "Môn học",                          // en: "Subjects"
  "exercises": "Bài tập",                          // en: "Exercises"
  "lessons": "Bài giảng",                           // en: "Lessons"
  "exams": "Thi thử",                              // en: "Practice tests"
  "otherFunctions": "Chức năng khác",              // en: "Other functions"
  "settings": "Cài đặt",                           // en: "Settings"
  "language": "Ngôn ngữ",                          // en: "Language"
  "reset": "Reset",                                 // en: "Reset"
  "ai": "AI",                                        // en: "AI"
  "security": "Bảo mật",                           // en: "Security"
  "support": "Hỗ trợ",                             // en: "Support"
  "rate": "Đánh giá",                              // en: "Rate"
  "footer": {
    "support": "Hỗ trợ: 1900-xxxx | 8:00 - 22:00",  // en: "Support: 1900-xxxx | 8:00 - 22:00"
    "copyright": "© 2024 Edu Mini App"               // en: "© 2024 Edu Mini App"
  }
}
```

The existing `user.title`, `user.language`, `user.theme`, `user.aiStatus`, `user.provider`, `user.reset`, `user.theme*` keys can be removed since their functionality is now in the new grid.

## 13. File Changes

**New files:**
- `src/components/user/user-avatar.tsx`
- `src/components/user/quick-action.tsx`
- `src/components/user/function-tile.tsx`
- `src/components/user/gradient-header.tsx`
- `src/components/user/info-banner.tsx`
- 13 SVG files in `src/static/icons/`

**Modified files:**
- `src/pages/user.tsx` (full rewrite)
- `src/i18n/vi.json` + `src/i18n/en.json` (new keys, remove some old keys)
- `src/pages/user.test.tsx` (updated tests)

## 14. Tests

Updated tests in `src/pages/user.test.tsx`:

- Header section: title, subtitle, login button rendered
- 3 quick action links rendered (each links to the right route)
- AI Tutor banner rendered (title, subtitle, CTA)
- "Chức năng thường dùng" section: 4 function tiles
- "Chức năng khác" section: 8 function tiles
- Footer: support info + copyright
- Each tile has accessible label
- Clicking a quick action navigates to the right route

## 15. Error Handling

| Failure | UX |
|---------|----|
| Navigation fails (rare) | Standard React Router behavior — no extra handling needed |
| SVG icon missing | Build error at compile time |

## 16. Risks

- **13 new SVG files**: Large upfront cost. Mitigated by using simple Lucide-style paths.
- **Long page**: New User page is significantly longer than the old one. Need to ensure `pb-16` is set so the tab bar doesn't cover the footer.
- **Removed functionality**: The old Language/Theme/AI Status/Provider/Reset sections are gone. Their functionality is replaced by the 8-icon grid (Settings, Language, Theme, Reset, AI, Security, Support, Rate). Users who accessed these via the old sections will need to find them in the new grid.
- **Login is a placeholder**: The login button does nothing. Real auth is out of scope.
- **Function tiles are placeholders**: Clicking them does nothing. Future iteration can add handlers.

## 17. Out of Scope (v1)

- Real authentication flow
- Real avatar image (placeholder circle only)
- Real contact info (placeholder `1900-xxxx`)
- Function tile click handlers (labels only)
- Real favorites / Môn học / Bài tập / etc. content
- Per-screen empty state
- Per-screen loading state
- Real AI Tutor integration in the banner
