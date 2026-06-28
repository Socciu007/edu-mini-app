# Survey Form Design

**Date:** 2026-06-28
**Status:** Approved (pending spec review)
**Scope:** Replace the existing quiz-style `SurveyPage` with a data-collection form.

## Background

The current [src/pages/survey.tsx](../../src/pages/survey.tsx) implements a quiz game: it picks 5 random multiple-choice questions from `ALL_QUESTIONS` and presents them with a 30-second timer each. This page is linked from the tab-bar via `ROUTES.survey` (`/survey`) and from a quick-action tile on the User page.

The user wants to repurpose the same route for a **form-based survey** that collects:
- subject, grade (class), lesson name, difficulty, and uploaded documents
- then submits via a mock API and shows the server response.

This is a complete replacement of the page contents — the URL, route registration, and tab-bar link stay the same. Quiz game state machine, timer, scoring UI, and quiz-related tests are removed.

## Goals

1. Replace the quiz UI with a clean, validated form.
2. Provide optimistic UX: form clears immediately on submit; toast confirms; response data appears in a panel below once the API resolves.
3. Keep each component small and independently testable.
4. Match existing project patterns (Tailwind tokens, i18n via `useTranslation`, page → component → prop flow).

## Non-goals

- No real backend integration (mock API only).
- No persistence of submitted surveys across reloads.
- No drag-and-drop reordering of uploaded files.
- No rich-text lesson name (plain text input only).
- No edit/delete of submitted survey from this page.

## Functional Requirements

### Form fields

| Field | Control | Options / constraint | Required |
|-------|---------|----------------------|----------|
| Subject (`subject`) | Select | `math`, `physics`, `chemistry`, `english` (from `SUBJECTS` in [src/constants/subjects.ts](../../src/constants/subjects.ts)) | Yes |
| Grade (`grade`) | Select | `10`, `11`, `12` (from new `src/constants/grades.ts`) | Yes |
| Lesson (`lesson`) | Text input | 3–200 characters, trimmed | Yes |
| Difficulty (`difficulty`) | Select | `easy`, `medium`, `hard` (from existing `Difficulty` type in [src/providers/types.ts](../../src/providers/types.ts)) | Yes |
| Documents (`documents`) | Multi-file picker | Allowed types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/png`, `image/jpeg`. Max 3 files. Max 10 MB per file. | Yes (≥1) |

### Validation rules

- All five fields are required. Submit button stays enabled; errors render **inline** below the field on first failed submit attempt, and clear as the user edits the field.
- Lesson: trimmed length must be ≥ 3 characters; otherwise show `survey.form.errors.lessonTooShort`.
- Documents: at least 1 file; otherwise `survey.form.errors.documentsRequired`.
- File count > 3: `survey.form.errors.tooManyFiles`.
- File size > 10 MB: `survey.form.errors.fileTooLarge` with the file name interpolated.
- File MIME not in allowed list: `survey.form.errors.fileTypeInvalid` with the file name interpolated.

### Submit flow

1. User taps **Submit** (`survey.form.submit`).
2. Page validates all fields synchronously. On error → render inline errors; **no API call**.
3. On valid → call `submitSurvey(req)` (mock API, ~1.2s delay).
4. **Optimistic reset:** clear all form fields and uploaded files immediately after step 3.
5. Show success toast `survey.form.toastSuccess` via existing `SnackbarProvider`.
6. Set local state `response = <api response>` to render the `ResponsePanel` below the (now empty) form.
7. **API failure path:** if `submitSurvey` rejects, show `survey.form.toastError`; **do not** reset the form (user can retry); do not show response panel.
8. Once a response is displayed, the user can submit again. Behavior on resubmit:
   - Successful resubmit → the previous response is **replaced** by the new one (single response panel at a time).
   - Failed resubmit → the previous response **stays visible** (we never clear `response` on failure), the form fields are also unchanged, so the user can fix and retry.
   - Submitting state (`isSubmitting: true`) suppresses new submit clicks while in flight.

### Response panel

Shown below the form whenever `response` is non-null. Renders:
- `survey.form.responseTitle` heading
- `survey.form.responseSurveyId` → `response.surveyId`
- `survey.form.responseStatus` → `response.status` (rendered in `text-success` if `accepted`, `text-warning` if `queued`)
- `survey.form.responseReceivedAt` → formatted using `new Date(response.receivedAt).toLocaleString()` with the current language from `useSettingsStore` (no new util needed; `Intl.DateTimeFormat` is built-in)

## Architecture

### File layout

```
src/pages/survey.tsx                       (rewritten — layout + state)
src/pages/survey.test.tsx                  (rewritten — form flow tests)

