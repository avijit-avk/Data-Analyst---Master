import { useCallback, useEffect, useState } from 'react';
import { COURSES, PRACTICE_LAB_PREVIEWS } from '../data/curriculum';
import {
  AcademyLocalState,
  CourseProgressEntry,
  CourseStatus,
  PersonalLinkFormat,
  PersonalSettings,
  PersonalStudyLink,
  PracticeAnswerSubmission,
  PracticePrompt,
} from '../types/academy';
import { evaluatePracticeAnswer } from '../utils/practiceAnswerChecker';
import { autoAssignStudyResource } from '../utils/resourceMatcher';
import {
  buildYouTubeTimestampUrl,
  extractTimestampFromYouTubeUrl,
  isYouTubeUrl,
} from '../utils/youtubeOembed';

const STORAGE_KEY = 'dam_personal_edition_v1';

const VALID_PERSONAL_FORMATS: PersonalLinkFormat[] = [
  'Video',
  'NotebookLM',
  'Article',
  'Practice',
];

export interface NewPersonalLinkInput {
  courseId: string;
  label: string;
  url: string;
  format: PersonalLinkFormat;
  moduleIds: string[];
  startSeconds?: number | null;
}

export function normalizeSafeHttpUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const candidate =
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function createInitialCourseProgress(): Record<string, CourseProgressEntry> {
  const entries: Record<string, CourseProgressEntry> = {};
  for (const course of COURSES) {
    entries[course.id] = {
      status: 'not_started',
      completedModuleIds: [],
      notes: '',
      bookmarked: false,
      personalLinks: [],
      updatedAt: null,
    };
  }
  return entries;
}

const PRACTICE_PROMPT_MAP = new Map<string, PracticePrompt>(
  PRACTICE_LAB_PREVIEWS.flatMap((lab) =>
    lab.topics.flatMap((topic) =>
      topic.prompts.map((prompt) => [prompt.id, prompt] as const)
    )
  )
);

const VALID_PRACTICE_PROMPT_IDS = new Set(PRACTICE_PROMPT_MAP.keys());

const VALID_PRACTICE_MODULE_IDS = new Set(
  PRACTICE_LAB_PREVIEWS.flatMap((lab) => lab.topics.map((topic) => topic.moduleId))
);

function syncPracticedLabIds(practicedPromptIds: string[]): string[] {
  const checkedSet = new Set(practicedPromptIds);
  return PRACTICE_LAB_PREVIEWS.filter((lab) => {
    const promptIds = lab.topics.flatMap((t) => t.prompts.map((p) => p.id));
    return promptIds.length > 0 && promptIds.every((id) => checkedSet.has(id));
  }).map((lab) => lab.id);
}

export function createDefaultAcademyState(): AcademyLocalState {
  return {
    version: 1,
    settings: {
      learnerName: '',
      targetRole: '',
      weeklyHoursGoal: null,
      cardDensity: 'comfortable',
      showModulePreview: true,
      focusCourseId: null,
    },
    courseProgress: createInitialCourseProgress(),
    practicedLabIds: [],
    practicedPromptIds: [],
    practiceTopicNotes: {},
    practicePromptAnswers: {},
    completedInterviewItemIds: [],
    practiceScratchpad: '',
  };
}

