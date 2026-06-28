import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SurveyRequest } from '../../services/survey-api'
import { useSettingsStore } from '../../stores/settings-store'
import { SurveyForm } from './survey-form'

describe('SurveyForm', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi' })
  })

  // SelectFields render as a button trigger; clicking opens a popover with role="option" items.
  // The options render inside a Transition, so use findByRole to wait for them.
  async function pickOption(triggerIndex: number, optionName: string | RegExp) {
    fireEvent.click(screen.getAllByRole('button')[triggerIndex])
    const option = await screen.findByRole('option', { name: optionName })
    fireEvent.click(option)
  }

  it('renders all five field labels', () => {
    render(<SurveyForm onSubmit={vi.fn()} isSubmitting={false} />)
    expect(screen.getByText('Môn học')).toBeInTheDocument()
    expect(screen.getByText('Lớp')).toBeInTheDocument()
    expect(screen.getByText('Bài học')).toBeInTheDocument()
    expect(screen.getByText('Độ khó')).toBeInTheDocument()
    expect(screen.getByText('Tài liệu')).toBeInTheDocument()
  })

  it('submitting empty form shows inline errors and does not call onSubmit', async () => {
    const onSubmit = vi.fn()
    render(<SurveyForm onSubmit={onSubmit} isSubmitting={false} />)
    fireEvent.click(screen.getByRole('button', { name: /Gửi khảo sát/i }))
    await waitFor(() => {
      expect(screen.getByText(/Vui lòng chọn môn học/)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('filling all fields and submitting calls onSubmit with SurveyRequest shape', async () => {
    const onSubmit = vi.fn().mockResolvedValue(null)
    render(<SurveyForm onSubmit={onSubmit} isSubmitting={false} />)

    // Trigger order in DOM: [subject, grade, difficulty, file-pick, submit]
    // The first three role=button elements are the SelectField triggers.
    await pickOption(0, 'Toán')
    await pickOption(1, '10')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quadratic' } })
    await pickOption(2, 'Đọc hiểu')

    const file = new File([new Uint8Array(10)], 'a.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Chọn file/i) as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /Gửi khảo sát/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
    const arg = onSubmit.mock.calls[0][0] as SurveyRequest
    expect(arg.subject).toBe('math')
    expect(arg.grade).toBe(10)
    expect(arg.lesson).toBe('Quadratic')
    expect(arg.difficulty).toBe(1)
    expect(arg.documents).toHaveLength(1)
    expect(arg.documents[0].name).toBe('a.pdf')
  })

  it('submit button shows submitting label when isSubmitting=true', () => {
    render(<SurveyForm onSubmit={vi.fn()} isSubmitting={true} />)
    expect(screen.getByRole('button', { name: /Đang gửi/i })).toBeDisabled()
  })

  it('resets fields after a successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue({} as never)
    render(<SurveyForm onSubmit={onSubmit} isSubmitting={false} />)

    await pickOption(0, 'Toán')
    await pickOption(1, '10')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quadratic' } })
    await pickOption(2, 'Đọc hiểu')
    const file = new File([new Uint8Array(10)], 'a.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/Chọn file/i) as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /Gửi khảo sát/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('')
    })
  })
})
