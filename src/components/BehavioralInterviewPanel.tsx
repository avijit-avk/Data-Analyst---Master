import {
  AlertCircle,
  Clock,
  Eye,
  MessageSquareText,
  Save,
  Shuffle,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  BEHAVIORAL_QUESTIONS,
  BEHAVIORAL_RUBRIC_ITEMS,
} from '../data/portfolioAndCareerData';
import {
  BehavioralAnswerRecord,
  BehavioralPracticeMode,
  BehavioralQuestion,
  LmsLocalState,
} from '../types/academy';

interface BehavioralInterviewPanelProps {
  state: LmsLocalState;
  onSaveAnswer: (record: BehavioralAnswerRecord) => void;
  onDeleteAnswer: (recordId: string) => void;
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function BehavioralInterviewPanel({
  state,
  onSaveAnswer,
  onDeleteAnswer,
}: BehavioralInterviewPanelProps) {
  // Dynamically add portfolio-specific follow-up prompts if user created portfolio projects
  const projectPrompts: BehavioralQuestion[] = state.portfolioProjects
    .filter((p) => p.title.trim().length > 0)
    .slice(0, 3)
    .map((p) => ({
      id: `beh-proj-${p.id}`,
      category: 'Your Portfolio Project',
      isProjectSpecific: true,
      prompt: `Walk me through "${p.title}": what data quality or grain trap did you resolve, and why did you recommend ${p.quantifiedRecommendations ? 'your proposed action' : 'that next step'}?`,
      whyInterviewersAsk:
        'Tests whether you deeply understand the numbers, grain, and trade-offs inside your own portfolio project.',
      strongExample: `State the business decision (${p.stakeholderPersona || 'stakeholder'}), explain your cleaning/grain fix (${p.cleaningDecisions.slice(0, 120) || 'NULL & duplicate checks'}), cite your quantified numbers, and close with your limitation (${p.limitationsAndAssumptions.slice(0, 100) || 'small sample scope'}).`,
      weakExample:
        'Listing tools ("I used SQL and Excel") without explaining the exact metric logic or caveats.',
      redFlags: ['Unable to defend numerator/denominator or exclusions in your own project'],
      improvementTips: [
        'Keep your project narrative under 2 minutes: Question -> Cleaning -> Finding -> Impact -> Limitation.',
      ],
    }));

  const allQuestions = [...BEHAVIORAL_QUESTIONS, ...projectPrompts];

  const [selectedQId, setSelectedQId] = useState<string>(allQuestions[0].id);
  const [practiceMode, setPracticeMode] = useState<BehavioralPracticeMode>('untimed');
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [elapsedSec, setElapsedSec] = useState(0);

  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [actions, setActions] = useState('');
  const [result, setResult] = useState('');
  const [reflection, setReflection] = useState('');
  const [rubricChecks, setRubricChecks] = useState<Record<string, boolean>>({});
  const [showExamples, setShowExamples] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const activeQ = allQuestions.find((q) => q.id === selectedQId) ?? allQuestions[0];

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setElapsedSec((e) => e + 1);
      if (practiceMode === 'timed_2min') {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, practiceMode]);

  const handleSelectQuestion = (qId: string) => {
    setSelectedQId(qId);
    setTimerRunning(false);
    setSecondsLeft(120);
    setElapsedSec(0);
    setShowExamples(false);
    setSaveNotice(null);
  };

  const handleRandomQuestion = () => {
    const others = allQuestions.filter((q) => q.id !== selectedQId);
    const pick = others[Math.floor(Math.random() * others.length)] ?? allQuestions[0];
    handleSelectQuestion(pick.id);
    if (practiceMode === 'timed_2min') {
      setSecondsLeft(120);
      setTimerRunning(true);
    }
  };

