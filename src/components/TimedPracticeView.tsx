import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  Play,
  RotateCcw,
  Send,
  Table as TableIcon,
} from 'lucide-react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { EMBEDDED_DATASETS } from '../data/embeddedDatasets';
import {
  evaluateTimedSubmission,
  filterTimedChallenges,
  getTimedChallengeById,
  getTimedTopicsForLanguage,
  TIMED_CHALLENGES,
} from '../data/timedChallenges';
import {
  LmsLocalState,
  TimedAttemptRecord,
  TimedDifficulty,
  TimedDurationMinutes,
  TimedLanguage,
} from '../types/academy';
import { simulatePythonCode, PythonSimulationResponse } from '../utils/pythonSimulatorEngine';
import { executeSqlQuery, SqlExecutionResponse } from '../utils/sqlSandboxEngine';

interface TimedPracticeViewProps {
  challengeId?: string;
  state: LmsLocalState;
  onRecordAttempt: (attempt: TimedAttemptRecord) => void;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function TimedPracticeView({
  challengeId,
  state,
  onRecordAttempt,
}: TimedPracticeViewProps) {
  const [language, setLanguage] = useState<TimedLanguage>('sql');
  const [difficulty, setDifficulty] = useState<TimedDifficulty | 'all'>('all');
  const [topic, setTopic] = useState<string>('all');
  const [durationMin, setDurationMin] = useState<TimedDurationMinutes>(15);

  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(
    challengeId && getTimedChallengeById(challengeId) ? challengeId : null
  );
  const [sessionState, setSessionState] = useState<'setup' | 'running' | 'completed'>('setup');
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showSchema, setShowSchema] = useState(true);
  const [sqlResult, setSqlResult] = useState<SqlExecutionResponse | null>(null);
  const [pyResult, setPyResult] = useState<PythonSimulationResponse | null>(null);
  const [lastAttempt, setLastAttempt] = useState<TimedAttemptRecord | null>(null);

  const activeChallenge = activeChallengeId
    ? getTimedChallengeById(activeChallengeId)
    : undefined;
  const dataset = activeChallenge
    ? EMBEDDED_DATASETS.find((d) => d.id === activeChallenge.datasetId)
    : undefined;

  // Keep latest state in refs for clean auto-submit on countdown expiry
  const codeRef = useRef(code);
  codeRef.current = code;
  const hintsRef = useRef(hintsUsed);
  hintsRef.current = hintsUsed;

  useEffect(() => {
    if (challengeId) {
      const found = getTimedChallengeById(challengeId);
      if (found) {
        setLanguage(found.language);
        setActiveChallengeId(found.id);
      }
    }
  }, [challengeId]);

