# Review Icon Refresh — Design

**Date:** 2026-06-24
**Status:** Approved (pending user review of this written spec)
**Project:** `edu-mini-app` (Zalo Mini App)

## 1. Purpose

Replace the existing `src/static/icons/review.svg` with a more modern, gradient + glow-styled icon. The current icon is a bar chart inside stacked speech bubbles — the new icon keeps the bar chart metaphor (representing analytics) and adds a sparkle accent (representing AI/insight). Style: gradient + soft glow halo for a contemporary, premium feel.

## 2. Scope

### In scope

- Replace `src/static/icons/review.svg` with a new SVG
- Verify build still works (no other files reference the icon's internal structure — they only use `<ReviewIcon />`)

### Out of scope (v1)

- Replacing the other 6 icons (chat, survey, user, arrow-left, check, x) with the same gradient + glow style — the spec only covers review
- Color customization per theme (the icon will use fixed colors since `currentColor` doesn't work for multi-color gradients; the rest of the icons continue to use `currentColor`)

## 3. Design

### Visual description

- **3 vertical bars** of increasing height (4, 7, 9 units tall) representing analytics
- **Vertical gradient** on the bars: light green `#86EFAC` at top → deep green `#15803D` at bottom
- **Rounded tops** on the bars (rx="1") for a soft modern feel
- **4-point sparkle** in the top-right corner (at position 18,5) representing AI/insight
- **Sparkle color**: warm yellow `#FBBF24` for contrast against the green
- **Soft radial-gradient glow** behind the sparkle (yellow `#FCD34D` fading to transparent) to make it pop
- **No external glow** on the bars (clean look, matches the other simple outline icons)

### Exact SVG

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#86EFAC"/>
      <stop offset="100%" stop-color="#15803D"/>
    </linearGradient>
    <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCD34D" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#FCD34D" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="4" y="13" width="3.5" height="7" rx="1" fill="url(#barGrad)"/>
  <rect x="10" y="9" width="3.5" height="11" rx="1" fill="url(#barGrad)"/>
  <rect x="16" y="6" width="3.5" height="14" rx="1" fill="url(#barGrad)"/>
  <circle cx="18" cy="5" r="4" fill="url(#sparkGlow)"/>
  <path d="M18 2 L18.7 4.3 L21 5 L18.7 5.7 L18 8 L17.3 5.7 L15 5 L17.3 4.3 Z" fill="#FBBF24"/>
</svg>
```

## 4. File changes

- **Replace:** `src/static/icons/review.svg`

## 5. Error handling

| Failure | UX |
|---------|----|
| Build fails due to invalid SVG | Vite build error at compile time. Fix the SVG. |
| `id="barGrad"` or `id="sparkGlow"` collides with another SVG in the document | Unlikely since the icon is rendered as a React component. If it happens, namespace the IDs (e.g., `barGrad-1`). |

## 6. Tests

No new tests needed:
- The existing `tab-bar.test.tsx` tests use labels and active state, not icon appearance
- Visual verification via manual smoke test (open the app, look at the Review tab icon)

## 7. Risks

- **`url(#barGrad)` collision**: Multiple instances of the icon on the same page share the same gradient `id`. SVGs in different `<svg>` elements with the same gradient `id` should be fine since gradients are scoped to their own SVG element in modern browsers. If issues arise, we can namespace the IDs using a unique suffix.
- **Color consistency with theme**: The icon uses fixed hex colors (`#86EFAC`, `#15803D`, `#FCD34D`, `#FBBF24`), not `currentColor`. This means the icon won't change color with the dark/light theme — it always shows the green gradient + yellow sparkle. This is intentional for a "premium" feel. If the user prefers theme-aware, the next iteration can switch to `currentColor` for the bars.
- **File size**: The new SVG with gradients is ~700 bytes vs the old ~700 bytes. No meaningful difference.

## 8. Out of scope (v1)

- Other 6 icons in the same gradient + glow style
- Per-theme color variants for the review icon
- Animations on the icon (e.g., pulsing glow)
