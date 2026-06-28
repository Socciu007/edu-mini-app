import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { useChatStore } from '../stores/chat-store'
import { useSettingsStore } from '../stores/settings-store'
import { useThemeStore } from '../stores/theme-store'
import SettingsPage from './settings'

describe('SettingsPage', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi', preferredProvider: 'auto' })
    useThemeStore.setState({ mode: 'system' })
    useChatStore.setState({ messages: [], recentQuestionIds: [], stats: { asked: 0, correct: 0 } })
  })

  it('renders the settings title and back button', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Cài đặt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('renders all rows for the General section', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Ngôn ngữ')).toBeInTheDocument()
    expect(screen.getByText('Giao diện')).toBeInTheDocument()
    expect(screen.getByText('Làm mới cuộc trò chuyện')).toBeInTheDocument()
  })

  it('renders all rows for the Info section', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Trạng thái AI')).toBeInTheDocument()
    expect(screen.getByText('Giới thiệu')).toBeInTheDocument()
    expect(screen.getByText('Bảo mật')).toBeInTheDocument()
    expect(screen.getByText('Hỗ trợ')).toBeInTheDocument()
    expect(screen.getByText('Đánh giá ứng dụng')).toBeInTheDocument()
  })

  it('shows the current language value on the language select', () => {
    useSettingsStore.setState({ language: 'vi' })
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    const inputs = screen.getAllByRole('textbox')
    const langInput = inputs.find((el) => (el as HTMLInputElement).placeholder === 'Tiếng Việt')
    expect(langInput).toBeDefined()
    expect((langInput as HTMLInputElement).value).toBe('Tiếng Việt')
  })

  it('shows the current theme value on the theme select', () => {
    useThemeStore.setState({ mode: 'dark' })
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    const inputs = screen.getAllByRole('textbox')
    const themeInput = inputs.find((el) => (el as HTMLInputElement).placeholder === 'Tối')
    expect(themeInput).toBeDefined()
    expect((themeInput as HTMLInputElement).value).toBe('Tối')
  })

  it('clicking reset clears the chat store', () => {
    useChatStore.setState({
      messages: [{ id: 'x', role: 'user', content: 'test', createdAt: 0 }],
      recentQuestionIds: ['x'],
      stats: { asked: 1, correct: 0 },
    })
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    const resetRow = screen.getByText('Làm mới cuộc trò chuyện').closest('button')!
    fireEvent.click(resetRow)
    expect(useChatStore.getState().messages).toEqual([])
    expect(useChatStore.getState().stats).toEqual({ asked: 0, correct: 0 })
  })

  it('shows the AI not configured state when VITE_AI_API_KEY is unset', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Chưa cấu hình')).toBeInTheDocument()
  })

  it('renders the copyright footer', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('© 2024 Edu Mini App')).toBeInTheDocument()
  })
})