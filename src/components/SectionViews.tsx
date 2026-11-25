import { ArrowLeft, ArrowUpRight, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import {
  COURSES,
  INTERVIEW_CHECKLIST,
  PRACTICE_LAB_PREVIEWS,
} from '../data/curriculum';
import {
  getLabDrillStats,
  getOverallPracticeStats,
} from '../data/practiceDrills';
import { AcademyLocalState, CourseStatus, NavSection } from '../types/academy';
import { CourseCard } from './CourseCard';

interface CoursesViewProps {
  state: AcademyLocalState;
  onBackToDashboard: () => void;
  onOpenCourseOverview: (courseId: string) => void;
  onToggleBookmark: (courseId: string) => void;
  onToggleFocus: (courseId: string) => void;
  onSetCourseStatus: (courseId: string, status: CourseStatus) => void;
}

export function CoursesView({
  state,
  onBackToDashboard,
  onOpenCourseOverview,
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
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
            Courses Directory
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Browse all eight tracks in Data Analytics Masters. Select any course to inspect its module outline and record local study progress.
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
    </div>
  );
}


interface InterviewPrepViewProps {
  state: AcademyLocalState;
  onBackToDashboard: () => void;
  onToggleInterviewItem: (itemId: string) => void;
  onOpenCourseOverview: (courseId: string) => void;
}

export function InterviewPrepView({
  state,
  onBackToDashboard,
  onToggleInterviewItem,
  onOpenCourseOverview,
}: InterviewPrepViewProps) {
  const completedCount = state.completedInterviewItemIds.length;
  const totalCount = INTERVIEW_CHECKLIST.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
              Interview Preparation
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Track core analytical interview topics you have personally reviewed. Open the Interview Preparation course card for full module notes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {completedCount} / {totalCount} checked
            </span>
            <button
              type="button"
              onClick={() => onOpenCourseOverview('interview-preparation')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Open Course Outline</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {INTERVIEW_CHECKLIST.map((item) => {
          const checked = state.completedInterviewItemIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleInterviewItem(item.id)}
              aria-pressed={checked}
              className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
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
          );
        })}
      </div>
    </div>
  );
}

interface ProgressViewProps {
  state: AcademyLocalState;
  onBackToDashboard: () => void;
  onSelectSection: (section: NavSection) => void;
  onOpenCourseOverview: (courseId: string) => void;
  onResetProgressOnly: () => void;
}

export function ProgressView({
  state,
  onBackToDashboard,
  onSelectSection,
  onOpenCourseOverview,
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
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Dashboard</span>
          </button>
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
            <span>Reset Progress</span>
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
              Start by opening any course card on the Dashboard or checking off a topic in Practice Lab.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('dashboard')}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Go to Dashboard
          </button>
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
                <th className="py-3 px-4 text-right">My Links</th>
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
                      <button
                        type="button"
                        onClick={() => onOpenCourseOverview(course.id)}
                        className="text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer"
                      >
                        Study Guide
                      </button>
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
          <button
            type="button"
            onClick={() => onSelectSection('practice-lab')}
            className="text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer"
          >
            Open Practice Lab
          </button>
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
