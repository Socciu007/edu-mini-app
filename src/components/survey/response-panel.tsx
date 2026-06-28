import React from 'react'

import { useTranslation } from '../../i18n/use-translation'
import type { SurveyResponse } from '../../services/survey-api'
import { useSettingsStore } from '../../stores/settings-store'

interface Props {
  response: SurveyResponse
}

export function ResponsePanel({ response }: Props) {
  const { t } = useTranslation()
  const language = useSettingsStore((s) => s.language)

  const dateText = new Date(response.receivedAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')
  const statusClass = response.status === 'accepted' ? 'text-success' : 'text-warning'

  return (
    <section
      aria-label={t('survey.form.responseTitle')}
      className="mt-6 p-4 rounded-xl bg-surface border border-border"
    >
      <h3 className="text-sm font-semibold mb-3">{t('survey.form.responseTitle')}</h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-text-subtle">{t('survey.form.responseSurveyId')}</dt>
        <dd className="font-mono break-all">{response.surveyId}</dd>

        <dt className="text-text-subtle">{t('survey.form.responseStatus')}</dt>
        <dd className={statusClass}>{response.status}</dd>

        <dt className="text-text-subtle">{t('survey.form.responseReceivedAt')}</dt>
        <dd>{dateText}</dd>
      </dl>
    </section>
  )
}
