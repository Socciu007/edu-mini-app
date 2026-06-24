import React from 'react';
import { SUBJECTS } from '../../constants/subjects';
import type { SubjectId } from '../../providers/types';
import { useTranslation } from '../../i18n/use-translation';

interface Props {
  active?: SubjectId;
  onPick: (id: SubjectId) => void;
}

export function SubjectChips({ active, onPick }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2">
      {SUBJECTS.map((s) => (
        <button
          key={s.id}
          onClick={() => onPick(s.id)}
          className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm whitespace-nowrap border ${
            active === s.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          <span>{s.emoji}</span>
          <span>{t(`subjects.${s.id}`)}</span>
        </button>
      ))}
    </div>
  );
}