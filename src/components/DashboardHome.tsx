import {
  ArrowRight,
  Award,
  CheckCircle2,
  Database,
  FlaskConical,
  GraduationCap,
} from 'lucide-react';
import { EMBEDDED_DATASETS } from '../data/embeddedDatasets';
import { getLessonsForModule, LMS_LESSONS, LMS_MODULES } from '../data/lmsCurriculum';
import { LMS_LABS } from '../data/lmsLabs';
import { LMS_QUIZZES } from '../data/lmsQuizzes';
import { LmsLocalState } from '../types/academy';
import { CourseIcon } from './CourseIcon';

interface DashboardHomeProps {
  state: LmsLocalState;
}

export function DashboardHome({ state }: DashboardHomeProps) {
  const totalLessons = LMS_LESSONS.length;
  const completedLessonsCount = state.completedLessonIds.length;
  const lessonsPct = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  const allExercises = LMS_LABS.flatMap((lab) => lab.exercises);
  const solvedExercisesCount = allExercises.filter(
    (ex) => state.exerciseCheckStatus[ex.id] === 'verified'
  ).length;
  const labsPct =
    allExercises.length > 0
      ? Math.round((solvedExercisesCount / allExercises.length) * 100)
      : 0;

  const moduleQuizzes = LMS_QUIZZES.filter((q) => !q.isCapstone);
  const passedModuleQuizzes = moduleQuizzes.filter(
    (q) => state.quizResults[q.id]?.passed
  ).length;

  const capstoneResult = state.quizResults['quiz-capstone'];

  const nextLesson =
    LMS_LESSONS.find((l) => !state.completedLessonIds.includes(l.id)) ?? LMS_LESSONS[0];

  const isCompact = state.settings.cardDensity === 'compact';

  const greetingHeading = state.settings.learnerName.trim()
    ? `Welcome back, ${state.settings.learnerName.trim()}`
    : 'Data Analytics Learning Workspace';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* Hero + Primary CTA */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            Self-Contained LMS
            {state.settings.targetRole ? ` · Target: ${state.settings.targetRole}` : ''}
            {state.settings.weeklyHoursGoal
              ? ` · ${state.settings.weeklyHoursGoal} hrs/wk goal`
              : ''}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {greetingHeading}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Work sequentially through 6 job-ready modules, practice directly in the in-browser SQL
            &amp; formula sandbox across 4 company datasets, and verify mastery with module quizzes
            and the Final Capstone Assessment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
          {completedLessonsCount < totalLessons ? (
            <a
              href={`#/lesson/${nextLesson.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <span>
                {completedLessonsCount === 0 ? 'Start Module 1' : 'Continue Next Lesson'}
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          ) : (
            <a
              href="#/quiz/quiz-capstone"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
            >
              <span>Take Capstone Assessment</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
          <a
            href="#/lab/lab-retail"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <Database className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>Open SQL Sandbox</span>
          </a>
        </div>
      </section>

      {/* Honest KPI Strip */}
      <section aria-label="Learning progress summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Lessons Completed</span>
            <GraduationCap className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {completedLessonsCount} / {totalLessons}
          </p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${lessonsPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 tabular-nums">{lessonsPct}% of curriculum</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Lab Challenges Verified</span>
            <FlaskConical className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {solvedExercisesCount} / {allExercises.length}
          </p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${labsPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 tabular-nums">{labsPct}% verified across 4 labs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Module Quizzes Passed</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {passedModuleQuizzes} / {moduleQuizzes.length}
          </p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${
                  moduleQuizzes.length > 0
                    ? Math.round((passedModuleQuizzes / moduleQuizzes.length) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-500">80% required to pass each quiz</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Capstone Assessment</span>
            <Award className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {capstoneResult ? `${capstoneResult.bestScorePercent}%` : 'Not Taken'}
          </p>
          <p
            className={`text-xs font-medium ${
              capstoneResult?.passed
                ? 'text-emerald-700'
                : capstoneResult
                  ? 'text-amber-700'
                  : 'text-slate-500'
            }`}
          >
            {capstoneResult?.passed
              ? 'Passed · Job-Ready Verified'
              : capstoneResult
                ? 'Below 80% · Retake Available'
                : '12-question comprehensive exam'}
          </p>
          <a
            href="#/quiz/quiz-capstone"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <span>{capstoneResult ? 'Review or Retake' : 'Start Capstone'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Sequential 6-Module Curriculum */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Sequential Curriculum Roadmap
            </h2>
            <p className="text-sm text-slate-600">
              Six progressive modules taking you from business KPIs through SQL, BI, cases, and interviews.
            </p>
          </div>
          <a
            href="#/modules"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View Full Curriculum</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LMS_MODULES.map((mod) => {
            const modLessons = getLessonsForModule(mod.id);
            const modDone = modLessons.filter((l) =>
              state.completedLessonIds.includes(l.id)
            ).length;
            const modPct =
              modLessons.length > 0 ? Math.round((modDone / modLessons.length) * 100) : 0;
            const quizRec = state.quizResults[mod.quizId];

            return (
              <article
                key={mod.id}
                className={`bg-white border border-slate-200 rounded-xl flex flex-col justify-between transition-colors hover:border-slate-300 ${
                  isCompact ? 'p-4' : 'p-5'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <CourseIcon iconKey={mod.iconKey} className="w-5 h-5" />
                    </div>
                    <div className="text-right text-xs text-slate-500 tabular-nums">
                      <span>Module {mod.order}</span>
                      <span> · </span>
                      <span>{mod.estimatedHours}h</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900 leading-snug">
                      <a
                        href={`#/module/${mod.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {mod.title}
                      </a>
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">{mod.subtitle}</p>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  {state.settings.showModulePreview && (
                    <ul className="space-y-1 pt-1 border-t border-slate-100">
                      {modLessons.map((lesson) => {
                        const isDone = state.completedLessonIds.includes(lesson.id);
                        return (
                          <li key={lesson.id} className="text-xs flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isDone ? 'bg-emerald-600' : 'bg-slate-300'
                              }`}
                              aria-hidden="true"
                            />
                            <a
                              href={`#/lesson/${lesson.id}`}
                              className={`truncate hover:text-blue-600 ${
                                isDone ? 'text-slate-500 line-through' : 'text-slate-700'
                              }`}
                            >
                              {lesson.title}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 tabular-nums">
                      <span>
                        {modDone} / {modLessons.length} lessons
                      </span>
                      <span
                        className={
                          quizRec?.passed
                            ? 'text-emerald-700 font-medium'
                            : quizRec
                              ? 'text-amber-700 font-medium'
                              : 'text-slate-500'
                        }
                      >
                        {quizRec?.passed
                          ? `Quiz Passed (${quizRec.bestScorePercent}%)`
                          : quizRec
                            ? `Quiz ${quizRec.bestScorePercent}%`
                            : 'Quiz Pending'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${modPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`#/module/${mod.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <span>Open Module</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <a
                        href={`#/lab/${mod.labId}`}
                        className="text-slate-600 hover:text-blue-600"
                      >
                        Lab
                      </a>
                      <a
                        href={`#/quiz/${mod.quizId}`}
                        className="text-slate-600 hover:text-blue-600"
                      >
                        Quiz
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Embedded Domain Labs */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Interactive Practice Labs &amp; SQL Sandbox
            </h2>
            <p className="text-sm text-slate-600">
              Query embedded company tables live in your browser, validate formula logic, and export CSVs anytime.
            </p>
          </div>
          <a
            href="#/lab"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>Browse All Labs</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LMS_LABS.map((lab) => {
            const ds = EMBEDDED_DATASETS.find((d) => d.id === lab.datasetId);
            const verifiedCount = lab.exercises.filter(
              (ex) => state.exerciseCheckStatus[ex.id] === 'verified'
            ).length;

            return (
              <a
                key={lab.id}
                href={`#/lab/${lab.id}`}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 flex flex-col justify-between gap-4 transition-colors group"
              >
                <div className="space-y-2">
                  <p className="text-xs font-medium text-blue-600">{lab.domain}</p>
                  <h3 className="font-display text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {lab.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{lab.overview}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 tabular-nums">
                  <span>{ds ? `${ds.tables.length} tables` : 'Dataset'}</span>
                  <span>
                    {verifiedCount}/{lab.exercises.length} verified
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
