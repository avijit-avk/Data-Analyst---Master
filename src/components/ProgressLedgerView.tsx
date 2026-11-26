import {
  ArrowRight,
  Briefcase,
  Clock,
  FolderKanban,
  Settings,
} from 'lucide-react';
import { getLessonsForModule, LMS_LESSONS, LMS_MODULES } from '../data/lmsCurriculum';
import { LMS_LABS } from '../data/lmsLabs';
import { LMS_QUIZZES } from '../data/lmsQuizzes';
import { OPEN_ENDED_TASKS } from '../data/openEndedTasks';
import {
  APPLICATION_READINESS_CHECKLIST,
  evaluatePortfolioProjectQuality,
} from '../data/portfolioAndCareerData';
import { LmsLocalState } from '../types/academy';

interface ProgressLedgerViewProps {
  state: LmsLocalState;
  onOpenSettings: () => void;
}

export function ProgressLedgerView({ state, onOpenSettings }: ProgressLedgerViewProps) {
  const orderedModules = [...LMS_MODULES].sort((a, b) => a.order - b.order);
  const totalLessons = LMS_LESSONS.length;
  const completedLessons = state.completedLessonIds.length;
  const allExercises = LMS_LABS.flatMap((l) => l.exercises);
  const verifiedLabs = allExercises.filter(
    (ex) => state.exerciseCheckStatus[ex.id] === 'verified'
  ).length;
  const passedQuizzes = LMS_QUIZZES.filter((q) => state.quizResults[q.id]?.passed).length;

  const openEndedSubmitted = OPEN_ENDED_TASKS.filter((t) =>
    Boolean(state.openEndedSubmissions[t.id]?.submittedAt)
  ).length;

  const timedCount = state.timedAttempts.length;
  const timedAvgScore =
    timedCount > 0
      ? Math.round(
          state.timedAttempts.reduce((acc, a) => acc + a.scorePercent, 0) / timedCount
        )
      : null;
  const timedBestScore =
    timedCount > 0
      ? Math.max(...state.timedAttempts.map((a) => a.scorePercent))
      : null;

  const portfolioCount = state.portfolioProjects.length;
  const portfolioCompleteCount = state.portfolioProjects.filter(
    (p) => evaluatePortfolioProjectQuality(p).isPortfolioComplete
  ).length;

  const behavioralCount = state.behavioralAnswers.length;
  const checklistDone = APPLICATION_READINESS_CHECKLIST.filter(
    (c) => state.careerChecklist[c.id]
  ).length;
  const appCount = state.jobApplications.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            Local Browser Ledger
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Progress &amp; Mastery Record
          </h1>
          <p className="text-sm text-slate-600">
            Unified record of your completed lessons, lab checks, quizzes, open-ended evaluations,
            timed drills, portfolio projects, and job-readiness milestones stored locally.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer shrink-0"
        >
          <Settings className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span>Export / Import JSON Backup</span>
        </button>
      </div>

      {/* Core Curriculum Summary Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <p className="text-xs text-slate-500">Lessons Completed</p>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {completedLessons} / {totalLessons}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <p className="text-xs text-slate-500">Lab Challenges Verified</p>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {verifiedLabs} / {allExercises.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <p className="text-xs text-slate-500">Assessments Passed</p>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {passedQuizzes} / {LMS_QUIZZES.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
          <p className="text-xs text-slate-500">Open-Ended Evaluations</p>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {openEndedSubmitted} / {OPEN_ENDED_TASKS.length}
          </p>
        </div>
      </div>

      {/* Practice, Portfolio & Career Readiness Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Timed Live-Coding</span>
            </div>
            <p className="font-display text-xl font-bold text-slate-900 tabular-nums">
              {timedCount} attempt{timedCount === 1 ? '' : 's'}
            </p>
            <p className="text-xs text-slate-600 tabular-nums">
              {timedCount > 0
                ? `Avg ${timedAvgScore}% · Best ${timedBestScore}%`
                : 'No timed SQL/Python drills submitted yet.'}
            </p>
          </div>
          <a
            href="#/timed-practice"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Timed Practice</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
              <FolderKanban className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Portfolio Projects</span>
            </div>
            <p className="font-display text-xl font-bold text-slate-900 tabular-nums">
              {portfolioCompleteCount} / {portfolioCount} complete
            </p>
            <p className="text-xs text-slate-600">
              Validated against all 10 portfolio quality checks and exportable as Markdown README.
            </p>
          </div>
          <a
            href="#/portfolio"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Portfolio Builder</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
              <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Interview &amp; Job Launch</span>
            </div>
            <p className="font-display text-xl font-bold text-slate-900 tabular-nums">
              {checklistDone} / {APPLICATION_READINESS_CHECKLIST.length} checklist
            </p>
            <p className="text-xs text-slate-600 tabular-nums">
              {behavioralCount} STAR draft{behavioralCount === 1 ? '' : 's'} · {appCount} tracked
              application{appCount === 1 ? '' : 's'}
            </p>
          </div>
          <a
            href="#/career-readiness"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Career Prep</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Module Table (Ordered 1..8) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Module</th>
                <th className="px-5 py-3.5 font-semibold">Lessons</th>
                <th className="px-5 py-3.5 font-semibold">Open-Ended</th>
                <th className="px-5 py-3.5 font-semibold">Quiz Best</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {orderedModules.map((mod) => {
                const lessons = getLessonsForModule(mod.id);
                const done = lessons.filter((l) =>
                  state.completedLessonIds.includes(l.id)
                ).length;
                const modTasks = OPEN_ENDED_TASKS.filter((t) => t.moduleId === mod.id);
                const modOeDone = modTasks.filter((t) =>
                  Boolean(state.openEndedSubmissions[t.id]?.submittedAt)
                ).length;
                const rec = state.quizResults[mod.quizId];
                const allDone = done === lessons.length && Boolean(rec?.passed);

                return (
                  <tr key={mod.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        Module {mod.order}: {mod.title}
                      </p>
                      <p className="text-xs text-slate-500">{mod.subtitle}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {done} / {lessons.length}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {modOeDone} / {modTasks.length}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {rec ? `${rec.bestScorePercent}%` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium ${
                          allDone
                            ? 'text-emerald-700'
                            : done > 0 || rec || modOeDone > 0
                              ? 'text-blue-700'
                              : 'text-slate-500'
                        }`}
                      >
                        {allDone
                          ? 'Module Mastered'
                          : done > 0 || rec || modOeDone > 0
                            ? 'In Progress'
                            : 'Not Started'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={`#/module/${mod.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
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
