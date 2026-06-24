import { describe, it, expect } from 'vitest';
import { LocalBankProvider } from './local-bank';
import type { Question } from './types';

const sample: Question[] = [
  { id: 'a', subject: 'math', prompt: { vi: '1', en: '1' }, answer: '1', difficulty: 'easy' },
  { id: 'b', subject: 'math', prompt: { vi: '2', en: '2' }, answer: '2', difficulty: 'medium' },
  { id: 'c', subject: 'physics', prompt: { vi: '3', en: '3' }, answer: '3', difficulty: 'easy' },
];

describe('LocalBankProvider', () => {
  it('returns a question for the requested subject', async () => {
    const p = new LocalBankProvider(sample);
    const q = await p.getQuestion({ subject: 'math' });
    expect(q.subject).toBe('math');
  });

  it('does not return the same question twice in a row', async () => {
    const p = new LocalBankProvider([sample[0], sample[1]]);
    const q1 = await p.getQuestion({ subject: 'math' });
    const q2 = await p.getQuestion({ subject: 'math' });
    expect(q1.id).not.toBe(q2.id);
  });

  it('honors excludeIds', async () => {
    const p = new LocalBankProvider([sample[0], sample[1]]);
    const q = await p.getQuestion({ subject: 'math', excludeIds: ['a'] });
    expect(q.id).toBe('b');
  });

  it('throws when no questions match', async () => {
    const p = new LocalBankProvider(sample);
    await expect(p.getQuestion({ subject: 'english' })).rejects.toThrow();
  });

  it('explain is not implemented', () => {
    const p = new LocalBankProvider(sample);
    expect(p.explain).toBeUndefined();
  });
});