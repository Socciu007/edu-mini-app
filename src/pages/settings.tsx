import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settings-store';
import { useChatStore } from '../stores/chat-store';
import { useTranslation } from '../i18n/use-translation';
import { LanguageToggle } from '../components/language-toggle';

export default function SettingsPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const preferredProvider = useSettingsStore((s) => s.preferredProvider);
  const setProvider = useSettingsStore((s) => s.setProvider);
  const resetChat = useChatStore((s) => s.reset);
  const aiReady = Boolean(import.meta.env.VITE_AI_API_KEY);

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => nav(-1)} className="text-sm text-gray-600 mr-4">←</button>
        <h1 className="text-lg font-bold">{t('settings.title')}</h1>
      </div>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('settings.language')}</h2>
        <LanguageToggle />
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('settings.aiStatus')}</h2>
        <div className={`text-sm ${aiReady ? 'text-green-600' : 'text-yellow-600'}`}>
          {aiReady ? `✅ ${t('settings.aiReady')}` : `⚠️ ${t('settings.aiNotConfigured')}`}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Model: {(import.meta.env.VITE_AI_MODEL as string) || 'gpt-4o-mini'}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('settings.provider')}</h2>
        <div className="flex flex-col gap-2">
          {(['auto', 'local', 'ai'] as const).map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="provider"
                checked={preferredProvider === p}
                onChange={() => setProvider(p)}
              />
              {t(`settings.provider${p[0].toUpperCase()}${p.slice(1)}` as any)}
            </label>
          ))}
        </div>
      </section>

      <button
        onClick={() => { resetChat(); nav('/'); }}
        className="w-full rounded-lg border border-red-300 text-red-600 py-2 text-sm"
      >
        {t('settings.reset')}
      </button>
    </div>
  );
}
