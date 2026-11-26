import { useCallback, useEffect, useState } from 'react';
import { getLessonById } from '../data/lmsCurriculum';
import { LMS_LABS } from '../data/lmsLabs';
import { getQuizById } from '../data/lmsQuizzes';
import {
  LmsLocalState,
  PersonalSettings,
  PracticeCheckStatus,
  QuizAttemptRecord,
} from '../types/academy';
import { evaluatePracticeAnswer } from '../utils/practiceAnswerChecker';

const STORAGE_KEY = 'data_analytics_masters_lms_v2';

export const DEFAULT_SETTINGS: PersonalSettings = {
  learnerName: '',
  targetRole: '',
  weeklyHoursGoal: null,
  cardDensity: 'comfortable',
  showModulePreview: true,
};

export const INITIAL_LMS_STATE: LmsLocalState = {
  completedLessonIds: [],
  lessonNotes: {},
  exerciseAnswers: {},
  exerciseCheckStatus: {},
  exerciseFeedback: {},
  labNotes: {},
  quizResults: {},
  settings: DEFAULT_SETTINGS,
};

const VALID_EXERCISE_MAP = new Map(
  LMS_LABS.flatMap((lab) => lab.exercises.map((ex) => [ex.id, ex]))
);

function sanitizeRecord<T>(raw: unknown, check: (val: unknown) => val is T): Record<string, T> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, T> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (check(v)) {
      result[k] = v;
    }
  }
  return result;
}

function sanitizeState(raw: unknown): LmsLocalState {
  if (!raw || typeof raw !== 'object') return INITIAL_LMS_STATE;
  const obj = raw as Partial<LmsLocalState>;

  const completedLessonIds = Array.isArray(obj.completedLessonIds)
    ? Array.from(
        new Set(
          obj.completedLessonIds.filter(
            (id): id is string => typeof id === 'string' && Boolean(getLessonById(id))
          )
        )
      )
    : [];

  const lessonNotes = sanitizeRecord(
    obj.lessonNotes,
    (v): v is string => typeof v === 'string'
  );

  const exerciseAnswers = sanitizeRecord(
    obj.exerciseAnswers,
    (v): v is string => typeof v === 'string' && VALID_EXERCISE_MAP.size > 0
  );

  const exerciseCheckStatus = sanitizeRecord(
    obj.exerciseCheckStatus,
    (v): v is PracticeCheckStatus =>
      v === 'unchecked' || v === 'verified' || v === 'needs_review'
  );

  const exerciseFeedback = sanitizeRecord(
    obj.exerciseFeedback,
    (v): v is string => typeof v === 'string'
  );

  const labNotes = sanitizeRecord(
    obj.labNotes,
    (v): v is string => typeof v === 'string'
  );

  const quizResults: Record<string, QuizAttemptRecord> = {};
  if (obj.quizResults && typeof obj.quizResults === 'object') {
    for (const [quizId, val] of Object.entries(obj.quizResults)) {
      if (!getQuizById(quizId) || !val || typeof val !== 'object') continue;
      const rec = val as Partial<QuizAttemptRecord>;
      if (
        typeof rec.attempts === 'number' &&
        typeof rec.bestScorePercent === 'number' &&
        typeof rec.lastScorePercent === 'number' &&
        typeof rec.passed === 'boolean'
      ) {
        quizResults[quizId] = {
          attempts: rec.attempts,
          bestScorePercent: rec.bestScorePercent,
          lastScorePercent: rec.lastScorePercent,
          passed: rec.passed,
          lastAnswers: sanitizeRecord(
            rec.lastAnswers,
            (v): v is number => typeof v === 'number' && Number.isInteger(v)
          ),
          lastSubmittedAt:
            typeof rec.lastSubmittedAt === 'string'
              ? rec.lastSubmittedAt
              : new Date().toISOString(),
        };
      }
    }
  }

  const rawSettings = obj.settings;
  const settings: PersonalSettings = {
    learnerName:
      typeof rawSettings?.learnerName === 'string' ? rawSettings.learnerName : '',
    targetRole:
      typeof rawSettings?.targetRole === 'string' ? rawSettings.targetRole : '',
    weeklyHoursGoal:
      typeof rawSettings?.weeklyHoursGoal === 'number' &&
      rawSettings.weeklyHoursGoal > 0
        ? Math.min(rawSettings.weeklyHoursGoal, 60)
        : null,
    cardDensity:
      rawSettings?.cardDensity === 'compact' ? 'compact' : 'comfortable',
    showModulePreview:
      typeof rawSettings?.showModulePreview === 'boolean'
        ? rawSettings.showModulePreview
        : true,
  };

  return {
    completedLessonIds,
    lessonNotes,
    exerciseAnswers,
    exerciseCheckStatus,
    exerciseFeedback,
    labNotes,
    quizResults,
    settings,
  };
}

