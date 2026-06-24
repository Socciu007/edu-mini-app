import { describe, it, expect, beforeEach } from 'vitest';
import { getProvider, hasAiConfig } from './index';

describe('providers factory', () => {
  beforeEach(() => {
    delete process.env.VITE_AI_API_KEY;
  });

  it('returns local provider when no key', () => {
    expect(hasAiConfig()).toBe(false);
    expect(getProvider().name).toBe('local');
  });

  it('returns AI provider when explicitly requested and key set', () => {
    process.env.VITE_AI_API_KEY = 'x';
    expect(getProvider('ai').name).toBe('ai');
  });

  it('falls back to local when AI requested but no key', () => {
    expect(getProvider('ai').name).toBe('local');
  });
});