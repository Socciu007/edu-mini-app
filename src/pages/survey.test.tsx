import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SurveyPage from './survey';
import { useSettingsStore } from '../stores/settings-store';

describe('SurveyPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSettingsStore.setState({ language: 'vi' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders idle state with start button', () => {
    render(<MemoryRouter><SurveyPage /></MemoryRouter>);
    expect(screen.getByText('Khảo sát nhanh')).toBeInTheDocument();
    expect(screen.getByText(/5 câu hỏi/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bắt đầu' })).toBeInTheDocument();
  });

  it('transitions to playing state when start is clicked', () => {
    render(<MemoryRouter><SurveyPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    expect(screen.getByText(/Câu 1 \/ 5/)).toBeInTheDocument();
    expect(screen.getByText(/30s/)).toBeInTheDocument();
  });

  it('marks correct answer and advances', () => {
    render(<MemoryRouter><SurveyPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));

    const buttons = screen.getAllByRole('button').filter((b) => /^[A-D]\./.test(b.textContent || ''));
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);

    act(() => { vi.advanceTimersByTime(1100); });

    expect(screen.getByText(/Câu 2 \/ 5/)).toBeInTheDocument();
  });

  it('transitions to finished state after 5 questions', () => {
    render(<MemoryRouter><SurveyPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));

    for (let i = 0; i < 5; i++) {
      const buttons = screen.queryAllByRole('button').filter((b) => /^[A-D]\./.test(b.textContent || ''));
      if (buttons.length === 0) break;
      fireEvent.click(buttons[0]);
      act(() => { vi.advanceTimersByTime(1100); });
    }

    expect(screen.getByText('Kết quả')).toBeInTheDocument();
    expect(screen.getByText(/Bạn đúng \d+ \/ 5/)).toBeInTheDocument();
  });

  it('returns to idle when retry is clicked', () => {
    render(<MemoryRouter><SurveyPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    for (let i = 0; i < 5; i++) {
      const buttons = screen.queryAllByRole('button').filter((b) => /^[A-D]\./.test(b.textContent || ''));
      if (buttons.length === 0) break;
      fireEvent.click(buttons[0]);
      act(() => { vi.advanceTimersByTime(1100); });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Làm lại' }));
    expect(screen.getByText('Khảo sát nhanh')).toBeInTheDocument();
  });
});
