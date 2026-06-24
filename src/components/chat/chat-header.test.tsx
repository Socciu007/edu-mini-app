import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatHeader } from './chat-header';
import { useSettingsStore } from '../../stores/settings-store';
import { useChatStore } from '../../stores/chat-store';

describe('ChatHeader', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi' });
    useChatStore.setState({ messages: [], activeSubject: 'math', recentQuestionIds: [], stats: { asked: 0, correct: 0 } });
  });

  it('renders the change subject link', () => {
    render(
      <MemoryRouter>
        <ChatHeader activeSubject="math" onNewSession={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Đổi môn')).toBeInTheDocument();
  });

  it('does NOT render the settings link (moved to tab bar)', () => {
    render(
      <MemoryRouter>
        <ChatHeader activeSubject="math" onNewSession={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Cài đặt')).not.toBeInTheDocument();
  });

  it('calls setActiveSubject(undefined) when change subject is clicked', () => {
    render(
      <MemoryRouter>
        <ChatHeader activeSubject="math" onNewSession={() => {}} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Đổi môn'));
    expect(useChatStore.getState().activeSubject).toBeUndefined();
  });

  it('calls onNewSession when new session is clicked', () => {
    const onNewSession = vi.fn();
    render(
      <MemoryRouter>
        <ChatHeader activeSubject="math" onNewSession={onNewSession} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Phiên mới'));
    expect(onNewSession).toHaveBeenCalled();
  });
});
