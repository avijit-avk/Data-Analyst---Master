import { useCallback, useEffect, useState } from 'react';
import { getLessonById } from '../data/lmsCurriculum';
import { LMS_LABS } from '../data/lmsLabs';
import { getQuizById } from '../data/lmsQuizzes';
import { evaluateOpenEndedSubmission, getOpenEndedTaskById } from '../data/openEndedTasks';
import { DEFAULT_PORTFOLIO_RUBRIC } from '../data/portfolioAndCareerData';
import {
  BehavioralAnswerRecord,
  JobApplicationEntry,
  JobGapAnalysisEntry,
  LmsLocalState,
  OpenEndedSubmissionRecord,
  PersonalSettings,
  PortfolioProject,
  PortfolioRubricKey,
  PracticeCheckStatus,
  QuizAttemptRecord,
  ResumeWorksheet,
  TimedAttemptRecord,
} from '../types/academy';
import { evaluatePracticeAnswer } from '../utils/practiceAnswerChecker';

export const STORAGE_KEY = 'data_analytics_masters_lms_v3';
export const LEGACY_STORAGE_KEY = 'data_analytics_masters_lms_v2';

export const DEFAULT_SETTINGS: PersonalSettings = {
  learnerName: '',
  targetRole: '',
  weeklyHoursGoal: null,
  cardDensity: 'comfortable',
  showModulePreview: true,
};

export const DEFAULT_RESUME_WORKSHEET: ResumeWorksheet = {
  targetRole: 'Data Analyst',
  professionalSummary: '',
  skills: '',
  toolsAndTechnologies: '',
  portfolioProjects: '',
  certificationsOrMentorship: '',
  priorExperienceAndBullets: '',
  education: '',
  links: '',
};

export const INITIAL_LMS_STATE: LmsLocalState = {
  schemaVersion: 3,
  completedLessonIds: [],
  lessonNotes: {},
  exerciseAnswers: {},
  exerciseCheckStatus: {},
  exerciseFeedback: {},
  labNotes: {},
  quizResults: {},
  openEndedSubmissions: {},
  timedAttempts: [],
  portfolioProjects: [],
  behavioralAnswers: [],
  resumeWorksheet: DEFAULT_RESUME_WORKSHEET,
  careerChecklist: {},
  jdGapAnalyses: [],
  jobApplications: [],
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

function asStr(val: unknown, fallback = ''): string {
  return typeof val === 'string' ? val : fallback;
}

function sanitizePortfolioProject(raw: unknown): PortfolioProject | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Partial<PortfolioProject>;
  if (typeof p.id !== 'string' || !p.id) return null;

  const rubric: Record<PortfolioRubricKey, boolean> = { ...DEFAULT_PORTFOLIO_RUBRIC };
  if (p.rubricSelfReview && typeof p.rubricSelfReview === 'object') {
    for (const k of Object.keys(DEFAULT_PORTFOLIO_RUBRIC) as PortfolioRubricKey[]) {
      if (typeof (p.rubricSelfReview as Record<string, unknown>)[k] === 'boolean') {
        rubric[k] = Boolean((p.rubricSelfReview as Record<string, unknown>)[k]);
      }
    }
  }

  return {
    id: p.id,
    templateId:
      p.templateId === 'retail-margin' ||
      p.templateId === 'operations-sla' ||
      p.templateId === 'banking-risk' ||
      p.templateId === 'hr-attrition' ||
      p.templateId === 'custom'
        ? p.templateId
        : 'custom',
    createdAt: asStr(p.createdAt, new Date().toISOString()),
    updatedAt: asStr(p.updatedAt, new Date().toISOString()),
    title: asStr(p.title),
    businessProblem: asStr(p.businessProblem),
    stakeholderPersona: asStr(p.stakeholderPersona),
    datasetDescription: asStr(p.datasetDescription),
    dataDictionary: asStr(p.dataDictionary),
    datasetGrain: asStr(p.datasetGrain),
    cleaningDecisions: asStr(p.cleaningDecisions),
    analysisQuestions: asStr(p.analysisQuestions),
    workNotes: asStr(p.workNotes),
    kpiDefinitions: asStr(p.kpiDefinitions),
    dashboardPlan: asStr(p.dashboardPlan),
    findings: asStr(p.findings),
    quantifiedRecommendations: asStr(p.quantifiedRecommendations),
    limitationsAndAssumptions: asStr(p.limitationsAndAssumptions),
    nextSteps: asStr(p.nextSteps),
    skillsDemonstrated: asStr(p.skillsDemonstrated),
    shortSummary: asStr(p.shortSummary),
    longCaseStudy: asStr(p.longCaseStudy),
    readmeDraft: asStr(p.readmeDraft),
    rubricSelfReview: rubric,
    learnerVerifiedOriginalWork: Boolean(p.learnerVerifiedOriginalWork),
  };
}

