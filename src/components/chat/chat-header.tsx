import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/use-translation';
import { SUBJECT_BY_ID } from '../../constants/subjects';
import { useChatStore } from '../../stores/chat-store';
import type { SubjectId } from '../../providers/types';

interface Props {
  activeSubject?: SubjectId;
  onNewSession: () => void;
}

export function ChatHeader({ activeSubject, onNewSession }: Props) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const subj = activeSubject ? SUBJECT_BY_ID[activeSubject] : undefined;
  const setActiveSubject = useChatStore((s) => s.setActiveSubject);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
      <button onClick={() => nav(-1)} className="text-sm text-gray-600">
        ← {t('chat.back')}
      </button>
      <div className="flex items-center gap-2">
        {subj && <span className="text-lg">{subj.emoji}</span>}
        <span className="font-medium">{subj ? t(`subjects.${subj.id}`) : 'Edu Chat'}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNewSession} className="text-xs text-gray-600 underline">
          {t('chat.newSession')}
        </button>
        <button onClick={() => setActiveSubject(undefined)} className="text-xs text-gray-600 underline">
          {t('chat.changeSubject')}
        </button>
      </div>
    </div>
  );
}
