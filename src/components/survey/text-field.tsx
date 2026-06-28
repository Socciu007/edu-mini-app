import React from 'react'

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  error?: string
}

export function TextField({ label, value, onChange, placeholder, maxLength, error }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border text-text rounded-lg px-3 py-2 text-sm bg-primary-foreground"
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  )
}