function readFromStorage(): LmsLocalState {
  if (typeof window === 'undefined') return INITIAL_LMS_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_LMS_STATE;
    return sanitizeState(JSON.parse(raw));
  } catch {
    return INITIAL_LMS_STATE;
  }
}

export function useLmsState() {
  const [state, setState] = useState<LmsLocalState>(() => readFromStorage());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors safely
    }
  }, [state]);

  const toggleLessonComplete = useCallback((lessonId: string) => {
    setState((prev) => {
      const exists = prev.completedLessonIds.includes(lessonId);
      return {
        ...prev,
        completedLessonIds: exists
          ? prev.completedLessonIds.filter((id) => id !== lessonId)
          : [...prev.completedLessonIds, lessonId],
      };
    });
  }, []);

  const setLessonComplete = useCallback((lessonId: string, complete: boolean) => {
    setState((prev) => {
      const exists = prev.completedLessonIds.includes(lessonId);
      if (complete && !exists) {
        return {
          ...prev,
          completedLessonIds: [...prev.completedLessonIds, lessonId],
        };
      }
      if (!complete && exists) {
        return {
          ...prev,
          completedLessonIds: prev.completedLessonIds.filter((id) => id !== lessonId),
        };
      }
      return prev;
    });
  }, []);

  const updateLessonNote = useCallback((lessonId: string, note: string) => {
    setState((prev) => ({
      ...prev,
      lessonNotes: {
        ...prev.lessonNotes,
        [lessonId]: note,
      },
    }));
  }, []);

  const updateExerciseAnswer = useCallback((exerciseId: string, answer: string) => {
    setState((prev) => {
      const nextStatus = { ...prev.exerciseCheckStatus };
      const nextFeedback = { ...prev.exerciseFeedback };
      delete nextStatus[exerciseId];
      delete nextFeedback[exerciseId];
      return {
        ...prev,
        exerciseAnswers: {
          ...prev.exerciseAnswers,
          [exerciseId]: answer,
        },
        exerciseCheckStatus: nextStatus,
        exerciseFeedback: nextFeedback,
      };
    });
  }, []);

  const checkExerciseAnswer = useCallback((exerciseId: string) => {
    const ex = VALID_EXERCISE_MAP.get(exerciseId);
    if (!ex) return;
    setState((prev) => {
      const answer = prev.exerciseAnswers[exerciseId] ?? '';
      const result = evaluatePracticeAnswer(answer, ex.validationRule);
      return {
        ...prev,
        exerciseCheckStatus: {
          ...prev.exerciseCheckStatus,
          [exerciseId]: result.status,
        },
        exerciseFeedback: {
          ...prev.exerciseFeedback,
          [exerciseId]: result.feedback,
        },
      };
    });
  }, []);

  const updateLabNote = useCallback((labId: string, note: string) => {
    setState((prev) => ({
      ...prev,
      labNotes: {
        ...prev.labNotes,
        [labId]: note,
      },
    }));
  }, []);

  const submitQuizAttempt = useCallback(
    (quizId: string, selectedAnswers: Record<string, number>) => {
      const quiz = getQuizById(quizId);
      if (!quiz || quiz.questions.length === 0) return;

      let correctCount = 0;
      for (const q of quiz.questions) {
        if (selectedAnswers[q.id] === q.correctIndex) {
          correctCount += 1;
        }
      }
      const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
      const passedNow = scorePercent >= quiz.passingPercent;

      setState((prev) => {
        const existing = prev.quizResults[quizId];
        return {
          ...prev,
          quizResults: {
            ...prev.quizResults,
            [quizId]: {
              attempts: (existing?.attempts ?? 0) + 1,
              bestScorePercent: Math.max(existing?.bestScorePercent ?? 0, scorePercent),
              lastScorePercent: scorePercent,
              passed: Boolean(existing?.passed || passedNow),
              lastAnswers: { ...selectedAnswers },
              lastSubmittedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    []
  );

  const updateSettings = useCallback((patch: Partial<PersonalSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...patch,
      },
    }));
  }, []);

  const importJsonBackup = useCallback(
    (rawJson: string): { ok: true } | { ok: false; error: string } => {
      try {
        const parsed = JSON.parse(rawJson);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return { ok: false, error: 'Backup file must contain a JSON object.' };
        }
        const sanitized = sanitizeState(parsed);
        setState(sanitized);
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: 'Could not parse JSON file. Select a valid Data Analytics Masters backup.',
        };
      }
    },
    []
  );

  const resetProgressOnly = useCallback(() => {
    setState((prev) => ({
      ...INITIAL_LMS_STATE,
      settings: prev.settings,
    }));
  }, []);

  const resetAllData = useCallback(() => {
    setState(INITIAL_LMS_STATE);
  }, []);

  return {
    state,
    toggleLessonComplete,
    setLessonComplete,
    updateLessonNote,
    updateExerciseAnswer,
    checkExerciseAnswer,
    updateLabNote,
    submitQuizAttempt,
    updateSettings,
    importJsonBackup,
    resetProgressOnly,
    resetAllData,
  };
}