src/components/survey/
  survey-form.tsx          (form shell, owns form state, renders fields + submit)
  select-field.tsx         (labeled select; controlled value + error)
  text-field.tsx           (labeled text input; controlled value + error)
  file-picker-field.tsx    (multi-file input with preview, add/remove, validation)
  response-panel.tsx       (renders SurveyResponse data)

src/hooks/
  use-survey-submit.ts     (validation + submit + toast + reset; returns { submit, isSubmitting })

src/services/
  survey-api.ts            (mock submitSurvey with 1.2s delay; 5% random failure)
  survey-api.test.ts

src/constants/
  grades.ts                (GRADES = [10, 11, 12] as const, plus GRADE_LABELS for i18n)

src/i18n/
  vi.json, en.json         (replace survey.* keys; add survey.form.* subtree)
```

### Component contracts

**`survey.tsx` (page)**
- Holds page-level state: `response: SurveyResponse | null`, `isSubmitting: boolean`.
- Renders `PageHeader`, `SurveyForm`, `ResponsePanel`.
- Owns no form state — that lives in `SurveyForm`.
- Wires `onSubmit` from `useSurveySubmit(responseSetter)` to `SurveyForm`.

**`SurveyForm`**
- Props: `onSubmit: (req: SurveyRequest) => void | Promise<void>`, `isSubmitting: boolean`.
- Owns form state via `useState` (no external form library).
- Renders the five field components in order.
- Submit button shows `survey.form.submit` normally, `survey.form.submitting` while `isSubmitting`.
- After successful submit, resets internal state to empty values and clears files.

**`SelectField`**
- Props: `label, value, options: { value, label }[], onChange(value), error?`.
- Renders label, native `<select>`, optional error span in `text-danger`.

**`TextField`**
- Props: `label, value, onChange(value), placeholder?, maxLength?, error?`.
- Renders label, `<input type="text">`, optional error.

**`FilePickerField`**
- Props: `files: File[], onChange(files: File[]), maxFiles, maxSizeBytes, accept, error?, hint?`.
- Renders label, hint, hidden `<input type="file" multiple>`, visible "Choose files" button.
- Lists selected files with name + size + Remove button.
- Validates count / size / MIME on add; on violation, sets `error` and does NOT add the offending file(s).

**`ResponsePanel`**
- Props: `response: SurveyResponse`.
- Pure presentational.

### State types

```ts
// src/services/survey-api.ts
export type SurveyRequest = {
  subject: SubjectId;
  grade: 10 | 11 | 12;
  lesson: string;
  difficulty: Difficulty;
  documents: File[];
};

export type SurveyResponse = {
  surveyId: string;          // "SRV-2026-XXXX"
  status: 'accepted' | 'queued';
  receivedAt: string;         // ISO 8601
  estimatedReviewHours: number;
};

export class SurveyApiError extends Error {
  constructor(public code: 'network' | 'server', message: string) { super(message); }
}

