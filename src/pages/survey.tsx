import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ResponsePanel } from '../components/survey/response-panel'
import { SurveyForm } from '../components/survey/survey-form'
import { PageHeader } from '../components/page-header'
import { useTranslation } from '../i18n/use-translation'
import { useSurveySubmit } from '../hooks/use-survey-submit'
import type { SurveyRequest, SurveyResponse } from '../services/survey-api'

export default function SurveyPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [response, setResponse] = useState<SurveyResponse | null>(null)
  const { isSubmitting, submit } = useSurveySubmit()

  async function handleSubmit(req: SurveyRequest) {
    const result = await submit(req)
    if (result) setResponse(result)
    return result
  }

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title={t('survey.headerTitle')} onBack={() => nav('/')} />
      <SurveyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      {response ? <ResponsePanel response={response} /> : null}
    </div>
  )
}