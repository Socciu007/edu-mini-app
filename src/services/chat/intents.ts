import type { Intent, Question, SubjectId } from '../../providers/types';

interface Ctx {
  lastQuestion?: Question;
  activeSubject?: SubjectId;
}

const REQUEST_QUESTION = /^(cho tôi|hãy cho|please\s*give|give\s*me).*(câu hỏi|question)/i;
const REQUEST_ANOTHER = /^(thêm|another|next|tiếp theo)/i;
const EXPLAIN = /(giải thích|explain|why|tại sao)/i;
const HINT = /(gợi ý|hint)/i;
const MCQ_LETTER = /^[a-d]$/i;

export function detectIntent(text: string, ctx: Ctx): Intent {
  const t = text.trim();

  if (REQUEST_QUESTION.test(t)) {
    return { kind: 'request_question', subject: ctx.activeSubject };
  }
  if (REQUEST_ANOTHER.test(t) && ctx.lastQuestion) {
    return { kind: 'request_question', subject: ctx.lastQuestion.subject };
  }
  if (EXPLAIN.test(t) && ctx.lastQuestion) {
    return { kind: 'request_explanation', questionId: ctx.lastQuestion.id };
  }
  if (HINT.test(t) && ctx.lastQuestion) {
    return { kind: 'request_hint', questionId: ctx.lastQuestion.id };
  }
  if (ctx.lastQuestion && MCQ_LETTER.test(t) && ctx.lastQuestion.choices) {
    return { kind: 'submit_answer', text: t.toUpperCase(), questionId: ctx.lastQuestion.id };
  }
  if (ctx.lastQuestion && t.length > 0 && t.length < 100) {
    return { kind: 'submit_answer', text: t, questionId: ctx.lastQuestion.id };
  }
  return { kind: 'chitchat' };
}