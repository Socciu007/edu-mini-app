import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_QUESTIONS } from '../data/questions';
import { KatexRenderer } from '../components/katex-renderer';
import { PageHeader } from '../components/page-header';
import { useTranslation } from '../i18n/use-translation';
import CheckIcon from '@/static/icons/check.svg?react';
import XIcon from '@/static/icons/x.svg?react';
import type { Question } from '../providers/types';

const QUESTION_COUNT = 5;
const QUESTION_DURATION_SEC = 30;
const ADVANCE_DELAY_MS = 1000;

type SurveyState =
  | { kind: 'idle' }
  | { kind: 'playing'; questions: Question[]; currentIdx: number; answers: (boolean | null)[]; secondsLeft: number }
  | { kind: 'finished'; questions: Question[]; answers: (boolean | null)[] };

function pickQuestions(): Question[] {
  const mcq = ALL_QUESTIONS.filter((q) => q.choices && q.choices.length > 0);
  const shuffled = [...mcq];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(QUESTION_COUNT, shuffled.length));
}

export default function SurveyPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [state, setState] = useState<SurveyState>({ kind: 'idle' });
  const advanceTimer = useRef<number | null>(null);

  // Timer tick
  useEffect(() => {
    if (state.kind !== 'playing') return;
    if (state.secondsLeft <= 0) return;
    const id = window.setTimeout(() => {
      setState((s) => s.kind === 'playing' ? { ...s, secondsLeft: Math.max(0, s.secondsLeft - 1) } : s);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [state.kind === 'playing' ? state.secondsLeft : null, state.kind]);

  // Timer expiry → mark incorrect, advance
  useEffect(() => {
    if (state.kind !== 'playing') return;
    if (state.secondsLeft > 0) return;
    advanceWithAnswer(null);
  }, [state.kind === 'playing' ? state.secondsLeft : null, state.kind]);

  function advanceWithAnswer(answer: boolean | null) {
    if (state.kind !== 'playing') return;
    const nextAnswers = [...state.answers];
    nextAnswers[state.currentIdx] = answer;
    const nextIdx = state.currentIdx + 1;
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    if (nextIdx >= state.questions.length) {
      advanceTimer.current = window.setTimeout(() => {
        setState({ kind: 'finished', questions: state.questions, answers: nextAnswers });
      }, ADVANCE_DELAY_MS);
    } else {
      advanceTimer.current = window.setTimeout(() => {
        setState({
          kind: 'playing',
          questions: state.questions,
          currentIdx: nextIdx,
          answers: nextAnswers,
          secondsLeft: QUESTION_DURATION_SEC,
        });
      }, ADVANCE_DELAY_MS);
    }
  }

  function handleStart() {
    setState({
      kind: 'playing',
      questions: pickQuestions(),
      currentIdx: 0,
      answers: [],
      secondsLeft: QUESTION_DURATION_SEC,
    });
  }

  function handleChoice(idx: number, q: Question) {
    if (!q.choices) return;
    const correct = q.choices[idx] === q.answer;
    advanceWithAnswer(correct);
  }

  function handleSkip() {
    advanceWithAnswer(null);
  }

  function handleRetry() {
    setState({ kind: 'idle' });
  }

  // Render
  if (state.kind === 'idle') {
    return (
      <div className="min-h-screen pb-16">
        <PageHeader title={`📝 ${t('survey.title')}`} onBack={() => nav('/')} />
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">📝</div>
          <h1 className="text-xl font-bold mb-2">{t('survey.title')}</h1>
          <p className="text-text-subtle mb-8">{t('survey.description')}</p>
          <button
            onClick={handleStart}
            className="rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-medium"
          >
            {t('survey.start')}
          </button>
        </div>
      </div>
    );
  }

  if (state.kind === 'finished') {
    const correctCount = state.answers.filter((a) => a === true).length;
    return (
      <div className="min-h-screen pb-16 flex flex-col items-center justify-center text-center">
        <PageHeader title={`📝 ${t('survey.title')}`} onBack={() => nav('/')} />
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="text-5xl mb-4">🏁</div>
          <h1 className="text-xl font-bold mb-4">{t('survey.scoreTitle')}</h1>
          <p className="text-2xl mb-6">{t('survey.score', { correct: correctCount, total: state.questions.length })}</p>
          <div className="space-y-2 mb-8 w-full max-w-md">
            {state.questions.map((q, i) => (
              <div key={q.id} className="flex items-center justify-between border-b border-border py-2 text-left">
                <div className="flex-1 mr-2 text-sm">
                  <KatexRenderer>{q.prompt.vi}</KatexRenderer>
                </div>
                {state.answers[i] === true ? (
                  <CheckIcon className="w-5 h-5 text-success" aria-label="Correct" />
                ) : state.answers[i] === false ? (
                  <XIcon className="w-5 h-5 text-danger" aria-label="Incorrect" />
                ) : (
                  <span className="text-text-subtle text-lg">—</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="rounded-full bg-primary text-primary-foreground px-6 py-2 text-sm font-medium"
            >
              {t('survey.retry')}
            </button>
            <button
              onClick={() => nav('/')}
              className="rounded-full border border-border text-text-secondary px-6 py-2 text-sm font-medium"
            >
              {t('survey.backToChat')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // playing
  const q = state.questions[state.currentIdx];
  return (
    <div className="min-h-screen pb-16 flex flex-col">
      <PageHeader title={`📝 ${t('survey.title')}`} onBack={() => nav('/')} />
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-secondary">
            {t('survey.progress', { current: state.currentIdx + 1, total: state.questions.length })}
          </span>
          <span className={`text-sm font-mono ${state.secondsLeft <= 10 ? 'text-danger' : 'text-text-secondary'}`}>
            {t('survey.timeLeft', { seconds: state.secondsLeft })}
          </span>
        </div>
        <div className="flex-1">
          <div className="text-base mb-6">
            <KatexRenderer>{q.prompt.vi}</KatexRenderer>
          </div>
          <div className="space-y-2">
            {(q.choices || []).map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(idx, q)}
                className="w-full text-left rounded-lg border border-border px-4 py-3 text-sm hover:bg-background"
              >
                {String.fromCharCode(65 + idx)}. {choice}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center mt-4">
          <button
            onClick={handleSkip}
            className="text-xs text-text-subtle underline"
          >
            {t('survey.skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
