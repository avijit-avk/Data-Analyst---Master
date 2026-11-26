import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Download,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Table as TableIcon,
  Terminal,
} from 'lucide-react';
import { KeyboardEvent, useEffect, useState } from 'react';
import { EMBEDDED_DATASETS, getDatasetById, triggerCsvDownload } from '../data/embeddedDatasets';
import { getLabById, LMS_LABS } from '../data/lmsLabs';
import { getOpenEndedTasksForLab } from '../data/openEndedTasks';
import { LmsLocalState } from '../types/academy';
import { PythonSimulationResponse, simulatePythonCode } from '../utils/pythonSimulatorEngine';
import { executeSqlQuery, SqlExecutionResponse } from '../utils/sqlSandboxEngine';
import { OpenEndedEvaluator } from './OpenEndedEvaluator';

interface LabViewProps {
  labId?: string;
  state: LmsLocalState;
  onUpdateAnswer: (exerciseId: string, answer: string) => void;
  onCheckAnswer: (exerciseId: string) => void;
  onUpdateLabNote: (labId: string, note: string) => void;
  onSaveOpenEndedDraft: (taskId: string, draftText: string) => void;
  onSubmitOpenEndedResponse: (taskId: string, text?: string) => void;
  onToggleOpenEndedRubric: (taskId: string, criterionId: string) => void;
  onResetOpenEndedTask: (taskId: string) => void;
}

