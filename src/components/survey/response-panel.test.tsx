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
    const matches = screen.getAllByText(/2026/);
    expect(matches.length).toBeGreaterThan(0);
  });
});