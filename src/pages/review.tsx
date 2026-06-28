import React from 'react'
import { useNavigate } from 'react-router-dom'

import { MessageBubble } from '../components/chat/message-bubble'
import { PageHeader } from '../components/page-header'
import { useTranslation } from '../i18n/use-translation'
import { useChatStore } from '../stores/chat-store'

function formatRelative(ts: number, lang: 'vi' | 'en'): string {
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  if (sec < 30) return lang === 'vi' ? 'vừa xong' : 'just now'
  if (sec < 60) return lang === 'vi' ? `${sec} giây trước` : `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return lang === 'vi' ? `${min} phút trước` : `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return lang === 'vi' ? `${hr} giờ trước` : `${hr}h ago`
  const d = Math.floor(hr / 24)
  return lang === 'vi' ? `${d} ngày trước` : `${d}d ago`
}

export default function ReviewPage() {
  const { t, language } = useTranslation()
  const messages = useChatStore((s) => s.messages)
  const asked = useChatStore((s) => s.stats.asked)
  const correct = useChatStore((s) => s.stats.correct)
  const accuracy = asked > 0 ? `${Math.round((correct / asked) * 100)}%` : '-'
  const nav = useNavigate()

  return (
    <div className="pb-16">
      <PageHeader title={t('review.title')} onBack={() => nav(-1)} />

      <section className="p-4">
        <h2 className="text-sm font-medium text-text-secondary mb-2">{t('review.stats')}</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border p-3 bg-accent-soft">
            <div className="text-xs text-text">{t('review.asked')}</div>
            <div className="text-2xl font-bold">{asked}</div>
          </div>
          <div className="rounded-lg border border-border p-3 bg-accent-soft">
            <div className="text-xs text-text">{t('review.correct')}</div>
            <div className="text-2xl font-bold">{correct}</div>
          </div>
          <div className="rounded-lg border border-border p-3 bg-accent-soft">
            <div className="text-xs text-text">{t('review.accuracy')}</div>
            <div className="text-2xl font-bold">{accuracy}</div>
          </div>
        </div>
      </section>

      <section className="p-4">
        <h2 className="text-sm font-medium text-text-secondary mb-2">💬 {t('review.history')}</h2>
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-text-subtle">
            {t('review.empty')}
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((m) => (
              <div key={m.id}>
                <div className="text-[10px] text-text-subtle px-2">{formatRelative(m.createdAt, language)}</div>
                <MessageBubble message={m} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
