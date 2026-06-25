import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chat-store';
import type { ChatMessage } from '../providers/types';

const fakeRunner = async () => ({
  messages: [{ id: 'bot-1', role: 'bot' as const, content: 'hi', createdAt: 1 }],
});

describe('chat-store', () => {
  beforeEach(() => {
    useChatStore.setState({ messages: [], recentQuestionIds: [], stats: { asked: 0, correct: 0 } });
  });

  it('resets the conversation', () => {
    useChatStore.setState({ messages: [{ id: 'x', role: 'user', content: 'a', createdAt: 0 }] });
    useChatStore.getState().reset();
    expect(useChatStore.getState().messages).toEqual([]);
  });

  it('sendUserMessage appends user and bot messages', async () => {
    await useChatStore.getState().sendUserMessage('hello', fakeRunner as any);
    const msgs = useChatStore.getState().messages;
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[1].role).toBe('bot');
  });

  it('sendUserMessage updates stats from bot feedback', async () => {
    const runner = async () => ({
      messages: [
        { id: 'b1', role: 'bot' as const, content: 'q', questionRef: 'q1', feedback: null, createdAt: 1 },
        { id: 'b2', role: 'bot' as const, content: 'right!', questionRef: 'q1', feedback: 'correct' as const, createdAt: 2 },
      ] as ChatMessage[],
    });
    await useChatStore.getState().sendUserMessage('B', runner as any);
    const s = useChatStore.getState().stats;
    expect(s.asked).toBe(1);
    expect(s.correct).toBe(1);
  });

  it('sendUserMessage calls runner with no activeSubject in ctx', async () => {
    let capturedCtx: any = null;
    const runner = async (_text: string, ctx: any) => {
      capturedCtx = ctx;
      return { messages: [{ id: 'b1', role: 'bot' as const, content: 'hi', createdAt: 1 }] };
    };
    await useChatStore.getState().sendUserMessage('hi', runner as any);
    expect(capturedCtx.activeSubject).toBeUndefined();
    expect(capturedCtx.history).toBeDefined();
    expect(capturedCtx.recentIds).toBeDefined();
  });
});
