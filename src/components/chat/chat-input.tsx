import React, { useState } from 'react'

import { useTranslation } from '../../i18n/use-translation'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState('')

  const submit = () => {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex items-center gap-2 border-border p-2 bg-background fixed bottom-14 left-0 right-0">
      <textarea
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        placeholder={t('chat.placeholder')}
        className="flex-1 resize-none border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border"
        disabled={disabled}
      />
      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="rounded-lg bg-primary border-border text-text-secondary px-4 py-2 text-sm disabled:opacity-60"
      >
        {t('chat.send')}
      </button>
    </div>
  )
}
