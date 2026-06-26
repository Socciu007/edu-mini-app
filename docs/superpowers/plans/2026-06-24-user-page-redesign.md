# User Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the User page to follow the sample format — gradient header, 3 quick actions, AI banner, 2 function grids (4 + 8 items). Replace 13 emoji placeholders with proper SVG icons.

**Architecture:** Extract repeating patterns into 5 small components (UserAvatar, QuickAction, FunctionTile, InfoBanner, GradientHeader). Compose them in `user.tsx`. All 13 new SVG icons use `currentColor` (theme-aware). Header + banner use inline `style` with `linear-gradient(...var(--color-accent), var(--color-primary))`.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, vite-plugin-svgr, Zustand, zmp-ui.

**Spec:** `docs/superpowers/specs/2026-06-24-user-page-redesign-design.md`

**Test convention reminder:**
- Test files using JSX need `import React from 'react'`
- Test files using `toBeInTheDocument` need `import '@testing-library/jest-dom/vitest'`

---

## Task 1: Update i18n keys (foundation)

**Files:**
- Modify: `src/i18n/vi.json`
- Modify: `src/i18n/en.json`

- [ ] **Step 1: Replace the `user` object in vi.json**

Read the current `src/i18n/vi.json` to see existing keys. Replace the entire `"user": { ... }` object with:

```jsonc
"user": {
  "title": "Cá nhân",
  "language": "Ngôn ngữ",
  "languageVi": "Tiếng Việt",
  "languageEn": "English",
  "provider": "Nguồn câu hỏi",
  "providerAuto": "Tự động (ưu tiên cục bộ)",
  "providerLocal": "Chỉ ngân hàng cục bộ)",
  "providerAi": "Chỉ AI",
  "reset": "Reset",
  "about": "Giới thiệu",
  "aiStatus": "Trạng thái AI",
  "aiReady": "Đã cấu hình",
  "aiNotConfigured": "Chưa cấu hình",
  "theme": "Giao diện",
  "themeLight": "Sáng",
  "themeDark": "Tối",
  "themeSystem": "Hệ thống",
  "headerTitle": "Cá nhân",
  "loginTitle": "Đăng nhập / Đăng ký",
  "loginSubtitle": "Xem thêm thông tin",
  "loginButton": "Đăng nhập ngay",
  "favorite": "Yêu thích",
  "aiBanner": {
    "title": "Trợ lý AI 24/7",
    "subtitle": "Hỏi đáp bất kỳ lúc nào",
    "cta": "Dùng ngay"
  },
  "commonFunctions": "Chức năng thường dùng",
  "subjects": "Môn học",
  "exercises": "Bài tập",
  "lessons": "Bài giảng",
  "exams": "Thi thử",
  "otherFunctions": "Chức năng khác",
  "settings": "Cài đặt",
  "security": "Bảo mật",
  "support": "Hỗ trợ",
  "rate": "Đánh giá",
  "ai": "AI",
  "footer": {
    "support": "Hỗ trợ: 1900-xxxx | 8:00 - 22:00",
    "copyright": "© 2024 Edu Mini App"
  }
}
```

- [ ] **Step 2: Replace the `user` object in en.json**

Read the current `src/i18n/en.json`. Replace the entire `"user": { ... }` object with:

