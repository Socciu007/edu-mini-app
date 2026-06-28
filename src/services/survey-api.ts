import type { SubjectId, Difficulty } from '../providers/types';
import { type Grade } from '../constants/grades';

export type { Grade };

export interface SurveyRequest {
  subject: SubjectId;
  grade: Grade;
  lesson: string;
  difficulty: Difficulty;
  documents: File[];
}

export type SurveyStatus = 'accepted' | 'queued';

export interface SurveyResponse {
  surveyId: string;
  status: SurveyStatus;
  receivedAt: string;
  estimatedReviewHours: number;
}

export class SurveyApiError extends Error {
  constructor(public readonly code: 'network' | 'server', message: string) {
    super(message);
    this.name = 'SurveyApiError';
  }
}

const MOCK_DELAY_MS = 1200;
const MOCK_FAILURE_RATE = 0.05; // 5% chance of throwing a mock server error

function randomId(): string {
  const year = new Date().getFullYear();
  const tail = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SRV-${year}-${tail}`;
}

export async function submitSurvey(_req: SurveyRequest): Promise<SurveyResponse> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  if (Math.random() < MOCK_FAILURE_RATE) {
    throw new SurveyApiError('server', 'Mock server error');
  }
  return {
    surveyId: randomId(),
    status: 'accepted',
    receivedAt: new Date().toISOString(),
    estimatedReviewHours: 24,
  };
}
