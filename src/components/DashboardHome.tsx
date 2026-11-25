import { ArrowRight, ArrowUpRight, Check, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  COURSES,
  INTERVIEW_CHECKLIST,
  LEARNING_STAGES,
  PRACTICE_LAB_PREVIEWS,
} from '../data/curriculum';
import { getOverallPracticeStats } from '../data/practiceDrills';
import {
  AcademyLocalState,
  CourseCategory,
  CourseStatus,
  NavSection,
} from '../types/academy';
import { buildHashHref, buildSectionHashHref } from '../utils/hashRouter';
import { CourseCard } from './CourseCard';

interface DashboardHomeProps {
  state: AcademyLocalState;
  onSelectSection: (section: NavSection) => void;
  onOpenCourseOverview: (courseId: string, moduleId?: string) => void;
  onOpenPracticeLab: (labId: string, moduleId?: string) => void;
  onOpenSettings: () => void;
  onToggleBookmark: (courseId: string) => void;
  onToggleFocus: (courseId: string) => void;
  onSetCourseStatus: (courseId: string, status: CourseStatus) => void;
}

type CategoryFilter = 'All' | CourseCategory;
type StatusFilter = 'all' | 'bookmarked' | 'in_progress' | 'completed';

const CATEGORY_TABS: CategoryFilter[] = [
  'All',
  'Core Tools',
  'Quantitative & BI',
  'Applied & Career',
];

