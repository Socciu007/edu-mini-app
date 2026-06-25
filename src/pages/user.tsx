import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settings-store';
import { useChatStore } from '../stores/chat-store';
import { useTranslation } from '../i18n/use-translation';
import { LanguageToggle } from '../components/language-toggle';
import { PageHeader } from '../components/page-header';

export default function UserPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const preferredProvider = useSettingsStore((s) => s.preferredProvider);
  const setProvider = useSettingsStore((s) => s.setProvider);
  const resetChat = useChatStore((s) => s.reset);
  const aiReady = Boolean(import.meta.env.VITE_AI_API_KEY);

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title={`👤 ${t('user.title')}`} onBack={() => nav('/')} />
      <div className="p-4">
      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('user.language')}</h2>
        <LanguageToggle />
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('user.aiStatus')}</h2>
        <div className={`text-sm ${aiReady ? 'text-green-600' : 'text-yellow-600'}`}>
          {aiReady ? `✅ ${t('user.aiReady')}` : `⚠️ ${t('user.aiNotConfigured')}`}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Model: {(import.meta.env.VITE_AI_MODEL as string) || 'gpt-4o-mini'}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('user.provider')}</h2>
        <div className="flex flex-col gap-2">
          {(['auto', 'local', 'ai'] as const).map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="provider"
                checked={preferredProvider === p}
                onChange={() => setProvider(p)}
              />
              {t(`user.provider${p[0].toUpperCase()}${p.slice(1)}` as any)}
            </label>
          ))}
        </div>
      </section>

      <button
        onClick={() => { resetChat(); nav('/'); }}
        className="w-full rounded-lg border border-red-300 text-red-600 py-2 text-sm"
      >
        {t('user.reset')}
      </button>
      </div>
    </div>
  );
}