  const handleSave = () => {
    if (!situation.trim() && !actions.trim() && !result.trim()) {
      setSaveNotice('Add notes in Situation, Actions, or Result before saving.');
      return;
    }
    const rec: BehavioralAnswerRecord = {
      id: `beh-ans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: activeQ.id,
      mode: practiceMode,
      durationSec: practiceMode === 'timed_2min' ? 120 - secondsLeft : elapsedSec,
      situation: situation.trim(),
      task: task.trim(),
      actions: actions.trim(),
      result: result.trim(),
      reflection: reflection.trim(),
      rubricChecks: { ...rubricChecks },
      savedAt: new Date().toISOString(),
    };
    onSaveAnswer(rec);
    setTimerRunning(false);
    setSaveNotice('Saved behavioral STAR/CAR answer to local history.');
  };

  const checkedCount = Object.values(rubricChecks).filter(Boolean).length;

  return (
    <section
      id="behavioral-interview-studio"
      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 space-y-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue-600">
            <MessageSquareText className="w-4 h-4" aria-hidden="true" />
            <span>Behavioral &amp; Storytelling Interview Studio</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            STAR / CAR Behavioral Practice ({allQuestions.length} Prompts)
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Practice honest behavioral framing using real transferable work and portfolio evidence.
            Never invent analyst job titles or metrics—lead with verifiable actions and outcomes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => {
                setPracticeMode('untimed');
                setTimerRunning(false);
              }}
              className={`px-3 py-1.5 font-medium rounded-md cursor-pointer ${
                practiceMode === 'untimed'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Untimed Draft
            </button>
            <button
              type="button"
              onClick={() => {
                setPracticeMode('timed_2min');
                setSecondsLeft(120);
                setTimerRunning(true);
              }}
              className={`px-3 py-1.5 font-medium rounded-md cursor-pointer ${
                practiceMode === 'timed_2min'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              2-Min Timer
            </button>
          </div>

          <button
            type="button"
            onClick={handleRandomQuestion}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Random Prompt</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Question List */}
        <div className="lg:col-span-4 space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {allQuestions.map((q) => {
            const isCurr = q.id === activeQ.id;
            const savedCount = state.behavioralAnswers.filter((b) => b.questionId === q.id).length;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestion(q.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                  isCurr
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] tabular-nums">
                  <span className={isCurr ? 'text-blue-300 font-semibold' : 'text-blue-600 font-semibold'}>
                    {q.category}
                  </span>
                  {savedCount > 0 && (
                    <span className={isCurr ? 'text-emerald-300' : 'text-emerald-700'}>
                      {savedCount} saved
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium leading-snug">{q.prompt}</p>
              </button>
            );
          })}
        </div>

        {/* STAR/CAR Builder */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-blue-700 uppercase">
                {activeQ.category}
              </span>
              {practiceMode === 'timed_2min' && (
                <div className="flex items-center gap-2 font-mono text-xs font-bold tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                  <span className={secondsLeft <= 30 ? 'text-red-700' : 'text-slate-900'}>
                    {formatSec(secondsLeft)} remaining
                  </span>
                  <button
                    type="button"
                    onClick={() => setTimerRunning((r) => !r)}
                    className="text-blue-600 underline font-sans cursor-pointer"
                  >
                    {timerRunning ? 'Pause' : 'Resume'}
                  </button>
                </div>
              )}
            </div>
            <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900">
              {activeQ.prompt}
            </h3>
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Why Interviewers Ask: </span>
              {activeQ.whyInterviewersAsk}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StarInput
              id="star-s"
              label="S — Situation (Context & Role, ~20%)"
              value={situation}
              onChange={setSituation}
              placeholder="Where were you (prior job or portfolio case) and what problem existed?"
            />
            <StarInput
              id="star-t"
              label="T — Task (Goal / Decision at Stake)"
              value={task}
              onChange={setTask}
              placeholder="What specific outcome or clarification were you responsible for?"
            />
          </div>

          <StarInput
            id="star-a"
            label="A — Analytical Actions (Your Specific Steps, ~60%)"
            value={actions}
            onChange={setActions}
            rows={3}
            placeholder="Describe exact checks, SQL/Python/Excel methods, reconciliation, or stakeholder conversations YOU led..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StarInput
              id="star-r"
              label="R — Quantified Result (~20%)"
              value={result}
              onChange={setResult}
              placeholder="Honest time saved, errors eliminated, margin insight, or decision enabled..."
            />
            <StarInput
              id="star-ref"
              label="Reflection (What You Learned / Next Step)"
              value={reflection}
              onChange={setReflection}
              placeholder="What safeguard or habit did you adopt afterward?"
            />
          </div>

          {/* 8-Point Self-Review Rubric */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900">
                8-Point Behavioral Self-Review Checklist
              </span>
              <span className="text-slate-600 tabular-nums">{checkedCount} / 8 checked</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BEHAVIORAL_RUBRIC_ITEMS.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(rubricChecks[item.id])}
                    onChange={() =>
                      setRubricChecks((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Save Answer Draft</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExamples((e) => !e)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showExamples ? 'Hide Coaching Guide' : 'Show Strong vs. Weak & Red Flags'}</span>
              </button>
            </div>

            {saveNotice && <span className="text-xs font-medium text-emerald-700">{saveNotice}</span>}
          </div>

          {showExamples && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-emerald-800">Strong Example</p>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{activeQ.strongExample}</p>
              </div>
              <div>
                <p className="font-semibold text-red-700">Weak Example (Avoid)</p>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{activeQ.weakExample}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <p className="font-semibold text-slate-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                    Red Flags
                  </p>
                  <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                    {activeQ.redFlags.map((rf, i) => (
                      <li key={i}>{rf}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Improvement Tips</p>
                  <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                    {activeQ.improvementTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Saved History */}
          {state.behavioralAnswers.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Saved Practice Answers ({state.behavioralAnswers.length})
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {state.behavioralAnswers.slice(0, 8).map((ans) => {
                  const q = allQuestions.find((item) => item.id === ans.questionId);
                  return (
                    <div key={ans.id} className="p-3 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">
                          {q?.category ?? 'Prompt'} ·{' '}
                          <span className="font-normal text-slate-500 tabular-nums">
                            {ans.mode === 'timed_2min' ? '2-Min Timed' : 'Untimed'} ·{' '}
                            {Object.values(ans.rubricChecks).filter(Boolean).length}/8 rubric checks
                          </span>
                        </p>
                        <p className="text-slate-600 line-clamp-2">
                          {ans.actions || ans.situation || ans.result}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (q) setSelectedQId(q.id);
                            setSituation(ans.situation);
                            setTask(ans.task);
                            setActions(ans.actions);
                            setResult(ans.result);
                            setReflection(ans.reflection);
                            setRubricChecks(ans.rubricChecks);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAnswer(ans.id)}
                          aria-label="Delete saved behavioral answer"
                          className="text-slate-400 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StarInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-800">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none leading-relaxed"
      />
    </div>
  );
}
