import React, { useState } from 'react';
import { SelectField } from './select-field';
import { TextField } from './text-field';
import { FilePickerField } from './file-picker-field';
import { useTranslation } from '../../i18n/use-translation';
import { GRADES, type Grade } from '../../constants/grades';
import { SUBJECTS } from '../../constants/subjects';
import type { Difficulty, SubjectId } from '../../providers/types';
import type { SurveyRequest, SurveyResponse } from '../../services/survey-api';

interface Props {
  onSubmit: (req: SurveyRequest) => Promise<SurveyResponse | null> | SurveyResponse | null;
  isSubmitting: boolean;
}

const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];
const MAX_FILES = 3;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface FormState {
  subject: SubjectId | '';
  grade: Grade | '';
  lesson: string;
  difficulty: Difficulty | '';
  documents: File[];
}

const EMPTY: FormState = { subject: '', grade: '', lesson: '', difficulty: '', documents: [] };

type ErrorKey =
  | 'subjectRequired'
  | 'gradeRequired'
  | 'lessonRequired'
  | 'lessonTooShort'
  | 'difficultyRequired'
  | 'documentsRequired';

export function SurveyForm({ onSubmit, isSubmitting }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, ErrorKey>>>({});

  function validate(state: FormState) {
    const e: Partial<Record<keyof FormState, ErrorKey>> = {};
    if (!state.subject) e.subject = 'subjectRequired';
    if (!state.grade) e.grade = 'gradeRequired';
    if (!state.lesson.trim()) e.lesson = 'lessonRequired';
    else if (state.lesson.trim().length < 3) e.lesson = 'lessonTooShort';
    if (!state.difficulty) e.difficulty = 'difficultyRequired';
    if (state.documents.length < 1) e.documents = 'documentsRequired';
    return e;
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = validate(form);
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }
    const req: SurveyRequest = {
      subject: form.subject as SubjectId,
      grade: form.grade as Grade,
      lesson: form.lesson.trim(),
      difficulty: form.difficulty as Difficulty,
      documents: form.documents,
    };
    const result = await onSubmit(req);
    if (result) {
      setForm(EMPTY);
      setErrors({});
    }
  }

  const subjectOptions = SUBJECTS.map((s) => ({ value: s.id, label: s.name.vi }));
  const gradeOptions = GRADES.map((g) => ({ value: g, label: String(g) }));
  const difficultyOptions: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: t('survey.form.easy') },
    { value: 'medium', label: t('survey.form.medium') },
    { value: 'hard', label: t('survey.form.hard') },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <SelectField
        label={t('survey.form.subject')}
        value={form.subject}
        options={subjectOptions}
        onChange={(v) => update('subject', v as SubjectId)}
        error={errors.subject ? t(`survey.form.errors.${errors.subject}`) : undefined}
      />
      <SelectField
        label={t('survey.form.grade')}
        value={form.grade}
        options={gradeOptions}
        onChange={(v) => update('grade', v as Grade)}
        error={errors.grade ? t(`survey.form.errors.${errors.grade}`) : undefined}
      />
      <TextField
        label={t('survey.form.lesson')}
        value={form.lesson}
        onChange={(v) => update('lesson', v)}
        maxLength={200}
        error={errors.lesson ? t(`survey.form.errors.${errors.lesson}`) : undefined}
      />
      <SelectField
        label={t('survey.form.difficulty')}
        value={form.difficulty}
        options={difficultyOptions}
        onChange={(v) => update('difficulty', v as Difficulty)}
        error={errors.difficulty ? t(`survey.form.errors.${errors.difficulty}`) : undefined}
      />
      <FilePickerField
        label={t('survey.form.documents')}
        hint={t('survey.form.documentsHint')}
        files={form.documents}
        onChange={(files) => update('documents', files)}
        maxFiles={MAX_FILES}
        maxSizeBytes={MAX_SIZE_BYTES}
        accept={ACCEPTED_MIME}
        error={errors.documents ? t(`survey.form.errors.${errors.documents}`) : undefined}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium disabled:opacity-50"
      >
        {isSubmitting ? t('survey.form.submitting') : t('survey.form.submit')}
      </button>
    </form>
  );
}