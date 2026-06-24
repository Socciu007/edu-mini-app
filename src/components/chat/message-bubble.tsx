import React from 'react';
import { KatexRenderer } from '../katex-renderer';
import type { ChatMessage } from '../../providers/types';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message.feedback === 'correct' && <div className="text-xs mb-1 opacity-75">✅</div>}
        {message.feedback === 'incorrect' && <div className="text-xs mb-1 opacity-75">❌</div>}
        <KatexRenderer>{message.content}</KatexRenderer>
      </div>
    </div>
  );
}
