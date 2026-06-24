import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/use-translation';
import { LanguageToggle } from '../components/language-toggle';
import { SubjectChips } from '../components/chat/subject-chips';
import { useChatStore } from '../stores/chat-store';
import type { SubjectId } from '../providers/types';

export default function HomePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const setActiveSubject = useChatStore((s) => s.setActiveSubject);
  const activeSubject = useChatStore((s) => s.activeSubject);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">🎓</div>
        <h1 className="text-2xl font-bold mb-2">{t('home.title')}</h1>
        <p className="text-gray-500 mb-8">{t('home.subtitle')}</p>
        <SubjectChips
          active={activeSubject}
          onPick={(id: SubjectId) => setActiveSubject(id)}
        />
        <button
          onClick={() => nav('/chat')}
          disabled={!activeSubject}
          className="mt-8 rounded-full bg-blue-500 text-white px-8 py-3 text-sm font-medium disabled:opacity-50"
        >
          {t('home.getStarted')}
        </button>
      </div>
    </div>
  );
}
