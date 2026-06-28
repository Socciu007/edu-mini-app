import React from 'react'

import { UserAvatar } from './user-avatar'

interface Props {
  title: string
  subtitle: string
  buttonText: string
  onButtonClick: () => void
}

export function GradientHeader({ title, subtitle, buttonText, onButtonClick }: Props) {
  return (
    <header
      className="px-6 pt-8 pb-12 text-white"
      style={{ background: 'linear-gradient(to bottom right, var(--color-accent), var(--color-primary))' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <UserAvatar />
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-white/80">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onButtonClick}
        className="w-full bg-white text-primary font-medium py-2 rounded-lg border border-border"
      >
        {buttonText}
      </button>
    </header>
  )
}