function sanitizePersonalLinks(
  rawLinks: unknown,
  courseId: string,
  validModuleIds: Set<string>,
  defaultModuleId: string
): PersonalStudyLink[] {
  if (!Array.isArray(rawLinks)) return [];
  const validLinks: PersonalStudyLink[] = [];

  for (const item of rawLinks) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as Partial<PersonalStudyLink> & {
      moduleId?: unknown;
    };
    if (typeof candidate.label !== 'string' || typeof candidate.url !== 'string') {
      continue;
    }
    const label = candidate.label.trim();
    const safeUrl = normalizeSafeHttpUrl(candidate.url);
    if (!label || !safeUrl) continue;

    const format: PersonalLinkFormat = VALID_PERSONAL_FORMATS.includes(
      candidate.format as PersonalLinkFormat
    )
      ? (candidate.format as PersonalLinkFormat)
      : 'Article';

    let moduleIds: string[] = [];
    if (Array.isArray(candidate.moduleIds)) {
      moduleIds = Array.from(
        new Set(
          candidate.moduleIds.filter(
            (id): id is string => typeof id === 'string' && validModuleIds.has(id)
          )
        )
      );
    } else if (
      typeof candidate.moduleId === 'string' &&
      validModuleIds.has(candidate.moduleId)
    ) {
      moduleIds = [candidate.moduleId];
    }

    if (moduleIds.length === 0) {
      const matched = autoAssignStudyResource(label, safeUrl, courseId);
      moduleIds =
        matched.course.id === courseId
          ? matched.modules.map((m) => m.id)
          : [defaultModuleId];
    }

    let startSeconds: number | null =
      typeof candidate.startSeconds === 'number' &&
      Number.isFinite(candidate.startSeconds) &&
      candidate.startSeconds >= 0
        ? Math.floor(candidate.startSeconds)
        : null;

    if (startSeconds === null && isYouTubeUrl(safeUrl)) {
      startSeconds = extractTimestampFromYouTubeUrl(safeUrl);
    }

    validLinks.push({
      id:
        typeof candidate.id === 'string' && candidate.id.trim()
          ? candidate.id
          : `link-${validLinks.length}-${Date.now()}`,
      label,
      url: safeUrl,
      format,
      moduleIds,
      startSeconds,
      addedAt:
        typeof candidate.addedAt === 'string'
          ? candidate.addedAt
          : new Date().toISOString(),
    });
  }

  return validLinks;
}

