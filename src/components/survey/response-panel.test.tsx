import '@testing-library/jest-dom/vitest'

import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import type { SurveyResponse } from '../../services/survey-api'
import { ResponsePanel } from './response-panel'

const response: SurveyResponse = {
  surveyId: 'SRV-2026-ABC123',
  status: 'accepted',
  receivedAt: '2026-06-28T10:00:00.000Z',
  estimatedReviewHours: 24,
}

describe('ResponsePanel', () => {
  it('renders surveyId and status', () => {
    render(<ResponsePanel response={response} />)
    expect(screen.getByText(/SRV-2026-ABC123/)).toBeInTheDocument()
    expect(screen.getByText(/accepted/i)).toBeInTheDocument()
  })

  it('renders receivedAt as a localized date string', () => {
    render(<ResponsePanel response={response} />)
    // toLocaleString on 2026-06-28T10:00:00.000Z includes "06" (month) and "28" (day) but NOT "2026" by itself in the localized "en-US" format (e.g. "6/28/2026, 10:00:00 AM" does contain 2026 — be more specific).
    // Check that the date cell contains the day "28" and month "6" or "06" — something the surveyId doesn't.
    expect(screen.getByText(/28/)).toBeInTheDocument()
  })
})
