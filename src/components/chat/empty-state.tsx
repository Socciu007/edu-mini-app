import React from 'react';
import { useTranslation } from '../../i18n/use-translation';

interface Props {
  onPickPrompt: (text: string) => void;
}

export function EmptyState({ onPickPrompt }: Props) {
  const { t, tValue } = useTranslation();
  const prompts = tValue('chat.starterPrompts') as unknown;
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center text-text-subtle">
      <div className="text-5xl mb-4">🎓</div>
      <p className="mb-6">{t('chat.empty')}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.isArray(prompts) && (prompts as string[]).map((p, i) => (
          <button
            key={i}
            onClick={() => onPickPrompt(p)}
            className="rounded-full border border-border px-3 py-1 text-xs hover:bg-background"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
