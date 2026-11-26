import { getLessonById, getModuleById } from '../data/lmsCurriculum';
import { getLabById, getLabForModule } from '../data/lmsLabs';
import { getQuizById, getQuizForModule } from '../data/lmsQuizzes';
import { getTimedChallengeById } from '../data/timedChallenges';
import { NavSection } from '../types/academy';

export type AppRoute =
  | { section: 'dashboard' }
  | { section: 'modules' }
  | { section: 'module'; moduleId: string }
  | { section: 'lesson'; lessonId: string }
  | { section: 'lab'; labId?: string }
  | { section: 'timed-practice'; challengeId?: string }
  | { section: 'portfolio'; projectId?: string }
  | { section: 'career-readiness' }
  | { section: 'quiz'; quizId?: string }
  | { section: 'progress' }
  | { section: 'not-found'; rawHash: string };

export function parseHashRoute(rawHash: string): AppRoute {
  const cleaned = rawHash.replace(/^#/, '').replace(/^\/+|\/+$/g, '');
  if (!cleaned || cleaned === 'dashboard') {
    return { section: 'dashboard' };
  }

  const segments = cleaned.split('/').map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  });

  const head = segments[0];
  const id = segments[1];
  const hasExtraSegments = segments.length > 2;

  if (head === 'modules' && segments.length === 1) {
    return { section: 'modules' };
  }

  if (head === 'module' && !hasExtraSegments) {
    if (!id) return { section: 'modules' };
    const mod = getModuleById(id);
    return mod ? { section: 'module', moduleId: mod.id } : { section: 'not-found', rawHash };
  }

  if (head === 'lesson' && !hasExtraSegments) {
    if (!id) return { section: 'not-found', rawHash };
    const lesson = getLessonById(id);
    return lesson ? { section: 'lesson', lessonId: lesson.id } : { section: 'not-found', rawHash };
  }

  if (head === 'lab' && !hasExtraSegments) {
    if (!id) return { section: 'lab' };
    const direct = getLabById(id);
    if (direct) return { section: 'lab', labId: direct.id };
    const byModule = getLabForModule(id);
    if (byModule) return { section: 'lab', labId: byModule.id };
    return { section: 'not-found', rawHash };
  }

  if (head === 'timed-practice' && !hasExtraSegments) {
    if (!id) return { section: 'timed-practice' };
    const challenge = getTimedChallengeById(id);
    return challenge
      ? { section: 'timed-practice', challengeId: challenge.id }
      : { section: 'not-found', rawHash };
  }

  if (head === 'portfolio' && !hasExtraSegments) {
    return id ? { section: 'portfolio', projectId: id } : { section: 'portfolio' };
  }

  if (head === 'career-readiness' && segments.length === 1) {
    return { section: 'career-readiness' };
  }

  if (head === 'behavioral-prep' && segments.length === 1) {
    return { section: 'module', moduleId: 'mod-6' };
  }

  if (head === 'quiz' && !hasExtraSegments) {
    if (!id) return { section: 'quiz' };
    if (id === 'capstone') return { section: 'quiz', quizId: 'quiz-capstone' };
    const direct = getQuizById(id);
    if (direct) return { section: 'quiz', quizId: direct.id };
    const byModule = getQuizForModule(id);
    if (byModule) return { section: 'quiz', quizId: byModule.id };
    return { section: 'not-found', rawHash };
  }

  if (head === 'progress' && segments.length === 1) {
    return { section: 'progress' };
  }

  return { section: 'not-found', rawHash };
}

export function buildHashHref(route: AppRoute): string {
  switch (route.section) {
    case 'dashboard':
      return '#/dashboard';
    case 'modules':
      return '#/modules';
    case 'module':
      return `#/module/${encodeURIComponent(route.moduleId)}`;
    case 'lesson':
      return `#/lesson/${encodeURIComponent(route.lessonId)}`;
    case 'lab':
      return route.labId ? `#/lab/${encodeURIComponent(route.labId)}` : '#/lab';
    case 'timed-practice':
      return route.challengeId
        ? `#/timed-practice/${encodeURIComponent(route.challengeId)}`
        : '#/timed-practice';
    case 'portfolio':
      return route.projectId
        ? `#/portfolio/${encodeURIComponent(route.projectId)}`
        : '#/portfolio';
    case 'career-readiness':
      return '#/career-readiness';
    case 'quiz':
      return route.quizId ? `#/quiz/${encodeURIComponent(route.quizId)}` : '#/quiz';
    case 'progress':
      return '#/progress';
    case 'not-found':
      return '#/dashboard';
  }
}

export function buildSectionHashHref(section: NavSection): string {
  switch (section) {
    case 'dashboard':
      return '#/dashboard';
    case 'modules':
    case 'module':
    case 'lesson':
      return '#/modules';
    case 'lab':
      return '#/lab';
    case 'timed-practice':
      return '#/timed-practice';
    case 'portfolio':
      return '#/portfolio';
    case 'career-readiness':
      return '#/career-readiness';
    case 'quiz':
      return '#/quiz';
    case 'progress':
      return '#/progress';
    case 'not-found':
      return '#/dashboard';
  }
}

export function navigateToHash(route: AppRoute): void {
  if (typeof window === 'undefined') return;
  const targetHash = buildHashHref(route);
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
}
