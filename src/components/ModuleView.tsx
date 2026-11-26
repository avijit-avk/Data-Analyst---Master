import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Clock,
  FlaskConical,
} from 'lucide-react';
import { getLessonsForModule, getModuleById, LMS_MODULES } from '../data/lmsCurriculum';
import { getLabById } from '../data/lmsLabs';
import { getQuizById } from '../data/lmsQuizzes';
import { getOpenEndedTasksForModule } from '../data/openEndedTasks';
import { BehavioralAnswerRecord, LmsLocalState } from '../types/academy';
import { BehavioralInterviewPanel } from './BehavioralInterviewPanel';
import { CourseIcon } from './CourseIcon';
import { OpenEndedEvaluator } from './OpenEndedEvaluator';

interface ModuleViewProps {
  moduleId?: string;
  state: LmsLocalState;
  onToggleLessonComplete: (lessonId: string) => void;
  onSaveOpenEndedDraft: (taskId: string, draftText: string) => void;
  onSubmitOpenEndedResponse: (taskId: string, text?: string) => void;
  onToggleOpenEndedRubric: (taskId: string, criterionId: string) => void;
  onResetOpenEndedTask: (taskId: string) => void;
  onSaveBehavioralAnswer: (record: BehavioralAnswerRecord) => void;
  onDeleteBehavioralAnswer: (recordId: string) => void;
}

