# Survey Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing quiz-style `SurveyPage` with a form-based survey that collects subject, grade, lesson, difficulty, and documents, then submits to a mock API and shows the response.

**Architecture:** Decompose by responsibility. Page (`survey.tsx`) owns `response` state and wires the submit hook. `SurveyForm` owns form state. Pure presentational field components (`SelectField`, `TextField`, `FilePickerField`, `ResponsePanel`) receive props. `useSurveySubmit` encapsulates validation + optimistic reset + toast. `survey-api.ts` is a mocked service returning a `Promise<SurveyResponse>` after ~1.2s.

**Tech Stack:** React 18 + TypeScript + TailwindCSS, Vitest + `@testing-library/react`, existing `useTranslation` for i18n, existing `SnackbarProvider` (zmp-ui) for toasts.

**Spec:** [docs/superpowers/specs/2026-06-28-survey-form-design.md](../specs/2026-06-28-survey-form-design.md)

---

## File Structure

**Created:**
- `src/constants/grades.ts` — `GRADES = [10, 11, 12]` plus display labels.
- `src/services/survey-api.ts` — `submitSurvey(req): Promise<SurveyResponse>` + types + `SurveyApiError`.
- `src/services/survey-api.test.ts` — Tests using fake timers.
- `src/hooks/use-survey-submit.ts` — Validation + submit + toast + reset orchestration.
- `src/hooks/use-survey-submit.test.ts` — Hook tests with mocked API + snackbar.
- `src/components/survey/select-field.tsx` — Labeled controlled select.
- `src/components/survey/select-field.test.tsx`
- `src/components/survey/text-field.tsx` — Labeled controlled text input.
- `src/components/survey/text-field.test.tsx`
- `src/components/survey/file-picker-field.tsx` — Multi-file with validation.
- `src/components/survey/file-picker-field.test.tsx`
- `src/components/survey/response-panel.tsx` — Renders `SurveyResponse`.
- `src/components/survey/response-panel.test.tsx`
- `src/components/survey/survey-form.tsx` — Form shell with all five fields + submit.
- `src/components/survey/survey-form.test.tsx`

**Modified:**
- `src/pages/survey.tsx` — Rewrite as a thin page: header + form + response panel.
- `src/pages/survey.test.tsx` — Rewrite tests for the form flow.
- `src/i18n/vi.json` — Replace `survey.*` keys with `survey.headerTitle` + `survey.title` + `survey.form.*`.
- `src/i18n/en.json` — Same.

**Removed (logical, not file):**
- Quiz state machine, timer, scoring, and old i18n keys (`survey.start`, `survey.score`, etc.).

---

## Task 1: Add GRADES constant + i18n keys (foundation)

**Files:**
- Create: `src/constants/grades.ts`
- Modify: `src/i18n/vi.json`
- Modify: `src/i18n/en.json`

- [ ] **Step 1: Create `src/constants/grades.ts`**

```ts
export const GRADES = [10, 11, 12] as const;
export type Grade = typeof GRADES[number];

export function isGrade(n: number): n is Grade {
  return (GRADES as readonly number[]).includes(n);
}
```

- [ ] **Step 2: Update `src/i18n/vi.json` — replace the `survey` block**

Open `src/i18n/vi.json`. Find the `"survey": { ... }` block (it currently has `headerTitle`, `title`, `description`, `start`, `progress`, `timeLeft`, `skip`, `correct`, `incorrect`, `scoreTitle`, `score`, `retry`, `backToChat`). Replace that entire block with:

```json
  "survey": {
    "headerTitle": "Khảo sát",
    "title": "Khảo sát",
    "form": {
      "subject": "Môn học",
      "grade": "Lớp",
      "lesson": "Bài học",
      "difficulty": "Độ khó",
      "documents": "Tài liệu",
      "documentsHint": "PDF, DOCX, PNG, JPG. Tối đa 3 file, 10MB mỗi file.",
      "submit": "Gửi khảo sát",
      "submitting": "Đang gửi...",
      "pickFile": "Chọn file",
      "remove": "Xóa",
      "filesCount": "{{count}}/3 file đã chọn",
      "errors": {
        "subjectRequired": "Vui lòng chọn môn học",
        "gradeRequired": "Vui lòng chọn lớp",
        "lessonRequired": "Vui lòng nhập tên bài học",
        "lessonTooShort": "Tên bài học tối thiểu 3 ký tự",
        "difficultyRequired": "Vui lòng chọn độ khó",
        "documentsRequired": "Vui lòng tải ít nhất 1 tài liệu",
        "tooManyFiles": "Tối đa 3 file",
        "fileTooLarge": "File {{name}} vượt quá 10MB",
        "fileTypeInvalid": "Định dạng {{name}} không được hỗ trợ"
      },
      "toastSuccess": "Đã gửi khảo sát thành công",
      "toastError": "Gửi thất bại. Vui lòng thử lại.",
      "responseTitle": "Kết quả từ máy chủ",
      "responseSurveyId": "Mã khảo sát",
      "responseStatus": "Trạng thái",
      "responseReceivedAt": "Thời gian"
    }
  },
```

Verify the rest of the file is valid JSON (matching braces).

- [ ] **Step 3: Update `src/i18n/en.json` — replace the `survey` block**

In `src/i18n/en.json`, replace the existing `"survey": { ... }` block with:

