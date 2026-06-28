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

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'math' } })
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '10' } })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quadratic' } })
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'medium' } })

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
    expect(arg.difficulty).toBe('medium')
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

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'math' } })
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '10' } })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Quadratic' } })
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'medium' } })
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