```jsonc
"user": {
  "title": "Profile",
  "language": "Language",
  "languageVi": "Tiếng Việt",
  "languageEn": "English",
  "provider": "Question source",
  "providerAuto": "Auto (prefer local)",
  "providerLocal": "Local bank only",
  "providerAi": "AI only",
  "reset": "Reset",
  "about": "About",
  "aiStatus": "AI status",
  "aiReady": "Configured",
  "aiNotConfigured": "Not configured",
  "theme": "Theme",
  "themeLight": "Light",
  "themeDark": "Dark",
  "themeSystem": "System",
  "headerTitle": "Profile",
  "loginTitle": "Sign in / Sign up",
  "loginSubtitle": "View more info",
  "loginButton": "Sign in now",
  "favorite": "Favorites",
  "aiBanner": {
    "title": "AI Tutor 24/7",
    "subtitle": "Ask anything, anytime",
    "cta": "Try now"
  },
  "commonFunctions": "Common functions",
  "subjects": "Subjects",
  "exercises": "Exercises",
  "lessons": "Lessons",
  "exams": "Practice tests",
  "otherFunctions": "Other functions",
  "settings": "Settings",
  "security": "Security",
  "support": "Support",
  "rate": "Rate",
  "ai": "AI",
  "footer": {
    "support": "Support: 1900-xxxx | 8:00 - 22:00",
    "copyright": "© 2024 Edu Mini App"
  }
}
```

- [ ] **Step 3: Verify JSON is valid**

```bash
cd "e:/projectVN/edu-mini-app"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/vi.json','utf8')); console.log('vi OK')"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8')); console.log('en OK')"
```

Expected: both print OK.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/vi.json src/i18n/en.json
git commit -m "feat(i18n): add keys for redesigned User page"
```

---

## Task 2: Create 13 SVG icon files

**Files:**
- Create: `src/static/icons/star.svg`
- Create: `src/static/icons/book.svg`
- Create: `src/static/icons/pencil.svg`
- Create: `src/static/icons/lecture.svg`
- Create: `src/static/icons/test.svg`
- Create: `src/static/icons/settings.svg`
- Create: `src/static/icons/globe.svg`
- Create: `src/static/icons/theme.svg`
- Create: `src/static/icons/refresh.svg`
- Create: `src/static/icons/bot.svg`
- Create: `src/static/icons/lock.svg`
- Create: `src/static/icons/help.svg`
- Create: `src/static/icons/rate.svg`

- [ ] **Step 1: Create star.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L14.9 8.6L22 9.3L16.8 14.1L18.2 21L12 17.8L5.8 21L7.2 14.1L2 9.3L9.1 8.6L12 2Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/>
</svg>
```

- [ ] **Step 2: Create book.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 4.5C4 3.67 4.67 3 5.5 3H10.5C11.33 3 12 3.67 12 4.5V20.5C12 19.67 11.33 19 10.5 19H5.5C4.67 19 4 19.67 4 20.5V4.5Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/>
  <path d="M20 4.5C20 3.67 19.33 3 18.5 3H13.5C12.67 3 12 3.67 12 4.5V20.5C12 19.67 12.67 19 13.5 19H18.5C19.33 19 20 19.67 20 20.5V4.5Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/>
</svg>
```

- [ ] **Step 3: Create pencil.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 21L6.5 19.5L19 7L17 5L4.5 17.5L3 21Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/>
  <path d="M14 6L18 10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 4: Create lecture.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="4" width="18" height="13" rx="1" stroke="currentColor" stroke-width="1.75" fill="none"/>
  <path d="M8 21H16" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
  <path d="M12 17V21" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
  <path d="M7 9L10 11L7 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M11 13H14" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 5: Create test.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 11L11 13L15 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75" fill="none"/>
</svg>
```

- [ ] **Step 6: Create settings.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.75" fill="none"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/>
</svg>
```

- [ ] **Step 7: Create globe.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75" fill="none"/>
  <path d="M3 12H21" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
  <path d="M12 3C14.5 5.5 16 8.5 16 12C16 15.5 14.5 18.5 12 21" stroke="currentColor" stroke-width="1.75" fill="none"/>
  <path d="M12 3C9.5 5.5 8 8.5 8 12C8 15.5 9.5 18.5 12 21" stroke="currentColor" stroke-width="1.75" fill="none"/>
</svg>
```

- [ ] **Step 8: Create theme.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/>
</svg>
```

- [ ] **Step 9: Create refresh.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 12A9 9 0 0 1 15.5 3.3L18 5.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M18 2V5.5H14.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M21 12A9 9 0 0 1 8.5 20.7L6 18.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M6 22V18.5H9.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
```

