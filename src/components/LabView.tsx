import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Table as TableIcon,
} from 'lucide-react';
import { KeyboardEvent, useEffect, useState } from 'react';
import { getDatasetById, triggerCsvDownload } from '../data/embeddedDatasets';
import { getLabById, LMS_LABS } from '../data/lmsLabs';
import { LmsLocalState } from '../types/academy';
import { executeSqlQuery, SqlExecutionResponse } from '../utils/sqlSandboxEngine';

interface LabViewProps {
  labId?: string;
  state: LmsLocalState;
  onUpdateAnswer: (exerciseId: string, answer: string) => void;
  onCheckAnswer: (exerciseId: string) => void;
  onUpdateLabNote: (labId: string, note: string) => void;
}

export function LabView({
  labId,
  state,
  onUpdateAnswer,
  onCheckAnswer,
  onUpdateLabNote,
}: LabViewProps) {
  const activeLab = labId ? getLabById(labId) : undefined;
  const dataset = activeLab ? getDatasetById(activeLab.datasetId) : undefined;

  const [activeTableIdx, setActiveTableIdx] = useState(0);
  const [showSchema, setShowSchema] = useState(false);
  const [sqlText, setSqlText] = useState(activeLab?.defaultSqlQuery ?? '');
  const [sqlResult, setSqlResult] = useState<SqlExecutionResponse | null>(null);
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveTableIdx(0);
    setShowSchema(false);
    setOpenHints({});
    setOpenSolutions({});
    if (activeLab && dataset) {
      setSqlText(activeLab.defaultSqlQuery);
      setSqlResult(executeSqlQuery(activeLab.defaultSqlQuery, dataset.tables));
    } else {
      setSqlText('');
      setSqlResult(null);
    }
  }, [activeLab?.id]);

  if (!activeLab || !dataset) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            Interactive Sandbox &amp; Datasets
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Practice Labs
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Every dataset lives inside this browser—no external downloads or accounts needed. Run
            live SQL queries against multi-table schemas, test business formulas, and verify answers
            instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LMS_LABS.map((lab) => {
            const ds = getDatasetById(lab.datasetId);
            const verifiedCount = lab.exercises.filter(
              (ex) => state.exerciseCheckStatus[ex.id] === 'verified'
            ).length;
            const totalRows = ds ? ds.tables.reduce((acc, t) => acc + t.rows.length, 0) : 0;

            return (
              <article
                key={lab.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                    <span className="font-semibold text-blue-600">{lab.domain}</span>
                    <span>
                      {ds?.tables.length ?? 0} tables · {totalRows} rows
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    <a href={`#/lab/${lab.id}`} className="hover:text-blue-600 transition-colors">
                      {lab.title}
                    </a>
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{lab.overview}</p>
                  {ds && (
                    <p className="text-xs font-mono text-slate-500">
                      Tables: {ds.tables.map((t) => t.name).join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-600 tabular-nums">
                    {verifiedCount} / {lab.exercises.length} challenges verified
                  </span>
                  <a
                    href={`#/lab/${lab.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Database className="w-4 h-4" aria-hidden="true" />
                    <span>Launch Lab</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  const activeTable = dataset.tables[activeTableIdx] ?? dataset.tables[0];
  const verifiedCount = activeLab.exercises.filter(
    (ex) => state.exerciseCheckStatus[ex.id] === 'verified'
  ).length;

  const handleRunSql = (queryToRun?: string) => {
    const q = queryToRun ?? sqlText;
    setSqlResult(executeSqlQuery(q, dataset.tables));
  };

  const handleSqlKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunSql();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Breadcrumb + Lab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <a
            href="#/lab"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>All Practice Labs</span>
          </a>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {activeLab.title}
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl">{activeLab.businessBrief}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {LMS_LABS.map((lab) => {
            const isCurr = lab.id === activeLab.id;
            return (
              <a
                key={lab.id}
                href={`#/lab/${lab.id}`}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  isCurr
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {lab.domain}
              </a>
            );
          })}
        </div>
      </div>

      {/* Embedded Dataset Explorer */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <TableIcon className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
            <span className="font-display text-sm font-semibold text-slate-900">
              Embedded Dataset: {dataset.title}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              · {activeTable.rows.length} rows
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSchema((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
            >
              <span>{showSchema ? 'Hide Schema' : 'View Schema'}</span>
              {showSchema ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => triggerCsvDownload(activeTable)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export {activeTable.csvFilename}</span>
            </button>
          </div>
        </div>

        {/* Table Switcher */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">Tables:</span>
          {dataset.tables.map((tbl, idx) => (
            <button
              key={tbl.name}
              type="button"
              onClick={() => setActiveTableIdx(idx)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors cursor-pointer ${
                idx === activeTableIdx
                  ? 'bg-white text-slate-900 border-slate-300 font-semibold shadow-2xs'
                  : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100'
              }`}
            >
              {tbl.name} ({tbl.rows.length})
            </button>
          ))}
        </div>

        {showSchema && (
          <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {activeTable.columns.map((col) => (
              <div
                key={col.name}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-slate-900">{col.name}</span>
                  <span className="font-mono text-[11px] text-blue-600">{col.type}</span>
                </div>
                <p className="text-slate-500 mt-0.5">{col.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Row Preview (first 8 rows, scrollable horizontally) */}
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
              <tr>
                {activeTable.columns.map((col) => (
                  <th
                    key={col.name}
                    className="px-3.5 py-2.5 font-mono font-semibold text-slate-700 whitespace-nowrap"
                  >
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {activeTable.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/70">
                  {activeTable.columns.map((col) => {
                    const val = row[col.name];
                    return (
                      <td
                        key={col.name}
                        className={`px-3.5 py-2 whitespace-nowrap ${
                          val === null ? 'font-mono text-amber-700 italic' : 'text-slate-700'
                        }`}
                      >
                        {val === null ? 'NULL' : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive SQL Query Sandbox */}
      {activeLab.supportsSqlSandbox && (
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                In-Browser SQL Query Sandbox
              </h2>
              <p className="text-xs text-slate-500">
                Supports SELECT, JOIN, WHERE, GROUP BY, HAVING, CASE WHEN, WITH CTEs, and Window
                Functions across all {dataset.tables.length} tables above. Press Ctrl/Cmd + Enter to
                run.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSqlText(activeLab.defaultSqlQuery);
                  handleRunSql(activeLab.defaultSqlQuery);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => handleRunSql()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Run SQL Query</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            <div className="lg:col-span-6 p-4 bg-slate-950">
              <label htmlFor="sql-sandbox-editor" className="sr-only">
                SQL query editor
              </label>
              <textarea
                id="sql-sandbox-editor"
                rows={10}
                value={sqlText}
                onChange={(e) => setSqlText(e.target.value)}
                onKeyDown={handleSqlKeyDown}
                spellCheck={false}
                className="w-full h-full min-h-[210px] bg-transparent text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-y"
              />
            </div>

            <div className="lg:col-span-6 flex flex-col max-h-[300px]">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 tabular-nums">
                <span className="font-medium">Query Output</span>
                {sqlResult?.ok && (
                  <span>
                    {sqlResult.rows.length} rows · {sqlResult.executionMs} ms
                  </span>
                )}
              </div>

              {sqlResult && !sqlResult.ok && (
                <div className="p-4 text-xs text-red-700 bg-red-50 font-mono">
                  SQL Error: {sqlResult.error}
                </div>
              )}

              {sqlResult?.ok && (
                <div className="overflow-auto flex-1">
                  {sqlResult.rows.length === 0 ? (
                    <p className="p-4 text-xs text-slate-500">
                      Query executed cleanly and returned 0 matching rows.
                    </p>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                        <tr>
                          {sqlResult.columns.map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2 font-mono font-semibold text-slate-700 whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 tabular-nums">
                        {sqlResult.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {sqlResult.columns.map((col) => {
                              const v = row[col];
                              return (
                                <td
                                  key={col}
                                  className={`px-3 py-2 whitespace-nowrap ${
                                    v === null ? 'font-mono text-amber-700 italic' : 'text-slate-700'
                                  }`}
                                >
                                  {v === null ? 'NULL' : String(v)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Challenges */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Guided Lab Challenges
            </h2>
            <p className="text-sm text-slate-600">
              Submit your query result, formula, or metric calculation below for instant verification.
            </p>
          </div>
          <span className="text-sm font-medium text-slate-700 tabular-nums">
            {verifiedCount} / {activeLab.exercises.length} Verified
          </span>
        </div>

        <div className="space-y-4">
          {activeLab.exercises.map((ex) => {
            const answer = state.exerciseAnswers[ex.id] ?? '';
            const status = state.exerciseCheckStatus[ex.id] ?? 'unchecked';
            const feedback = state.exerciseFeedback[ex.id];
            const showHint = Boolean(openHints[ex.id]);
            const showSolution = Boolean(openSolutions[ex.id]);

            return (
              <article
                key={ex.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-blue-600 uppercase tracking-wide">
                        {ex.kind === 'sql'
                          ? 'SQL Challenge'
                          : ex.kind === 'formula'
                            ? 'Formula Challenge'
                            : 'Metric Analysis'}
                      </span>
                      <span>·</span>
                      <span>Challenge {ex.order}</span>
                      {status === 'verified' && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            Verified
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900">
                      {ex.title}
                    </h3>
                  </div>

                  {ex.starterSql && (
                    <button
                      type="button"
                      onClick={() => {
                        setSqlText(ex.starterSql!);
                        handleRunSql(ex.starterSql!);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Run Starter Query in Sandbox</span>
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">{ex.prompt}</p>

                <div className="space-y-2">
                  <label htmlFor={`ex-input-${ex.id}`} className="sr-only">
                    Answer for {ex.title}
                  </label>
                  <textarea
                    id={`ex-input-${ex.id}`}
                    rows={2}
                    value={answer}
                    onChange={(e) => onUpdateAnswer(ex.id, e.target.value)}
                    placeholder={
                      ex.kind === 'formula'
                        ? 'Enter your Excel or DAX formula (and result if requested)...'
                        : 'Enter your metric values, account/segment name, or short summary...'
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onCheckAnswer(ex.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Check Answer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenHints((prev) => ({ ...prev, [ex.id]: !prev[ex.id] }))
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenSolutions((prev) => ({ ...prev, [ex.id]: !prev[ex.id] }))
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{showSolution ? 'Hide Solution' : 'Step-by-Step Solution'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {status !== 'unchecked' && feedback && (
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      status === 'verified'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    {feedback}
                  </div>
                )}

                {showHint && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Hint: </span>
                    {ex.hint}
                  </div>
                )}

                {showSolution && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">Step-by-Step Walkthrough</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {ex.solutionSteps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                    <p className="font-mono text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2">
                      {ex.referenceAnswer}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Lab Notes */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={`lab-note-${activeLab.id}`}
            className="font-display text-base font-semibold text-slate-900"
          >
            Lab Observations &amp; Queries Scratchpad
          </label>
          <span className="text-xs text-slate-500">Saved locally</span>
        </div>
        <textarea
          id={`lab-note-${activeLab.id}`}
          rows={3}
          value={state.labNotes[activeLab.id] ?? ''}
          onChange={(e) => onUpdateLabNote(activeLab.id, e.target.value)}
          placeholder="Record your insights, edge-case findings, or portfolio summary bullets..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
        />
      </section>
    </div>
  );
}
