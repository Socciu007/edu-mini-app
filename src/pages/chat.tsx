import React, { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { ChatInput } from '../components/chat/chat-input'
import { EmptyState } from '../components/chat/empty-state'
import { MessageBubble } from '../components/chat/message-bubble'
import { PageHeader } from '../components/page-header'
import { useTranslation } from '../i18n/use-translation'
import { useChatStore } from '../stores/chat-store'

export default function ChatPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const messages = useChatStore((s) => s.messages)
  const sendUserMessage = useChatStore((s) => s.sendUserMessage)
  // const reset = useChatStore((s) => s.reset)
  const aiReady = Boolean(import.meta.env.VITE_AI_API_KEY)

  const listRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!listRef.current) return

    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('tabs.chat')} onBack={() => nav('/')} />
      {!aiReady && (
        <div className="bg-[#FEF9C3] text-[#000] text-xs px-4 py-2 border-b border-border">
          {t('chat.aiNotConfiguredRandom')}
        </div>
      )}
      <div ref={listRef} className="flex-1 overflow-y-auto px-2 bg-background pb-4">
        {messages.length === 0 ? (
          <EmptyState onPickPrompt={(p) => sendUserMessage(p)} />
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>
      <ChatInput onSend={(text) => sendUserMessage(text)} />
    </div>
  )
}