function hydrateState(raw: string | null): AcademyLocalState {
  const fallback = createDefaultAcademyState();
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AcademyLocalState>;
    const mergedProgress = createInitialCourseProgress();

    if (parsed.courseProgress && typeof parsed.courseProgress === 'object') {
      for (const course of COURSES) {
        const existing = parsed.courseProgress[course.id];
        if (existing && typeof existing === 'object') {
          const validModuleIds = new Set(course.modules.map((m) => m.id));
          const completedModuleIds = Array.isArray(existing.completedModuleIds)
            ? existing.completedModuleIds.filter(
                (id): id is string => typeof id === 'string' && validModuleIds.has(id)
              )
            : [];
          const status: CourseStatus =
            existing.status === 'completed' ||
            existing.status === 'in_progress' ||
            existing.status === 'not_started'
              ? existing.status
              : 'not_started';

          mergedProgress[course.id] = {
            status,
            completedModuleIds,
            notes: typeof existing.notes === 'string' ? existing.notes : '',
            bookmarked: Boolean(existing.bookmarked),
            personalLinks: sanitizePersonalLinks(
              existing.personalLinks,
              course.id,
              validModuleIds,
              course.modules[0].id
            ),
            updatedAt: typeof existing.updatedAt === 'string' ? existing.updatedAt : null,
          };
        }
      }
    }

    const rawLegacyLabIds = Array.isArray(parsed.practicedLabIds)
      ? parsed.practicedLabIds.filter((id): id is string => typeof id === 'string')
      : [];

    let practicedPromptIds: string[] = [];
    if (Array.isArray(parsed.practicedPromptIds)) {
      practicedPromptIds = Array.from(
        new Set(
          parsed.practicedPromptIds.filter(
            (id): id is string =>
              typeof id === 'string' && VALID_PRACTICE_PROMPT_IDS.has(id)
          )
        )
      );
    } else if (rawLegacyLabIds.length > 0) {
      // Preserve legacy drill-level completion marks when migrating older saves
      const legacySet = new Set(rawLegacyLabIds);
      practicedPromptIds = PRACTICE_LAB_PREVIEWS.filter((lab) =>
        legacySet.has(lab.id)
      ).flatMap((lab) => lab.topics.flatMap((t) => t.prompts.map((p) => p.id)));
    }

    const practiceTopicNotes: Record<string, string> = {};
    if (parsed.practiceTopicNotes && typeof parsed.practiceTopicNotes === 'object') {
      for (const [moduleId, noteValue] of Object.entries(parsed.practiceTopicNotes)) {
        if (VALID_PRACTICE_MODULE_IDS.has(moduleId) && typeof noteValue === 'string') {
          practiceTopicNotes[moduleId] = noteValue;
        }
      }
    }

    const practicePromptAnswers: Record<string, PracticeAnswerSubmission> = {};
    if (
      parsed.practicePromptAnswers &&
      typeof parsed.practicePromptAnswers === 'object'
    ) {
      for (const [promptId, rawSubmission] of Object.entries(
        parsed.practicePromptAnswers
      )) {
        if (
          !VALID_PRACTICE_PROMPT_IDS.has(promptId) ||
          !rawSubmission ||
          typeof rawSubmission !== 'object'
        ) {
          continue;
        }
        const sub = rawSubmission as Partial<PracticeAnswerSubmission>;
        const answerText = typeof sub.answerText === 'string' ? sub.answerText : '';
        const status =
          sub.status === 'verified' || sub.status === 'needs_review'
            ? sub.status
            : null;
        practicePromptAnswers[promptId] = {
          answerText,
          status,
          feedback: typeof sub.feedback === 'string' ? sub.feedback : null,
          checkedAt: typeof sub.checkedAt === 'string' ? sub.checkedAt : null,
        };
      }
    }

    return {
      version: 1,
      settings: {
        learnerName:
          typeof parsed.settings?.learnerName === 'string'
            ? parsed.settings.learnerName
            : fallback.settings.learnerName,
        targetRole:
          typeof parsed.settings?.targetRole === 'string'
            ? parsed.settings.targetRole
            : fallback.settings.targetRole,
        weeklyHoursGoal:
          typeof parsed.settings?.weeklyHoursGoal === 'number' &&
          parsed.settings.weeklyHoursGoal > 0
            ? parsed.settings.weeklyHoursGoal
            : null,
        cardDensity:
          parsed.settings?.cardDensity === 'compact' ? 'compact' : 'comfortable',
        showModulePreview:
          typeof parsed.settings?.showModulePreview === 'boolean'
            ? parsed.settings.showModulePreview
            : true,
        focusCourseId:
          typeof parsed.settings?.focusCourseId === 'string' &&
          COURSES.some((c) => c.id === parsed.settings?.focusCourseId)
            ? parsed.settings.focusCourseId
            : null,
      },
      courseProgress: mergedProgress,
      practicedLabIds: syncPracticedLabIds(practicedPromptIds),
      practicedPromptIds,
      practiceTopicNotes,
      practicePromptAnswers,
      completedInterviewItemIds: Array.isArray(parsed.completedInterviewItemIds)
        ? parsed.completedInterviewItemIds.filter(
            (id): id is string => typeof id === 'string'
          )
        : [],
      practiceScratchpad:
        typeof parsed.practiceScratchpad === 'string'
          ? parsed.practiceScratchpad
          : '',
    };
  } catch {
    return fallback;
  }
}

function buildFinalLinkEntry(input: NewPersonalLinkInput, suffix: string): PersonalStudyLink | null {
  const course = COURSES.find((c) => c.id === input.courseId);
  if (!course) return null;

  const cleanLabel = input.label.trim();
  const safeBaseUrl = normalizeSafeHttpUrl(input.url);
  if (!cleanLabel || !safeBaseUrl) return null;

  const validIdSet = new Set(course.modules.map((m) => m.id));
  const cleanModuleIds = Array.from(
    new Set(input.moduleIds.filter((id) => validIdSet.has(id)))
  );
  if (cleanModuleIds.length === 0) return null;

  const normalizedSeconds =
    typeof input.startSeconds === 'number' &&
    Number.isFinite(input.startSeconds) &&
    input.startSeconds >= 0
      ? Math.floor(input.startSeconds)
      : null;

  const finalUrl = isYouTubeUrl(safeBaseUrl)
    ? buildYouTubeTimestampUrl(safeBaseUrl, normalizedSeconds)
    : safeBaseUrl;

  return {
    id: `link-${Date.now()}-${suffix}`,
    label: cleanLabel,
    url: finalUrl,
    format: input.format,
    moduleIds: cleanModuleIds,
    startSeconds: normalizedSeconds,
    addedAt: new Date().toISOString(),
  };
}

