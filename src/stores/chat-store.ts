import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { routeMessage, type RouterContext } from '../services/chat';
import type { ChatMessage, Question } from '../providers/types';
import { useSettingsStore } from './settings-store';

interface ChatState {
  messages: ChatMessage[];
  recentQuestionIds: string[];
  stats: { asked: number; correct: number };

  reset: () => void;
  sendUserMessage: (text: string, runner?: typeof routeMessage) => Promise<void>;
}

function findLastQuestion(messages: ChatMessage[]): Question | undefined {
  // We don't store the full Question object in chat-store (only id), so we
  // rely on caller to look it up. To keep this self-contained, we store a
  // cached map of last questions in module scope.
  return undefined;
}

// Module-scope cache: last seen question per id, populated by the caller.
const questionCache: Map<string, Question> = new Map();
export function rememberQuestion(q: Question) { questionCache.set(q.id, q); }
export function getRememberedQuestion(id: string) { return questionCache.get(id); }

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      recentQuestionIds: [],
      stats: { asked: 0, correct: 0 },

      reset: () => set({ messages: [], recentQuestionIds: [], stats: { asked: 0, correct: 0 } }),

      sendUserMessage: async (text, runner = routeMessage) => {
        const userMsg: ChatMessage = {
          id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'user',
          content: text,
          createdAt: Date.now(),
        };
        const state = get();
        const lang = useSettingsStore.getState().language;

        // Find last question message
        const lastBot = [...state.messages].reverse().find((m) => m.role === 'bot' && m.questionRef);
        const lastQuestion = lastBot?.questionRef ? questionCache.get(lastBot.questionRef) : undefined;

        const ctx: RouterContext = {
          history: state.messages,
          recentIds: state.recentQuestionIds,
          lastQuestion,
        };

        set({ messages: [...state.messages, userMsg] });
        const out = await runner(text, ctx, lang);

        // Cache any newly-asked questions
        for (const m of out.messages) {
          if (m.questionRef && !questionCache.has(m.questionRef)) {
            // We don't have the full Question here; we trust the caller to call rememberQuestion externally.
          }
        }

        const newMsgs = [...get().messages, ...out.messages];
        const askedRefs = out.messages
          .filter((m) => m.questionRef)
          .map((m) => m.questionRef as string);
        const newRecent = askedRefs.concat(state.recentQuestionIds).slice(0, 50);
        // Count unique question ids as "asked"; feedback messages share the same questionRef.
        const asked = new Set(askedRefs).size;
        const correct = out.messages.filter((m) => m.feedback === 'correct').length;
        set({
          messages: newMsgs,
          recentQuestionIds: newRecent,
          stats: {
            asked: state.stats.asked + asked,
            correct: state.stats.correct + correct,
          },
        });
      },
    }),
    {
      name: 'edu-chat-v1',
      partialize: (s) => ({
        messages: s.messages,
        recentQuestionIds: s.recentQuestionIds,
        stats: s.stats,
      }),
    },
  ),
);