export function DashboardHome({
  state,
  onSelectSection,
  onOpenCourseOverview,
  onOpenPracticeLab,
  onOpenSettings,
  onToggleBookmark,
  onToggleFocus,
  onSetCourseStatus,
}: DashboardHomeProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const metrics = useMemo(() => {
    let completedCourses = 0;
    let inProgressCourses = 0;
    let completedModules = 0;
    let totalModules = 0;

    for (const course of COURSES) {
      totalModules += course.modules.length;
      const entry = state.courseProgress[course.id];
      if (!entry) continue;
      completedModules += entry.completedModuleIds.length;
      if (entry.status === 'completed') completedCourses += 1;
      if (entry.status === 'in_progress') inProgressCourses += 1;
    }

    const percent =
      totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    const focusCourse = state.settings.focusCourseId
      ? COURSES.find((c) => c.id === state.settings.focusCourseId) ?? null
      : null;

    // Next recommended course in job-ready sequence strictly from local progress
    const nextSequentialCourse =
      focusCourse ??
      COURSES.find(
        (c) => state.courseProgress[c.id]?.status !== 'completed'
      ) ??
      COURSES[COURSES.length - 1];

    const nextMatchingLab = PRACTICE_LAB_PREVIEWS.find(
      (lab) => lab.courseId === nextSequentialCourse.id
    );

    const practiceStats = getOverallPracticeStats(PRACTICE_LAB_PREVIEWS, state);

    const stageSummaries = LEARNING_STAGES.map((stage) => {
      const stageCourses = stage.courseIds
        .map((id) => COURSES.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
      const doneCourses = stageCourses.filter(
        (c) => state.courseProgress[c.id]?.status === 'completed'
      ).length;
      const doneModules = stageCourses.reduce(
        (sum, c) => sum + (state.courseProgress[c.id]?.completedModuleIds.length ?? 0),
        0
      );
      const stageModules = stageCourses.reduce((sum, c) => sum + c.modules.length, 0);
      return {
        stage,
        stageCourses,
        doneCourses,
        doneModules,
        stageModules,
      };
    });

    return {
      completedCourses,
      inProgressCourses,
      completedModules,
      totalModules,
      percent,
      focusCourse,
      nextSequentialCourse,
      nextMatchingLab,
      practiceStats,
      stageSummaries,
    };
  }, [state]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return COURSES.filter((course) => {
      if (categoryFilter !== 'All' && course.category !== categoryFilter) {
        return false;
      }
      const entry = state.courseProgress[course.id];
      if (statusFilter === 'bookmarked' && !entry?.bookmarked) {
        return false;
      }
      if (statusFilter === 'in_progress' && entry?.status !== 'in_progress') {
        return false;
      }
      if (statusFilter === 'completed' && entry?.status !== 'completed') {
        return false;
      }
      if (q) {
        const haystack = [
          course.title,
          course.category,
          course.shortDescription,
          ...course.outlineTopics,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [categoryFilter, statusFilter, searchQuery, state.courseProgress]);

  const hasActiveFilters =
    categoryFilter !== 'All' || statusFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* Personal Academy Hero */}
      <section aria-labelledby="academy-hero-heading" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-slate-500">
              Personal Edition · Free Job-Ready Curriculum · Browser Local Storage
            </p>
            <h1
              id="academy-hero-heading"
              className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 text-balance"
            >
              {state.settings.learnerName.trim()
                ? `Welcome back, ${state.settings.learnerName.trim()}`
                : 'Your Personal Data Analytics Curriculum'}
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Follow a structured, step-by-step free learning sequence from spreadsheets and SQL through Python, statistics, and BI into real portfolio projects and interview prep.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={buildHashHref({
                section: 'courses',
                courseId: metrics.nextSequentialCourse.id,
              })}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                  return;
                }
                e.preventDefault();
                onOpenCourseOverview(metrics.nextSequentialCourse.id);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>
                {metrics.focusCourse
                  ? `Resume ${metrics.focusCourse.title}`
                  : `Start Step ${metrics.nextSequentialCourse.indexLabel}: ${metrics.nextSequentialCourse.title}`}
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <a
              href={buildSectionHashHref('courses')}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                  return;
                }
                e.preventDefault();
                onSelectSection('courses');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>View Learning Sequence</span>
            </a>

            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>Personal Settings</span>
            </button>
          </div>
        </div>

        {/* Honest 4-column summary strip derived strictly from localStorage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Courses Completed</p>
            <p className="mt-2 font-display text-2xl font-semibold text-slate-950 tabular-nums">
              {metrics.completedCourses} / {COURSES.length}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {metrics.inProgressCourses} currently in progress
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Syllabus Modules Checked</p>
            <p className="mt-2 font-display text-2xl font-semibold text-slate-950 tabular-nums">
              {metrics.completedModules} / {metrics.totalModules}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {metrics.percent}% of outline checked locally
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Current Focus</p>
            <p className="mt-2 font-display text-2xl font-semibold text-slate-950 leading-snug">
              {metrics.focusCourse ? metrics.focusCourse.title : 'None selected'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {metrics.focusCourse
                ? `${metrics.focusCourse.category} · ${metrics.focusCourse.estimatedHours}h planned`
                : 'Select the crosshair icon on any card'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Personal Target</p>
            <p className="mt-2 font-display text-2xl font-semibold text-slate-950 tabular-nums leading-snug">
              {state.settings.weeklyHoursGoal
                ? `${state.settings.weeklyHoursGoal} hrs / week`
                : 'Unset'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {state.settings.targetRole.trim()
                ? `Role: ${state.settings.targetRole.trim()}`
                : 'Set target role & weekly hours in Settings'}
            </p>
          </div>
        </div>
      </section>

      {/* Job-Ready 3-Stage Learning Sequence */}
      <section aria-labelledby="learning-sequence-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2
              id="learning-sequence-heading"
              className="font-display text-xl font-semibold text-slate-950 tracking-tight"
            >
              Job-Ready Free Learning Sequence
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Three sequential phases pairing curated free docs and video courses with hands-on CSV drills.
            </p>
          </div>

          {metrics.nextMatchingLab && (
            <a
              href={buildHashHref({
                section: 'practice-lab',
                labId: metrics.nextMatchingLab.id,
              })}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                  return;
                }
                e.preventDefault();
                onOpenPracticeLab(metrics.nextMatchingLab!.id);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              <span>Practice {metrics.nextSequentialCourse.title} CSV Drills</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {metrics.stageSummaries.map(
            ({ stage, stageCourses, doneCourses, doneModules, stageModules }) => {
              const stageDone =
                stageCourses.length > 0 && doneCourses === stageCourses.length;
              return (
                <div
                  key={stage.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-medium text-blue-700">
                        {stage.stageNumber}
                      </span>
                      <span
                        className={`font-mono tabular-nums ${
                          stageDone ? 'text-emerald-700 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {stageDone && (
                          <Check className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                        )}
                        {doneModules}/{stageModules} topics
                      </span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-slate-950">
                      {stage.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-700">
                      {stage.subtitle}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {stage.outcome}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {stageCourses.map((c) => {
                      const cDone = state.courseProgress[c.id]?.status === 'completed';
                      return (
                        <a
                          key={c.id}
                          href={buildHashHref({ section: 'courses', courseId: c.id })}
                          onClick={(e) => {
                            if (
                              e.metaKey ||
                              e.ctrlKey ||
                              e.shiftKey ||
                              e.altKey ||
                              e.button !== 0
                            ) {
                              return;
                            }
                            e.preventDefault();
                            onOpenCourseOverview(c.id);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                            cDone
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                          }`}
                        >
                          <span className="font-mono text-[11px] opacity-70">
                            {c.indexLabel}
                          </span>
                          <span>{c.title}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* Eight Functional Course Cards */}
      <section aria-labelledby="courses-grid-heading" className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2
              id="courses-grid-heading"
              className="font-display text-xl font-semibold text-slate-950 tracking-tight"
            >
              Core Curriculum
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Eight sequential tracks. Open any study guide to check off syllabus topics, access free resources, or save custom links.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter courses or topics..."
              aria-label="Filter courses or topics"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Category & status filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter courses by category"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start"
          >
            {CATEGORY_TABS.map((tab) => {
              const active = categoryFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategoryFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="dashboard-status-filter" className="text-xs text-slate-500">
              Status:
            </label>
            <select
              id="dashboard-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="all">All courses</option>
              <option value="bookmarked">Bookmarked</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={state.courseProgress[course.id]}
                isFocused={state.settings.focusCourseId === course.id}
                density={state.settings.cardDensity}
                showModulePreview={state.settings.showModulePreview}
                onOpenOverview={onOpenCourseOverview}
                onToggleBookmark={onToggleBookmark}
                onToggleFocus={onToggleFocus}
                onCycleStatus={onSetCourseStatus}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-sm font-medium text-slate-900">
              No courses match your current filters.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try clearing your search term or switching back to all categories.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('All');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* Workspace Navigation Shortcuts */}
      <section aria-labelledby="academy-areas-heading" className="space-y-4">
        <h2
          id="academy-areas-heading"
          className="font-display text-lg font-semibold text-slate-950 tracking-tight"
        >
          Academy Workspaces
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <a
            href={buildSectionHashHref('practice-lab')}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              onSelectSection('practice-lab');
            }}
            className="text-left bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Practice Lab
                </span>
                <ArrowRight
                  className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Downloadable CSV datasets and guided answer-checked drills across Excel, SQL, Python, Statistics, and Power BI.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-slate-500 tabular-nums">
                {metrics.practiceStats.completedPrompts} / {metrics.practiceStats.totalPrompts} prompts
              </span>
              <span className="font-medium text-blue-700">Open Practice Lab &rarr;</span>
            </div>
          </a>

          <a
            href={buildSectionHashHref('interview-prep')}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              onSelectSection('interview-prep');
            }}
            className="text-left bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Interview Preparation
                </span>
                <ArrowRight
                  className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Structured round playbooks and readiness checklist covering SQL joins, A/B design, case diagnostics, and STAR pitch.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-slate-500 tabular-nums">
                {state.completedInterviewItemIds.length} / {INTERVIEW_CHECKLIST.length} reviewed
              </span>
              <span className="font-medium text-blue-700">Open Interview Prep &rarr;</span>
            </div>
          </a>

          <a
            href={buildSectionHashHref('progress')}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              onSelectSection('progress');
            }}
            className="text-left bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Progress Ledger
                </span>
                <ArrowRight
                  className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Clean tabular audit of all eight courses, checked modules, Practice Lab completion, and saved personal notes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-slate-500 tabular-nums">
                {metrics.completedModules} / {metrics.totalModules} modules checked
              </span>
              <span className="font-medium text-blue-700">View Progress Ledger &rarr;</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
