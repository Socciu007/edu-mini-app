import { detectIntent } from './intents';
import { getProvider, hasAiConfig, localProvider } from '../../providers';
import { SUBJECT_BY_ID } from '../../constants/subjects';
import { rememberQuestion } from '../../stores/chat-store';
import type { ChatMessage, Intent, Question, SubjectId } from '../../providers/types';

export interface RouterContext {
  activeSubject?: SubjectId;
  history: ChatMessage[];
  recentIds: string[];
  lastQuestion?: Question;
}

const LANG_KEY = (lang: 'vi' | 'en') => (lang === 'en' ? 'en' : 'vi');

function uid(prefix = 'm') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function botAsks(q: Question, lang: 'vi' | 'en'): ChatMessage {
  // Cache the full Question so answer evaluation can find it later
  rememberQuestion(q);
  const prompt = q.prompt[LANG_KEY(lang)];
  const choicesBlock = q.choices?.length
    ? '\n\n' + q.choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`).join('\n')
    : '';
  return {
    id: uid('bot'),
    role: 'bot',
    content: prompt + choicesBlock,
    subject: q.subject,
    questionRef: q.id,
    feedback: null,
    createdAt: Date.now(),
  };
}

function botFeedback(correct: boolean, q: Question, lang: 'vi' | 'en', extra?: string): ChatMessage {
  const head = correct ? (lang === 'en' ? 'Correct! 🎉' : 'Chính xác! 🎉') : (lang === 'en' ? `Not quite. Answer: ${q.answer}` : `Chưa đúng. Đáp án: ${q.answer}`);
  const tail = extra ? `\n\n${extra}` : '';
  return {
    id: uid('bot'),
    role: 'bot',
    content: head + tail,
    subject: q.subject,
    questionRef: q.id,
    feedback: correct ? 'correct' : 'incorrect',
    createdAt: Date.now(),
  };
}

export async function routeMessage(
  userText: string,
  ctx: RouterContext,
  lang: 'vi' | 'en' = 'vi',
): Promise<{ messages: ChatMessage[] }> {
  const intent: Intent = detectIntent(userText, ctx);
  const subject = (intent.kind === 'request_question' && intent.subject) || ctx.activeSubject || 'math';
  const subj = SUBJECT_BY_ID[subject];

  if (intent.kind === 'request_question') {
    let q: Question;
    try {
      q = await localProvider.getQuestion({ subject, excludeIds: ctx.recentIds });
    } catch {
      if (hasAiConfig()) {
        q = await getProvider('ai').getQuestion({ subject, difficulty: intent.difficulty });
      } else {
        return { messages: [{ id: uid('bot'), role: 'bot', content: lang === 'en' ? 'No questions available for this subject yet.' : 'Chưa có câu hỏi cho môn này.', subject, createdAt: Date.now() }] };
      }
    }
    return { messages: [botAsks(q, lang)] };
  }

  if (intent.kind === 'submit_answer') {
    const q = ctx.lastQuestion;
    if (!q) return { messages: [{ id: uid('bot'), role: 'bot', content: lang === 'en' ? 'Please ask a question first.' : 'Hãy hỏi một câu trước nhé.', createdAt: Date.now() }] };
    if (q.choices) {
      const letter = intent.text.trim().toUpperCase();
      const idx = letter.charCodeAt(0) - 65;
      const correct = q.choices[idx] === q.answer;
      return { messages: [botFeedback(correct, q, lang, q.explanation?.[LANG_KEY(lang)])] };
    }
    if (hasAiConfig()) {
      try {
        const { correct, feedback } = await getProvider('ai').evaluateAnswer!(q, intent.text);
        return { messages: [botFeedback(correct, q, lang, feedback)] };
      } catch {
        return { messages: [botFeedback(false, q, lang, lang === 'en' ? 'Could not reach AI.' : 'Không kết nối được AI.')] };
      }
    }
    return { messages: [botFeedback(false, q, lang, lang === 'en' ? 'AI not configured to grade open answers.' : 'AI chưa được cấu hình để chấm câu trả lời.')] };
  }

  if (intent.kind === 'request_explanation' || intent.kind === 'request_hint') {
    const q = ctx.lastQuestion;
    if (!q) return { messages: [{ id: uid('bot'), role: 'bot', content: lang === 'en' ? 'No active question.' : 'Chưa có câu hỏi nào.', createdAt: Date.now() }] };
    if (hasAiConfig()) {
      try {
        const text = await getProvider('ai').explain!(q, intent.kind === 'request_hint' ? 'hint' : 'explain');
        return { messages: [{ id: uid('bot'), role: 'bot', content: text, subject: q.subject, questionRef: q.id, createdAt: Date.now() }] };
      } catch { /* fall through to local */ }
    }
    const localText = q.explanation?.[LANG_KEY(lang)] ?? q.answer;
    const prefix = intent.kind === 'request_hint' ? (lang === 'en' ? 'Hint: ' : 'Gợi ý: ') : (lang === 'en' ? 'Explanation: ' : 'Giải thích: ');
    return { messages: [{ id: uid('bot'), role: 'bot', content: prefix + localText, subject: q.subject, questionRef: q.id, createdAt: Date.now() }] };
  }

  // chitchat
  if (hasAiConfig()) {
    try {
      const text = await getProvider('ai').chat!(userText, ctx.history);
      return { messages: [{ id: uid('bot'), role: 'bot', content: text, createdAt: Date.now() }] };
    } catch { /* fall through */ }
  }
  return {
    messages: [{
      id: uid('bot'),
      role: 'bot',
      content: lang === 'en'
        ? 'I can help with Math, Physics, Chemistry, or English. Try: "Give me a math question".'
        : 'Tôi có thể giúp Toán, Lý, Hóa, Anh. Thử: "Cho tôi câu hỏi Toán".',
      createdAt: Date.now(),
    }],
  };
}
