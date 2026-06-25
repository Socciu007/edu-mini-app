import React, { useEffect, useRef } from 'react'
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
  const reset = useChatStore((s) => s.reset)
  const aiReady = Boolean(import.meta.env.VITE_AI_API_KEY)

  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title={t('tabs.chat')}
        onBack={() => nav('/')}
        // right={
        //   <button onClick={reset} className="text-xs text-gray-600 no-underline">
        //     {t('chat.newSession')}
        //   </button>
        // }
      />
      {!aiReady && (
        <div className="bg-yellow-50 text-yellow-800 text-xs px-4 py-2 border-b border-yellow-200">
          {t('chat.aiNotConfiguredRandom')}
        </div>
      )}
      <div ref={listRef} className="flex-1 overflow-y-auto px-2 bg-gray-50 scrollbar-thin">
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