export function ModuleView({
  moduleId,
  state,
  onToggleLessonComplete,
  onSaveOpenEndedDraft,
  onSubmitOpenEndedResponse,
  onToggleOpenEndedRubric,
  onResetOpenEndedTask,
  onSaveBehavioralAnswer,
  onDeleteBehavioralAnswer,
}: ModuleViewProps) {
  const orderedModules = [...LMS_MODULES].sort((a, b) => a.order - b.order);

  if (!moduleId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
              8-Module Sequential Curriculum + Launch Readiness
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              All Learning Modules
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              Complete lessons in order, practice on each module’s embedded business dataset, finish
              open-ended evaluations, and score 80% or higher on the module quiz.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
            <a
              href="#/timed-practice"
              className="px-3.5 py-2 font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl"
            >
              Timed Coding Drills
            </a>
            <a
              href="#/quiz"
              className="px-3.5 py-2 font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl"
            >
              All Assessments
            </a>
          </div>
        </div>

        <div className="space-y-4">
          {orderedModules.map((mod) => {
            const lessons = getLessonsForModule(mod.id);
            const doneCount = lessons.filter((l) =>
              state.completedLessonIds.includes(l.id)
            ).length;
            const quizRec = state.quizResults[mod.quizId];
            const lab = getLabById(mod.labId);
            const labDone = lab
              ? lab.exercises.filter((e) => state.exerciseCheckStatus[e.id] === 'verified').length
              : 0;
            const oeTasks = getOpenEndedTasksForModule(mod.id);
            const oeDone = oeTasks.filter((t) =>
              Boolean(state.openEndedSubmissions[t.id]?.submittedAt)
            ).length;

            return (
              <article
                key={mod.id}
                className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 tabular-nums">
                    <span className="font-semibold text-blue-600">Module {mod.order}</span>
                    <span>·</span>
                    <span>{mod.estimatedHours} hours estimated</span>
                    <span>·</span>
                    <span>
                      {doneCount}/{lessons.length} lessons
                    </span>
                    {lab && (
                      <>
                        <span>·</span>
                        <span>
                          Lab {labDone}/{lab.exercises.length}
                        </span>
                      </>
                    )}
                    {oeTasks.length > 0 && (
                      <>
                        <span>·</span>
                        <span>
                          Open-Ended {oeDone}/{oeTasks.length}
                        </span>
                      </>
                    )}
                    {quizRec && (
                      <>
                        <span>·</span>
                        <span
                          className={
                            quizRec.passed
                              ? 'text-emerald-700 font-medium'
                              : 'text-amber-700 font-medium'
                          }
                        >
                          Quiz {quizRec.bestScorePercent}% ({quizRec.passed ? 'Passed' : 'Retry'})
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    <a href={`#/module/${mod.id}`} className="hover:text-blue-600 transition-colors">
                      {mod.title}
                    </a>
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{mod.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <a
                    href={`#/module/${mod.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span>Open Module</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <a
                    href={`#/lab/${mod.labId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span>Lab</span>
                  </a>
                  <a
                    href={`#/quiz/${mod.quizId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span>Quiz</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  const mod = getModuleById(moduleId);
  if (!mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="font-display text-xl font-semibold text-slate-900">Module Not Found</h1>
        <a
          href="#/modules"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to Modules</span>
        </a>
      </div>
    );
  }

  const lessons = getLessonsForModule(mod.id);
  const doneCount = lessons.filter((l) => state.completedLessonIds.includes(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0;
  const lab = getLabById(mod.labId);
  const quiz = getQuizById(mod.quizId);
  const quizResult = state.quizResults[mod.quizId];
  const openEndedTasks = getOpenEndedTasksForModule(mod.id);

  const prevModule = orderedModules.find((m) => m.order === mod.order - 1);
  const nextModule = orderedModules.find((m) => m.order === mod.order + 1);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <a href="#/dashboard" className="hover:text-slate-900">
          Dashboard
        </a>
        <span>/</span>
        <a href="#/modules" className="hover:text-slate-900">
          Modules
        </a>
        <span>/</span>
        <span className="text-slate-900 font-medium">Module {mod.order}</span>
      </nav>

      {/* Module Overview Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <CourseIcon iconKey={mod.iconKey} className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-blue-600 tabular-nums">
                Module {mod.order} of {orderedModules.length} · {mod.estimatedHours} hours ·{' '}
                {lessons.length} built-in lessons
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {mod.title}
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">{mod.description}</p>
            </div>
          </div>
        </div>

        {(mod.id === 'mod-python' || mod.id === 'mod-stats') && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700">
            <span className="font-semibold text-slate-900">
              {mod.id === 'mod-python'
                ? 'Constrained Python & pandas Simulator: '
                : 'Statistical Caution Standard: '}
            </span>
            {mod.id === 'mod-python'
              ? 'Code exercises in this module execute inside our browser-local Constrained Python & pandas Simulator against the embedded company CSV tables (rather than full arbitrary CPython).'
              : 'Every lesson explicitly distinguishes assumptions, justified claims, unsupported causal leaps, and real-world business decisions on small or skewed datasets.'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Learning Objectives
            </h2>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {mod.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold tabular-nums">{idx + 1}.</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Prerequisites
              </h2>
              <p className="text-sm text-slate-700">{mod.prerequisites.join(' · ')}</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 tabular-nums">
                <span>Module Completion</span>
                <span className="font-semibold text-slate-900">
                  {doneCount} / {lessons.length} lessons ({pct}%)
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ordered Lessons List */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Built-In Self-Study Lessons
        </h2>

        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {lessons.map((lesson) => {
            const isDone = state.completedLessonIds.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    onClick={() => onToggleLessonComplete(lesson.id)}
                    aria-label={
                      isDone
                        ? `Mark ${lesson.title} incomplete`
                        : `Mark ${lesson.title} complete`
                    }
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Circle className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                      <span className="font-medium text-slate-700">Lesson {lesson.order}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {lesson.durationMinutes} min
                      </span>
                      {isDone && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-700 font-medium">Completed</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      <a
                        href={`#/lesson/${lesson.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {lesson.title}
                      </a>
                    </h3>
                    <p className="text-sm text-slate-600">{lesson.summary}</p>
                  </div>
                </div>

                <a
                  href={`#/lesson/${lesson.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                >
                  <span>{isDone ? 'Review Lesson' : 'Read Lesson'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lab + Quiz Action Pair */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {lab && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                <FlaskConical className="w-4 h-4" aria-hidden="true" />
                <span>Applied Practice Lab · {lab.domain}</span>
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">{lab.title}</h3>
              <p className="text-sm text-slate-600">{lab.overview}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 tabular-nums">
                {
                  lab.exercises.filter((e) => state.exerciseCheckStatus[e.id] === 'verified')
                    .length
                }{' '}
                / {lab.exercises.length} challenges verified
              </span>
              <a
                href={`#/lab/${lab.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span>Open Practice Lab</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}

        {quiz && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                <Award className="w-4 h-4" aria-hidden="true" />
                <span>End-of-Module Assessment</span>
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">{quiz.title}</h3>
              <p className="text-sm text-slate-600">
                {quiz.questions.length} graded questions · {quiz.passingPercent}% passing score ·
                instant explanations.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span
                className={`text-xs font-medium tabular-nums ${
                  quizResult?.passed
                    ? 'text-emerald-700'
                    : quizResult
                      ? 'text-amber-700'
                      : 'text-slate-500'
                }`}
              >
                {quizResult
                  ? `Best: ${quizResult.bestScorePercent}% (${
                      quizResult.passed ? 'Passed' : 'Retry'
                    })`
                  : 'Not attempted yet'}
              </span>
              <a
                href={`#/quiz/${quiz.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <span>{quizResult ? 'Retake Quiz' : 'Start Quiz'}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Module Open-Ended Evaluation Task */}
      <OpenEndedEvaluator
        tasks={openEndedTasks}
        state={state}
        onSaveDraft={onSaveOpenEndedDraft}
        onSubmitResponse={onSubmitOpenEndedResponse}
        onToggleRubric={onToggleOpenEndedRubric}
        onResetTask={onResetOpenEndedTask}
      />

      {/* Module 8 (mod-6): Behavioral Interview Studio + Career/Timed Shortcuts */}
      {mod.id === 'mod-6' && (
        <>
          <BehavioralInterviewPanel
            state={state}
            onSaveAnswer={onSaveBehavioralAnswer}
            onDeleteAnswer={onDeleteBehavioralAnswer}
          />

          <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Continue Final Hiring Preparation
              </h3>
              <p className="text-sm text-slate-600">
                Pair your Behavioral STAR drafts with blank-editor Timed Coding Drills and Career Readiness tools.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="#/timed-practice"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl"
              >
                Timed Live-Coding Practice
              </a>
              <a
                href="#/career-readiness"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Resume &amp; Career Workspace
              </a>
            </div>
          </section>
        </>
      )}

      {/* Module Prev / Next */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-sm">
        {prevModule ? (
          <a
            href={`#/module/${prevModule.id}`}
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Module {prevModule.order}: {prevModule.subtitle}</span>
          </a>
        ) : (
          <a
            href="#/dashboard"
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Dashboard</span>
          </a>
        )}

        {nextModule ? (
          <a
            href={`#/module/${nextModule.id}`}
            className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700"
          >
            <span>Next: Module {nextModule.order}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        ) : (
          <a
            href="#/quiz/quiz-capstone"
            className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:text-emerald-800"
          >
            <span>Final Capstone Exam</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