export function LabView({
  labId,
  state,
  onUpdateAnswer,
  onCheckAnswer,
  onUpdateLabNote,
  onSaveOpenEndedDraft,
  onSubmitOpenEndedResponse,
  onToggleOpenEndedRubric,
  onResetOpenEndedTask,
}: LabViewProps) {
  const activeLab = labId ? getLabById(labId) : undefined;
  const dataset = activeLab ? getDatasetById(activeLab.datasetId) : undefined;

  const [activeTableIdx, setActiveTableIdx] = useState(0);
  const [showSchema, setShowSchema] = useState(false);
  const [sandboxMode, setSandboxMode] = useState<'sql' | 'python'>(() =>
    Boolean(activeLab?.supportsPythonSimulator) &&
    (activeLab?.id === 'lab-python' || activeLab?.id === 'lab-statistics')
      ? 'python'
      : 'sql'
  );
  const [sqlText, setSqlText] = useState(activeLab?.defaultSqlQuery ?? '');
  const [sqlResult, setSqlResult] = useState<SqlExecutionResponse | null>(null);
  const [pyText, setPyText] = useState(activeLab?.defaultPythonCode ?? '');
  const [pyResult, setPyResult] = useState<PythonSimulationResponse | null>(null);
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveTableIdx(0);
    setShowSchema(false);
    setOpenHints({});
    setOpenSolutions({});
    if (activeLab && dataset) {
      const preferPython =
        Boolean(activeLab.supportsPythonSimulator) &&
        (activeLab.id === 'lab-python' || activeLab.id === 'lab-statistics');
      setSandboxMode(preferPython ? 'python' : 'sql');

      setSqlText(activeLab.defaultSqlQuery);
      setSqlResult(executeSqlQuery(activeLab.defaultSqlQuery, dataset.tables));

      const defaultPy =
        activeLab.defaultPythonCode ??
        `import pandas as pd\ndf = pd.read_csv('${dataset.tables[0].csvFilename}')\ndf.describe()`;
      setPyText(defaultPy);
      setPyResult(simulatePythonCode(defaultPy, EMBEDDED_DATASETS.flatMap((d) => d.tables)));
    } else {
      setSqlText('');
      setSqlResult(null);
      setPyText('');
      setPyResult(null);
    }
  }, [activeLab?.id]);

  if (!activeLab || !dataset) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
              Interactive Sandboxes &amp; Embedded Datasets
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Practice Labs
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              Every dataset lives inside this browser—no external downloads or accounts needed. Run
              live SQL queries, practice in the Constrained Python &amp; pandas Simulator, and
              verify answers instantly.
            </p>
          </div>
          <a
            href="#/timed-practice"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shrink-0"
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>Timed Live-Coding Practice</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
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
                    <span className="font-semibold text-blue-600">
                      {lab.domain}
                      {lab.supportsPythonSimulator ? ' · SQL + Python Sim' : ' · SQL Sandbox'}
                    </span>
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
  const labOpenEndedTasks = getOpenEndedTasksForLab(activeLab.id);
  const allEmbeddedTables = EMBEDDED_DATASETS.flatMap((d) => d.tables);

  const handleRunSql = (queryToRun?: string) => {
    const q = queryToRun ?? sqlText;
    setSqlResult(executeSqlQuery(q, dataset.tables));
  };

  const handleRunPython = (codeToRun?: string) => {
    const code = codeToRun ?? pyText;
    setPyResult(simulatePythonCode(code, allEmbeddedTables));
  };

  const handleSqlKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunSql();
    }
  };

  const handlePyKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunPython();
    }
  };

  const formatKindBadge = (kind: string) => {
    switch (kind) {
      case 'sql':
        return 'SQL Challenge';
      case 'formula':
        return 'Formula Challenge';
      case 'python':
        return 'Python Challenge';
      case 'statistics':
        return 'Statistics Challenge';
      default:
        return 'Metric Analysis';
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
          <a
            href="#/timed-practice"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Timed Practice</span>
          </a>
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

        {/* Row Preview */}
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

      {/* Interactive SQL + Constrained Python Sandboxes */}
      {(activeLab.supportsSqlSandbox || activeLab.supportsPythonSimulator) && (
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {activeLab.supportsSqlSandbox && activeLab.supportsPythonSimulator && (
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex p-1 bg-slate-200/70 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSandboxMode('sql')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                    sandboxMode === 'sql'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>SQL Query Sandbox</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxMode('python')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                    sandboxMode === 'python'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Constrained Python &amp; pandas Simulator</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-500">
                100% browser-local execution on embedded CSV tables
              </span>
            </div>
          )}

          {/* SQL Sandbox Panel */}
          {sandboxMode === 'sql' && activeLab.supportsSqlSandbox && (
            <>
              <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    In-Browser SQL Query Sandbox
                  </h2>
                  <p className="text-xs text-slate-500">
                    Supports SELECT, JOIN, WHERE, GROUP BY, HAVING, CASE WHEN, WITH CTEs, and
                    Window Functions across all {dataset.tables.length} tables above. Press Ctrl/Cmd
                    + Enter to run.
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
                                        v === null
                                          ? 'font-mono text-amber-700 italic'
                                          : 'text-slate-700'
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
            </>
          )}

          {/* Constrained Python & pandas Simulator Panel */}
          {sandboxMode === 'python' && activeLab.supportsPythonSimulator && (
            <>
              <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    Constrained Python &amp; pandas Simulator
                  </h2>
                  <p className="text-xs text-slate-500">
                    Browser-local analytical Python subset supporting{' '}
                    <code className="font-mono">pd.read_csv</code>, boolean masks,{' '}
                    <code className="font-mono">.str.lower/.strip</code>,{' '}
                    <code className="font-mono">.merge()</code>,{' '}
                    <code className="font-mono">.groupby().agg()</code>,{' '}
                    <code className="font-mono">.describe()</code>,{' '}
                    <code className="font-mono">np.mean/median/std/percentile</code>, and{' '}
                    <code className="font-mono">print()</code>. Not a full CPython runtime.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const fallback =
                        activeLab.defaultPythonCode ??
                        `import pandas as pd\ndf = pd.read_csv('${dataset.tables[0].csvFilename}')\ndf.describe()`;
                      setPyText(fallback);
                      handleRunPython(fallback);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunPython()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Run Python Script</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                <div className="lg:col-span-6 p-4 bg-slate-950">
                  <label htmlFor="python-sandbox-editor" className="sr-only">
                    Constrained Python editor
                  </label>
                  <textarea
                    id="python-sandbox-editor"
                    rows={10}
                    value={pyText}
                    onChange={(e) => setPyText(e.target.value)}
                    onKeyDown={handlePyKeyDown}
                    spellCheck={false}
                    className="w-full h-full min-h-[210px] bg-transparent text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-y"
                  />
                </div>

                <div className="lg:col-span-6 flex flex-col max-h-[340px]">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 tabular-nums">
                    <span className="font-medium">Simulator Output</span>
                    {pyResult?.ok && <span>{pyResult.modeLabel}</span>}
                  </div>

                  {pyResult && !pyResult.ok && (
                    <div className="p-4 text-xs text-red-700 bg-red-50 font-mono">
                      Simulator Error: {pyResult.error}
                    </div>
                  )}

                  {pyResult?.ok && (
                    <div className="overflow-auto flex-1 divide-y divide-slate-100">
                      {pyResult.outputLines.length > 0 && (
                        <div className="p-3 bg-slate-50/70 font-mono text-xs text-slate-800 whitespace-pre-wrap">
                          {pyResult.outputLines.join('\n')}
                        </div>
                      )}
                      {pyResult.resultTable && pyResult.resultTable.rows.length > 0 && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                            <tr>
                              {pyResult.resultTable.columns.map((col) => (
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
                            {pyResult.resultTable.rows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                {pyResult.resultTable!.columns.map((col) => {
                                  const v = row[col];
                                  return (
                                    <td
                                      key={col}
                                      className={`px-3 py-2 whitespace-nowrap ${
                                        v === null
                                          ? 'font-mono text-amber-700 italic'
                                          : 'text-slate-700'
                                      }`}
                                    >
                                      {v === null ? 'NaN' : String(v)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {pyResult.outputLines.length === 0 &&
                        (!pyResult.resultTable || pyResult.resultTable.rows.length === 0) && (
                          <p className="p-4 text-xs text-slate-500">
                            Script executed cleanly with no printed output. Add print(...) or end
                            with a DataFrame variable name to inspect rows.
                          </p>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
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
              Submit your query result, formula, script insight, or metric calculation below for
              instant verification.
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
                        {formatKindBadge(ex.kind)}
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

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {ex.starterSql && (
                      <button
                        type="button"
                        onClick={() => {
                          setSandboxMode('sql');
                          setSqlText(ex.starterSql!);
                          handleRunSql(ex.starterSql!);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Run Starter SQL</span>
                      </button>
                    )}

                    {ex.starterPython && activeLab.supportsPythonSimulator && (
                      <button
                        type="button"
                        onClick={() => {
                          setSandboxMode('python');
                          setPyText(ex.starterPython!);
                          handleRunPython(ex.starterPython!);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Run Starter in Python Sim</span>
                      </button>
                    )}
                  </div>
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
                        : 'Enter your metric values, Python/SQL finding, or analytical interpretation...'
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

      {/* Lab-Scoped Open-Ended Evaluation */}
      {labOpenEndedTasks.length > 0 && (
        <OpenEndedEvaluator
          tasks={labOpenEndedTasks}
          state={state}
          onSaveDraft={onSaveOpenEndedDraft}
          onSubmitResponse={onSubmitOpenEndedResponse}
          onToggleRubric={onToggleOpenEndedRubric}
          onResetTask={onResetOpenEndedTask}
          heading="Lab Open-Ended Analytical Synthesis"
          subheading="Apply your dataset findings in an open-ended analytical prompt checked with deterministic rules and the weighted rubric."
        />
      )}

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
