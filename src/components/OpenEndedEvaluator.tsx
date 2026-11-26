import {
  CheckCircle2,
  ClipboardCheck,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { LmsLocalState, OpenEndedTask } from '../types/academy';

interface OpenEndedEvaluatorProps {
  tasks: OpenEndedTask[];
  state: LmsLocalState;
  onSaveDraft: (taskId: string, draftText: string) => void;
  onSubmitResponse: (taskId: string, text?: string) => void;
  onToggleRubric: (taskId: string, criterionId: string) => void;
  onResetTask: (taskId: string) => void;
  heading?: string;
  subheading?: string;
}

const TASK_TYPE_LABELS: Record<OpenEndedTask['taskType'], string> = {
  sql_from_question: 'SQL Query Writing',
  dataset_grain: 'Dataset Grain Audit',
  kpi_definition: 'KPI Contract Design',
  interpret_result_table: 'Result Table Interpretation',
  executive_recommendation: 'Executive Recommendation',
  data_quality_risks: 'Data Quality Risks',
  debug_query_formula: 'Formula / Query Debugging',
  chart_defense: 'Chart Defense & BI',
  python_transformation: 'Python Transformation',
  statistical_interpretation: 'Statistical Interpretation',
  dax_modeling: 'DAX & Star Modeling',
};

export function OpenEndedEvaluator({
  tasks,
  state,
  onSaveDraft,
  onSubmitResponse,
  onToggleRubric,
  onResetTask,
  heading = 'Open-Ended Analytical Evaluation',
  subheading = 'Write structured responses against real datasets, inspect deterministic checks, and self-review with the transparent weighted rubric.',
}: OpenEndedEvaluatorProps) {
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});
  const [openRubrics, setOpenRubrics] = useState<Record<string, boolean>>({});

  if (tasks.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue-600">
          <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
          <span>Structured Evaluation Tasks</span>
        </div>
        <h2 className="font-display text-xl font-semibold text-slate-900">{heading}</h2>
        <p className="text-sm text-slate-600">{subheading}</p>
      </div>

      <div className="space-y-5">
        {tasks.map((task) => {
          const rec = state.openEndedSubmissions[task.id];
          const draft = rec?.draftText ?? '';
          const hasSubmitted = Boolean(rec?.submittedAt);
          const showHint = Boolean(openHints[task.id]);
          const showSolution = Boolean(openSolutions[task.id]);
          const showRubric = openRubrics[task.id] ?? true;

          return (
            <article
              key={task.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                    <span className="font-semibold text-blue-600 uppercase tracking-wide">
                      {TASK_TYPE_LABELS[task.taskType]}
                    </span>
                    <span>·</span>
                    <span>{task.recommendedLength}</span>
                    {hasSubmitted && rec?.combinedScorePercent !== null && (
                      <>
                        <span>·</span>
                        <span
                          className={`font-semibold ${
                            rec.combinedScorePercent >= 75
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          Evaluation Score: {rec.combinedScorePercent}% (Attempt {rec.attempts})
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900">
                    {task.title}
                  </h3>
                </div>

                {task.taskType === 'python_transformation' && (
                  <span className="text-xs text-slate-500 shrink-0">
                    Runs in Constrained Python Simulator
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-800 leading-relaxed">{task.prompt}</p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 space-y-1">
                <p>
                  <span className="font-semibold text-slate-900">Context / Dataset: </span>
                  {task.contextData}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Required Format: </span>
                  {task.requiredResponseFormat}
                </p>
              </div>

              {/* Transparent Weighted Rubric (visible before submission) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setOpenRubrics((prev) => ({ ...prev, [task.id]: !showRubric }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <span>Grading Rubric (40% / 25% / 15% / 10% / 10%)</span>
                  <span className="text-blue-600">
                    {showRubric ? 'Hide Rubric' : 'Show Rubric'}
                  </span>
                </button>
                {showRubric && (
                  <div className="divide-y divide-slate-100 px-4 py-2 bg-white">
                    {task.rubric.map((crit) => {
                      const checked = Boolean(rec?.selfRubricChecks?.[crit.id]);
                      return (
                        <label
                          key={crit.id}
                          className="py-2 flex items-start gap-2.5 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleRubric(task.id, crit.id)}
                            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-slate-900">
                              {crit.label} ({crit.weightPercent}%)
                            </span>
                            <span className="text-slate-600"> — {crit.description}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Response Editor */}
              <div className="space-y-2">
                <label htmlFor={`oe-input-${task.id}`} className="sr-only">
                  Response for {task.title}
                </label>
                <textarea
                  id={`oe-input-${task.id}`}
                  rows={
                    task.taskType === 'sql_from_question' ||
                    task.taskType === 'python_transformation'
                      ? 6
                      : 5
                  }
                  value={draft}
                  onChange={(e) => onSaveDraft(task.id, e.target.value)}
                  spellCheck={
                    task.taskType !== 'sql_from_question' &&
                    task.taskType !== 'python_transformation'
                  }
                  placeholder={
                    task.taskType === 'sql_from_question'
                      ? 'Write your executable SQL query here...'
                      : task.taskType === 'python_transformation'
                        ? 'Write your pandas code here (e.g., import pandas as pd)...'
                        : 'Write your structured analytical response here (drafts save automatically)...'
                  }
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none ${
                    task.taskType === 'sql_from_question' ||
                    task.taskType === 'python_transformation'
                      ? 'font-mono text-xs leading-relaxed'
                      : 'leading-relaxed'
                  }`}
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSubmitResponse(task.id, draft)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{hasSubmitted ? 'Retry & Re-Evaluate' : 'Submit & Evaluate'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenHints((prev) => ({ ...prev, [task.id]: !prev[task.id] }))
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenSolutions((prev) => ({
                          ...prev,
                          [task.id]: !prev[task.id],
                        }))
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{showSolution ? 'Hide Reference Answer' : 'Reference Answer'}</span>
                    </button>
                  </div>

                  {draft.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onResetTask(task.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-700 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Reset Task</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Evaluation Result */}
              {hasSubmitted && rec && (
                <div
                  className={`p-4 rounded-xl border space-y-2 text-xs ${
                    (rec.combinedScorePercent ?? 0) >= 75
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Automated Checks: {rec.automatedScorePercent ?? 0}% · Combined With Self-Rubric:{' '}
                      {rec.combinedScorePercent ?? 0}%
                    </span>
                    <span className="tabular-nums opacity-80">
                      Check off rubric items above after comparing with Reference Answer
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 opacity-90">
                    {rec.automatedChecksSummary.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              {showHint && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Hint: </span>
                  {task.hint}
                </div>
              )}

              {showSolution && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">Reference Answer</p>
                  <pre className="whitespace-pre-wrap font-mono bg-white border border-slate-200 rounded-lg p-3 text-slate-900 leading-relaxed">
                    {task.referenceAnswer}
                  </pre>
                  <p>
                    <span className="font-semibold text-slate-900">Why This Works: </span>
                    {task.explanation}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