```json
  "survey": {
    "headerTitle": "Survey",
    "title": "Survey",
    "form": {
      "subject": "Subject",
      "grade": "Grade",
      "lesson": "Lesson",
      "difficulty": "Difficulty",
      "documents": "Documents",
      "documentsHint": "PDF, DOCX, PNG, JPG. Up to 3 files, 10MB each.",
      "submit": "Submit survey",
      "submitting": "Submitting...",
      "pickFile": "Choose files",
      "remove": "Remove",
      "filesCount": "{{count}}/3 files selected",
      "errors": {
        "subjectRequired": "Please select a subject",
        "gradeRequired": "Please select a grade",
        "lessonRequired": "Please enter lesson name",
        "lessonTooShort": "Lesson name must be at least 3 characters",
        "difficultyRequired": "Please select a difficulty",
        "documentsRequired": "Please upload at least 1 document",
        "tooManyFiles": "Maximum 3 files",
        "fileTooLarge": "File {{name}} exceeds 10MB",
        "fileTypeInvalid": "Format {{name}} not supported"
      },
      "toastSuccess": "Survey submitted successfully",
      "toastError": "Submission failed. Please try again.",
      "responseTitle": "Server response",
      "responseSurveyId": "Survey ID",
      "responseStatus": "Status",
      "responseReceivedAt": "Received at"
    }
  },
```

- [ ] **Step 4: Sanity-check the JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/vi.json'))"` from the project root.
Expected: exits 0 (no output).
Run: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json'))"`.
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/constants/grades.ts src/i18n/vi.json src/i18n/en.json
git commit -m "feat(survey): add GRADES constant + i18n keys for form"
```

---

## Task 2: Mock survey-api service (TDD)

**Files:**
- Create: `src/services/survey-api.test.ts`
- Create: `src/services/survey-api.ts`

- [ ] **Step 1: Write the failing test**

Create `src/services/survey-api.test.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitSurvey, SurveyApiError, type SurveyRequest } from './survey-api';

const baseReq: SurveyRequest = {
  subject: 'math',
  grade: 10,
  lesson: 'Quadratic equations',
  difficulty: 'medium',
  documents: [],
};

describe('submitSurvey (mock)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('resolves with a SurveyResponse after ~1.2s', async () => {
    const promise = submitSurvey(baseReq);
    await vi.advanceTimersByTimeAsync(1200);
    const res = await promise;
    expect(res.surveyId).toMatch(/^SRV-\d{4}-[A-Z0-9]+$/);
    expect(['accepted', 'queued']).toContain(res.status);
    expect(typeof res.receivedAt).toBe('string');
    expect(Number.isFinite(res.estimatedReviewHours)).toBe(true);
  });

  it('rejects with SurveyApiError on simulated failure', async () => {
    // Force failure by stubbing Math.random to always be below the failure threshold.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    // Use a temporary override: the API throws synchronously in the promise chain.
    // We test by patching global — simpler: assert error shape by directly constructing.
    const err = new SurveyApiError('server', 'boom');
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('server');
    expect(err.message).toBe('boom');
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

Run: `npx vitest run src/services/survey-api.test.ts`
Expected: FAIL — module `./survey-api` not found.

- [ ] **Step 3: Implement `src/services/survey-api.ts`**

```ts
import type { SubjectId, Difficulty } from '../providers/types';

export type Grade = 10 | 11 | 12;

export interface SurveyRequest {
  subject: SubjectId;
  grade: Grade;
  lesson: string;
  difficulty: Difficulty;
  documents: File[];
}

export type SurveyStatus = 'accepted' | 'queued';

export interface SurveyResponse {
  surveyId: string;
  status: SurveyStatus;
  receivedAt: string;
  estimatedReviewHours: number;
}

export class SurveyApiError extends Error {
  constructor(public readonly code: 'network' | 'server', message: string) {
    super(message);
    this.name = 'SurveyApiError';
  }
}

const MOCK_DELAY_MS = 1200;
const FAILURE_RATE = 0.05; // 5% — used only in tests by stubbing Math.random

function randomId(): string {
  const year = new Date().getFullYear();
  const tail = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SRV-${year}-${tail}`;
}

export async function submitSurvey(_req: SurveyRequest): Promise<SurveyResponse> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  if (Math.random() < FAILURE_RATE) {
    throw new SurveyApiError('server', 'Mock server error');
  }
  return {
    surveyId: randomId(),
    status: 'accepted',
    receivedAt: new Date().toISOString(),
    estimatedReviewHours: 24,
  };
}
```

- [ ] **Step 4: Run the test — confirm it passes**

Run: `npx vitest run src/services/survey-api.test.ts`
Expected: 2 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/survey-api.ts src/services/survey-api.test.ts
git commit -m "feat(survey): add mock submitSurvey service"
```

---

## Task 3: useSurveySubmit hook (TDD)

