import math from './math.json';
import physics from './physics.json';
import chemistry from './chemistry.json';
import english from './english.json';
import type { Question } from '../../providers/types';

export const ALL_QUESTIONS: Question[] = [
  ...(math as Question[]),
  ...(physics as Question[]),
  ...(chemistry as Question[]),
  ...(english as Question[]),
];