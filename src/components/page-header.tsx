import React from 'react'
import { useNavigate } from 'react-router-dom'

import ArrowLeft from '@/static/icons/arrow-left-circle.svg?react'

interface Props {
  title: string
  onBack?: () => void
  right?: React.ReactNode
}

export function PageHeader({ title, onBack, right }: Props) {
  const nav = useNavigate()
  const showBack = Boolean(onBack)
  const handleBack = onBack ?? (() => nav(-1))
  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-2 py-3 bg-header z-20">
      {showBack ? (
        <button onClick={handleBack} className="w-16 bg-transparent text-left border-none" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
      ) : (
        <div className="w-16" />
      )}
      <h1 className="text-lg font-bold flex-1 text-center">{title}</h1>
      <div>{right}</div>
    </header>
  )
}
