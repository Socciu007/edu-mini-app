import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSurveySubmit } from './use-survey-submit';
import * as api from '../services/survey-api';
import type { SurveyResponse } from '../services/survey-api';

const openSnackbar = vi.fn();

vi.mock('zmp-ui', () => ({
  useSnackbar: () => ({
    openSnackbar,
    closeSnackbar: vi.fn(),
    setDownloadProgress: vi.fn(),
  }),
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
  documents: [new File(['content'], 'homework.pdf', { type: 'application/pdf' })],
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
