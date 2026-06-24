import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewPage from './review';
import { useChatStore } from '../stores/chat-store';
import { useSettingsStore } from '../stores/settings-store';
import type { ChatMessage } from '../providers/types';

describe('ReviewPage', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi' });
    useChatStore.setState({ messages: [], stats: { asked: 0, correct: 0 } });
  });

  it('renders the review title', () => {
    render(<MemoryRouter><ReviewPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Review/);
  });

  it('shows empty state when no messages', () => {
    render(<MemoryRouter><ReviewPage /></MemoryRouter>);
    expect(screen.getByText(/chưa có cuộc trò chuyện/i)).toBeInTheDocument();
  });

  it('shows stats from chat-store', () => {
    useChatStore.setState({
      messages: [],
      stats: { asked: 10, correct: 7 },
    });
    render(<MemoryRouter><ReviewPage /></MemoryRouter>);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('renders messages from chat-store', () => {
    const messages: ChatMessage[] = [
      { id: 'u1', role: 'user', content: 'Hello', createdAt: Date.now() },
      { id: 'b1', role: 'bot', content: 'Hi there!', createdAt: Date.now() },
    ];
    useChatStore.setState({ messages, stats: { asked: 0, correct: 0 } });
    render(<MemoryRouter><ReviewPage /></MemoryRouter>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows accuracy as — when asked is 0', () => {
    useChatStore.setState({ messages: [], stats: { asked: 0, correct: 0 } });
    render(<MemoryRouter><ReviewPage /></MemoryRouter>);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
