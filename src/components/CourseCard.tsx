import { ArrowUpRight, Bookmark, Check, Crosshair } from 'lucide-react';
import { Course, CourseProgressEntry, CourseStatus } from '../types/academy';
import { CourseIcon } from './CourseIcon';

interface CourseCardProps {
  course: Course;
  progress: CourseProgressEntry;
  isFocused: boolean;
  density: 'comfortable' | 'compact';
  showModulePreview: boolean;
  onOpenOverview: (courseId: string) => void;
  onToggleBookmark: (courseId: string) => void;
  onToggleFocus: (courseId: string) => void;
  onCycleStatus: (courseId: string, nextStatus: CourseStatus) => void;
}

const STATUS_META: Record<
  CourseStatus,
  { label: string; next: CourseStatus; nextActionLabel: string; dotClass: string }
> = {
  not_started: {
    label: 'Not started',
    next: 'in_progress',
    nextActionLabel: 'Start',
    dotClass: 'text-slate-500',
  },
  in_progress: {
    label: 'In progress',
    next: 'completed',
    nextActionLabel: 'Mark complete',
    dotClass: 'text-blue-700',
  },
  completed: {
    label: 'Completed',
    next: 'not_started',
    nextActionLabel: 'Reset',
    dotClass: 'text-emerald-700',
  },
};

export function CourseCard({
  course,
  progress,
  isFocused,
  density,
  showModulePreview,
  onOpenOverview,
  onToggleBookmark,
  onToggleFocus,
  onCycleStatus,
}: CourseCardProps) {
  const totalModules = course.modules.length;
  const completedCount = progress.completedModuleIds.length;
  const percent =
    totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const statusInfo = STATUS_META[progress.status];

  const curatedResourceCount =
    course.overviewResources.length +
    course.modules.reduce((sum, mod) => sum + mod.resources.length, 0);
  const personalLinkCount = progress.personalLinks?.length ?? 0;

  const paddingClass = density === 'compact' ? 'p-4' : 'p-5 sm:p-6';

  return (
    <article
      className={`group flex flex-col justify-between bg-white rounded-xl border transition-colors duration-150 ${paddingClass} ${
        isFocused
          ? 'border-blue-600 ring-1 ring-blue-600/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Row 1: Icon + compact numeric index/hours on left; Focus & Bookmark actions on right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors duration-150 ${
                progress.status === 'completed'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : isFocused
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <CourseIcon iconKey={course.iconKey} className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 tabular-nums">
              <span className="font-mono text-slate-400">{course.indexLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{course.estimatedHours}h</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFocus(course.id)}
              aria-pressed={isFocused}
              title={isFocused ? 'Remove current focus' : 'Set as current focus'}
              aria-label={
                isFocused
                  ? `Remove ${course.title} from current focus`
                  : `Set ${course.title} as current focus`
              }
              className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 ${
                isFocused
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Crosshair className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onToggleBookmark(course.id)}
              aria-pressed={progress.bookmarked}
              title={progress.bookmarked ? 'Remove bookmark' : 'Bookmark course'}
              aria-label={
                progress.bookmarked
                  ? `Remove bookmark for ${course.title}`
                  : `Bookmark ${course.title}`
              }
              className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 ${
                progress.bookmarked
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${progress.bookmarked ? 'fill-slate-900' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Row 2: Full-width category & course title — zero truncation */}
        <div className="mt-3.5">
          <p className="text-xs font-medium text-slate-500 leading-normal">
            {course.category}
          </p>
          <h3 className="font-display text-[17px] font-semibold text-slate-900 tracking-tight leading-snug mt-0.5">
            {course.title}
          </h3>
        </div>

        {/* Course description */}
        <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
          {course.shortDescription}
        </p>

        {/* Clean unboxed syllabus topics & resource count */}
        {showModulePreview && (
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            {course.outlineTopics.join(' · ')}
          </p>
        )}

        <p className="mt-2 text-xs text-slate-400 tabular-nums">
          {curatedResourceCount} free guides
          {personalLinkCount > 0 ? ` · ${personalLinkCount} saved` : ''}
        </p>
      </div>

      {/* Bottom local progress + functional controls */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 text-xs mb-2">
          <span className={`font-medium inline-flex items-center gap-1 ${statusInfo.dotClass}`}>
            {progress.status === 'completed' && (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{statusInfo.label}</span>
            {isFocused && (
              <>
                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span className="text-blue-700">Focus</span>
              </>
            )}
          </span>
          <span className="font-mono text-slate-500 tabular-nums shrink-0">
            {completedCount}/{totalModules} ({percent}%)
          </span>
        </div>

        {/* Honest local progress bar */}
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${course.title} syllabus progress`}
          className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"
        >
          <div
            className={`h-full transition-all duration-200 ${
              progress.status === 'completed' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onCycleStatus(course.id, statusInfo.next)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            {statusInfo.nextActionLabel}
          </button>

          <button
            type="button"
            onClick={() => onOpenOverview(course.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-900 hover:text-blue-700 rounded-lg hover:bg-blue-50/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <span>Study Guide</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