  const finishAttempt = (autoSubmitted: boolean) => {
    if (!activeChallenge) return;
    const allocatedSec = durationMin * 60;
    const usedSec = Math.max(1, allocatedSec - secondsLeft);
    const evaluated = evaluateTimedSubmission(
      activeChallenge,
      codeRef.current,
      allocatedSec,
      usedSec,
      hintsRef.current
    );
    const priorAttempts = state.timedAttempts.filter(
      (a) => a.challengeId === activeChallenge.id
    ).length;

    const record: TimedAttemptRecord = {
      id: `ta-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      challengeId: activeChallenge.id,
      language: activeChallenge.language,
      difficulty: activeChallenge.difficulty,
      durationAllocatedSec: allocatedSec,
      durationUsedSec: autoSubmitted ? allocatedSec : usedSec,
      codeSubmitted: codeRef.current,
      autoSubmitted,
      hintsUsed: hintsRef.current,
      attemptNumber: priorAttempts + 1,
      scorePercent: evaluated.scorePercent,
      scoreBreakdown: evaluated.scoreBreakdown,
      feedback: evaluated.feedback,
      submittedAt: new Date().toISOString(),
    };

    onRecordAttempt(record);
    setLastAttempt(record);
    setSessionState('completed');
  };

  useEffect(() => {
    if (sessionState !== 'running') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sessionState]);

  useEffect(() => {
    if (sessionState === 'running' && secondsLeft === 0 && activeChallenge) {
      finishAttempt(true);
    }
  }, [secondsLeft, sessionState]);

  const startSession = (selectedId: string, mins: TimedDurationMinutes = durationMin) => {
    const ch = getTimedChallengeById(selectedId);
    if (!ch) return;
    setActiveChallengeId(ch.id);
    setDurationMin(mins);
    setSecondsLeft(mins * 60);
    // Intentional: Blank editor in Timed Practice (no starter query exposed)
    setCode('');
    setHintsUsed(0);
    setShowHint(false);
    setShowSolution(false);
    setSqlResult(null);
    setPyResult(null);
    setLastAttempt(null);
    setSessionState('running');
  };

  const handleRunLive = () => {
    if (!activeChallenge || !dataset) return;
    if (activeChallenge.language === 'sql') {
      setSqlResult(executeSqlQuery(code, dataset.tables));
    } else {
      setPyResult(simulatePythonCode(code, EMBEDDED_DATASETS.flatMap((d) => d.tables)));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunLive();
    }
  };

  const filteredChallenges = filterTimedChallenges(language, difficulty, topic);
  const topics = getTimedTopicsForLanguage(language);

  if (sessionState === 'setup' || !activeChallenge || !dataset) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <a
              href="#/lab"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Practice Labs</span>
            </a>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Timed Live-Coding Practice
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Rehearse blank-editor SQL &amp; Python technical screens under realistic countdown
              conditions. Practice environment for interview conditioning—not a formal certification.
            </p>
          </div>
        </div>

        {/* Setup Controls */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                1. Language Track
              </span>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg">
                {(['sql', 'python'] as TimedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setLanguage(lang);
                      setTopic('all');
                    }}
                    className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer uppercase ${
                      language === lang
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="timed-difficulty"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
              >
                2. Difficulty Tier
              </label>
              <select
                id="timed-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TimedDifficulty | 'all')}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="interview">Interview Level</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="timed-topic"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
              >
                3. Topic Focus
              </label>
              <select
                id="timed-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="all">Mixed / All Topics</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                4. Timer Duration
              </span>
              <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-lg tabular-nums">
                {([15, 30, 45] as TimedDurationMinutes[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMin(m)}
                    className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      durationMin === m
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {language === 'python' && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
              <span className="font-semibold text-slate-900">Simulator Scope: </span>
              Timed Python runs in the browser-local Constrained Python &amp; pandas Simulator
              (supports <code className="font-mono">pd.read_csv</code>, <code className="font-mono">.merge</code>,{' '}
              <code className="font-mono">.groupby().agg()</code>, boolean masks,{' '}
              <code className="font-mono">.str</code> cleaning, <code className="font-mono">np.mean/median/percentile</code>).
            </p>
          )}
        </section>

        {/* Matching Challenges */}
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Select a Challenge ({filteredChallenges.length} available)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((ch) => {
              const attempts = state.timedAttempts.filter((a) => a.challengeId === ch.id);
              const best = attempts.reduce((max, a) => Math.max(max, a.scorePercent), 0);

              return (
                <article
                  key={ch.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-blue-600 uppercase">
                        {ch.language} · {ch.difficulty}
                      </span>
                      <span className="tabular-nums">
                        {attempts.length > 0 ? `Best ${best}% (${attempts.length})` : 'Unattempted'}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      {ch.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500">{ch.topic}</p>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {ch.businessPrompt}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => startSession(ch.id, durationMin)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Start {durationMin}-Min Blank-Editor Session</span>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* Attempt History Table */}
        {state.timedAttempts.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Recent Timed Practice History
            </h2>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Challenge</th>
                      <th className="px-4 py-3 font-semibold">Track</th>
                      <th className="px-4 py-3 font-semibold">Attempt</th>
                      <th className="px-4 py-3 font-semibold">Time Used</th>
                      <th className="px-4 py-3 font-semibold">Hints</th>
                      <th className="px-4 py-3 font-semibold">Score</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    {state.timedAttempts.slice(0, 15).map((att) => {
                      const ch = getTimedChallengeById(att.challengeId);
                      return (
                        <tr key={att.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {ch?.title ?? att.challengeId}
                          </td>
                          <td className="px-4 py-3 uppercase text-slate-600">
                            {att.language} · {att.difficulty}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            #{att.attemptNumber}
                            {att.autoSubmitted ? ' (Auto)' : ''}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatClock(att.durationUsedSec)} / {formatClock(att.durationAllocatedSec)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{att.hintsUsed}</td>
                          <td
                            className={`px-4 py-3 font-semibold ${
                              att.scorePercent >= 75 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {att.scorePercent}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => startSession(att.challengeId, durationMin)}
                              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                            >
                              Retry
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  }

  const isFiveMinWarning = sessionState === 'running' && secondsLeft <= 300 && secondsLeft > 60;
  const isOneMinWarning = sessionState === 'running' && secondsLeft <= 60;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Timer Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setSessionState('setup')}
              className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Setup</span>
            </button>
            <span>·</span>
            <span className="font-semibold uppercase text-blue-600">
              {activeChallenge.language} · {activeChallenge.difficulty}
            </span>
            <span>·</span>
            <span>Blank-Editor Timed Drill</span>
          </div>
          <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            {activeChallenge.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div
            className={`px-3.5 py-2 rounded-xl border font-mono text-sm font-bold tabular-nums flex items-center gap-2 ${
              sessionState === 'completed'
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : isOneMinWarning
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : isFiveMinWarning
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-900 border-slate-900 text-white'
            }`}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{formatClock(secondsLeft)}</span>
          </div>

          {sessionState === 'running' ? (
            <button
              type="button"
              onClick={() => finishAttempt(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Submit &amp; Score</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startSession(activeChallenge.id, durationMin)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry Timed Drill</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning Banners */}
      {(isFiveMinWarning || isOneMinWarning) && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-xs font-medium flex items-center gap-2 ${
            isOneMinWarning
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            {isOneMinWarning
              ? 'Under 1 minute remaining! Your editor will auto-submit cleanly when the timer hits 00:00.'
              : '5-minute warning: verify required column names and edge-case filters before submitting.'}
          </span>
        </div>
      )}

      {/* Post-Submit Evaluation Breakdown */}
      {sessionState === 'completed' && lastAttempt && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>
                  Attempt #{lastAttempt.attemptNumber} Complete ·{' '}
                  {lastAttempt.autoSubmitted ? 'Auto-Submitted on Expiry' : 'Submitted'}
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 tabular-nums">
                Practice Score: {lastAttempt.scorePercent}%
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowSolution((prev) => !prev)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
            >
              {showSolution ? 'Hide Reference Solution' : 'View Reference Solution'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 tabular-nums">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[11px] text-slate-500">Output Accuracy</p>
              <p className="font-display text-lg font-bold text-slate-900">
                {lastAttempt.scoreBreakdown.outputScore} / 45
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[11px] text-slate-500">Edge Cases</p>
              <p className="font-display text-lg font-bold text-slate-900">
                {lastAttempt.scoreBreakdown.edgeCaseScore} / 25
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[11px] text-slate-500">Code Quality</p>
              <p className="font-display text-lg font-bold text-slate-900">
                {lastAttempt.scoreBreakdown.qualityScore} / 20
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[11px] text-slate-500">Time Bonus</p>
              <p className="font-display text-lg font-bold text-slate-900">
                {lastAttempt.scoreBreakdown.timeScore} / 10
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[11px] text-slate-500">Hint Penalty</p>
              <p className="font-display text-lg font-bold text-red-700">
                -{lastAttempt.scoreBreakdown.hintPenalty}
              </p>
            </div>
          </div>

          <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
            {lastAttempt.feedback.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>

          {showSolution && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <p className="font-semibold text-slate-900">Reference Solution</p>
              <pre className="font-mono bg-slate-900 text-slate-100 rounded-lg p-3.5 overflow-x-auto leading-relaxed">
                <code>{activeChallenge.referenceSolution}</code>
              </pre>
              <p className="text-slate-700">{activeChallenge.explanation}</p>
            </div>
          )}
        </section>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Prompt, Constraints, Schema */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="space-y-1.5">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Business Prompt
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {activeChallenge.businessPrompt}
              </p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Required Output Columns
              </h3>
              <p className="font-mono text-xs text-slate-900">
                {activeChallenge.requiredColumns.join(', ')}
              </p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Constraints &amp; Edge Cases
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {activeChallenge.constraintsAndEdgeCases.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!showHint && hintsUsed === 0) {
                    setHintsUsed((h) => h + 1);
                  }
                  setShowHint((prev) => !prev);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showHint ? 'Hide Hint' : 'Reveal Hint (-8 pts)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSchema((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
              >
                <TableIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showSchema ? 'Hide Schema' : 'Show Schema'}</span>
              </button>
            </div>

            {showHint && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <span className="font-semibold">Hint: </span>
                {activeChallenge.hint}
              </div>
            )}
          </div>

          {showSchema && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                Dataset Schema ({dataset.title})
              </h3>
              {dataset.tables.map((tbl) => (
                <div key={tbl.name} className="space-y-1.5">
                  <p className="font-mono text-xs font-semibold text-blue-700">
                    {activeChallenge.language === 'python' ? tbl.csvFilename : tbl.name} (
                    {tbl.rows.length} rows)
                  </p>
                  <p className="font-mono text-[11px] text-slate-600 leading-relaxed">
                    {tbl.columns.map((c) => `${c.name} (${c.type})`).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Right: Blank Editor + Live Output */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {activeChallenge.language === 'sql'
                ? 'Blank SQL Editor (Ctrl/Cmd + Enter to Run)'
                : 'Constrained Python & pandas Simulator (Ctrl/Cmd + Enter to Run)'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={sessionState !== 'running'}
                onClick={() => setCode('')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={handleRunLive}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Run Code</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950">
            <label htmlFor="timed-code-editor" className="sr-only">
              Timed practice code editor
            </label>
            <textarea
              id="timed-code-editor"
              rows={11}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              readOnly={sessionState === 'completed'}
              spellCheck={false}
              placeholder={
                activeChallenge.language === 'sql'
                  ? '-- Write your SQL SELECT query from scratch...'
                  : "# Write your pandas script from scratch (e.g., import pandas as pd)..."
              }
              className="w-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-y placeholder:text-slate-500"
            />
          </div>

          {/* Live Output Panel */}
          <div className="border-t border-slate-200 max-h-72 overflow-auto">
            {activeChallenge.language === 'sql' && !sqlResult && (
              <p className="p-4 text-xs text-slate-500">
                Click Run Code anytime to test your SQL query output before submitting.
              </p>
            )}
            {activeChallenge.language === 'python' && !pyResult && (
              <p className="p-4 text-xs text-slate-500">
                Click Run Code anytime to test your script in the Constrained Python &amp; pandas Simulator.
              </p>
            )}

            {activeChallenge.language === 'sql' && sqlResult && !sqlResult.ok && (
              <div className="p-4 text-xs font-mono text-red-700 bg-red-50">
                SQL Error: {sqlResult.error}
              </div>
            )}

            {activeChallenge.language === 'sql' && sqlResult?.ok && (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    {sqlResult.columns.map((c) => (
                      <th key={c} className="px-3 py-2 font-mono font-semibold text-slate-700">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {sqlResult.rows.map((r, i) => (
                    <tr key={i}>
                      {sqlResult.columns.map((c) => (
                        <td key={c} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                          {r[c] === null ? 'NULL' : String(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeChallenge.language === 'python' && pyResult && !pyResult.ok && (
              <div className="p-4 text-xs font-mono text-red-700 bg-red-50">
                Simulator Error: {pyResult.error}
              </div>
            )}

            {activeChallenge.language === 'python' && pyResult?.ok && (
              <div className="space-y-3 p-4">
                {pyResult.outputLines.length > 0 && (
                  <pre className="font-mono text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto">
                    {pyResult.outputLines.join('\n')}
                  </pre>
                )}
                {pyResult.resultTable && pyResult.resultTable.rows.length > 0 && (
                  <table className="w-full text-left border-collapse text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {pyResult.resultTable.columns.map((c) => (
                          <th key={c} className="px-3 py-2 font-mono font-semibold text-slate-700">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 tabular-nums">
                      {pyResult.resultTable.rows.slice(0, 20).map((r, i) => (
                        <tr key={i}>
                          {pyResult.resultTable!.columns.map((c) => (
                            <td key={c} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                              {r[c] === null ? 'NULL' : String(r[c])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
