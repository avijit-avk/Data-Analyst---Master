import { ArrowRight, Settings } from 'lucide-react';
import { getLessonsForModule, LMS_LESSONS, LMS_MODULES } from '../data/lmsCurriculum';
import { LMS_LABS } from '../data/lmsLabs';
import { LMS_QUIZZES } from '../data/lmsQuizzes';
import { LmsLocalState } from '../types/academy';

interface ProgressLedgerViewProps {
  state: LmsLocalState;
  onOpenSettings: () => void;
}

export function ProgressLedgerView({ state, onOpenSettings }: ProgressLedgerViewProps) {
  const totalLessons = LMS_LESSONS.length;
  const completedLessons = state.completedLessonIds.length;
  const allExercises = LMS_LABS.flatMap((l) => l.exercises);
  const verifiedLabs = allExercises.filter(
    (ex) => state.exerciseCheckStatus[ex.id] === 'verified'
  ).length;
  const passedQuizzes = LMS_QUIZZES.filter((q) => state.quizResults[q.id]?.passed).length;

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
            All metrics reflect your real completed lessons, verified lab challenges, and graded
            assessments stored in browser localStorage.
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

      {/* Summary Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </div>

      {/* Module Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Module</th>
                <th className="px-5 py-3.5 font-semibold">Lessons</th>
                <th className="px-5 py-3.5 font-semibold">Quiz Best</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {LMS_MODULES.map((mod) => {
                const lessons = getLessonsForModule(mod.id);
                const done = lessons.filter((l) =>
                  state.completedLessonIds.includes(l.id)
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
                      {rec ? `${rec.bestScorePercent}%` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium ${
                          allDone
                            ? 'text-emerald-700'
                            : done > 0 || rec
                              ? 'text-blue-700'
                              : 'text-slate-500'
                        }`}
                      >
                        {allDone
                          ? 'Module Mastered'
                          : done > 0 || rec
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
