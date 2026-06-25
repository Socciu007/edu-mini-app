import React from 'react';
import { KatexRenderer } from '../katex-renderer';
import CheckIcon from '@/static/icons/check.svg?react';
import XIcon from '@/static/icons/x.svg?react';
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
        {message.feedback === 'correct' && (
          <CheckIcon
            className="inline w-4 h-4 mb-1 text-green-600"
            aria-label="Correct"
          />
        )}
        {message.feedback === 'incorrect' && (
          <XIcon
            className="inline w-4 h-4 mb-1 text-red-600"
            aria-label="Incorrect"
          />
        )}
        <KatexRenderer>{message.content}</KatexRenderer>
      </div>
    </div>
  );
}