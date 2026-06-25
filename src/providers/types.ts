export type SubjectId = 'math' | 'physics' | 'chemistry' | 'english';

export interface Subject {
  id: SubjectId;
  name: { vi: string; en: string };
  emoji: string;
  color: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  subject: SubjectId;
  prompt: { vi: string; en: string };
  choices?: string[];
  answer: string;
  explanation?: { vi: string; en: string };
  difficulty: Difficulty;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  subject?: SubjectId;
  questionRef?: string;
  feedback?: 'correct' | 'incorrect' | null;
  createdAt: number;
}

export type Intent =
  | { kind: 'request_question'; subject?: SubjectId; difficulty?: Difficulty }
  | { kind: 'submit_answer'; text: string; questionId?: string }
  | { kind: 'request_explanation'; questionId?: string }
  | { kind: 'request_hint'; questionId?: string }
  | { kind: 'chitchat' };

export interface QuestionProvider {
  readonly name: 'local' | 'ai';
  getQuestion(ctx: { subject: SubjectId; difficulty?: Difficulty; excludeIds?: string[] }): Promise<Question>;
  explain?(q: Question, mode?: 'explain' | 'hint'): Promise<string>;
  evaluateAnswer?(q: Question, userAnswer: string): Promise<{ correct: boolean; feedback: string }>;
  chat?(userText: string, history: ChatMessage[]): Promise<string>;
  detectSubject?(text: string, history: ChatMessage[]): Promise<SubjectId | null>;
}
