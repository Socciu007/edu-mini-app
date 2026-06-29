import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMenu } from './chat-menu';
import { useChatStore } from '../../stores/chat-store';

describe('ChatMenu', () => {
  beforeEach(() => {
    useChatStore.setState({ messages: [], recentQuestionIds: [], stats: { asked: 0, correct: 0 } });
  });

  it('renders the menu trigger button', () => {
    render(<ChatMenu />);
    expect(screen.getByRole('button', { name: /Menu/i })).toBeInTheDocument();
  });

  it('clicking trigger opens the dropdown', () => {
    render(<ChatMenu />);
    expect(screen.queryByText('Đoạn hội thoại mới')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    expect(screen.getByText('Đoạn hội thoại mới')).toBeInTheDocument();
  });

  it('dropdown shows 3 action items', () => {
    render(<ChatMenu />);
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    expect(screen.getByText('Đoạn hội thoại mới')).toBeInTheDocument();
    expect(screen.getByText('Tìm kiếm chat')).toBeInTheDocument();
    expect(screen.getByText('Làm mới hội thoại')).toBeInTheDocument();
  });

  it('dropdown shows 2 section labels (Pinned, Conversations)', () => {
    render(<ChatMenu />);
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    expect(screen.getByText('Đã ghim')).toBeInTheDocument();
    expect(screen.getByText('Hội thoại')).toBeInTheDocument();
  });

  it('click outside closes the dropdown', () => {
    render(
      <div>
        <ChatMenu />
        <button data-testid="outside">Outside</button>
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    expect(screen.getByText('Đoạn hội thoại mới')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Đoạn hội thoại mới')).not.toBeInTheDocument();
  });

  it('click "New chat" calls reset and closes the dropdown', () => {
    useChatStore.setState({ messages: [
      { id: 'u1', role: 'user', content: 'hello', createdAt: 1 },
      { id: 'b1', role: 'bot', content: 'hi', createdAt: 2 },
    ], recentQuestionIds: [], stats: { asked: 0, correct: 0 } });
    render(<ChatMenu />);
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    fireEvent.click(screen.getByText('Đoạn hội thoại mới'));
    expect(useChatStore.getState().messages).toEqual([]);
    expect(screen.queryByText('Đoạn hội thoại mới')).not.toBeInTheDocument();
  });

  it('click "Refresh" calls reset and closes the dropdown', () => {
    useChatStore.setState({ messages: [
      { id: 'u1', role: 'user', content: 'hello', createdAt: 1 },
    ], recentQuestionIds: [], stats: { asked: 0, correct: 0 } });
    render(<ChatMenu />);
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    fireEvent.click(screen.getByText('Làm mới hội thoại'));
    expect(useChatStore.getState().messages).toEqual([]);
    expect(screen.queryByText('Làm mới hội thoại')).not.toBeInTheDocument();
  });

  it('click "Search chats" closes the dropdown (no-op for v1)', () => {
    render(<ChatMenu />);
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    fireEvent.click(screen.getByText('Tìm kiếm chat'));
    expect(screen.queryByText('Tìm kiếm chat')).not.toBeInTheDocument();
  });

  it('when messages are empty, Conversations shows "Phiên hiện tại"', () => {
    render(<ChatMenu />);
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    expect(screen.getByText('Phiên hiện tại')).toBeInTheDocument();
  });

  it('when messages exist, Conversations shows first 40 chars of first user message', () => {
    useChatStore.setState({ messages: [
      { id: 'u1', role: 'user', content: 'a'.repeat(60), createdAt: 1 },
    ], recentQuestionIds: [], stats: { asked: 0, correct: 0 } });
    render(<ChatMenu />);
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }));
    const text = screen.getByText(/^a{40}/);
    expect(text).toBeInTheDocument();
  });
});