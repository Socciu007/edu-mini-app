import React, { useRef, useState } from 'react'

import { useTranslation } from '../../i18n/use-translation'

interface Props {
  label: string
  files: File[]
  onChange: (files: File[]) => void
  maxFiles: number
  maxSizeBytes: number
  accept: string[]
  hint?: string
  error?: string
}

export function FilePickerField({ label, files, onChange, maxFiles, maxSizeBytes, accept, hint, error }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const shownError = error ?? localError

  function handlePick(next: FileList | null) {
    if (!next || next.length === 0) return
    const incoming = Array.from(next)

    if (files.length + incoming.length > maxFiles) {
      setLocalError(t('survey.form.errors.tooManyFiles'))
      return
    }

    for (const f of incoming) {
      if (f.size > maxSizeBytes) {
        setLocalError(t('survey.form.errors.fileTooLarge', { name: f.name }))
        return
      }
      if (!accept.includes(f.type)) {
        setLocalError(t('survey.form.errors.fileTypeInvalid', { name: f.name }))
        return
      }
    }

    setLocalError(null)
    onChange([...files, ...incoming])
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      {hint ? <span className="text-xs text-text-subtle">{hint}</span> : null}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept.join(',')}
        onChange={(e) => {
          handlePick(e.target.files)
          e.target.value = ''
        }}
        className="hidden"
        aria-label={t('survey.form.pickFile')}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="self-start bg-primary-foreground rounded-full border border-border text-text px-4 py-2 text-xs"
      >
        {t('survey.form.pickFile')}
      </button>
      <span className="text-xs text-text-subtle">{t('survey.form.filesCount', { count: files.length })}</span>
      <ul className="flex flex-col gap-1">
        {files.map((f, idx) => (
          <li
            key={`${f.name}-${idx}`}
            className="flex items-center justify-between text-sm bg-surface px-3 py-2 rounded"
          >
            <span className="truncate mr-2">
              {f.name} ({Math.max(1, Math.round(f.size / 1024))} KB)
            </span>
            <button
              type="button"
              onClick={() => onChange(files.filter((_, i) => i !== idx))}
              className="text-xs text-text-subtle underline"
            >
              {t('survey.form.remove')}
            </button>
          </li>
        ))}
      </ul>
      {shownError ? <span className="text-xs text-danger">{shownError}</span> : null}
    </div>
  )
}
