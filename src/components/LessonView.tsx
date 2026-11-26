import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  NotebookPen,
  Play,
  Terminal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { EMBEDDED_DATASETS } from '../data/embeddedDatasets';
import {
  getLessonById,
  getLessonsForModule,
  getModuleById,
  LMS_LESSONS,
} from '../data/lmsCurriculum';
import { LmsLocalState } from '../types/academy';
import { PythonSimulationResponse, simulatePythonCode } from '../utils/pythonSimulatorEngine';

interface LessonViewProps {
  lessonId: string;
  state: LmsLocalState;
  onToggleLessonComplete: (lessonId: string) => void;
  onUpdateLessonNote: (lessonId: string, note: string) => void;
}

export function LessonView({
  lessonId,
  state,
  onToggleLessonComplete,
  onUpdateLessonNote,
}: LessonViewProps) {
  const lesson = getLessonById(lessonId);
  const [showExerciseHint, setShowExerciseHint] = useState(false);
  const [showExerciseSolution, setShowExerciseSolution] = useState(false);
  const [simCode, setSimCode] = useState('');
  const [simResult, setSimResult] = useState<PythonSimulationResponse | null>(null);

  useEffect(() => {
    setShowExerciseHint(false);
    setShowExerciseSolution(false);
    setSimCode(lesson?.guidedExercise?.starterCode ?? '');
    setSimResult(null);
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="font-display text-xl font-semibold text-slate-900">Lesson Not Found</h1>
        <a
          href="#/modules"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Browse Modules</span>
        </a>
      </div>
    );
  }

  const mod = getModuleById(lesson.moduleId);
  const moduleLessons = getLessonsForModule(lesson.moduleId);
  const globalIndex = LMS_LESSONS.findIndex((l) => l.id === lesson.id);
  const prevLesson = globalIndex > 0 ? LMS_LESSONS[globalIndex - 1] : undefined;
  const nextLesson =
    globalIndex >= 0 && globalIndex < LMS_LESSONS.length - 1
      ? LMS_LESSONS[globalIndex + 1]
      : undefined;

  const isCompleted = state.completedLessonIds.includes(lesson.id);
  const noteValue = state.lessonNotes[lesson.id] ?? '';

  const handleRunLessonSimulator = () => {
    const tables = EMBEDDED_DATASETS.flatMap((d) => d.tables);
    setSimResult(simulatePythonCode(simCode, tables));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Lesson Stepper */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          {mod && (
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <a
                href={`#/module/${mod.id}`}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Module {mod.order} Overview</span>
              </a>
              <p className="font-display text-sm font-semibold text-slate-900 leading-snug">
                {mod.title}
              </p>
            </div>
          )}

          <ol className="space-y-1">
            {moduleLessons.map((item) => {
              const active = item.id === lesson.id;
              const done = state.completedLessonIds.includes(item.id);
              return (
                <li key={item.id}>
                  <a
                    href={`#/lesson/${item.id}`}
                    className={`flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      active
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="tabular-nums shrink-0 mt-0.5">
                      {done ? '✓' : `${item.order}.`}
                    </span>
                    <span className="leading-snug">{item.title}</span>
                  </a>
                </li>
              );
            })}
          </ol>

          {mod && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <a
                href={`#/lab/${mod.labId}`}
                className="w-full inline-flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Module Practice Lab</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a
                href={`#/quiz/${mod.quizId}`}
                className="w-full inline-flex items-center justify-between px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Module Graded Quiz</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          )}
        </aside>

        {/* Main Lesson Content */}
        <article className="lg:col-span-9 space-y-8">
          {/* Header */}
          <header className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                <a href="#/dashboard" className="hover:text-slate-900">
                  Dashboard
                </a>
                <span>/</span>
                {mod && (
                  <>
                    <a href={`#/module/${mod.id}`} className="hover:text-slate-900">
                      Module {mod.order}
                    </a>
                    <span>/</span>
                  </>
                )}
                <span className="text-slate-900 font-medium">Lesson {lesson.order}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {lesson.durationMinutes} min read
                </span>
              </div>

              <button
                type="button"
                onClick={() => onToggleLessonComplete(lesson.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{isCompleted ? 'Completed' : 'Mark Lesson Complete'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {lesson.title}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">{lesson.summary}</p>
              {lesson.learningObjective && (
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
                  <span className="font-semibold text-blue-700">Learning Objective: </span>
                  {lesson.learningObjective}
                </p>
              )}
            </div>
          </header>

          {/* 1. Core Concepts */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              1. Core Concepts
            </h2>
            <div className="space-y-5">
              {lesson.coreConcepts.map((concept, idx) => (
                <div key={idx} className="space-y-2 pb-5 border-b border-slate-100 last:border-b-0 last:pb-0">
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    {concept.heading}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {concept.explanation}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
                    <span className="font-semibold text-blue-700">Key Takeaway: </span>
                    {concept.keyTakeaway}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Syntax / Formula / Query Reference */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              2. Syntax &amp; Formula Reference
            </h2>
            <div className="space-y-4">
              {lesson.syntaxReference.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <pre className="font-mono text-xs sm:text-sm bg-slate-900 text-slate-100 rounded-lg p-3.5 overflow-x-auto leading-relaxed">
                    <code>{item.syntax}</code>
                  </pre>
                  <p className="text-xs sm:text-sm text-slate-600">{item.usage}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Worked Step-by-Step Example */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                3. Worked Example
              </h2>
              <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <span className="font-semibold text-slate-900">Scenario: </span>
                {lesson.workedExample.scenario}
              </p>
            </div>

            <ol className="space-y-4">
              {lesson.workedExample.steps.map((step, idx) => (
                <li key={idx} className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900">{step.stepTitle}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{step.detail}</p>
                  {step.codeOrFormula && (
                    <pre className="font-mono text-xs bg-slate-900 text-slate-100 rounded-lg p-3.5 overflow-x-auto leading-relaxed">
                      <code>{step.codeOrFormula}</code>
                    </pre>
                  )}
                </li>
              ))}
            </ol>

            {lesson.workedExample.expectedOutput && (
              <div className="bg-slate-900 text-slate-100 rounded-lg px-3.5 py-2.5 text-xs font-mono">
                <span className="text-slate-400">Expected Output: </span>
                {lesson.workedExample.expectedOutput}
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-sm text-emerald-900">
              <span className="font-semibold">Outcome: </span>
              {lesson.workedExample.outcome}
            </div>
          </section>

          {/* Optional Guided Exercise & Inline Simulator */}
          {lesson.guidedExercise && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    Guided Practice Check
                  </h2>
                </div>
                {lesson.guidedExercise.starterCode && (
                  <span className="text-xs text-slate-500">
                    Constrained Python &amp; pandas Simulator
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {lesson.guidedExercise.prompt}
              </p>

              {lesson.guidedExercise.starterCode && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Try in Constrained Python &amp; pandas Simulator
                    </span>
                    <button
                      type="button"
                      onClick={handleRunLessonSimulator}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Run Simulator</span>
                    </button>
                  </div>
                  <div className="p-3.5 bg-slate-950">
                    <textarea
                      rows={6}
                      value={simCode}
                      onChange={(e) => setSimCode(e.target.value)}
                      spellCheck={false}
                      aria-label="Lesson Python simulator editor"
                      className="w-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-y"
                    />
                  </div>

                  {simResult && (
                    <div className="p-3.5 border-t border-slate-200 bg-slate-50 text-xs space-y-2">
                      {!simResult.ok ? (
                        <p className="font-mono text-red-700">{simResult.error}</p>
                      ) : (
                        <>
                          {simResult.outputLines.length > 0 && (
                            <pre className="font-mono bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto">
                              {simResult.outputLines.join('\n')}
                            </pre>
                          )}
                          {simResult.resultTable && simResult.resultTable.rows.length > 0 && (
                            <div className="overflow-x-auto max-h-56 bg-white border border-slate-200 rounded-lg">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                    {simResult.resultTable.columns.map((col) => (
                                      <th key={col} className="px-3 py-2 font-mono font-semibold text-slate-700">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 tabular-nums">
                                  {simResult.resultTable.rows.slice(0, 12).map((row, idx) => (
                                    <tr key={idx}>
                                      {simResult.resultTable!.columns.map((col) => (
                                        <td key={col} className="px-3 py-1.5 text-slate-700 whitespace-nowrap">
                                          {row[col] === null ? 'NULL' : String(row[col])}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExerciseHint((h) => !h)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{showExerciseHint ? 'Hide Hint' : 'Hint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExerciseSolution((s) => !s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{showExerciseSolution ? 'Hide Solution' : 'Reveal Solution'}</span>
                </button>
              </div>

              {showExerciseHint && (
                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="font-semibold text-slate-900">Hint: </span>
                  {lesson.guidedExercise.hint}
                </p>
              )}

              {showExerciseSolution && (
                <pre className="text-xs font-mono bg-slate-900 text-slate-100 rounded-lg p-3.5 whitespace-pre-wrap">
                  {lesson.guidedExercise.solution}
                </pre>
              )}
            </section>
          )}

          {/* Optional Statistical Framing (Module 5 Statistics) */}
          {lesson.statisticalFraming && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Statistical Scope, Assumptions &amp; Causal Discipline
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <p className="font-semibold text-slate-900">Assumptions</p>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    {lesson.statisticalFraming.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <p className="font-semibold text-slate-900">Business Decision</p>
                  <p className="text-slate-700 leading-relaxed">{lesson.statisticalFraming.decision}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                  <p className="font-semibold text-emerald-900">Justified From Data</p>
                  <p className="text-emerald-900/90 leading-relaxed">
                    {lesson.statisticalFraming.justified}
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                  <p className="font-semibold text-amber-900">NOT Justified (Avoid Overclaiming)</p>
                  <p className="text-amber-900/90 leading-relaxed">
                    {lesson.statisticalFraming.notJustified}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 4. Common Pitfalls */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold text-slate-900">
                4. Common Pitfalls &amp; Fixes
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {lesson.commonPitfalls.map((pitfall, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                  <p className="text-sm font-semibold text-slate-900">{pitfall.mistake}</p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">Why it breaks: </span>
                    {pitfall.whyItBreaks}
                  </p>
                  <p className="text-sm text-emerald-800">
                    <span className="font-medium">Fix: </span>
                    {pitfall.fix}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Business Interpretation */}
          {lesson.businessInterpretation && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Business Interpretation
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {lesson.businessInterpretation}
              </p>
            </section>
          )}

          {/* 5. Summary Cheat Sheet */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              5. Summary Cheat Sheet
            </h2>
            <ul className="space-y-2 text-sm text-slate-700">
              {lesson.cheatSheet.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Personal Lesson Notes */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor={`note-${lesson.id}`}
                className="inline-flex items-center gap-2 font-display text-base font-semibold text-slate-900"
              >
                <NotebookPen className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>Personal Study Notes</span>
              </label>
              <span className="text-xs text-slate-500">Saved locally as you type</span>
            </div>
            <textarea
              id={`note-${lesson.id}`}
              rows={3}
              value={noteValue}
              onChange={(e) => onUpdateLessonNote(lesson.id, e.target.value)}
              placeholder="Write your own summary, edge cases to remember, or interview takeaways..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </section>

          {/* Lesson Footer Controls */}
          <footer className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {prevLesson ? (
              <a
                href={`#/lesson/${prevLesson.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Previous: {prevLesson.title}</span>
              </a>
            ) : (
              <a
                href="#/modules"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>All Modules</span>
              </a>
            )}

            <div className="flex flex-wrap items-center gap-2.5 justify-end">
              {!isCompleted && (
                <button
                  type="button"
                  onClick={() => onToggleLessonComplete(lesson.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Complete Lesson</span>
                </button>
              )}

              {nextLesson ? (
                <a
                  href={`#/lesson/${nextLesson.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  <span>Next Lesson</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              ) : (
                <a
                  href="#/quiz/quiz-capstone"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                >
                  <span>Take Final Capstone Exam</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