export function useAcademyStorage() {
  const [state, setState] = useState<AcademyLocalState>(() => {
    if (typeof window === 'undefined') {
      return createDefaultAcademyState();
    }
    return hydrateState(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota or private browsing write errors gracefully
    }
  }, [state]);

  const updateSettings = useCallback((patch: Partial<PersonalSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...patch,
      },
    }));
  }, []);

  const toggleFocusCourse = useCallback((courseId: string) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        focusCourseId: prev.settings.focusCourseId === courseId ? null : courseId,
      },
    }));
  }, []);

  const setCourseStatus = useCallback((courseId: string, status: CourseStatus) => {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return;

    setState((prev) => {
      const current = prev.courseProgress[courseId];
      let nextModules = current.completedModuleIds;

      if (status === 'not_started') {
        nextModules = [];
      } else if (status === 'completed') {
        nextModules = course.modules.map((m) => m.id);
      }

      return {
        ...prev,
        courseProgress: {
          ...prev.courseProgress,
          [courseId]: {
            ...current,
            status,
            completedModuleIds: nextModules,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const toggleCourseModule = useCallback((courseId: string, moduleId: string) => {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return;

    setState((prev) => {
      const current = prev.courseProgress[courseId];
      const exists = current.completedModuleIds.includes(moduleId);
      const nextModules = exists
        ? current.completedModuleIds.filter((id) => id !== moduleId)
        : [...current.completedModuleIds, moduleId];

      let nextStatus: CourseStatus = 'not_started';
      if (nextModules.length === course.modules.length) {
        nextStatus = 'completed';
      } else if (nextModules.length > 0) {
        nextStatus = 'in_progress';
      }

      return {
        ...prev,
        courseProgress: {
          ...prev.courseProgress,
          [courseId]: {
            ...current,
            status: nextStatus,
            completedModuleIds: nextModules,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const toggleBookmark = useCallback((courseId: string) => {
    setState((prev) => {
      const current = prev.courseProgress[courseId];
      return {
        ...prev,
        courseProgress: {
          ...prev.courseProgress,
          [courseId]: {
            ...current,
            bookmarked: !current.bookmarked,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const updateCourseNotes = useCallback((courseId: string, notes: string) => {
    setState((prev) => {
      const current = prev.courseProgress[courseId];
      return {
        ...prev,
        courseProgress: {
          ...prev.courseProgress,
          [courseId]: {
            ...current,
            notes,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const addPersonalLink = useCallback(
    (
      courseId: string,
      label: string,
      url: string,
      format: PersonalLinkFormat,
      moduleIds: string[],
      startSeconds: number | null = null
    ) => {
      const built = buildFinalLinkEntry(
        { courseId, label, url, format, moduleIds, startSeconds },
        Math.random().toString(36).slice(2, 7)
      );
      if (!built) return false;

      setState((prev) => {
        const current = prev.courseProgress[courseId];
        if (!current) return prev;
        return {
          ...prev,
          courseProgress: {
            ...prev.courseProgress,
            [courseId]: {
              ...current,
              personalLinks: [...current.personalLinks, built],
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });

      return true;
    },
    []
  );

  const addPersonalLinksBatch = useCallback((items: NewPersonalLinkInput[]) => {
    const builtByCourse: Record<string, PersonalStudyLink[]> = {};
    let totalAdded = 0;

    items.forEach((item, index) => {
      const built = buildFinalLinkEntry(
        item,
        `${index}-${Math.random().toString(36).slice(2, 6)}`
      );
      if (!built) return;
      if (!builtByCourse[item.courseId]) {
        builtByCourse[item.courseId] = [];
      }
      builtByCourse[item.courseId].push(built);
      totalAdded += 1;
    });

    if (totalAdded === 0) return 0;

    const now = new Date().toISOString();
    setState((prev) => {
      const nextProgress = { ...prev.courseProgress };
      for (const [cId, links] of Object.entries(builtByCourse)) {
        const existing = nextProgress[cId];
        if (!existing) continue;
        nextProgress[cId] = {
          ...existing,
          personalLinks: [...existing.personalLinks, ...links],
          updatedAt: now,
        };
      }
      return {
        ...prev,
        courseProgress: nextProgress,
      };
    });

    return totalAdded;
  }, []);

  const updatePersonalLinkTimestamp = useCallback(
    (courseId: string, linkId: string, startSeconds: number | null) => {
      const normalizedSeconds =
        typeof startSeconds === 'number' &&
        Number.isFinite(startSeconds) &&
        startSeconds >= 0
          ? Math.floor(startSeconds)
          : null;

      setState((prev) => {
        const current = prev.courseProgress[courseId];
        if (!current) return prev;
        return {
          ...prev,
          courseProgress: {
            ...prev.courseProgress,
            [courseId]: {
              ...current,
              personalLinks: current.personalLinks.map((link) => {
                if (link.id !== linkId) return link;
                const updatedUrl = isYouTubeUrl(link.url)
                  ? buildYouTubeTimestampUrl(link.url, normalizedSeconds)
                  : link.url;
                return {
                  ...link,
                  url: updatedUrl,
                  startSeconds: normalizedSeconds,
                };
              }),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    []
  );

  const deletePersonalLink = useCallback((courseId: string, linkId: string) => {
    setState((prev) => {
      const current = prev.courseProgress[courseId];
      if (!current) return prev;
      return {
        ...prev,
        courseProgress: {
          ...prev.courseProgress,
          [courseId]: {
            ...current,
            personalLinks: current.personalLinks.filter(
              (link) => link.id !== linkId
            ),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const togglePracticedLab = useCallback((labId: string) => {
    const lab = PRACTICE_LAB_PREVIEWS.find((item) => item.id === labId);
    if (!lab) return;
    const labPromptIds = lab.topics.flatMap((t) => t.prompts.map((p) => p.id));

    setState((prev) => {
      const checkedSet = new Set(prev.practicedPromptIds);
      const allDone =
        labPromptIds.length > 0 && labPromptIds.every((id) => checkedSet.has(id));

      if (allDone) {
        for (const id of labPromptIds) checkedSet.delete(id);
      } else {
        for (const id of labPromptIds) checkedSet.add(id);
      }

      const nextPrompts = Array.from(checkedSet);
      return {
        ...prev,
        practicedPromptIds: nextPrompts,
        practicedLabIds: syncPracticedLabIds(nextPrompts),
      };
    });
  }, []);

  const togglePracticePrompt = useCallback((promptId: string) => {
    if (!VALID_PRACTICE_PROMPT_IDS.has(promptId)) return;

    setState((prev) => {
      const exists = prev.practicedPromptIds.includes(promptId);
      const nextPrompts = exists
        ? prev.practicedPromptIds.filter((id) => id !== promptId)
        : [...prev.practicedPromptIds, promptId];

      return {
        ...prev,
        practicedPromptIds: nextPrompts,
        practicedLabIds: syncPracticedLabIds(nextPrompts),
      };
    });
  }, []);

  const setPracticeTopicAll = useCallback(
    (labId: string, moduleId: string, completed: boolean) => {
      const lab = PRACTICE_LAB_PREVIEWS.find((item) => item.id === labId);
      const topic = lab?.topics.find((t) => t.moduleId === moduleId);
      if (!topic) return;

      const topicPromptIds = topic.prompts.map((p) => p.id);

      setState((prev) => {
        const checkedSet = new Set(prev.practicedPromptIds);
        if (completed) {
          for (const id of topicPromptIds) checkedSet.add(id);
        } else {
          for (const id of topicPromptIds) checkedSet.delete(id);
        }

        const nextPrompts = Array.from(checkedSet);
        return {
          ...prev,
          practicedPromptIds: nextPrompts,
          practicedLabIds: syncPracticedLabIds(nextPrompts),
        };
      });
    },
    []
  );

  const updatePracticeTopicNote = useCallback((moduleId: string, text: string) => {
    if (!VALID_PRACTICE_MODULE_IDS.has(moduleId)) return;
    setState((prev) => ({
      ...prev,
      practiceTopicNotes: {
        ...prev.practiceTopicNotes,
        [moduleId]: text,
      },
    }));
  }, []);

  const updatePracticePromptAnswer = useCallback(
    (promptId: string, answerText: string) => {
      if (!VALID_PRACTICE_PROMPT_IDS.has(promptId)) return;
      setState((prev) => ({
        ...prev,
        practicePromptAnswers: {
          ...prev.practicePromptAnswers,
          [promptId]: {
            answerText,
            status: null,
            feedback: null,
            checkedAt: null,
          },
        },
      }));
    },
    []
  );

  const checkPracticePromptAnswer = useCallback((promptId: string) => {
    const prompt = PRACTICE_PROMPT_MAP.get(promptId);
    if (!prompt) return;

    setState((prev) => {
      const currentText = prev.practicePromptAnswers[promptId]?.answerText ?? '';
      const evaluation = evaluatePracticeAnswer(currentText, prompt.validation);

      let nextPrompts = prev.practicedPromptIds;
      if (
        evaluation.status === 'verified' &&
        !prev.practicedPromptIds.includes(promptId)
      ) {
        nextPrompts = [...prev.practicedPromptIds, promptId];
      }

      return {
        ...prev,
        practicedPromptIds: nextPrompts,
        practicedLabIds: syncPracticedLabIds(nextPrompts),
        practicePromptAnswers: {
          ...prev.practicePromptAnswers,
          [promptId]: {
            answerText: currentText,
            status: evaluation.status,
            feedback: evaluation.feedback,
            checkedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const toggleInterviewItem = useCallback((itemId: string) => {
    setState((prev) => {
      const exists = prev.completedInterviewItemIds.includes(itemId);
      return {
        ...prev,
        completedInterviewItemIds: exists
          ? prev.completedInterviewItemIds.filter((id) => id !== itemId)
          : [...prev.completedInterviewItemIds, itemId],
      };
    });
  }, []);

  const updatePracticeScratchpad = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      practiceScratchpad: text,
    }));
  }, []);

  const importStateFromJson = useCallback(
    (rawJson: string): { ok: true } | { ok: false; error: string } => {
      try {
        const parsed = JSON.parse(rawJson) as unknown;
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !('courseProgress' in parsed) ||
          !('settings' in parsed)
        ) {
          return {
            ok: false,
            error:
              'Backup file does not match Data Analytics Masters export format.',
          };
        }
        const hydrated = hydrateState(rawJson);
        setState(hydrated);
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: 'Could not parse JSON file. Please select a valid backup export.',
        };
      }
    },
    []
  );

  const resetProgressOnly = useCallback(() => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        focusCourseId: null,
      },
      courseProgress: createInitialCourseProgress(),
      practicedLabIds: [],
      practicedPromptIds: [],
      practiceTopicNotes: {},
      practicePromptAnswers: {},
      completedInterviewItemIds: [],
      practiceScratchpad: '',
    }));
  }, []);

  const resetAllData = useCallback(() => {
    const fresh = createDefaultAcademyState();
    setState(fresh);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore gracefully
    }
  }, []);

  return {
    state,
    updateSettings,
    toggleFocusCourse,
    setCourseStatus,
    toggleCourseModule,
    toggleBookmark,
    updateCourseNotes,
    addPersonalLink,
    addPersonalLinksBatch,
    updatePersonalLinkTimestamp,
    deletePersonalLink,
    togglePracticedLab,
    togglePracticePrompt,
    setPracticeTopicAll,
    updatePracticeTopicNote,
    updatePracticePromptAnswer,
    checkPracticePromptAnswer,
    toggleInterviewItem,
    updatePracticeScratchpad,
    importStateFromJson,
    resetProgressOnly,
    resetAllData,
  };
}
