import { useCallback, useState } from 'react';
import { useSnackbar } from 'zmp-ui';
import { submitSurvey, type SurveyRequest, type SurveyResponse } from '../services/survey-api';

export type SurveyFormShape = {
  subject?: SurveyRequest['subject'];
  grade?: SurveyRequest['grade'];
  lesson: string;
  difficulty?: SurveyRequest['difficulty'];
  documents: File[];
};

export type SurveyErrors = Partial<Record<keyof SurveyFormShape, string>>;

function validate(form: SurveyFormShape): SurveyErrors {
  const errors: SurveyErrors = {};
  if (!form.subject) errors.subject = 'subjectRequired';
  if (!form.grade) errors.grade = 'gradeRequired';
  if (!form.lesson.trim()) errors.lesson = 'lessonRequired';
  else if (form.lesson.trim().length < 3) errors.lesson = 'lessonTooShort';
  if (!form.difficulty) errors.difficulty = 'difficultyRequired';
  if (form.documents.length < 1) errors.documents = 'documentsRequired';
  return errors;
}

export interface UseSurveySubmitResult {
  isSubmitting: boolean;
  submit(form: SurveyFormShape): Promise<SurveyResponse | null>;
}

export function useSurveySubmit(): UseSurveySubmitResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const snackbar = useSnackbar();

  const submit = useCallback(
    async (form: SurveyFormShape): Promise<SurveyResponse | null> => {
      const errors = validate(form);
      if (Object.keys(errors).length > 0) {
        // Surface a generic error snackbar; per-field errors are handled in SurveyForm.
        snackbar.openSnackbar({ text: 'survey.form.toastError', type: 'error' });
        return null;
      }

      setIsSubmitting(true);
      try {
        const response = await submitSurvey(form as SurveyRequest);
        snackbar.openSnackbar({ text: 'survey.form.toastSuccess', type: 'success' });
        return response;
      } catch {
        snackbar.openSnackbar({ text: 'survey.form.toastError', type: 'error' });
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [snackbar],
  );

  return { isSubmitting, submit };
}