export function submitSurvey(req: SurveyRequest): Promise<SurveyResponse>;
```

### Validation strategy

Inline errors only — no blocking modal. Validation runs:
- On submit: full validation, sets all errors.
- On field change: clear that field's error.

This is simple enough that a 30-line `validate(form)` function returning `Record<keyof FormState, string | null>` is sufficient; no schema library needed.

## i18n keys

Replace existing `survey.*` keys (used by the old quiz) with:

```jsonc
"survey": {
  "headerTitle": "Khảo sát",          // keep — referenced by tab-bar
  "title":      "Khảo sát",
  "form": {
    "subject":       "Môn học",
    "grade":         "Lớp",
    "lesson":        "Bài học",
    "difficulty":    "Độ khó",
    "documents":     "Tài liệu",
    "documentsHint": "PDF, DOCX, PNG, JPG. Tối đa 3 file, 10MB mỗi file.",
    "submit":        "Gửi khảo sát",
    "submitting":    "Đang gửi...",
    "pickFile":      "Chọn file",
    "remove":        "Xóa",
    "filesCount":    "{{count}}/3 file đã chọn",
    "errors": {
      "subjectRequired":     "Vui lòng chọn môn học",
      "gradeRequired":       "Vui lòng chọn lớp",
      "lessonRequired":      "Vui lòng nhập tên bài học",
      "lessonTooShort":      "Tên bài học tối thiểu 3 ký tự",
      "difficultyRequired":  "Vui lòng chọn độ khó",
      "documentsRequired":   "Vui lòng tải ít nhất 1 tài liệu",
      "tooManyFiles":        "Tối đa 3 file",
      "fileTooLarge":        "File {{name}} vượt quá 10MB",
      "fileTypeInvalid":     "Định dạng {{name}} không được hỗ trợ"
    },
    "toastSuccess":         "Đã gửi khảo sát thành công",
    "toastError":           "Gửi thất bại. Vui lòng thử lại.",
    "responseTitle":        "Kết quả từ máy chủ",
    "responseSurveyId":     "Mã khảo sát",
    "responseStatus":       "Trạng thái",
    "responseReceivedAt":   "Thời gian"
  }
}
```

English equivalents live under the same key path in `en.json`. The old keys (`survey.start`, `survey.score`, etc.) are removed from both files. `survey.headerTitle` stays because `user.tsx` and `tab-bar.tsx` reference it.

## Visual design

Uses existing Tailwind tokens from the project's design system:
- Page wrapper: `min-h-screen pb-16`
- Form container: `p-4 space-y-4`
- Field wrapper: `flex flex-col gap-1`
- Label: `text-sm text-text-secondary`
- Input/select: `border border-border rounded-lg px-3 py-2 text-sm bg-background`
- Error text: `text-xs text-danger`
- Hint text: `text-xs text-text-subtle`
- File row: `flex items-center justify-between text-sm bg-surface px-3 py-2 rounded`
- Submit button: `w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium disabled:opacity-50`
- Response panel: `mt-6 p-4 rounded-xl bg-surface border border-border`

Spacing matches the rest of the app (similar density to `user.tsx` and `chat.tsx`).

## Testing strategy

Tests live next to each component. Use `@testing-library/react` and `vitest`. Key cases:

- **`survey-form.test.tsx`**
  - Renders all 5 field labels.
  - Submit empty form → renders inline errors for all 5 fields.
  - Fill valid form → submit calls `onSubmit` with correct `SurveyRequest`.
  - While `isSubmitting` true, submit button label is `submitting` and disabled.

- **`select-field.test.tsx` / `text-field.test.tsx`**
  - Controlled value, label, error display.

- **`file-picker-field.test.tsx`**
  - Add file within limits → file appears in list.
  - Add file >10 MB → error shown, file NOT added.
  - Add 4th file when max=3 → error shown, file NOT added.
  - Add file with bad MIME → error shown.
  - Remove file → file removed from list.

- **`response-panel.test.tsx`**
  - Renders surveyId, status (with correct color), receivedAt.

- **`use-survey-submit.test.ts`**
  - Valid form → calls `submitSurvey`, shows success toast, returns response so page can set state.
  - API rejects → shows error toast, returns `null` so page keeps form data.

- **`survey-api.test.ts`**
  - With `vi.useFakeTimers()` + `vi.advanceTimersByTime(1200)` → resolves with response shape.
  - Use a seeded RNG (or temporarily set failure probability to 1) to deterministically test the error path.

- **`survey.test.tsx`** (page rewrite)
  - Renders header + form.
  - Submit valid form → response panel appears with surveyId.
  - Reset state: after success, form is empty again.

The old `survey.test.tsx` quiz cases (Câu 1 / 5, 30s timer, etc.) are removed since the quiz no longer exists.

## Out of scope / future

- Real backend integration (replace mock with `fetch`).
- Survey history list (would require a new page/route).
- Re-upload same files after validation failure (current UX: user re-picks).
- Drag-and-drop reorder of files.
- Edit-in-place after submission.
- Server-driven file-type / size limits.
