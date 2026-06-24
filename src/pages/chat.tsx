import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chat-store';
import { useSettingsStore } from '../stores/settings-store';
import { ChatHeader } from '../components/chat/chat-header';
import { ChatInput } from '../components/chat/chat-input';
import { MessageBubble } from '../components/chat/message-bubble';
import { EmptyState } from '../components/chat/empty-state';
import { useTranslation } from '../i18n/use-translation';

export default function ChatPage() {
  const { t } = useTranslation();
  const messages = useChatStore((s) => s.messages);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const activeSubject = useChatStore((s) => s.activeSubject);
  const reset = useChatStore((s) => s.reset);
  const preferredProvider = useSettingsStore((s) => s.preferredProvider);
  const language = useSettingsStore((s) => s.language);
  const aiReady = Boolean(import.meta.env.VITE_AI_API_KEY);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [messages.length]);

  return (
    <div className="h-screen flex flex-col">
      <ChatHeader activeSubject={activeSubject} onNewSession={reset} />
      {!aiReady && (
        <div className="bg-yellow-50 text-yellow-800 text-xs px-4 py-2 border-b border-yellow-200">
          {t('errors.aiNotConfigured')}
        </div>
      )}
      <div ref={listRef} className="flex-1 overflow-y-auto px-2 bg-gray-50">
        {messages.length === 0 ? (
          <EmptyState onPickPrompt={(p) => sendUserMessage(p)} />
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>
      <ChatInput onSend={(text) => sendUserMessage(text)} />
    </div>
  );
}
