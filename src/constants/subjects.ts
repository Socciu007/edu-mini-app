import type { Subject, SubjectId } from '../providers/types';

export const SUBJECTS: Subject[] = [
  { id: 'math',      name: { vi: 'Toán',      en: 'Math' },      emoji: '➕', color: 'blue' },
  { id: 'physics',   name: { vi: 'Vật lý',    en: 'Physics' },   emoji: '⚛️', color: 'purple' },
  { id: 'chemistry', name: { vi: 'Hóa học',   en: 'Chemistry' }, emoji: '🧪', color: 'green' },
  { id: 'english',   name: { vi: 'Tiếng Anh', en: 'English' },   emoji: '🅰️', color: 'orange' },
];

export const SUBJECT_BY_ID: Record<SubjectId, Subject> = SUBJECTS.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {} as Record<SubjectId, Subject>);

export function pickRandomSubject(): SubjectId {
  const ids: SubjectId[] = ['math', 'physics', 'chemistry', 'english'];
  return ids[Math.floor(Math.random() * ids.length)];
}