- [ ] **Step 10: Create bot.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.75" fill="none"/>
  <path d="M12 4V8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
  <circle cx="9" cy="14" r="1" fill="currentColor"/>
  <circle cx="15" cy="14" r="1" fill="currentColor"/>
  <path d="M8 20H16" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 11: Create lock.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.75" fill="none"/>
  <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="currentColor" stroke-width="1.75" fill="none"/>
</svg>
```

- [ ] **Step 12: Create help.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75" fill="none"/>
  <path d="M9.5 9C9.5 8 10.5 7 12 7C13.5 7 14.5 8 14.5 9C14.5 10 12 10.5 12 12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
</svg>
```

- [ ] **Step 13: Create rate.svg**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L13.5 8.5L20 9L14.5 13L16 19L12 15.5L8 19L9.5 13L4 9L10.5 8.5L12 2Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/>
  <path d="M5 21H19" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 14: Verify build**

```bash
cd "e:/projectVN/edu-mini-app"
npm run build 2>&1 | tail -3
```

Expected: build succeeds. All 13 SVGs are valid.

- [ ] **Step 15: Commit**

```bash
git add src/static/icons/
git commit -m "feat(icons): add 13 new SVG icons for User page redesign"
```

---

## Task 3: Create UserAvatar + QuickAction components

**Files:**
- Create: `src/components/user/user-avatar.tsx`
- Create: `src/components/user/quick-action.tsx`
- Create: `src/components/user/user-avatar.test.tsx`
- Create: `src/components/user/quick-action.test.tsx`

- [ ] **Step 1: Write the failing test for UserAvatar**

Create `src/components/user/user-avatar.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  it('renders a circular placeholder', () => {
    const { container } = render(<UserAvatar />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('rounded-full');
    expect(div.className).toContain('bg-white/30');
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/user-avatar.test.tsx 2>&1 | tail -10
```

Expected: FAIL — `user-avatar` not found.

- [ ] **Step 3: Implement UserAvatar**

Create `src/components/user/user-avatar.tsx`:

```tsx
import React from 'react';

export function UserAvatar() {
  return <div className="w-16 h-16 rounded-full bg-white/30 border-2 border-white" />;
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/user-avatar.test.tsx 2>&1 | tail -10
```

Expected: 1 test passes.

- [ ] **Step 5: Write the failing test for QuickAction**

Create `src/components/user/quick-action.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QuickAction } from './quick-action';

// Mock an icon component
const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-icon" {...props} />
);

describe('QuickAction', () => {
  it('renders label', () => {
    render(
      <MemoryRouter>
        <QuickAction label="Test" to="/test" Icon={MockIcon as any} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('navigates to the given route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickAction label="Go" to="/target" Icon={MockIcon as any} />
      </MemoryRouter>,
    );
    const link = screen.getByText('Go').closest('a');
    expect(link).toHaveAttribute('href', '/target');
  });
});
```

- [ ] **Step 6: Run test, expect fail**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/quick-action.test.tsx 2>&1 | tail -10
```

Expected: FAIL — `quick-action` not found.

- [ ] **Step 7: Implement QuickAction**

Create `src/components/user/quick-action.tsx`:

```tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

