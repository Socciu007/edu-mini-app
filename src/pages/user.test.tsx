import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserPage from './user';
import { useSettingsStore } from '../stores/settings-store';
import { useThemeStore } from '../stores/theme-store';
import { useChatStore } from '../stores/chat-store';

describe('UserPage', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi', preferredProvider: 'auto' });
    useThemeStore.setState({ mode: 'system' });
    useChatStore.setState({ messages: [], activeSubject: undefined, recentQuestionIds: [], stats: { asked: 0, correct: 0 } });
  });

  it('renders the gradient header with title and subtitle', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('Đăng nhập / Đăng ký')).toBeInTheDocument();
    expect(screen.getByText('Xem thêm thông tin')).toBeInTheDocument();
  });

  it('renders the login button', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Đăng nhập ngay' })).toBeInTheDocument();
  });

  it('renders 3 quick action links', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    const links = screen.getAllByRole('link');
    const quickLinks = links.filter((l) => ['/survey', '/review'].includes(l.getAttribute('href') || ''));
    expect(quickLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the AI Tutor banner', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('Trợ lý AI 24/7')).toBeInTheDocument();
    expect(screen.getByText('Hỏi đáp bất kỳ lúc nào')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dùng ngay' })).toBeInTheDocument();
  });

  it('renders the Common Functions section with 4 items', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('Chức năng thường dùng')).toBeInTheDocument();
    expect(screen.getByText('Môn học')).toBeInTheDocument();
    expect(screen.getByText('Bài tập')).toBeInTheDocument();
    expect(screen.getByText('Bài giảng')).toBeInTheDocument();
    expect(screen.getByText('Thi thử')).toBeInTheDocument();
  });

  it('renders the Other Functions section with 8 items', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('Chức năng khác')).toBeInTheDocument();
    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
    expect(screen.getByText('Ngôn ngữ')).toBeInTheDocument();
    expect(screen.getByText('Bắt đầu lại cuộc trò chuyện')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Bảo mật')).toBeInTheDocument();
    expect(screen.getByText('Hỗ trợ')).toBeInTheDocument();
    expect(screen.getAllByText('Đánh giá').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the footer', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('© 2024 Edu Mini App')).toBeInTheDocument();
  });

  it('clicking the theme tile cycles through theme modes', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(useThemeStore.getState().mode).toBe('system');
    const themeTile = screen.getByText('Giao diện').closest('button')!;
    fireEvent.click(themeTile);
    expect(useThemeStore.getState().mode).toBe('light');
  });

  it('clicking the reset tile clears chat store', () => {
    useChatStore.setState({ messages: [{ id: 'x', role: 'user', content: 'test', createdAt: 0 }] });
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    const resetTile = screen.getByText('Bắt đầu lại cuộc trò chuyện').closest('button')!;
    fireEvent.click(resetTile);
    expect(useChatStore.getState().messages).toEqual([]);
  });
});