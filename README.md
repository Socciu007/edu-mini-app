# Edu Chat — Mini App

Educational chatbot mini app for Zalo. Pick a subject (Math, Physics, Chemistry, English), chat in Vietnamese or English, get questions and explanations from a local question bank with optional AI fallback.

## Stack

React 18, TypeScript, Vite 5, Zustand, Tailwind, zmp-ui, KaTeX, Vitest.

## Setup

```bash
npm install
npm run dev
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
npm test
```

## Adding Questions

Edit files in `src/data/questions/<subject>.json`. Each question follows the `Question` type in `src/providers/types.ts`.

## Spec & Plan

- Design: `docs/superpowers/specs/2026-06-24-edu-chatbot-design.md`
- Plan: `docs/superpowers/plans/2026-06-24-edu-chatbot.md`
