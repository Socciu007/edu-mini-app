import { describe, it, expect } from 'vitest';
import { detectIntent } from './intents';
import type { Question } from '../../providers/types';

const q: Question = {
  id: 'math-001', subject: 'math',
  prompt: { vi: '?', en: '?' },
  choices: ['A', 'B', 'C', 'D'], answer: 'A', difficulty: 'easy',
};

describe('detectIntent', () => {
  it('detects request_question (VI)', () => {
    expect(detectIntent('Cho tôi câu hỏi Toán', { activeSubject: 'math' })).toEqual({
      kind: 'request_question', subject: 'math',
    });
  });

  it('detects request_question (EN)', () => {
    expect(detectIntent('Please give me a question', { activeSubject: 'physics' })).toEqual({
      kind: 'request_question', subject: 'physics',
    });
  });

  it('detects request_explanation (VI) with lastQuestion', () => {
    const i = detectIntent('Giải thích đi', { lastQuestion: q });
    expect(i.kind).toBe('request_explanation');
  });

  it('detects request_hint (EN)', () => {
    const i = detectIntent('hint', { lastQuestion: q });
    expect(i.kind).toBe('request_hint');
  });

  it('detects MCQ answer A/B/C/D', () => {
    const i = detectIntent('B', { lastQuestion: q });
    expect(i).toEqual({ kind: 'submit_answer', text: 'B', questionId: 'math-001' });
  });

  it('detects open-ended short answer as submit_answer', () => {
    const i = detectIntent('x = 4', { lastQuestion: q });
    expect(i).toEqual({ kind: 'submit_answer', text: 'x = 4', questionId: 'math-001' });
  });

  it('falls back to chitchat for long free text', () => {
    const long = 'This is a long free-form text that should be treated as chitchat because the user is asking for help, not answering a multiple choice question.';
    expect(detectIntent(long, { lastQuestion: q }).kind).toBe('chitchat');
  });

  it('chitchat when no lastQuestion and no keywords', () => {
    expect(detectIntent('Hello there', {}).kind).toBe('chitchat');
  });
});