export function sanitizeState(raw: unknown): LmsLocalState {
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

  const openEndedSubmissions: Record<string, OpenEndedSubmissionRecord> = {};
  if (obj.openEndedSubmissions && typeof obj.openEndedSubmissions === 'object') {
    for (const [taskId, val] of Object.entries(obj.openEndedSubmissions)) {
      if (!val || typeof val !== 'object') continue;
      const rec = val as Partial<OpenEndedSubmissionRecord>;
      openEndedSubmissions[taskId] = {
        taskId,
        draftText: asStr(rec.draftText),
        submittedText: asStr(rec.submittedText),
        submittedAt: typeof rec.submittedAt === 'string' ? rec.submittedAt : null,
        attempts: typeof rec.attempts === 'number' ? rec.attempts : 0,
        automatedScorePercent:
          typeof rec.automatedScorePercent === 'number' ? rec.automatedScorePercent : null,
        automatedChecksSummary: Array.isArray(rec.automatedChecksSummary)
          ? rec.automatedChecksSummary.filter((s): s is string => typeof s === 'string')
          : [],
        selfRubricChecks: sanitizeRecord(
          rec.selfRubricChecks,
          (v): v is boolean => typeof v === 'boolean'
        ),
        combinedScorePercent:
          typeof rec.combinedScorePercent === 'number' ? rec.combinedScorePercent : null,
      };
    }
  }

  const timedAttempts: TimedAttemptRecord[] = Array.isArray(obj.timedAttempts)
    ? obj.timedAttempts
        .filter((a): a is TimedAttemptRecord => {
          return (
            Boolean(a) &&
            typeof a === 'object' &&
            typeof a.id === 'string' &&
            typeof a.challengeId === 'string' &&
            (a.language === 'sql' || a.language === 'python') &&
            typeof a.scorePercent === 'number'
          );
        })
        .slice(0, 100)
    : [];

  const portfolioProjects: PortfolioProject[] = Array.isArray(obj.portfolioProjects)
    ? obj.portfolioProjects
        .map(sanitizePortfolioProject)
        .filter((p): p is PortfolioProject => p !== null)
    : [];

  const behavioralAnswers: BehavioralAnswerRecord[] = Array.isArray(obj.behavioralAnswers)
    ? obj.behavioralAnswers.filter(
        (b): b is BehavioralAnswerRecord =>
          Boolean(b) &&
          typeof b === 'object' &&
          typeof b.id === 'string' &&
          typeof b.questionId === 'string'
      )
    : [];

  const rawResume = obj.resumeWorksheet as Partial<ResumeWorksheet> | undefined;
  const resumeWorksheet: ResumeWorksheet = {
    targetRole: asStr(rawResume?.targetRole, 'Data Analyst'),
    professionalSummary: asStr(rawResume?.professionalSummary),
    skills: asStr(rawResume?.skills),
    toolsAndTechnologies: asStr(rawResume?.toolsAndTechnologies),
    portfolioProjects: asStr(rawResume?.portfolioProjects),
    certificationsOrMentorship: asStr(rawResume?.certificationsOrMentorship),
    priorExperienceAndBullets: asStr(rawResume?.priorExperienceAndBullets),
    education: asStr(rawResume?.education),
    links: asStr(rawResume?.links),
  };

  const careerChecklist = sanitizeRecord(
    obj.careerChecklist,
    (v): v is boolean => typeof v === 'boolean'
  );

  const jdGapAnalyses: JobGapAnalysisEntry[] = Array.isArray(obj.jdGapAnalyses)
    ? obj.jdGapAnalyses.filter(
        (j): j is JobGapAnalysisEntry =>
          Boolean(j) && typeof j === 'object' && typeof j.id === 'string'
      )
    : [];

  const jobApplications: JobApplicationEntry[] = Array.isArray(obj.jobApplications)
    ? obj.jobApplications.filter(
        (j): j is JobApplicationEntry =>
          Boolean(j) && typeof j === 'object' && typeof j.id === 'string'
      )
    : [];

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
    schemaVersion: 3,
    completedLessonIds,
    lessonNotes,
    exerciseAnswers,
    exerciseCheckStatus,
    exerciseFeedback,
    labNotes,
    quizResults,
    openEndedSubmissions,
    timedAttempts,
    portfolioProjects,
    behavioralAnswers,
    resumeWorksheet,
    careerChecklist,
    jdGapAnalyses,
    jobApplications,
    settings,
  };
}

