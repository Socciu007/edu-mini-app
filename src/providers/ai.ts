import type { ChatMessage, Question, QuestionProvider, SubjectId, Difficulty } from './types';

const SYSTEM_PROMPT = `You are an educational question generator for Vietnamese students. Respond in the user's language (Vietnamese or English). Output strict JSON only. For questions, output shape: {"id":"ai-<random>","subject":"<id>","prompt":{"vi":"...","en":"..."},"choices":[...],"answer":"...","explanation":{"vi":"...","en":"..."},"difficulty":"<level>","tags":[...]}. For answer evaluation, output: {"correct":<bool>,"feedback":"<text>"}. For explanation/hint, output: {"text":"<markdown with $...$ LaTeX>"}. For chitchat, output: {"text":"<reply>"}. LaTeX inside strings is allowed.`;

function envConfig() {
  return {
    url: import.meta.env.VITE_AI_API_URL as string | undefined,
    key: import.meta.env.VITE_AI_API_KEY as string | undefined,
    model: (import.meta.env.VITE_AI_MODEL as string | undefined) ?? 'gpt-4o-mini',
  };
}

function extractJson<T>(text: string): T {
  // Try direct parse, else first {...} block
  try { return JSON.parse(text) as T; } catch { /* fall through */ }
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('AI returned non-JSON response');
  return JSON.parse(m[0]) as T;
}

interface ChatMsg { role: 'system' | 'user' | 'assistant'; content: string }

async function callAI(messages: ChatMsg[]): Promise<string> {
  const { url, key, model } = envConfig();
  if (!url || !key) throw new Error('AI is not configured (missing VITE_AI_API_KEY / VITE_AI_API_URL)');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature: 0.4 }),
  });
  if (!res.ok) {
    if (res.status >= 500) throw new Error('AI is unreachable');
    const body = await res.text().catch(() => '');
    throw new Error(`AI error ${res.status}: ${body.slice(0, 120)}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices?.[0]?.message?.content ?? '';
}

export class AIProvider implements QuestionProvider {
  readonly name = 'ai' as const;

  private uid() { return Math.random().toString(36).slice(2, 10); }

  async getQuestion(ctx: { subject: SubjectId; difficulty?: Difficulty; excludeIds?: string[] }): Promise<Question> {
    const userPrompt = `Generate a ${ctx.difficulty ?? 'medium'} difficulty ${ctx.subject} question. Output JSON only.`;
    const text = await callAI([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }]);
    const parsed = extractJson<Partial<Question>>(text);
    return {
      id: parsed.id ?? `ai-${this.uid()}`,
      subject: ctx.subject,
      prompt: parsed.prompt ?? { vi: '', en: '' },
      choices: parsed.choices,
      answer: parsed.answer ?? '',
      explanation: parsed.explanation,
      difficulty: ctx.difficulty ?? 'medium',
      tags: parsed.tags,
    };
  }

  async explain(q: Question, mode: 'explain' | 'hint' = 'explain'): Promise<string> {
    const userPrompt = `${mode === 'hint' ? 'Give a short hint' : 'Explain step by step'} for this question: ${JSON.stringify(q)}. Output JSON {"text":"..."} only.`;
    const text = await callAI([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }]);
    const { text: body } = extractJson<{ text: string }>(text);
    return body;
  }

  async evaluateAnswer(q: Question, userAnswer: string): Promise<{ correct: boolean; feedback: string }> {
    const userPrompt = `Question: ${JSON.stringify(q)}\nStudent answer: ${userAnswer}\nOutput JSON {"correct":<bool>,"feedback":"<text>"} only.`;
    const text = await callAI([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }]);
    return extractJson<{ correct: boolean; feedback: string }>(text);
  }

  async chat(userText: string, history: ChatMessage[]): Promise<string> {
    const messages: ChatMsg[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map<ChatMsg>((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      { role: 'user', content: userText },
    ];
    const text = await callAI(messages);
    const { text: body } = extractJson<{ text: string }>(text);
    return body;
  }
}
