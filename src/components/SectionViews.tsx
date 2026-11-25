import { ArrowLeft, ArrowUpRight, Check, Copy, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import {
  COURSES,
  INTERVIEW_CHECKLIST,
  INTERVIEW_ROUND_GUIDES,
  LEARNING_STAGES,
  PRACTICE_LAB_PREVIEWS,
} from '../data/curriculum';
import {
  getLabDrillStats,
  getOverallPracticeStats,
} from '../data/practiceDrills';
import { AcademyLocalState, CourseStatus, NavSection } from '../types/academy';
import {
  buildHashHref,
  buildSectionHashHref,
  buildShareableUrl,
} from '../utils/hashRouter';
import { CourseCard } from './CourseCard';

interface CoursesViewProps {
  state: AcademyLocalState;
  onBackToDashboard: () => void;
  onOpenCourseOverview: (courseId: string, moduleId?: string) => void;
  onOpenPracticeLab: (labId: string, moduleId?: string) => void;
  onToggleBookmark: (courseId: string) => void;
  onToggleFocus: (courseId: string) => void;
  onSetCourseStatus: (courseId: string, status: CourseStatus) => void;
}

export function CoursesView({
  state,
  onBackToDashboard,
  onOpenCourseOverview,
  onOpenPracticeLab,
  onToggleBookmark,
  onToggleFocus,
  onSetCourseStatus,
}: CoursesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Core Tools', 'Quantitative & BI', 'Applied & Career'];

  const visibleCourses =
    selectedCategory === 'All'
      ? COURSES
      : COURSES.filter((c) => c.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <a
            href={buildSectionHashHref('dashboard')}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              onBackToDashboard();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Dashboard</span>
          </a>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
            Job-Ready Learning Sequence
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Follow the eight free tracks in order from Stage 01 through Stage 03, pairing curated docs and video courses with hands-on Practice Lab datasets.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Course category filter"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory === 'All' ? (
        <div className="space-y-10">
          {LEARNING_STAGES.map((stage) => {
            const stageCourses = stage.courseIds
              .map((id) => COURSES.find((c) => c.id === id))
              .filter((c): c is NonNullable<typeof c> => Boolean(c));

            const doneModules = stageCourses.reduce(
              (sum, c) =>
                sum + (state.courseProgress[c.id]?.completedModuleIds.length ?? 0),
              0
            );
            const totalModules = stageCourses.reduce(
              (sum, c) => sum + c.modules.length,
              0
            );
            const totalHours = stageCourses.reduce(
              (sum, c) => sum + c.estimatedHours,
              0
            );

            return (
              <section
                key={stage.id}
                aria-labelledby={`${stage.id}-heading`}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-medium text-blue-700">
                        {stage.stageNumber}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="font-medium text-slate-600">
                        {stage.subtitle}
                      </span>
                    </div>
                    <h2
                      id={`${stage.id}-heading`}
                      className="font-display text-lg font-semibold text-slate-950 mt-0.5"
                    >
                      {stage.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">{stage.outcome}</p>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs text-slate-500 tabular-nums shrink-0">
                    <span>{totalHours}h planned</span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span>
                      {doneModules}/{totalModules} topics checked
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {stageCourses.map((course) => {
                    const matchingLab = PRACTICE_LAB_PREVIEWS.find(
                      (lab) => lab.courseId === course.id
                    );
                    return (
                      <div key={course.id} className="flex flex-col gap-2">
                        <CourseCard
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
                        {matchingLab && (
                          <a
                            href={buildHashHref({
                              section: 'practice-lab',
                              labId: matchingLab.id,
                            })}
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
                              onOpenPracticeLab(matchingLab.id);
                            }}
                            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-medium text-slate-700 hover:text-blue-700 flex items-center justify-between gap-2 transition-colors"
                          >
                            <span>Open {course.title} Practice Lab</span>
                            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {visibleCourses.map((course) => (
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
      )}
    </div>
  );
}

interface InterviewPrepViewProps {
  state: AcademyLocalState;
  onBackToDashboard: () => void;
  onToggleInterviewItem: (itemId: string) => void;
  onOpenCourseOverview: (courseId: string, moduleId?: string) => void;
  onOpenPracticeLab: (labId: string, moduleId?: string) => void;
}

export function InterviewPrepView({
  state,
  onBackToDashboard,
  onToggleInterviewItem,
  onOpenCourseOverview,
  onOpenPracticeLab,
}: InterviewPrepViewProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const completedCount = state.completedInterviewItemIds.length;
  const totalCount = INTERVIEW_CHECKLIST.length;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(
        buildShareableUrl({ section: 'interview-prep' })
      );
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard blocked gracefully ignored
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div>
        <a
          href={buildSectionHashHref('dashboard')}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
              return;
            }
            e.preventDefault();
            onBackToDashboard();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to Dashboard</span>
        </a>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
              Interview Preparation
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Review all four data analyst interview rounds, jump straight into linked SQL/Python/A/B Practice Lab drills, and verify your readiness checklist locally.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <span className="font-mono text-xs text-slate-500 tabular-nums mr-1">
              {completedCount} / {totalCount} reviewed
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  <span className="text-emerald-700">Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
            <a
              href={buildHashHref({
                section: 'courses',
                courseId: 'interview-preparation',
              })}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                  return;
                }
                e.preventDefault();
                onOpenCourseOverview('interview-preparation');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Open Interview Study Guide</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* 4 Structured Interview Round Playbooks */}
      <section aria-labelledby="interview-rounds-heading" className="space-y-4">
        <div>
          <h2
            id="interview-rounds-heading"
            className="font-display text-lg font-semibold text-slate-950 tracking-tight"
          >
            Core Interview Rounds &amp; Practice Links
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Each round pairs verified free external question banks with matching in-app labs and study modules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTERVIEW_ROUND_GUIDES.map((round) => (
            <article
              key={round.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-medium text-blue-700">
                    {round.roundLabel}
                  </span>
                  <span className="text-slate-400">
                    {round.focusSkills.join(' · ')}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold text-slate-950">
                  {round.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {round.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                {round.practiceLabId && (
                  <a
                    href={buildHashHref({
                      section: 'practice-lab',
                      labId: round.practiceLabId,
                    })}
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
                      onOpenPracticeLab(round.practiceLabId!);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Practice in Lab</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                )}

                <a
                  href={buildHashHref({
                    section: 'courses',
                    courseId: round.courseId,
                    moduleId: round.courseModuleId,
                  })}
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
                    onOpenCourseOverview(round.courseId, round.courseModuleId);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Review Study Module</span>
                </a>

                <a
                  href={round.freeResourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50/70 rounded-lg transition-colors whitespace-nowrap ml-auto"
                >
                  <span>{round.freeResourceSource}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Self-Tracked Interview Readiness Checklist */}
      <section aria-labelledby="interview-checklist-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="interview-checklist-heading"
            className="font-display text-lg font-semibold text-slate-950 tracking-tight"
          >
            Core Readiness Checklist
          </h2>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {completedCount} / {totalCount} complete
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {INTERVIEW_CHECKLIST.map((item) => {
            const checked = state.completedInterviewItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onToggleInterviewItem(item.id)}
                  aria-pressed={checked}
                  className="text-left flex items-start gap-4 cursor-pointer flex-1 min-w-0"
                >
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      checked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-slate-500">{item.area}</div>
                    <div
                      className={`text-sm font-medium mt-0.5 ${
                        checked ? 'text-slate-500 line-through' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2 pl-9 sm:pl-0 shrink-0">
                  {item.practiceLabId && (
                    <a
                      href={buildHashHref({
                        section: 'practice-lab',
                        labId: item.practiceLabId,
                        moduleId: item.practiceModuleId,
                      })}
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
                        onOpenPracticeLab(
                          item.practiceLabId!,
                          item.practiceModuleId
                        );
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <span>Practice Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}
                  {item.courseId && (
                    <a
                      href={buildHashHref({
                        section: 'courses',
                        courseId: item.courseId,
                        moduleId: item.courseModuleId,
                      })}
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
                        onOpenCourseOverview(item.courseId!, item.courseModuleId);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50/70 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <span>Study Topic</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface ProgressViewProps {
  state: AcademyLocalState;
  onBackToDashboard: () => void;
  onSelectSection: (section: NavSection) => void;
  onOpenCourseOverview: (courseId: string, moduleId?: string) => void;
  onOpenPracticeLab: (labId: string, moduleId?: string) => void;
  onResetProgressOnly: () => void;
}

export function ProgressView({
  state,
  onBackToDashboard,
  onSelectSection,
  onOpenCourseOverview,
  onOpenPracticeLab,
  onResetProgressOnly,
}: ProgressViewProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const totals = COURSES.reduce(
    (acc, course) => {
      const entry = state.courseProgress[course.id];
      const modCount = course.modules.length;
      const doneMods = entry?.completedModuleIds.length ?? 0;
      acc.totalModules += modCount;
      acc.doneModules += doneMods;
      if (entry?.status === 'completed') acc.completedCourses += 1;
      if (entry?.status === 'in_progress') acc.inProgressCourses += 1;
      return acc;
    },
    {
      totalModules: 0,
      doneModules: 0,
      completedCourses: 0,
      inProgressCourses: 0,
    }
  );

  const overallPercent =
    totals.totalModules > 0
      ? Math.round((totals.doneModules / totals.totalModules) * 100)
      : 0;

  const practiceStats = getOverallPracticeStats(PRACTICE_LAB_PREVIEWS, state);

  const hasAnyActivity =
    totals.doneModules > 0 ||
    totals.completedCourses > 0 ||
    totals.inProgressCourses > 0 ||
    practiceStats.completedPrompts > 0 ||
    state.practicedLabIds.length > 0 ||
    Object.values(state.practicePromptAnswers).some(
      (entry) => entry.answerText.trim() !== ''
    ) ||
    state.completedInterviewItemIds.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <a
            href={buildSectionHashHref('dashboard')}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              onBackToDashboard();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Dashboard</span>
          </a>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
            Personal Progress Ledger
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Every metric below is calculated exclusively from the modules, labs, and checklist items you have checked in this browser.
          </p>
        </div>

        {hasAnyActivity && !confirmingReset && (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset All Progress</span>
          </button>
        )}
      </div>

      {confirmingReset && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-700">
            Reset all locally tracked courses, practice drills, and interview checklist items back to 0?
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onResetProgressOnly();
                setConfirmingReset(false);
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      )}

      {/* Honest summary totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Overall Outline Completion</p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-950 tabular-nums">
            {overallPercent}%
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {totals.doneModules} of {totals.totalModules} modules checked
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Courses Completed</p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-950 tabular-nums">
            {totals.completedCourses} / {COURSES.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {totals.inProgressCourses} in progress
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Practice Lab Drills</p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-950 tabular-nums">
            {practiceStats.completedPrompts} / {practiceStats.totalPrompts}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {practiceStats.completedDrills} / {practiceStats.totalDrills} drills completed
            {practiceStats.inProgressDrills > 0
              ? ` · ${practiceStats.inProgressDrills} in progress`
              : ''}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Interview Checklist</p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-950 tabular-nums">
            {state.completedInterviewItemIds.length} / {INTERVIEW_CHECKLIST.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Topics reviewed</p>
        </div>
      </div>

      {!hasAnyActivity && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              No study activity recorded yet.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Start by opening Step 01 (Excel) in the learning sequence or checking off a prompt in Practice Lab.
            </p>
          </div>
          <a
            href={buildSectionHashHref('courses')}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              onSelectSection('courses');
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Open Learning Sequence
          </a>
        </div>
      )}

      {/* Course-by-course breakdown table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Modules Checked</th>
                <th className="py-3 px-4 text-right">Custom Links</th>
                <th className="py-3 px-4 text-right">Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {COURSES.map((course) => {
                const entry = state.courseProgress[course.id];
                const done = entry?.completedModuleIds.length ?? 0;
                const total = course.modules.length;
                const linkCount = entry?.personalLinks?.length ?? 0;
                const statusText =
                  entry?.status === 'completed'
                    ? 'Completed'
                    : entry?.status === 'in_progress'
                    ? 'In progress'
                    : 'Not started';

                return (
                  <tr key={course.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-400 mr-2 tabular-nums">
                        {course.indexLabel}
                      </span>
                      {course.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {course.category}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium ${
                          entry?.status === 'completed'
                            ? 'text-emerald-700'
                            : entry?.status === 'in_progress'
                            ? 'text-blue-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {done} / {total}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      {linkCount > 0 ? linkCount : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-500 whitespace-nowrap">
                      {entry?.notes.trim() ? 'Saved' : '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <a
                        href={buildHashHref({ section: 'courses', courseId: course.id })}
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
                          onOpenCourseOverview(course.id);
                        }}
                        className="text-xs font-medium text-blue-700 hover:text-blue-800"
                      >
                        Open Study Guide
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practice Lab subject-by-subject breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Practice Lab Breakdown
          </h2>
          <a
            href={buildSectionHashHref('practice-lab')}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              onSelectSection('practice-lab');
            }}
            className="text-xs font-medium text-blue-700 hover:text-blue-800"
          >
            Open Practice Lab
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Drill Track</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Topics Completed</th>
                <th className="py-3 px-4 text-right">Prompts Practiced</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {PRACTICE_LAB_PREVIEWS.map((lab) => {
                const stats = getLabDrillStats(lab, state);
                const statusText =
                  stats.status === 'completed'
                    ? 'Practiced'
                    : stats.status === 'in_progress'
                    ? 'In progress'
                    : 'Not started';

                return (
                  <tr key={lab.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {lab.tool}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{lab.title}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium ${
                          stats.status === 'completed'
                            ? 'text-emerald-700'
                            : stats.status === 'in_progress'
                            ? 'text-blue-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {stats.completedTopics} / {stats.totalTopics}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {stats.completedPrompts} / {stats.totalPrompts}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <a
                        href={buildHashHref({
                          section: 'practice-lab',
                          labId: lab.id,
                        })}
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
                          onOpenPracticeLab(lab.id);
                        }}
                        className="text-xs font-medium text-blue-700 hover:text-blue-800"
                      >
                        Open Lab
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
