import { describe, it, expect } from 'vitest';
import { pickRandomSubject } from './subjects';

describe('pickRandomSubject', () => {
  it('returns one of the 4 valid subjects', () => {
    const valid: ReadonlyArray<string> = ['math', 'physics', 'chemistry', 'english'];
    for (let i = 0; i < 50; i++) {
      const s = pickRandomSubject();
      expect(valid).toContain(s);
    }
  });

  it('returns a different subject on consecutive calls (eventually)', () => {
    const calls = new Set<string>();
    for (let i = 0; i < 10; i++) calls.add(pickRandomSubject());
    expect(calls.size).toBeGreaterThan(1);
  });
});
