import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '../components/page-header'
import { ResponsePanel } from '../components/survey/response-panel'
import { SurveyForm } from '../components/survey/survey-form'
import { useSurveySubmit } from '../hooks/use-survey-submit'
import { useTranslation } from '../i18n/use-translation'
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
    <div className="flex flex-col h-full">
      <PageHeader title={t('survey.headerTitle')} onBack={() => nav('/')} />
      <div className="overflow-y-auto pb-[5.5rem]">
        <SurveyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        {response ? <ResponsePanel response={response} /> : null}
      </div>
    </div>
  )
}
