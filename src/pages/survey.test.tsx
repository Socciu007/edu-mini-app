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