function readFromStorage(): LmsLocalState {
  if (typeof window === 'undefined') return INITIAL_LMS_STATE;
  try {
    const rawV3 = window.localStorage.getItem(STORAGE_KEY);
    if (rawV3) {
      return sanitizeState(JSON.parse(rawV3));
    }
    const rawV2 = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV2) {
      const migrated = sanitizeState(JSON.parse(rawV2));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return INITIAL_LMS_STATE;
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

  // ==========================================
  // PHASE 3: OPEN-ENDED EVALUATION ACTIONS
  // ==========================================
  const saveOpenEndedDraft = useCallback((taskId: string, draftText: string) => {
    setState((prev) => {
      const existing = prev.openEndedSubmissions[taskId];
      return {
        ...prev,
        openEndedSubmissions: {
          ...prev.openEndedSubmissions,
          [taskId]: {
            taskId,
            draftText,
            submittedText: existing?.submittedText ?? '',
            submittedAt: existing?.submittedAt ?? null,
            attempts: existing?.attempts ?? 0,
            automatedScorePercent: existing?.automatedScorePercent ?? null,
            automatedChecksSummary: existing?.automatedChecksSummary ?? [],
            selfRubricChecks: existing?.selfRubricChecks ?? {},
            combinedScorePercent: existing?.combinedScorePercent ?? null,
          },
        },
      };
    });
  }, []);

  const submitOpenEndedResponse = useCallback((taskId: string, textToSubmit?: string) => {
    const task = getOpenEndedTaskById(taskId);
    if (!task) return;
    setState((prev) => {
      const existing = prev.openEndedSubmissions[taskId];
      const text = textToSubmit ?? existing?.draftText ?? '';
      const selfRubric = existing?.selfRubricChecks ?? {};
      const evalRes = evaluateOpenEndedSubmission(task, text, selfRubric);
      return {
        ...prev,
        openEndedSubmissions: {
          ...prev.openEndedSubmissions,
          [taskId]: {
            taskId,
            draftText: text,
            submittedText: text,
            submittedAt: new Date().toISOString(),
            attempts: (existing?.attempts ?? 0) + 1,
            automatedScorePercent: evalRes.automatedScorePercent,
            automatedChecksSummary: evalRes.checksSummary,
            selfRubricChecks: selfRubric,
            combinedScorePercent: evalRes.combinedScorePercent,
          },
        },
      };
    });
  }, []);

  const toggleOpenEndedRubric = useCallback((taskId: string, criterionId: string) => {
    const task = getOpenEndedTaskById(taskId);
    if (!task) return;
    setState((prev) => {
      const existing = prev.openEndedSubmissions[taskId];
      const nextRubric = {
        ...(existing?.selfRubricChecks ?? {}),
        [criterionId]: !existing?.selfRubricChecks?.[criterionId],
      };
      const evalTargetText = existing?.submittedText || existing?.draftText || '';
      const evalRes = existing?.submittedAt
        ? evaluateOpenEndedSubmission(task, evalTargetText, nextRubric)
        : null;
      return {
        ...prev,
        openEndedSubmissions: {
          ...prev.openEndedSubmissions,
          [taskId]: {
            taskId,
            draftText: existing?.draftText ?? '',
            submittedText: existing?.submittedText ?? '',
            submittedAt: existing?.submittedAt ?? null,
            attempts: existing?.attempts ?? 0,
            automatedScorePercent:
              evalRes?.automatedScorePercent ?? existing?.automatedScorePercent ?? null,
            automatedChecksSummary:
              evalRes?.checksSummary ?? existing?.automatedChecksSummary ?? [],
            selfRubricChecks: nextRubric,
            combinedScorePercent:
              evalRes?.combinedScorePercent ?? existing?.combinedScorePercent ?? null,
          },
        },
      };
    });
  }, []);

  const resetOpenEndedTask = useCallback((taskId: string) => {
    setState((prev) => {
      const next = { ...prev.openEndedSubmissions };
      delete next[taskId];
      return {
        ...prev,
        openEndedSubmissions: next,
      };
    });
  }, []);

  // ==========================================
  // PHASE 4: TIMED LIVE-CODING PRACTICE
  // ==========================================
  const recordTimedAttempt = useCallback((attempt: TimedAttemptRecord) => {
    setState((prev) => ({
      ...prev,
      timedAttempts: [attempt, ...prev.timedAttempts].slice(0, 100),
    }));
  }, []);

  // ==========================================
  // PHASE 5: PORTFOLIO PROJECTS
  // ==========================================
  const upsertPortfolioProject = useCallback((project: PortfolioProject) => {
    setState((prev) => {
      const idx = prev.portfolioProjects.findIndex((p) => p.id === project.id);
      const updatedProject = { ...project, updatedAt: new Date().toISOString() };
      const nextList =
        idx >= 0
          ? prev.portfolioProjects.map((p, i) => (i === idx ? updatedProject : p))
          : [updatedProject, ...prev.portfolioProjects];
      return {
        ...prev,
        portfolioProjects: nextList,
      };
    });
  }, []);

  const deletePortfolioProject = useCallback((projectId: string) => {
    setState((prev) => ({
      ...prev,
      portfolioProjects: prev.portfolioProjects.filter((p) => p.id !== projectId),
    }));
  }, []);

  // ==========================================
  // PHASE 6: BEHAVIORAL INTERVIEW ANSWERS
  // ==========================================
  const saveBehavioralAnswer = useCallback((record: BehavioralAnswerRecord) => {
    setState((prev) => ({
      ...prev,
      behavioralAnswers: [record, ...prev.behavioralAnswers].slice(0, 100),
    }));
  }, []);

  const deleteBehavioralAnswer = useCallback((recordId: string) => {
    setState((prev) => ({
      ...prev,
      behavioralAnswers: prev.behavioralAnswers.filter((b) => b.id !== recordId),
    }));
  }, []);

  // ==========================================
  // PHASE 7: CAREER READINESS & TRACKER
  // ==========================================
  const updateResumeWorksheet = useCallback((patch: Partial<ResumeWorksheet>) => {
    setState((prev) => ({
      ...prev,
      resumeWorksheet: {
        ...prev.resumeWorksheet,
        ...patch,
      },
    }));
  }, []);

  const toggleCareerChecklistItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      careerChecklist: {
        ...prev.careerChecklist,
        [itemId]: !prev.careerChecklist[itemId],
      },
    }));
  }, []);

  const saveJdGapAnalysis = useCallback((entry: JobGapAnalysisEntry) => {
    setState((prev) => {
      const exists = prev.jdGapAnalyses.some((j) => j.id === entry.id);
      const next = exists
        ? prev.jdGapAnalyses.map((j) => (j.id === entry.id ? entry : j))
        : [entry, ...prev.jdGapAnalyses].slice(0, 25);
      return {
        ...prev,
        jdGapAnalyses: next,
      };
    });
  }, []);

  const deleteJdGapAnalysis = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      jdGapAnalyses: prev.jdGapAnalyses.filter((j) => j.id !== id),
    }));
  }, []);

  const upsertJobApplication = useCallback((entry: JobApplicationEntry) => {
    setState((prev) => {
      const exists = prev.jobApplications.some((j) => j.id === entry.id);
      const next = exists
        ? prev.jobApplications.map((j) => (j.id === entry.id ? entry : j))
        : [entry, ...prev.jobApplications];
      return {
        ...prev,
        jobApplications: next,
      };
    });
  }, []);

  const deleteJobApplication = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      jobApplications: prev.jobApplications.filter((j) => j.id !== id),
    }));
  }, []);

  // ==========================================
  // SETTINGS, BACKUP & RESET
  // ==========================================
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
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
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
    saveOpenEndedDraft,
    submitOpenEndedResponse,
    toggleOpenEndedRubric,
    resetOpenEndedTask,
    recordTimedAttempt,
    upsertPortfolioProject,
    deletePortfolioProject,
    saveBehavioralAnswer,
    deleteBehavioralAnswer,
    updateResumeWorksheet,
    toggleCareerChecklistItem,
    saveJdGapAnalysis,
    deleteJdGapAnalysis,
    upsertJobApplication,
    deleteJobApplication,
    updateSettings,
    importJsonBackup,
    resetProgressOnly,
    resetAllData,
  };
}
