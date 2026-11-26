import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Database,
  FlaskConical,
  FolderKanban,
  GraduationCap,
} from 'lucide-react';
import { EMBEDDED_DATASETS } from '../data/embeddedDatasets';
import { getLessonsForModule, LMS_LESSONS, LMS_MODULES } from '../data/lmsCurriculum';
import { LMS_LABS } from '../data/lmsLabs';
import { LMS_QUIZZES } from '../data/lmsQuizzes';
import { OPEN_ENDED_TASKS } from '../data/openEndedTasks';
import {
  APPLICATION_READINESS_CHECKLIST,
  evaluatePortfolioProjectQuality,
} from '../data/portfolioAndCareerData';
import { LmsLocalState } from '../types/academy';
import { CourseIcon } from './CourseIcon';

interface DashboardHomeProps {
  state: LmsLocalState;
}

export function DashboardHome({ state }: DashboardHomeProps) {
  const orderedModules = [...LMS_MODULES].sort((a, b) => a.order - b.order);
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

  const openEndedDone = OPEN_ENDED_TASKS.filter((t) =>
    Boolean(state.openEndedSubmissions[t.id]?.submittedAt)
  ).length;
  const timedCount = state.timedAttempts.length;
  const completedPortfolios = state.portfolioProjects.filter(
    (p) => evaluatePortfolioProjectQuality(p).isPortfolioComplete
  ).length;
  const checklistDone = APPLICATION_READINESS_CHECKLIST.filter(
    (c) => state.careerChecklist[c.id]
  ).length;

  const capstoneResult = state.quizResults['quiz-capstone'];

  const orderedLessons = orderedModules.flatMap((m) => getLessonsForModule(m.id));
  const nextLesson =
    orderedLessons.find((l) => !state.completedLessonIds.includes(l.id)) ?? orderedLessons[0];

  const isCompact = state.settings.cardDensity === 'compact';

  const greetingHeading = state.settings.learnerName.trim()
    ? `Welcome back, ${state.settings.learnerName.trim()}`
    : 'Data Analytics Learning Workspace';

  const nextModule =
    orderedModules.find((m) => m.id === nextLesson?.moduleId) ?? orderedModules[0];
  const primaryPathHref =
    completedLessonsCount < totalLessons
      ? `#/lesson/${nextLesson.id}`
      : !capstoneResult?.passed
        ? '#/quiz/quiz-capstone'
        : completedPortfolios === 0
          ? '#/portfolio'
          : '#/career-readiness';
  const primaryPathStep =
    completedLessonsCount < totalLessons
      ? `Next: Module ${nextModule.order} · ${nextLesson.title}`
      : !capstoneResult?.passed
        ? 'Next: Cumulative Capstone Assessment'
        : completedPortfolios === 0
          ? 'Next: Verify Your First Portfolio Artifact'
          : 'Next: Career & Application Readiness';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Hero + Single Dominant Path CTA */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            Self-Contained Job-Readiness LMS
            {state.settings.targetRole ? ` · Target: ${state.settings.targetRole}` : ''}
            {state.settings.weeklyHoursGoal
              ? ` · ${state.settings.weeklyHoursGoal} hrs/wk goal`
              : ''}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {greetingHeading}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Work sequentially across 8 analytical modules (Foundations, Excel, SQL, Python,
            Statistics, BI/DAX, Case Studies, Interviews), verify queries in browser-local
            sandboxes, and pass the Portfolio Quality Gate.
          </p>
          <p className="text-xs font-medium text-slate-500 pt-0.5">{primaryPathStep}</p>
        </div>

        <div className="flex flex-col items-stretch lg:items-end gap-2.5 shrink-0">
          <a
            href={primaryPathHref}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <span>Continue Job-Readiness Path</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
          <a
            href="#/lab"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 py-1"
          >
            <Database className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Open Practice Labs &amp; Timed Drills</span>
          </a>
        </div>
      </section>

      {/* Unified Progress KPI Strip */}
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
          <p className="text-xs text-slate-500 tabular-nums">{lessonsPct}% of 8 modules</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Labs, Open-Ended &amp; Timed</span>
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
          <p className="text-xs text-slate-500 tabular-nums">
            {openEndedDone}/{OPEN_ENDED_TASKS.length} open-ended · {timedCount} timed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Assessments &amp; Capstone</span>
            <Award className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {passedModuleQuizzes} / {moduleQuizzes.length} Quizzes
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
            Capstone:{' '}
            {capstoneResult
              ? `${capstoneResult.bestScorePercent}% (${capstoneResult.passed ? 'Passed' : 'Retry'})`
              : 'Not taken yet'}
          </p>
          <a
            href="#/quiz"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <span>Open Assessments</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Portfolio &amp; Career Gate</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
            {completedPortfolios} Job-Ready
          </p>
          <p className="text-xs text-slate-500 tabular-nums">
            {state.portfolioProjects.length} total drafts · {checklistDone}/15 career checks
          </p>
          <a
            href="#/portfolio"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <span>Portfolio Builder</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Compact 9-Step Sequence Bar */}
      <nav
        aria-label="Job-readiness sequence"
        className="flex flex-wrap items-center gap-1.5 text-xs"
      >
        <span className="font-semibold text-slate-500 mr-1">Sequence:</span>
        {orderedModules.map((m) => (
          <a
            key={m.id}
            href={`#/module/${m.id}`}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium tabular-nums"
          >
            {m.order}. {m.title.split('&')[0].replace('Data Analytics ', '').replace('Microsoft ', '').trim()}
          </a>
        ))}
        <a
          href="#/portfolio"
          className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-medium"
        >
          9. Portfolio &amp; Career
        </a>
      </nav>

      {/* Sequential 8-Module Curriculum */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Sequential Curriculum Roadmap (8 Modules)
            </h2>
            <p className="text-sm text-slate-600">
              From Business Thinking &amp; Excel through SQL, Python, Statistics, BI, Case Studies, and Interviews.
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
          {orderedModules.map((mod) => {
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
                      {modLessons.slice(0, 4).map((lesson) => {
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
                      {modLessons.length > 4 && (
                        <li className="text-[11px] text-slate-500 pl-3.5">
                          +{modLessons.length - 4} more lessons inside module
                        </li>
                      )}
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

          {/* Step 9 Card: Portfolio, Timed Drills & Career Readiness */}
          <article className="bg-white border border-blue-200 rounded-xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-medium text-blue-600">Step 9 · Launch</span>
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Portfolio, Timed Drills &amp; Career Readiness
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Convert analyses into GitHub READMEs &amp; case studies, test speed under blank-editor
                timed drills, and match job descriptions locally against your LMS evidence.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <a
                href="#/portfolio"
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <span>Portfolio</span>
              </a>
              <a
                href="#/timed-practice"
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg"
              >
                <span>Timed Drills</span>
              </a>
              <a
                href="#/career-readiness"
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg"
              >
                <span>Career Prep</span>
              </a>
            </div>
          </article>
        </div>
      </section>

      {/* Embedded Domain Labs */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Interactive Practice Labs (SQL, Python Simulator &amp; Statistics)
            </h2>
            <p className="text-sm text-slate-600">
              Query embedded company tables live, test pandas pipelines in our Constrained Simulator,
              and export CSVs anytime.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a
              href="#/timed-practice"
              className="text-slate-700 hover:text-blue-600 inline-flex items-center gap-1"
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Timed Practice</span>
            </a>
            <a
              href="#/lab"
              className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Browse All 6 Labs</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <p className="text-xs font-medium text-blue-600">
                    {lab.domain}
                    {lab.supportsPythonSimulator ? ' · SQL & Python Simulator' : ' · SQL & Formulas'}
                  </p>
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
