import React from 'react'

import CheckIcon from '@/static/icons/check.svg?react'
import XIcon from '@/static/icons/x.svg?react'

import type { ChatMessage } from '../../providers/types'
import { KatexRenderer } from '../katex-renderer'

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
          isUser ? 'bg-accent text-text-secondary' : 'bg-surface text-text-secondary'
        }`}
      >
        {message.feedback === 'correct' && (
          <CheckIcon className="inline w-4 h-4 mb-1 text-success" aria-label="Correct" />
        )}
        {message.feedback === 'incorrect' && (
          <XIcon className="inline w-4 h-4 mb-1 text-danger" aria-label="Incorrect" />
        )}
        <KatexRenderer>{message.content}</KatexRenderer>
      </div>
    </div>
  )
}