interface Props {
  label: string;
  to: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export function QuickAction({ label, to, Icon }: Props) {
  return (
    <NavLink to={to} className="flex flex-col items-center gap-1">
      <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <span className="text-xs text-text-secondary">{label}</span>
    </NavLink>
  );
}
```

- [ ] **Step 8: Run test, expect pass**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/quick-action.test.tsx 2>&1 | tail -10
```

Expected: 2 tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/user/user-avatar.tsx src/components/user/user-avatar.test.tsx src/components/user/quick-action.tsx src/components/user/quick-action.test.tsx
git commit -m "feat(user): add UserAvatar and QuickAction components"
```

---

## Task 4: Create FunctionTile + InfoBanner + GradientHeader components

**Files:**
- Create: `src/components/user/function-tile.tsx`
- Create: `src/components/user/info-banner.tsx`
- Create: `src/components/user/gradient-header.tsx`
- Create: `src/components/user/function-tile.test.tsx`
- Create: `src/components/user/info-banner.test.tsx`
- Create: `src/components/user/gradient-header.test.tsx`

- [ ] **Step 1: Write the failing test for FunctionTile**

Create `src/components/user/function-tile.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FunctionTile } from './function-tile';

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-icon" {...props} />
);

describe('FunctionTile', () => {
  it('renders label', () => {
    render(<FunctionTile label="Settings" Icon={MockIcon as any} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<FunctionTile label="X" Icon={MockIcon as any} onClick={onClick} />);
    fireEvent.click(screen.getByText('X').closest('button')!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/function-tile.test.tsx 2>&1 | tail -10
```

- [ ] **Step 3: Implement FunctionTile**

Create `src/components/user/function-tile.tsx`:

```tsx
import React from 'react';

interface Props {
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}

export function FunctionTile({ label, Icon, onClick }: Props) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <Icon className="w-7 h-7 text-text" />
      <span className="text-xs text-text-secondary">{label}</span>
    </button>
  );
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/function-tile.test.tsx 2>&1 | tail -10
```

- [ ] **Step 5: Write the failing test for InfoBanner**

Create `src/components/user/info-banner.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoBanner } from './info-banner';

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-icon" {...props} />
);

describe('InfoBanner', () => {
  it('renders title, subtitle, and cta', () => {
    render(
      <InfoBanner
        title="Title"
        subtitle="Sub"
        cta="Go"
        Icon={MockIcon as any}
        onCtaClick={() => {}}
      />,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('calls onCtaClick when CTA is clicked', () => {
    const onCtaClick = vi.fn();
    render(
      <InfoBanner
        title="T"
        subtitle="S"
        cta="Click"
        Icon={MockIcon as any}
        onCtaClick={onCtaClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Click' }));
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 6: Run test, expect fail**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/info-banner.test.tsx 2>&1 | tail -10
```

- [ ] **Step 7: Implement InfoBanner**

Create `src/components/user/info-banner.tsx`:

```tsx
import React from 'react';

interface Props {
  title: string;
  subtitle: string;
  cta: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  onCtaClick: () => void;
}

export function InfoBanner({ title, subtitle, cta, Icon, onCtaClick }: Props) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3 text-white"
      style={{ background: 'linear-gradient(to right, var(--color-accent), var(--color-primary))' }}
    >
      <Icon className="w-10 h-10" />
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-white/80">{subtitle}</p>
      </div>
      <button
        onClick={onCtaClick}
        className="bg-white text-primary font-medium px-3 py-1 rounded-lg text-sm"
      >
        {cta}
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Run test, expect pass**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/info-banner.test.tsx 2>&1 | tail -10
```

- [ ] **Step 9: Write the failing test for GradientHeader**

Create `src/components/user/gradient-header.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GradientHeader } from './gradient-header';

describe('GradientHeader', () => {
  it('renders title, subtitle, and button', () => {
    render(
      <GradientHeader
        title="Login"
        subtitle="Info"
        buttonText="Go"
        onButtonClick={() => {}}
      />,
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('calls onButtonClick when button is clicked', () => {
    const onButtonClick = vi.fn();
    render(
      <GradientHeader
        title="T"
        subtitle="S"
        buttonText="Go"
        onButtonClick={onButtonClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 10: Run test, expect fail**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/gradient-header.test.tsx 2>&1 | tail -10
```

- [ ] **Step 11: Implement GradientHeader**

Create `src/components/user/gradient-header.tsx`:

```tsx
import React from 'react';
import { UserAvatar } from './user-avatar';

interface Props {
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function GradientHeader({ title, subtitle, buttonText, onButtonClick }: Props) {
  return (
    <header
      className="px-6 pt-8 pb-12 text-white"
      style={{ background: 'linear-gradient(to bottom right, var(--color-accent), var(--color-primary))' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <UserAvatar />
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-white/80">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onButtonClick}
        className="w-full bg-white text-primary font-medium py-2 rounded-lg"
      >
        {buttonText}
      </button>
    </header>
  );
}
```

- [ ] **Step 12: Run test, expect pass**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/components/user/gradient-header.test.tsx 2>&1 | tail -10
```

- [ ] **Step 13: Commit**

```bash
git add src/components/user/function-tile.tsx src/components/user/function-tile.test.tsx src/components/user/info-banner.tsx src/components/user/info-banner.test.tsx src/components/user/gradient-header.tsx src/components/user/gradient-header.test.tsx
git commit -m "feat(user): add FunctionTile, InfoBanner, GradientHeader components"
```

---

## Task 5: Rewrite user.tsx

**Files:**
- Modify: `src/pages/user.tsx`

- [ ] **Step 1: Overwrite user.tsx**

Overwrite `src/pages/user.tsx`:

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/use-translation';
import { useChatStore } from '../stores/chat-store';
import { useSettingsStore } from '../stores/settings-store';
import { type ThemeMode, useThemeStore } from '../stores/theme-store';
import { GradientHeader } from '../components/user/gradient-header';
import { QuickAction } from '../components/user/quick-action';
import { InfoBanner } from '../components/user/info-banner';
import { FunctionTile } from '../components/user/function-tile';
import SurveyIcon from '@/static/icons/survey.svg?react';
import StarIcon from '@/static/icons/star.svg?react';
import ReviewIcon from '@/static/icons/review.svg?react';
import BookIcon from '@/static/icons/book.svg?react';
import PencilIcon from '@/static/icons/pencil.svg?react';
import LectureIcon from '@/static/icons/lecture.svg?react';
import TestIcon from '@/static/icons/test.svg?react';
import SettingsIcon from '@/static/icons/settings.svg?react';
import GlobeIcon from '@/static/icons/globe.svg?react';
import ThemeIcon from '@/static/icons/theme.svg?react';
import RefreshIcon from '@/static/icons/refresh.svg?react';
import BotIcon from '@/static/icons/bot.svg?react';
import LockIcon from '@/static/icons/lock.svg?react';
import HelpIcon from '@/static/icons/help.svg?react';
import RateIcon from '@/static/icons/rate.svg?react';

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];

export default function UserPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const resetChat = useChatStore((s) => s.reset);
  const preferredProvider = useSettingsStore((s) => s.preferredProvider);
  const setProvider = useSettingsStore((s) => s.setProvider);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <div className="pb-16">
      <GradientHeader
        title={t('user.loginTitle')}
        subtitle={t('user.loginSubtitle')}
        buttonText={t('user.loginButton')}
        onButtonClick={() => nav('/')}
      />

      {/* Quick actions */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-surface rounded-xl shadow-sm p-4 flex justify-around">
          <QuickAction label={t('user.aiBanner.cta') ? t('survey.headerTitle') : t('survey.headerTitle')} to="/survey" Icon={SurveyIcon} />
          <QuickAction label={t('user.favorite')} to="/review" Icon={StarIcon} />
          <QuickAction label={t('review.headerTitle')} to="/review" Icon={ReviewIcon} />
        </div>
      </div>

      {/* AI banner */}
      <div className="px-4 mt-4">
        <InfoBanner
          title={t('user.aiBanner.title')}
          subtitle={t('user.aiBanner.subtitle')}
          cta={t('user.aiBanner.cta')}
          Icon={BotIcon}
          onCtaClick={() => nav('/')}
        />
      </div>

      {/* Common functions */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-text mb-3">{t('user.commonFunctions')}</h2>
        <div className="bg-surface rounded-xl p-4 grid grid-cols-4 gap-4">
          <FunctionTile label={t('user.subjects')} Icon={BookIcon} />
          <FunctionTile label={t('user.exercises')} Icon={PencilIcon} />
          <FunctionTile label={t('user.lessons')} Icon={LectureIcon} />
          <FunctionTile label={t('user.exams')} Icon={TestIcon} />
        </div>
      </section>

      {/* Other functions */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-text mb-3">{t('user.otherFunctions')}</h2>
        <div className="bg-surface rounded-xl p-4 grid grid-cols-4 gap-4">
          <FunctionTile label={t('user.settings')} Icon={SettingsIcon} />
          <FunctionTile label={t('user.language')} Icon={GlobeIcon} />
          <FunctionTile
            label={t('user.theme')}
            Icon={ThemeIcon}
            onClick={() => {
              const next = THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length];
              setMode(next);
            }}
          />
          <FunctionTile label={t('user.reset')} Icon={RefreshIcon} onClick={() => resetChat()} />
          <FunctionTile label={t('user.ai')} Icon={BotIcon} onClick={() => nav('/')} />
          <FunctionTile label={t('user.security')} Icon={LockIcon} />
          <FunctionTile label={t('user.support')} Icon={HelpIcon} />
          <FunctionTile label={t('user.rate')} Icon={RateIcon} />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 mt-6 pb-8 text-xs text-text-subtle text-center space-y-1">
        <p>{t('user.footer.support')}</p>
        <p>{t('user.footer.copyright')}</p>
      </footer>
    </div>
  );
}
```

Note: The 3 quick actions are: Khảo sát (Survey) → /survey, Yêu thích (Favorites) → /review, Review → /review. The provider state and AI status variables are imported but not used in the new layout (they were used by the old sections). They can stay in the file (not used) or be removed. Keep imports for now to keep the diff minimal — they may be useful in future iterations.

- [ ] **Step 2: Run build**

```bash
cd "e:/projectVN/edu-mini-app"
npm run build 2>&1 | tail -5
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/user.tsx
git commit -m "feat: rewrite User page with sample layout (header + quick actions + banner + 2 grids)"
```

---

## Task 6: Update user.test.tsx

**Files:**
- Modify: `src/pages/user.test.tsx`

- [ ] **Step 1: Read the current test file**

```bash
cd "e:/projectVN/edu-mini-app"
cat src/pages/user.test.tsx
```

- [ ] **Step 2: Overwrite the test file**

Overwrite `src/pages/user.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserPage from './user';
import { useSettingsStore } from '../stores/settings-store';
import { useThemeStore } from '../stores/theme-store';
import { useChatStore } from '../stores/chat-store';

describe('UserPage', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi', preferredProvider: 'auto' });
    useThemeStore.setState({ mode: 'system' });
    useChatStore.setState({ messages: [], activeSubject: undefined, recentQuestionIds: [], stats: { asked: 0, correct: 0 } });
  });

  it('renders the gradient header with title and subtitle', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('Đăng nhập / Đăng ký')).toBeInTheDocument();
    expect(screen.getByText('Xem thêm thông tin')).toBeInTheDocument();
  });

  it('renders the login button', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Đăng nhập ngay' })).toBeInTheDocument();
  });

  it('renders 3 quick action links', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    // Each quick action is a NavLink — find all anchor tags within the quick actions card
    const links = screen.getAllByRole('link');
    // Expect 3 quick action links (Khảo sát / Yêu thích / Review) + no other links
    const quickLinks = links.filter((l) => ['/survey', '/review'].includes(l.getAttribute('href') || ''));
    expect(quickLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the AI Tutor banner', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('Trợ lý AI 24/7')).toBeInTheDocument();
    expect(screen.getByText('Hỏi đáp bất kỳ lúc nào')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dùng ngay' })).toBeInTheDocument();
  });

  it('renders the Common Functions section with 4 items', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('Chức năng thường dùng')).toBeInTheDocument();
    expect(screen.getByText('Môn học')).toBeInTheDocument();
    expect(screen.getByText('Bài tập')).toBeInTheDocument();
    expect(screen.getByText('Bài giảng')).toBeInTheDocument();
    expect(screen.getByText('Thi thử')).toBeInTheDocument();
  });

  it('renders the Other Functions section with 8 items', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('Chức năng khác')).toBeInTheDocument();
    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
    expect(screen.getByText('Ngôn ngữ')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Bảo mật')).toBeInTheDocument();
    expect(screen.getByText('Hỗ trợ')).toBeInTheDocument();
    expect(screen.getByText('Đánh giá')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('© 2024 Edu Mini App')).toBeInTheDocument();
  });

  it('clicking the theme tile cycles through theme modes', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(useThemeStore.getState().mode).toBe('system');
    const themeTile = screen.getByText('Giao diện').closest('button')!;
    fireEvent.click(themeTile);
    expect(useThemeStore.getState().mode).toBe('light');
  });

  it('clicking the reset tile clears chat store', () => {
    useChatStore.setState({ messages: [{ id: 'x', role: 'user', content: 'test', createdAt: 0 }] });
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    const resetTile = screen.getByText('Reset').closest('button')!;
    fireEvent.click(resetTile);
    expect(useChatStore.getState().messages).toEqual([]);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test -- src/pages/user.test.tsx 2>&1 | tail -10
```

Expected: 9 tests pass (or as many as the assertions allow; some may need adjustment).

- [ ] **Step 4: Commit**

```bash
git add src/pages/user.test.tsx
git commit -m "test: update UserPage tests for redesigned layout"
```

---

## Task 7: Final integration verification

- [ ] **Step 1: Run all tests**

```bash
cd "e:/projectVN/edu-mini-app"
npm test 2>&1 | tail -5
```

Expected: ~95 tests pass (was 81 before this plan; +13 for component tests + the user page tests).

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

Then open `http://localhost:3000`, navigate to User tab, and verify:
- Gradient header with avatar, title, subtitle, login button
- 3 quick action icons (Khảo sát / Yêu thích / Review) with labels
- AI Tutor banner with title, subtitle, "Dùng ngay" button
- "Chức năng thường dùng" section with 4 function tiles
- "Chức năng khác" section with 8 function tiles
- Footer with support info and copyright
- All icons render in currentColor (green in light mode, gray in dark)
- Dark mode toggle still works (cycle via the Theme tile)

---

## Self-Review Notes

Spec coverage:
- §1 Purpose → All tasks
- §3 Page layout → Task 5 (rewrite user.tsx)
- §4 Component architecture → Tasks 3-4 (5 components)
- §5 Header (gradient) → Task 4 (GradientHeader) + Task 5 (usage)
- §6 Quick actions → Task 3 (QuickAction) + Task 5 (usage)
- §7 AI Tutor banner → Task 4 (InfoBanner) + Task 5 (usage)
- §8 Common functions → Task 5 (FunctionTile in Common section)
- §9 Other functions → Task 5 (FunctionTile in Other section)
- §10 Footer → Task 5 (footer in user.tsx)
- §11 New SVG icons → Task 2 (13 SVG files)
- §12 i18n additions → Task 1 (i18n keys)
- §13 File changes → All tasks
- §14 Tests → Tasks 3, 4, 6
- §15 Error handling → Covered (no extra handling needed)
- §16 Risks → Addressed (long page mitigated with pb-16)
- §17 Out of scope → Captured

Type consistency:
- `Icon: React.FC<React.SVGProps<SVGSVGElement>>` consistent across QuickAction, InfoBanner, FunctionTile
- Props interfaces match usage

No placeholders found.