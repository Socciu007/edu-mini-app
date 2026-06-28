import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSettingsStore } from '../stores/settings-store'
import SurveyPage from './survey'

vi.mock('../services/survey-api', () => ({
  submitSurvey: vi.fn(),
  SurveyApiError: class SurveyApiError extends Error {
    code: 'network' | 'server'
    constructor(code: 'network' | 'server', message: string) {
      super(message)
      this.code = code
      this.name = 'SurveyApiError'
    }
  },
}))

import type { SurveyResponse } from '../services/survey-api'
import { submitSurvey } from '../services/survey-api'

describe('SurveyPage', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi' })
    vi.clearAllMocks()
  })

  // Locate the Listbox trigger whose sibling <label> matches, then pick an option by visible name.
  async function pickOption(label: string, optionName: string | RegExp) {
    const trigger = screen.getByText(label).parentElement!.querySelector('button')!
    fireEvent.click(trigger)
    const option = await screen.findByRole('option', { name: optionName })
    fireEvent.click(option)
  }

  it('renders header and form', () => {
    render(
      <MemoryRouter>
        <SurveyPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Khảo sát' })).toBeInTheDocument()
    expect(screen.getByText('Môn học')).toBeInTheDocument()
  })

  it('shows response panel after a successful submit', async () => {
    const mockResponse: SurveyResponse = {
      surveyId: 'SRV-2026-TEST01',
      status: 'accepted',
      receivedAt: '2026-06-28T10:00:00.000Z',
      estimatedReviewHours: 24,
    }
    vi.mocked(submitSurvey).mockResolvedValue(mockResponse)

    render(
      <MemoryRouter>
        <SurveyPage />
      </MemoryRouter>,
    )

    await pickOption('Môn học', 'Toán')
    await pickOption('Lớp', '10')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quadratic' } })
    await pickOption('Độ khó', 'Đọc hiểu')
    const file = new File([new Uint8Array(10)], 'a.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Chọn file/i) as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /Gửi khảo sát/i }))

    await waitFor(() => {
      expect(screen.getByText(/SRV-2026-TEST01/)).toBeInTheDocument()
    })
  })
})