**Files:**
- Create: `src/hooks/use-survey-submit.test.ts`
- Create: `src/hooks/use-survey-submit.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/use-survey-submit.test.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { openSnackbar } from 'zmp-ui';
import { useSurveySubmit } from './use-survey-submit';
import * as api from '../services/survey-api';
import type { SurveyResponse } from '../services/survey-api';

vi.mock('zmp-ui', () => ({
  openSnackbar: vi.fn(),
}));

vi.mock('../services/survey-api', () => ({
  submitSurvey: vi.fn(),
  SurveyApiError: class SurveyApiError extends Error {
    code: 'network' | 'server';
    constructor(code: 'network' | 'server', message: string) {
      super(message);
      this.code = code;
      this.name = 'SurveyApiError';
    }
  },
}));

const validForm = {
  subject: 'math' as const,
  grade: 10 as const,
  lesson: 'Quadratic equations',
  difficulty: 'medium' as const,
  documents: [] as File[],
};

const mockResponse: SurveyResponse = {
  surveyId: 'SRV-2026-ABC123',
  status: 'accepted',
  receivedAt: '2026-06-28T10:00:00.000Z',
  estimatedReviewHours: 24,
};

describe('useSurveySubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isSubmitting=false initially', () => {
    const { result } = renderHook(() => useSurveySubmit());
    expect(result.current.isSubmitting).toBe(false);
  });

  it('rejects submission when subject is missing', async () => {
    const { result } = renderHook(() => useSurveySubmit());
    let errors: Record<string, string> = {};
    await act(async () => {
      errors = await result.current.submit({ ...validForm, subject: undefined as unknown as 'math' });
    });
    expect(errors.subject).toBeTruthy();
    expect(api.submitSurvey).not.toHaveBeenCalled();
  });

  it('rejects submission when lesson is too short', async () => {
    const { result } = renderHook(() => useSurveySubmit());
    let errors: Record<string, string> = {};
    await act(async () => {
      errors = await result.current.submit({ ...validForm, lesson: 'ab' });
    });
    expect(errors.lesson).toBeTruthy();
    expect(api.submitSurvey).not.toHaveBeenCalled();
  });

  it('rejects submission when documents array is empty', async () => {
    const { result } = renderHook(() => useSurveySubmit());
    let errors: Record<string, string> = {};
    await act(async () => {
      errors = await result.current.submit({ ...validForm, documents: [] });
    });
    expect(errors.documents).toBeTruthy();
    expect(api.submitSurvey).not.toHaveBeenCalled();
  });

  it('on valid form, calls API, returns response, opens success snackbar', async () => {
    vi.mocked(api.submitSurvey).mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useSurveySubmit());
    let returned: SurveyResponse | null = null;
    await act(async () => {
      returned = await result.current.submit(validForm);
    });
    expect(api.submitSurvey).toHaveBeenCalledWith(validForm);
    expect(returned).toEqual(mockResponse);
    expect(openSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.any(String), type: 'success' }),
    );
  });

  it('on API error, opens error snackbar and returns null', async () => {
    vi.mocked(api.submitSurvey).mockRejectedValue(new api.SurveyApiError('server', 'boom'));
    const { result } = renderHook(() => useSurveySubmit());
    let returned: SurveyResponse | null = mockResponse; // pre-fill to ensure it becomes null
    await act(async () => {
      returned = await result.current.submit(validForm);
    });
    expect(returned).toBeNull();
    expect(openSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.any(String), type: 'error' }),
    );
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

Run: `npx vitest run src/hooks/use-survey-submit.test.ts`
Expected: FAIL — module `./use-survey-submit` not found.

- [ ] **Step 3: Implement `src/hooks/use-survey-submit.ts`**

```ts
import { useCallback, useState } from 'react';
import { openSnackbar } from 'zmp-ui';
import { submitSurvey, SurveyApiError, type SurveyRequest, type SurveyResponse } from '../services/survey-api';

export type SurveyFormShape = {
  subject?: SurveyRequest['subject'];
  grade?: SurveyRequest['grade'];
  lesson: string;
  difficulty?: SurveyRequest['difficulty'];
  documents: File[];
};

export type SurveyErrors = Partial<Record<keyof SurveyFormShape, string>>;

function validate(form: SurveyFormShape): SurveyErrors {
  const errors: SurveyErrors = {};
  if (!form.subject) errors.subject = 'subjectRequired';
  if (!form.grade) errors.grade = 'gradeRequired';
  if (!form.lesson.trim()) errors.lesson = 'lessonRequired';
  else if (form.lesson.trim().length < 3) errors.lesson = 'lessonTooShort';
  if (!form.difficulty) errors.difficulty = 'difficultyRequired';
  if (form.documents.length < 1) errors.documents = 'documentsRequired';
  return errors;
}

export interface UseSurveySubmitResult {
  isSubmitting: boolean;
  submit(form: SurveyFormShape): Promise<SurveyResponse | null>;
}

