import { LocalBankProvider } from './local-bank';
import { AIProvider } from './ai';
import type { QuestionProvider } from './types';
import { ALL_QUESTIONS } from '../data/questions';

const local = new LocalBankProvider(ALL_QUESTIONS);

export function hasAiConfig(): boolean {
  return Boolean(import.meta.env.VITE_AI_API_KEY);
}

export function getProvider(name?: 'local' | 'ai'): QuestionProvider {
  if (name === 'ai' && hasAiConfig()) return new AIProvider();
  return local;
}

export { local as localProvider };