import { describe, it, expect, beforeEach } from 'vitest';
import { routeMessage } from './router';
import { ALL_QUESTIONS } from '../../data/questions';
import type { ChatMessage, Question } from '../../providers/types';

const mathQ: Question = ALL_QUESTIONS.find((q) => q.id === 'math-001')!;

function msg(role: 'user' | 'bot', content: string, questionRef?: string): ChatMessage {
  return { id: `${role}-${content}`, role, content, questionRef, createdAt: Date.now() };
}

describe('routeMessage', () => {
  beforeEach(() => {
    delete process.env.VITE_AI_API_KEY;
  });

  it('returns a question for request_question from local bank', async () => {
    const out = await routeMessage('Cho tôi câu hỏi Toán', {
      history: [], recentIds: [],
    });
    expect(out.messages).toHaveLength(1);
    expect(out.messages[0].role).toBe('bot');
    expect(out.messages[0].questionRef).toBeDefined();
    // After Task 9: subject is random when no AI; accept any valid subject
    expect(['math', 'physics', 'chemistry', 'english']).toContain(out.messages[0].subject);
  });

  it('scores MCQ answer correctly', async () => {
    const history: ChatMessage[] = [msg('bot', 'pick one', 'math-001')];
    const out = await routeMessage('B', {
      activeSubject: 'math', history, recentIds: ['math-001'], lastQuestion: mathQ,
    });
    expect(out.messages[0].feedback).toBe('correct');
  });

  it('scores MCQ answer incorrectly', async () => {
    const history: ChatMessage[] = [msg('bot', 'pick one', 'math-001')];
    const out = await routeMessage('A', {
      activeSubject: 'math', history, recentIds: ['math-001'], lastQuestion: mathQ,
    });
    expect(out.messages[0].feedback).toBe('incorrect');
  });

  it('uses AI for explain when key set; else uses local explanation', async () => {
    const history: ChatMessage[] = [msg('bot', '?', 'math-001')];
    const out = await routeMessage('Giải thích', {
      activeSubject: 'math', history, recentIds: ['math-001'], lastQuestion: mathQ,
    });
    expect(out.messages[0].role).toBe('bot');
    expect(out.messages[0].content.length).toBeGreaterThan(0);
  });

  it('falls back gracefully when no providers match and no AI', async () => {
    const out = await routeMessage('blah blah blah blah', {
      activeSubject: 'english', history: [], recentIds: [],
    });
    // chitchat with no AI → canned string
    expect(out.messages[0].role).toBe('bot');
    expect(out.messages[0].content.length).toBeGreaterThan(0);
  });

  it('falls back to a random subject when no subject provided and no AI', async () => {
    const out = await routeMessage('Cho tôi câu hỏi', {
      history: [], recentIds: [],
    });
    expect(out.messages).toHaveLength(1);
    expect(out.messages[0].questionRef).toBeDefined();
    const validPrefixes = ['math-', 'phys-', 'chem-', 'eng-'];
    expect(validPrefixes.some(p => out.messages[0].questionRef!.startsWith(p))).toBe(true);
  });
});
