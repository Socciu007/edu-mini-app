import React from 'react';
import { useChatStore } from '../stores/chat-store';
import { MessageBubble } from '../components/chat/message-bubble';
import { useTranslation } from '../i18n/use-translation';

function formatRelative(ts: number, lang: 'vi' | 'en'): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 30) return lang === 'vi' ? 'vừa xong' : 'just now';
  if (sec < 60) return lang === 'vi' ? `${sec} giây trước` : `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return lang === 'vi' ? `${min} phút trước` : `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return lang === 'vi' ? `${hr} giờ trước` : `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return lang === 'vi' ? `${d} ngày trước` : `${d}d ago`;
}

export default function ReviewPage() {
  const { t, language } = useTranslation();
  const messages = useChatStore((s) => s.messages);
  const asked = useChatStore((s) => s.stats.asked);
  const correct = useChatStore((s) => s.stats.correct);
  const accuracy = asked > 0 ? `${Math.round((correct / asked) * 100)}%` : '—';

  return (
    <div className="min-h-screen pb-16">
      <div className="border-b border-gray-200 px-4 py-3 bg-white">
        <h1 className="text-lg font-bold">📊 {t('review.title')}</h1>
      </div>

      <section className="p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-2">{t('review.stats')}</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500">{t('review.asked')}</div>
            <div className="text-2xl font-bold">{asked}</div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500">{t('review.correct')}</div>
            <div className="text-2xl font-bold">{correct}</div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500">{t('review.accuracy')}</div>
            <div className="text-2xl font-bold">{accuracy}</div>
          </div>
        </div>
      </section>

      <section className="p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-2">💬 {t('review.history')}</h2>
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            {t('review.empty')}
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((m) => (
              <div key={m.id}>
                <div className="text-[10px] text-gray-400 px-2">{formatRelative(m.createdAt, language)}</div>
                <MessageBubble message={m} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
