import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIProvider } from './ai';
import type { Question } from './types';

const sampleQuestion: Question = {
  id: 'math-001', subject: 'math',
  prompt: { vi: 'Giải $2x=4$', en: 'Solve $2x=4$' },
  answer: 'x = 2', difficulty: 'easy',
};

function mockFetchOk(jsonBody: unknown) {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => jsonBody,
  } as Response));
}

function mockFetchFail(status = 500, body = 'oops') {
  return vi.fn(async () => ({
    ok: false,
    status,
    text: async () => body,
  } as Response));
}

describe('AIProvider', () => {
  beforeEach(() => {
    process.env.VITE_AI_API_URL = 'https://example.test/v1/chat';
    process.env.VITE_AI_API_KEY = 'test-key';
    process.env.VITE_AI_MODEL = 'gpt-test';
  });

  it('throws when API key missing', async () => {
    delete process.env.VITE_AI_API_KEY;
    const p = new AIProvider();
    await expect(p.getQuestion({ subject: 'math' })).rejects.toThrow(/not configured/i);
  });

  it('parses a JSON question from the response', async () => {
    const fakeQuestion = { id: 'q1', subject: 'math', prompt: { vi: 'p', en: 'p' }, answer: 'a', difficulty: 'easy' };
    global.fetch = mockFetchOk({
      choices: [{ message: { content: JSON.stringify(fakeQuestion) } }],
    });
    const p = new AIProvider();
    const q = await p.getQuestion({ subject: 'math' });
    expect(q.id).toBe('q1');
  });

  it('surfaces a friendly error on 5xx', async () => {
    global.fetch = mockFetchFail(503);
    const p = new AIProvider();
    await expect(p.getQuestion({ subject: 'math' })).rejects.toThrow(/unreachable/i);
  });

  it('evaluateAnswer returns correct/feedback', async () => {
    global.fetch = mockFetchOk({
      choices: [{ message: { content: JSON.stringify({ correct: true, feedback: 'Good' }) } }],
    });
    const p = new AIProvider();
    const res = await p.evaluateAnswer!(sampleQuestion, 'x = 2');
    expect(res.correct).toBe(true);
    expect(res.feedback).toBe('Good');
  });
});
