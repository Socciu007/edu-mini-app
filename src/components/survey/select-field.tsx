import React from 'react'

interface Option<V extends string | number> {
  value: V
  label: string
}

interface Props<V extends string | number> {
  label: string
  value: V | ''
  options: Option<V>[]
  onChange: (value: V) => void
  error?: string
}

export function SelectField<V extends string | number>({ label, value, options, onChange, error }: Props<V>) {
  // DOM <option> values are always strings, and select onChange delivers the
  // selected value as a string. We detect numeric V via the first option's
  // runtime type and coerce the string back to a number so callers receive
  // the original V type intact.
  const isNumeric = typeof options[0]?.value === 'number'

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const raw = e.target.value
          const v = (isNumeric ? Number(raw) : raw) as unknown as V
          onChange(v)
        }}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-primary-foreground"
      >
        <option className="text-text-secondary" value="" disabled>
          -
        </option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  )
}