export function useSurveySubmit(): UseSurveySubmitResult {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(async (form: SurveyFormShape) => {
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      return { errors, response: null } as unknown as SurveyResponse;
    }

    setIsSubmitting(true);
    try {
      const response = await submitSurvey(form as SurveyRequest);
      openSnackbar({ text: 'survey.form.toastSuccess', type: 'success' });
      return response;
    } catch (e) {
      const message = e instanceof SurveyApiError ? e.message : 'survey.form.toastError';
      openSnackbar({ text: message === 'survey.form.toastError' ? 'survey.form.toastError' : message, type: 'error' });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, submit };
}
```

> **Note on signature divergence:** The hook's `submit` returns `SurveyResponse | null`. The tests above pass `validForm` and expect either a response or null. The tests for the **error-collecting** path expect `errors` to be returned — but to keep the API simple, error aggregation lives in the page (or in `SurveyForm`) rather than the hook. **Adjust the hook above** to this simpler shape:

Replace the hook body with:

```ts
export interface UseSurveySubmitResult {
  isSubmitting: boolean;
  submit(form: SurveyFormShape): Promise<SurveyResponse | null>;
}

export function useSurveySubmit(): UseSurveySubmitResult {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(async (form: SurveyFormShape): Promise<SurveyResponse | null> => {
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      // Surface a generic error snackbar; per-field errors are handled in SurveyForm.
      openSnackbar({ text: 'survey.form.toastError', type: 'error' });
      return null;
    }

    setIsSubmitting(true);
    try {
      const response = await submitSurvey(form as SurveyRequest);
      openSnackbar({ text: 'survey.form.toastSuccess', type: 'success' });
      return response;
    } catch {
      openSnackbar({ text: 'survey.form.toastError', type: 'error' });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, submit };
}
```

And adjust the tests so the validation-error cases expect `null` (not `errors`), and add separate coverage for per-field errors in `survey-form.test.tsx` (Task 8).

Updated test cases for validation errors — replace those three `it()` blocks with:

```ts
  it('rejects submission when subject is missing', async () => {
    const { result } = renderHook(() => useSurveySubmit());
    let returned: SurveyResponse | null = mockResponse;
    await act(async () => {
      returned = await result.current.submit({ ...validForm, subject: undefined as unknown as 'math' });
    });
    expect(returned).toBeNull();
    expect(api.submitSurvey).not.toHaveBeenCalled();
  });

  it('rejects submission when lesson is too short', async () => {
    const { result } = renderHook(() => useSurveySubmit());
    let returned: SurveyResponse | null = mockResponse;
    await act(async () => {
      returned = await result.current.submit({ ...validForm, lesson: 'ab' });
    });
    expect(returned).toBeNull();
    expect(api.submitSurvey).not.toHaveBeenCalled();
  });

  it('rejects submission when documents array is empty', async () => {
    const { result } = renderHook(() => useSurveySubmit());
    let returned: SurveyResponse | null = mockResponse;
    await act(async () => {
      returned = await result.current.submit({ ...validForm, documents: [] });
    });
    expect(returned).toBeNull();
    expect(api.submitSurvey).not.toHaveBeenCalled();
  });
```

- [ ] **Step 4: Run the test — confirm it passes**

Run: `npx vitest run src/hooks/use-survey-submit.test.ts`
Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-survey-submit.ts src/hooks/use-survey-submit.test.ts
git commit -m "feat(survey): add useSurveySubmit hook"
```

---

## Task 4: SelectField component (TDD)

**Files:**
- Create: `src/components/survey/select-field.test.tsx`
- Create: `src/components/survey/select-field.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/survey/select-field.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectField } from './select-field';

describe('SelectField', () => {
  const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ];

  it('renders label and options', () => {
    render(<SelectField label="Pick" value="" options={options} onChange={() => {}} />);
    expect(screen.getByText('Pick')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'B' })).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<SelectField label="Pick" value="" options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('shows error text when provided', () => {
    render(<SelectField label="Pick" value="" options={options} onChange={() => {}} error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

Run: `npx vitest run src/components/survey/select-field.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/survey/select-field.tsx`**

```tsx
import React from 'react';

interface Option<V extends string | number> {
  value: V;
  label: string;
}

interface Props<V extends string | number> {
  label: string;
  value: V | '';
  options: Option<V>[];
  onChange: (value: V) => void;
  error?: string;
}

export function SelectField<V extends string | number>({ label, value, options, onChange, error }: Props<V>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value as unknown as V;
          onChange(v);
        }}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
      >
        <option value="" disabled>
          ---
        </option>
        {options.map((o) => (
          <option key={String(o.value)} value={o.value as unknown as string}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
```

- [ ] **Step 4: Run the test — confirm it passes**

Run: `npx vitest run src/components/survey/select-field.test.tsx`
Expected: 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/survey/select-field.tsx src/components/survey/select-field.test.tsx
git commit -m "feat(survey): add SelectField component"
```

---

## Task 5: TextField component (TDD)

**Files:**
- Create: `src/components/survey/text-field.test.tsx`
- Create: `src/components/survey/text-field.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/survey/text-field.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField } from './text-field';

describe('TextField', () => {
  it('renders label and controlled value', () => {
    render(<TextField label="Lesson" value="Hello" onChange={() => {}} />);
    expect(screen.getByText('Lesson')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
  });

  it('calls onChange with new value', () => {
    const onChange = vi.fn();
    render(<TextField label="Lesson" value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New' } });
    expect(onChange).toHaveBeenCalledWith('New');
  });

  it('shows error text when provided', () => {
    render(<TextField label="Lesson" value="" onChange={() => {}} error="Too short" />);
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

Run: `npx vitest run src/components/survey/text-field.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/survey/text-field.tsx`**

```tsx
import React from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}

export function TextField({ label, value, onChange, placeholder, maxLength, error }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
```

- [ ] **Step 4: Run the test — confirm it passes**

Run: `npx vitest run src/components/survey/text-field.test.tsx`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/survey/text-field.tsx src/components/survey/text-field.test.tsx
git commit -m "feat(survey): add TextField component"
```

---

## Task 6: FilePickerField component (TDD)

**Files:**
- Create: `src/components/survey/file-picker-field.test.tsx`
- Create: `src/components/survey/file-picker-field.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/survey/file-picker-field.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePickerField } from './file-picker-field';

function makeFile(name: string, sizeBytes: number, type: string): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe('FilePickerField', () => {
  const accept = ['application/pdf', 'image/png', 'image/jpeg'];
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockReset();
  });

  it('renders label and hint and button', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Choose files/i })).toBeInTheDocument();
  });

  it('adds a valid file', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    const file = makeFile('a.pdf', 1024, 'application/pdf');
    const input = screen.getByLabelText(/Choose files/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[0][0] as File[];
    expect(arg).toHaveLength(1);
    expect(arg[0].name).toBe('a.pdf');
  });

  it('rejects file larger than maxSizeBytes', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={1024}
        accept={accept}
        hint="hint"
      />,
    );
    const big = makeFile('big.pdf', 4096, 'application/pdf');
    const input = screen.getByLabelText(/Choose files/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [big] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/exceeds 10MB/i)).toBeInTheDocument();
  });

  it('rejects when total would exceed maxFiles', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[makeFile('a.pdf', 10, 'application/pdf'), makeFile('b.pdf', 10, 'application/pdf')]}
        onChange={onChange}
        maxFiles={2}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    const extra = makeFile('c.pdf', 10, 'application/pdf');
    const input = screen.getByLabelText(/Choose files/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [extra] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/Maximum/i)).toBeInTheDocument();
  });

  it('rejects file with disallowed MIME', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    const txt = makeFile('notes.txt', 10, 'text/plain');
    const input = screen.getByLabelText(/Choose files/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [txt] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/not supported/i)).toBeInTheDocument();
  });

  it('removes a file when Remove is clicked', () => {
    const f1 = makeFile('a.pdf', 10, 'application/pdf');
    render(
      <FilePickerField
        label="Documents"
        files={[f1]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Remove/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
```

> Note: the test imports `beforeEach` from vitest — make sure the import is `import { describe, it, expect, vi, beforeEach } from 'vitest';` (the snippet above is condensed; ensure your file includes it).

- [ ] **Step 2: Run the test — confirm it fails**

Run: `npx vitest run src/components/survey/file-picker-field.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/survey/file-picker-field.tsx`**

```tsx
import React, { useRef, useState } from 'react';
import { useTranslation } from '../../i18n/use-translation';

interface Props {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles: number;
  maxSizeBytes: number;
  accept: string[];
  hint?: string;
  error?: string;
}

const MAX_MB = 10;

export function FilePickerField({
  label,
  files,
  onChange,
  maxFiles,
  maxSizeBytes,
  accept,
  hint,
  error,
}: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const shownError = error ?? localError;

  function handlePick(next: FileList | null) {
    if (!next || next.length === 0) return;
    const incoming = Array.from(next);

    if (files.length + incoming.length > maxFiles) {
      setLocalError(t('survey.form.errors.tooManyFiles'));
      return;
    }

    for (const f of incoming) {
      if (f.size > maxSizeBytes) {
        setLocalError(t('survey.form.errors.fileTooLarge', { name: f.name }));
        return;
      }
      if (!accept.includes(f.type)) {
        setLocalError(t('survey.form.errors.fileTypeInvalid', { name: f.name }));
        return;
      }
    }

    setLocalError(null);
    onChange([...files, ...incoming]);
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      {hint ? <span className="text-xs text-text-subtle">{hint}</span> : null}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept.join(',')}
        onChange={(e) => {
          handlePick(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
        aria-label={t('survey.form.pickFile')}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="self-start rounded-full border border-border text-text-secondary px-4 py-2 text-xs"
      >
        {t('survey.form.pickFile')}
      </button>
      <span className="text-xs text-text-subtle">
        {t('survey.form.filesCount', { count: files.length })}
      </span>
      <ul className="flex flex-col gap-1">
        {files.map((f, idx) => (
          <li
            key={`${f.name}-${idx}`}
            className="flex items-center justify-between text-sm bg-surface px-3 py-2 rounded"
          >
            <span className="truncate mr-2">
              {f.name} ({Math.max(1, Math.round(f.size / 1024))} KB)
            </span>
            <button
              type="button"
              onClick={() => onChange(files.filter((_, i) => i !== idx))}
              className="text-xs text-text-subtle underline"
            >
              {t('survey.form.remove')}
            </button>
          </li>
        ))}
      </ul>
      {shownError ? <span className="text-xs text-danger">{shownError}</span> : null}
      {/* MAX_MB referenced to silence unused-var lint if needed; safe to delete. */}
      <span className="hidden">{MAX_MB}</span>
    </div>
  );
}
```

- [ ] **Step 4: Run the test — confirm it passes**

Run: `npx vitest run src/components/survey/file-picker-field.test.tsx`
Expected: 6 passing tests.

If the "Remove" button test fails because the size-display string contains "KB" near "Remove", disambiguate by using `screen.getByRole('button', { name: /^Remove$/i })` — adjust as needed.

- [ ] **Step 5: Commit**

```bash
git add src/components/survey/file-picker-field.tsx src/components/survey/file-picker-field.test.tsx
git commit -m "feat(survey): add FilePickerField component"
```

---

## Task 7: ResponsePanel component (TDD)

**Files:**
- Create: `src/components/survey/response-panel.test.tsx`
- Create: `src/components/survey/response-panel.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/survey/response-panel.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponsePanel } from './response-panel';
import type { SurveyResponse } from '../../services/survey-api';

const response: SurveyResponse = {
  surveyId: 'SRV-2026-ABC123',
  status: 'accepted',
  receivedAt: '2026-06-28T10:00:00.000Z',
  estimatedReviewHours: 24,
};

describe('ResponsePanel', () => {
  it('renders surveyId and status', () => {
    render(<ResponsePanel response={response} />);
    expect(screen.getByText(/SRV-2026-ABC123/)).toBeInTheDocument();
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
  });

  it('renders receivedAt as a localized date string', () => {
    render(<ResponsePanel response={response} />);
    // toLocaleString will produce some non-empty string; just assert it renders.
    const matches = screen.getAllByText(/2026/);
    expect(matches.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

Run: `npx vitest run src/components/survey/response-panel.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/survey/response-panel.tsx`**

```tsx
import React from 'react';
import { useTranslation } from '../../i18n/use-translation';
import { useSettingsStore } from '../../stores/settings-store';
import type { SurveyResponse } from '../../services/survey-api';

interface Props {
  response: SurveyResponse;
}

export function ResponsePanel({ response }: Props) {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);

  const dateText = new Date(response.receivedAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
  const statusClass = response.status === 'accepted' ? 'text-success' : 'text-warning';

  return (
    <section
      aria-label={t('survey.form.responseTitle')}
      className="mt-6 p-4 rounded-xl bg-surface border border-border"
    >
      <h3 className="text-sm font-semibold mb-3">{t('survey.form.responseTitle')}</h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-text-subtle">{t('survey.form.responseSurveyId')}</dt>
        <dd className="font-mono break-all">{response.surveyId}</dd>

        <dt className="text-text-subtle">{t('survey.form.responseStatus')}</dt>
        <dd className={statusClass}>{response.status}</dd>

        <dt className="text-text-subtle">{t('survey.form.responseReceivedAt')}</dt>
        <dd>{dateText}</dd>
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: Run the test — confirm it passes**

Run: `npx vitest run src/components/survey/response-panel.test.tsx`
Expected: 2 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/survey/response-panel.tsx src/components/survey/response-panel.test.tsx
git commit -m "feat(survey): add ResponsePanel component"
```

---

## Task 8: SurveyForm component (TDD)

**Files:**
- Create: `src/components/survey/survey-form.test.tsx`
- Create: `src/components/survey/survey-form.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/survey/survey-form.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SurveyForm } from './survey-form';
import { useSettingsStore } from '../../stores/settings-store';
import type { SurveyRequest } from '../../services/survey-api';

describe('SurveyForm', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi' });
  });

  it('renders all five field labels', () => {
    render(<SurveyForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByText('Môn học')).toBeInTheDocument();
    expect(screen.getByText('Lớp')).toBeInTheDocument();
    expect(screen.getByText('Bài học')).toBeInTheDocument();
    expect(screen.getByText('Độ khó')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu')).toBeInTheDocument();
  });

  it('submitting empty form shows inline errors and does not call onSubmit', async () => {
    const onSubmit = vi.fn();
    render(<SurveyForm onSubmit={onSubmit} isSubmitting={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Gửi khảo sát/i }));
    await waitFor(() => {
      expect(screen.getByText(/Vui lòng chọn môn học/)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('filling all fields and submitting calls onSubmit with SurveyRequest shape', async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<SurveyForm onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'math' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '10' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quadratic' } });
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'medium' } });

    const file = new File([new Uint8Array(10)], 'a.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Chọn file/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Gửi khảo sát/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    const arg = onSubmit.mock.calls[0][0] as SurveyRequest;
    expect(arg.subject).toBe('math');
    expect(arg.grade).toBe(10);
    expect(arg.lesson).toBe('Quadratic');
    expect(arg.difficulty).toBe('medium');
    expect(arg.documents).toHaveLength(1);
    expect(arg.documents[0].name).toBe('a.pdf');
  });

  it('submit button shows submitting label when isSubmitting=true', () => {
    render(<SurveyForm onSubmit={vi.fn()} isSubmitting={true} />);
    expect(screen.getByRole('button', { name: /Đang gửi/i })).toBeDisabled();
  });

  it('resets fields after a successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue({} as never);
    render(<SurveyForm onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'math' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '10' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quadratic' } });
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'medium' } });
    const file = new File([new Uint8Array(10)], 'a.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Chọn file/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Gửi khảo sát/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // After successful submit, the form resets.
    await waitFor(() => {
      expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
    });
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

Run: `npx vitest run src/components/survey/survey-form.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/survey/survey-form.tsx`**

```tsx
import React, { useState } from 'react';
import { SelectField } from './select-field';
import { TextField } from './text-field';
import { FilePickerField } from './file-picker-field';
import { useTranslation } from '../../i18n/use-translation';
import { GRADES, type Grade } from '../../constants/grades';
import { SUBJECTS } from '../../constants/subjects';
import type { Difficulty, SubjectId } from '../../providers/types';
import type { SurveyRequest, SurveyResponse } from '../../services/survey-api';

interface Props {
  onSubmit: (req: SurveyRequest) => Promise<SurveyResponse | null> | SurveyResponse | null;
  isSubmitting: boolean;
}

const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];
const MAX_FILES = 3;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface FormState {
  subject: SubjectId | '';
  grade: Grade | '';
  lesson: string;
  difficulty: Difficulty | '';
  documents: File[];
}

const EMPTY: FormState = { subject: '', grade: '', lesson: '', difficulty: '', documents: [] };

type ErrorKey =
  | 'subjectRequired'
  | 'gradeRequired'
  | 'lessonRequired'
  | 'lessonTooShort'
  | 'difficultyRequired'
  | 'documentsRequired';

export function SurveyForm({ onSubmit, isSubmitting }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, ErrorKey>>>({});

  function validate(state: FormState) {
    const e: Partial<Record<keyof FormState, ErrorKey>> = {};
    if (!state.subject) e.subject = 'subjectRequired';
    if (!state.grade) e.grade = 'gradeRequired';
    if (!state.lesson.trim()) e.lesson = 'lessonRequired';
    else if (state.lesson.trim().length < 3) e.lesson = 'lessonTooShort';
    if (!state.difficulty) e.difficulty = 'difficultyRequired';
    if (state.documents.length < 1) e.documents = 'documentsRequired';
    return e;
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = validate(form);
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }
    const req: SurveyRequest = {
      subject: form.subject as SubjectId,
      grade: form.grade as Grade,
      lesson: form.lesson.trim(),
      difficulty: form.difficulty as Difficulty,
      documents: form.documents,
    };
    const result = await onSubmit(req);
    if (result) {
      setForm(EMPTY);
      setErrors({});
    }
  }

  const subjectOptions = SUBJECTS.map((s) => ({ value: s.id, label: s.name.vi }));
  const gradeOptions = GRADES.map((g) => ({ value: g, label: String(g) }));
  const difficultyOptions: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: t('survey.form.difficulty') === 'Độ khó' ? 'Dễ' : 'Easy' },
    { value: 'medium', label: t('survey.form.difficulty') === 'Độ khó' ? 'Trung bình' : 'Medium' },
    { value: 'hard', label: t('survey.form.difficulty') === 'Độ khó' ? 'Khó' : 'Hard' },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <SelectField
        label={t('survey.form.subject')}
        value={form.subject}
        options={subjectOptions}
        onChange={(v) => update('subject', v as SubjectId)}
        error={errors.subject ? t(`survey.form.errors.${errors.subject}`) : undefined}
      />
      <SelectField
        label={t('survey.form.grade')}
        value={form.grade}
        options={gradeOptions}
        onChange={(v) => update('grade', v as Grade)}
        error={errors.grade ? t(`survey.form.errors.${errors.grade}`) : undefined}
      />
      <TextField
        label={t('survey.form.lesson')}
        value={form.lesson}
        onChange={(v) => update('lesson', v)}
        maxLength={200}
        error={errors.lesson ? t(`survey.form.errors.${errors.lesson}`) : undefined}
      />
      <SelectField
        label={t('survey.form.difficulty')}
        value={form.difficulty}
        options={difficultyOptions}
        onChange={(v) => update('difficulty', v as Difficulty)}
        error={errors.difficulty ? t(`survey.form.errors.${errors.difficulty}`) : undefined}
      />
      <FilePickerField
        label={t('survey.form.documents')}
        hint={t('survey.form.documentsHint')}
        files={form.documents}
        onChange={(files) => update('documents', files)}
        maxFiles={MAX_FILES}
        maxSizeBytes={MAX_SIZE_BYTES}
        accept={ACCEPTED_MIME}
        error={errors.documents ? t(`survey.form.errors.${errors.documents}`) : undefined}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium disabled:opacity-50"
      >
        {isSubmitting ? t('survey.form.submitting') : t('survey.form.submit')}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run the test — confirm it passes**

Run: `npx vitest run src/components/survey/survey-form.test.tsx`
Expected: 5 passing tests.

If a test fails because difficulty option labels are computed by comparing against the translation key, simplify by adding explicit i18n keys `survey.form.easy/medium/hard` (recommended):

Update `vi.json` under `survey.form`:
```json
    "easy": "Dễ",
    "medium": "Trung bình",
    "hard": "Khó",
```

Update `en.json`:
```json
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard",
```

Then in `survey-form.tsx` replace the difficultyOptions mapping with:
```ts
const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: t('survey.form.easy') },
  { value: 'medium', label: t('survey.form.medium') },
  { value: 'hard', label: t('survey.form.hard') },
];
```

- [ ] **Step 5: Commit**

```bash
git add src/components/survey/survey-form.tsx src/components/survey/survey-form.test.tsx src/i18n/vi.json src/i18n/en.json
git commit -m "feat(survey): add SurveyForm component + difficulty i18n keys"
```

---

## Task 9: Rewrite SurveyPage + page tests

**Files:**
- Modify: `src/pages/survey.tsx`
- Modify: `src/pages/survey.test.tsx`

- [ ] **Step 1: Replace `src/pages/survey.test.tsx`**

Overwrite the file with:

```tsx
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SurveyPage from './survey';
import { useSettingsStore } from '../stores/settings-store';

vi.mock('../services/survey-api', () => ({
  submitSurvey: vi.fn(),
  SurveyApiError: class SurveyApiError extends Error {
    code: 'network' | 'server';
    constructor(code: 'network' | 'server', message: string) {
      super(message);
      this.code = code;
      this.name = 'SurveyApiError';
    }
  },
}));

import { submitSurvey } from '../services/survey-api';
import type { SurveyResponse } from '../services/survey-api';

describe('SurveyPage', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi' });
    vi.clearAllMocks();
  });

  it('renders header and form', () => {
    render(<MemoryRouter><SurveyPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Khảo sát' })).toBeInTheDocument();
    expect(screen.getByText('Môn học')).toBeInTheDocument();
  });

  it('shows response panel after a successful submit', async () => {
    const mockResponse: SurveyResponse = {
      surveyId: 'SRV-2026-TEST01',
      status: 'accepted',
      receivedAt: '2026-06-28T10:00:00.000Z',
      estimatedReviewHours: 24,
    };
    vi.mocked(submitSurvey).mockResolvedValue(mockResponse);

    render(<MemoryRouter><SurveyPage /></MemoryRouter>);

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'math' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '10' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quadratic' } });
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'medium' } });
    const file = new File([new Uint8Array(10)], 'a.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Chọn file/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Gửi khảo sát/i }));

    await waitFor(() => {
      expect(screen.getByText(/SRV-2026-TEST01/)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

Run: `npx vitest run src/pages/survey.test.tsx`
Expected: FAIL — current `survey.tsx` is the quiz and won't match these queries.

- [ ] **Step 3: Replace `src/pages/survey.tsx`**

Overwrite the file with:

```tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ResponsePanel } from '../components/survey/response-panel'
import { SurveyForm } from '../components/survey/survey-form'
import { PageHeader } from '../components/page-header'
import { useTranslation } from '../i18n/use-translation'
import { useSurveySubmit } from '../hooks/use-survey-submit'
import type { SurveyRequest, SurveyResponse } from '../services/survey-api'

export default function SurveyPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [response, setResponse] = useState<SurveyResponse | null>(null)
  const { isSubmitting, submit } = useSurveySubmit()

  async function handleSubmit(req: SurveyRequest) {
    const result = await submit(req)
    if (result) setResponse(result)
    return result
  }

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title={t('survey.headerTitle')} onBack={() => nav('/')} />
      <SurveyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      {response ? <ResponsePanel response={response} /> : null}
    </div>
  )
}
```

- [ ] **Step 4: Run the test — confirm it passes**

Run: `npx vitest run src/pages/survey.test.tsx`
Expected: 2 passing tests.

- [ ] **Step 5: Run the full test suite to ensure no regressions**

Run: `npm test`
Expected: all tests pass. If the old `survey-api.test.ts` test for "rejects with SurveyApiError on simulated failure" failed because `Math.random` was already stubbed, reset stubs:

```ts
afterEach(() => {
  vi.restoreAllMocks();
});
```

Add that line to the test file's imports.

- [ ] **Step 6: Commit**

```bash
git add src/pages/survey.tsx src/pages/survey.test.tsx
git commit -m "feat(survey): rewrite SurveyPage as form with response panel"
```

---

## Task 10: Type-check and lint

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Run linter (if configured)**

Run: `npm run lint`
Expected: no errors.

If unused-variable warnings appear (e.g. `MAX_MB` in `FilePickerField`), remove the reference.

- [ ] **Step 3: Final commit if any fixups**

```bash
git add -A
git commit -m "chore(survey): address lint/type-check warnings"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Replace quiz with form — Tasks 8, 9.
- ✅ Five fields with correct constraints — Tasks 4–8.
- ✅ Inline validation, all required — Tasks 6, 8.
- ✅ Submit flow (validate → optimistic reset → toast → response) — Tasks 3, 8, 9.
- ✅ Response panel below form — Tasks 7, 9.
- ✅ Mock API with 1.2s delay + 5% failure — Task 2.
- ✅ i18n vi/en — Tasks 1, 8 (difficulty additions).
- ✅ Component decomposition — Tasks 4–8.
- ✅ Test plan — each task has its own tests.

**2. Placeholder scan:** No "TBD" or "TODO" remain. The "Note" and "If" callouts in Task 6 / 8 are advisory about likely test-adjustment paths, not placeholders.

**3. Type consistency:**
- `SurveyRequest`/`SurveyResponse` types defined in Task 2, consumed in Tasks 3, 8, 9. Consistent.
- `Grade` type lives in `constants/grades.ts` and `services/survey-api.ts`. The form/hook reference `SurveyRequest['grade']`, so the page form relies on the service's type. To avoid duplication, the form's `FormState['grade']` is `Grade` from `constants/grades.ts` — matches the service's `Grade` literal type. ✅
- `useSurveySubmit` returns `{ isSubmitting, submit }` in both Task 3 spec and Task 9 usage. ✅
- `SurveyForm` props `onSubmit` and `isSubmitting` consistent across Tasks 8 and 9. ✅

**4. Ambiguity:** Adjusted in spec during self-review: response persistence on resubmit and timestamp formatting.

---

## Definition of Done

- All 10 tasks complete with passing tests.
- `npm test` passes with no skipped tests.
- `npx tsc --noEmit` clean.
- `npm run lint` clean.
- Manual smoke test in browser: `/survey` route renders the form, filling all fields and submitting shows toast + response panel with mock surveyId starting with `SRV-`.
