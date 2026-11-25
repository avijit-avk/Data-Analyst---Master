import { COURSES, PRACTICE_LAB_PREVIEWS } from '../data/curriculum';
import { NavSection } from '../types/academy';

export type AppRoute =
  | { section: 'dashboard' }
  | { section: 'courses'; courseId?: string; moduleId?: string }
  | { section: 'practice-lab'; labId?: string; moduleId?: string }
  | { section: 'interview-prep' }
  | { section: 'progress' };

export function parseHashRoute(rawHash: string): AppRoute {
  const cleaned = rawHash.replace(/^#/, '').replace(/^\/+|\/+$/g, '');
  if (!cleaned) {
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

  if (head === 'dashboard') {
    return { section: 'dashboard' };
  }

  if (head === 'courses') {
    const courseSlug = segments[1];
    if (!courseSlug) {
      return { section: 'courses' };
    }
    const course = COURSES.find((c) => c.id === courseSlug);
    if (!course) {
      return { section: 'courses' };
    }
    const moduleSlug = segments[2];
    const matchedModule = moduleSlug
      ? course.modules.find((m) => m.id === moduleSlug)
      : undefined;

    return {
      section: 'courses',
      courseId: course.id,
      moduleId: matchedModule?.id,
    };
  }

  if (head === 'practice-lab') {
    const labSlug = segments[1];
    if (!labSlug) {
      return { section: 'practice-lab' };
    }
    const lab = PRACTICE_LAB_PREVIEWS.find(
      (l) => l.id === labSlug || l.courseId === labSlug
    );
    if (!lab) {
      return { section: 'practice-lab' };
    }
    const moduleSlug = segments[2];
    const matchedTopic = moduleSlug
      ? lab.topics.find((t) => t.moduleId === moduleSlug)
      : undefined;

    return {
      section: 'practice-lab',
      labId: lab.id,
      moduleId: matchedTopic?.moduleId,
    };
  }

  if (head === 'interview-prep') {
    return { section: 'interview-prep' };
  }

  if (head === 'progress') {
    return { section: 'progress' };
  }

  return { section: 'dashboard' };
}

export function buildHashHref(route: AppRoute): string {
  switch (route.section) {
    case 'dashboard':
      return '#/';
    case 'courses': {
      if (!route.courseId) return '#/courses';
      if (!route.moduleId) return `#/courses/${encodeURIComponent(route.courseId)}`;
      return `#/courses/${encodeURIComponent(route.courseId)}/${encodeURIComponent(
        route.moduleId
      )}`;
    }
    case 'practice-lab': {
      if (!route.labId) return '#/practice-lab';
      if (!route.moduleId) {
        return `#/practice-lab/${encodeURIComponent(route.labId)}`;
      }
      return `#/practice-lab/${encodeURIComponent(
        route.labId
      )}/${encodeURIComponent(route.moduleId)}`;
    }
    case 'interview-prep':
      return '#/interview-prep';
    case 'progress':
      return '#/progress';
  }
}

export function buildSectionHashHref(section: NavSection): string {
  return buildHashHref({ section });
}

export function navigateToHash(route: AppRoute): void {
  if (typeof window === 'undefined') return;
  const targetHash = buildHashHref(route);
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
}

export function buildShareableUrl(route: AppRoute): string {
  const hash = buildHashHref(route);
  if (typeof window === 'undefined') return hash;
  return `${window.location.origin}${window.location.pathname}${hash}`;
}
