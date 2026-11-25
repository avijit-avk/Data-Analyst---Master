import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Lightbulb,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PRACTICE_LAB_PREVIEWS } from '../data/curriculum';
import {
  getLabDrillStats,
  getOverallPracticeStats,
} from '../data/practiceDrills';
import { downloadSampleCsv } from '../data/sampleDatasets';
import {
  AcademyLocalState,
  PracticePromptKind,
  PracticeTopic,
} from '../types/academy';

interface PracticeLabViewProps {
  state: AcademyLocalState;
  onBackToDashboard: () => void;
  onTogglePracticedLab: (labId: string) => void;
  onTogglePracticePrompt: (promptId: string) => void;
  onSetTopicAll: (labId: string, moduleId: string, completed: boolean) => void;
  onUpdateTopicNote: (moduleId: string, text: string) => void;
  onUpdatePromptAnswer: (promptId: string, answerText: string) => void;
  onCheckPromptAnswer: (promptId: string) => void;
  onUpdateScratchpad: (text: string) => void;
  onOpenCourseOverview: (courseId: string) => void;
}

const PROMPT_KIND_STYLES: Record<PracticePromptKind, string> = {
  Scenario: 'border-blue-200 bg-blue-50/70 text-blue-800',
  'Edge Case': 'border-amber-200 bg-amber-50/70 text-amber-800',
  'Formula / Query': 'border-slate-200 bg-slate-100 text-slate-700',
};

export function PracticeLabView({
  state,
  onBackToDashboard,
  onTogglePracticedLab,
  onTogglePracticePrompt,
  onSetTopicAll,
  onUpdateTopicNote,
  onUpdatePromptAnswer,
  onCheckPromptAnswer,
  onUpdateScratchpad,
  onOpenCourseOverview,
}: PracticeLabViewProps) {
  const [selectedLabId, setSelectedLabId] = useState<string>(
    PRACTICE_LAB_PREVIEWS[0].id
  );
  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>([
    PRACTICE_LAB_PREVIEWS[0].topics[0].moduleId,
  ]);
  const [openHintIds, setOpenHintIds] = useState<string[]>([]);
  const [openReferenceIds, setOpenReferenceIds] = useState<string[]>([]);
  const [selectedSampleFileId, setSelectedSampleFileId] = useState<string>(
    PRACTICE_LAB_PREVIEWS[0].sampleFiles[0].id
  );
  const [isPreviewExpanded, setIsPreviewExpanded] = useState<boolean>(true);

  const checkedPromptSet = useMemo(
    () => new Set(state.practicedPromptIds),
    [state.practicedPromptIds]
  );

  const activeLab = useMemo(
    () =>
      PRACTICE_LAB_PREVIEWS.find((lab) => lab.id === selectedLabId) ??
      PRACTICE_LAB_PREVIEWS[0],
    [selectedLabId]
  );

  const activeSampleFile = useMemo(
    () =>
      activeLab.sampleFiles.find((f) => f.id === selectedSampleFileId) ??
      activeLab.sampleFiles[0],
    [activeLab, selectedSampleFileId]
  );

  const overallStats = useMemo(
    () => getOverallPracticeStats(PRACTICE_LAB_PREVIEWS, state),
    [state]
  );

  const activeLabStats = useMemo(
    () => getLabDrillStats(activeLab, state),
    [activeLab, state]
  );

  const handleSelectLab = (labId: string) => {
    setSelectedLabId(labId);
    const targetLab = PRACTICE_LAB_PREVIEWS.find((l) => l.id === labId);
    if (targetLab) {
      if (targetLab.sampleFiles.length > 0) {
        setSelectedSampleFileId(targetLab.sampleFiles[0].id);
      }
      if (targetLab.topics.length > 0) {
        // Open the first incomplete topic so learners immediately land where they left off
        const firstIncomplete = targetLab.topics.find((topic) =>
          topic.prompts.some((p) => !checkedPromptSet.has(p.id))
        );
        setExpandedModuleIds([
          (firstIncomplete ?? targetLab.topics[0]).moduleId,
        ]);
      }
    }
  };

  const toggleTopicExpanded = (moduleId: string) => {
    setExpandedModuleIds((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const allActiveTopicsExpanded = activeLab.topics.every((topic) =>
    expandedModuleIds.includes(topic.moduleId)
  );

  const toggleExpandAllActiveTopics = () => {
    const activeIds = activeLab.topics.map((t) => t.moduleId);
    if (allActiveTopicsExpanded) {
      setExpandedModuleIds((prev) => prev.filter((id) => !activeIds.includes(id)));
    } else {
      setExpandedModuleIds((prev) => Array.from(new Set([...prev, ...activeIds])));
    }
  };

  const stepToTopic = (targetTopic: PracticeTopic) => {
    setExpandedModuleIds([targetTopic.moduleId]);
    const el = document.getElementById(`practice-topic-${targetTopic.moduleId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const toggleHint = (promptId: string) => {
    setOpenHintIds((prev) =>
      prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [...prev, promptId]
    );
  };

  const toggleReference = (promptId: string) => {
    setOpenReferenceIds((prev) =>
      prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [...prev, promptId]
    );
  };

  const activeProgressPercent =
    activeLabStats.totalPrompts > 0
      ? Math.round(
          (activeLabStats.completedPrompts / activeLabStats.totalPrompts) * 100
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
              Practice Lab
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Download each subject’s sample CSV file and work through topic-by-topic cases anchored to its columns, edge cases, and self-verification checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono tabular-nums shrink-0">
            <span>
              {overallStats.completedPrompts} / {overallStats.totalPrompts} prompts
              practiced
            </span>
            <span aria-hidden="true" className="text-slate-300">
              |
            </span>
            <span>
              {overallStats.completedDrills} / {overallStats.totalDrills} drills
              completed
            </span>
          </div>
        </div>
      </div>

      {/* Subject Drill Selector */}
      <section aria-label="Select Practice Lab subject">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRACTICE_LAB_PREVIEWS.map((lab) => {
            const stats = getLabDrillStats(lab, state);
            const isSelected = lab.id === activeLab.id;
            const pct =
              stats.totalPrompts > 0
                ? Math.round((stats.completedPrompts / stats.totalPrompts) * 100)
                : 0;

            const statusLabel =
              stats.status === 'completed'
                ? 'Practiced'
                : stats.status === 'in_progress'
                ? 'In progress'
                : 'Not started';

            return (
              <button
                key={lab.id}
                type="button"
                onClick={() => handleSelectLab(lab.id)}
                aria-pressed={isSelected}
                className={`text-left rounded-xl border p-4 transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-white border-slate-900 ring-1 ring-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-900">
                      {lab.tool}
                    </span>
                    <span
                      className={`font-medium ${
                        stats.status === 'completed'
                          ? 'text-emerald-700'
                          : stats.status === 'in_progress'
                          ? 'text-blue-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                    {lab.title}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400 truncate">
                    {lab.sampleFiles.length > 1
                      ? `${lab.sampleFiles.length} CSV files`
                      : lab.sampleFiles[0].filename}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
                    <span>
                      {stats.completedTopics}/{stats.totalTopics} topics
                    </span>
                    <span>
                      {stats.completedPrompts}/{stats.totalPrompts}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        stats.status === 'completed'
                          ? 'bg-emerald-600'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Drill Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Active Drill Header + Topic Accordions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Subject Summary Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {activeLab.tool}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-medium ${
                      activeLabStats.status === 'completed'
                        ? 'text-emerald-700'
                        : activeLabStats.status === 'in_progress'
                        ? 'text-blue-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {activeLabStats.status === 'completed'
                      ? 'Drill completed'
                      : activeLabStats.status === 'in_progress'
                      ? 'In progress'
                      : 'Not started'}
                  </span>
                </div>
                <h2 className="font-display text-lg font-semibold text-slate-950">
                  {activeLab.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeLab.scopeSummary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenCourseOverview(activeLab.courseId)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Study Guide</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={toggleExpandAllActiveTopics}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {allActiveTopicsExpanded ? 'Collapse all' : 'Expand all'}
                </button>

                <button
                  type="button"
                  onClick={() => onTogglePracticedLab(activeLab.id)}
                  aria-pressed={activeLabStats.status === 'completed'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeLabStats.status === 'completed'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {activeLabStats.status === 'completed' && (
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>
                    {activeLabStats.status === 'completed'
                      ? 'Clear drill'
                      : 'Mark drill practiced'}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                <span>
                  {activeLabStats.completedTopics} / {activeLabStats.totalTopics}{' '}
                  topics completed
                </span>
                <span>
                  {activeLabStats.completedPrompts} / {activeLabStats.totalPrompts}{' '}
                  prompts ({activeProgressPercent}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    activeLabStats.status === 'completed'
                      ? 'bg-emerald-600'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${activeProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sample File Overview: Schema & 5-Row Preview */}
          <section
            aria-label="Sample dataset schema and preview"
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                  <FileSpreadsheet
                    className="w-4 h-4 text-slate-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      Sample File Overview
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="font-mono text-xs text-slate-600 tabular-nums">
                      {activeSampleFile.rows.length} rows ·{' '}
                      {activeSampleFile.columns.length} columns
                    </span>
                  </div>
                  <h3 className="font-mono text-sm font-semibold text-slate-950 truncate mt-0.5">
                    {activeSampleFile.filename}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPreviewExpanded((prev) => !prev)}
                  aria-expanded={isPreviewExpanded}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPreviewExpanded ? 'Hide preview' : 'Show schema & preview'}
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleCsv(activeSampleFile)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Download Sample CSV</span>
                </button>
              </div>
            </div>

            {/* Multi-file switcher (e.g., Power BI Fact + Lookup) */}
            {activeLab.sampleFiles.length > 1 && (
              <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div
                  role="tablist"
                  aria-label="Sample dataset files"
                  className="inline-flex flex-wrap items-center gap-1.5"
                >
                  {activeLab.sampleFiles.map((file) => {
                    const isFileActive = file.id === activeSampleFile.id;
                    return (
                      <button
                        key={file.id}
                        type="button"
                        role="tab"
                        aria-selected={isFileActive}
                        onClick={() => setSelectedSampleFileId(file.id)}
                        className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isFileActive
                            ? 'bg-white border-slate-900 text-slate-950 font-medium'
                            : 'bg-transparent border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        {file.filename} ({file.rows.length}r)
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {activeSampleFile.roleLabel}
                </span>
              </div>
            )}

            <div className="px-5 py-3.5 bg-slate-50/40 border-b border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeSampleFile.description}
              </p>
            </div>

            {isPreviewExpanded && (
              <div className="p-5 space-y-5">
                {/* Column Schema Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-800">
                      Column Schema
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Exact column names used in topic tasks below
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeSampleFile.columns.map((col) => (
                      <div
                        key={col.name}
                        className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-medium text-slate-900 truncate">
                            {col.name}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            {col.description}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] font-medium text-slate-600 border border-slate-200 bg-white rounded px-1.5 py-0.5 shrink-0">
                          {col.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5-Row Data Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-800">
                      First 5 Rows Preview
                    </h4>
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      Showing 5 of {activeSampleFile.rows.length} rows
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {activeSampleFile.columns.map((col) => (
                            <th
                              key={col.name}
                              className="py-2 px-3 font-mono text-[11px] font-semibold text-slate-700 whitespace-nowrap"
                            >
                              {col.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-xs">
                        {activeSampleFile.rows.slice(0, 5).map((row, rIdx) => (
                          <tr
                            key={`${activeSampleFile.id}-preview-${rIdx}`}
                            className="hover:bg-slate-50/60"
                          >
                            {activeSampleFile.columns.map((col) => {
                              const val = row[col.name];
                              const isNull =
                                val === null || val === undefined || val === '';
                              return (
                                <td
                                  key={col.name}
                                  className={`py-2 px-3 whitespace-nowrap ${
                                    isNull
                                      ? 'text-slate-400 italic'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  {isNull ? 'NULL' : String(val)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Topic-by-Topic Accordion */}
          <div className="space-y-3">
            {activeLab.topics.map((topic, topicIndex) => {
              const isExpanded = expandedModuleIds.includes(topic.moduleId);
              const doneInTopic = topic.prompts.filter((p) =>
                checkedPromptSet.has(p.id)
              ).length;
              const totalInTopic = topic.prompts.length;
              const allTopicDone =
                totalInTopic > 0 && doneInTopic === totalInTopic;
              const topicNote = state.practiceTopicNotes[topic.moduleId] ?? '';
              const prevTopic =
                topicIndex > 0 ? activeLab.topics[topicIndex - 1] : null;
              const nextTopic =
                topicIndex < activeLab.topics.length - 1
                  ? activeLab.topics[topicIndex + 1]
                  : null;

              return (
                <article
                  key={topic.moduleId}
                  id={`practice-topic-${topic.moduleId}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleTopicExpanded(topic.moduleId)}
                    aria-expanded={isExpanded}
                    className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span
                        className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center font-mono text-[11px] font-medium tabular-nums shrink-0 ${
                          allTopicDone
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : doneInTopic > 0
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        {allTopicDone ? (
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          topic.indexLabel
                        )}
                      </span>

                      <div className="min-w-0">
                        <h3 className="font-display text-sm sm:text-base font-semibold text-slate-900">
                          {topic.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                          {topic.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-0.5">
                      {topicNote.trim() && (
                        <span className="hidden sm:inline text-[11px] font-medium text-slate-500">
                          Notes saved
                        </span>
                      )}
                      <span
                        className={`font-mono text-xs tabular-nums ${
                          allTopicDone
                            ? 'text-emerald-700 font-medium'
                            : doneInTopic > 0
                            ? 'text-blue-700 font-medium'
                            : 'text-slate-500'
                        }`}
                      >
                        {doneInTopic} / {totalInTopic}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-5 space-y-5">
                      {/* Topic Practice Prompts */}
                      <div className="space-y-3">
                        {topic.prompts.map((prompt) => {
                          const isChecked = checkedPromptSet.has(prompt.id);
                          const isHintOpen = openHintIds.includes(prompt.id);
                          const isReferenceOpen = openReferenceIds.includes(
                            prompt.id
                          );
                          const submission = state.practicePromptAnswers[prompt.id];
                          const answerText = submission?.answerText ?? '';
                          const checkStatus = submission?.status ?? null;
                          const checkFeedback = submission?.feedback ?? null;
                          const isMultiline =
                            prompt.validation.inputMode === 'multiline';

                          return (
                            <div
                              key={prompt.id}
                              className={`rounded-lg border p-4 transition-colors ${
                                checkStatus === 'verified' || isChecked
                                  ? 'bg-white border-emerald-200/90'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => onTogglePracticePrompt(prompt.id)}
                                  aria-pressed={isChecked}
                                  aria-label={`Mark "${prompt.title}" practiced`}
                                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                    isChecked
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>

                                <div className="min-w-0 flex-1 space-y-3">
                                  <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span
                                          className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                                            PROMPT_KIND_STYLES[prompt.kind]
                                          }`}
                                        >
                                          {prompt.kind}
                                        </span>
                                        <h4
                                          className={`text-sm font-semibold ${
                                            isChecked
                                              ? 'text-slate-700'
                                              : 'text-slate-900'
                                          }`}
                                        >
                                          {prompt.title}
                                        </h4>
                                      </div>

                                      {checkStatus === 'verified' && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                          <CheckCircle2
                                            className="w-3.5 h-3.5"
                                            aria-hidden="true"
                                          />
                                          <span>Verified</span>
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-sm text-slate-700 leading-relaxed">
                                      {prompt.prompt}
                                    </p>
                                  </div>

                                  {/* Answer Input & Client-Side Checker */}
                                  <div className="space-y-2 pt-0.5">
                                    <label
                                      htmlFor={`answer-input-${prompt.id}`}
                                      className="block text-[11px] font-medium text-slate-500"
                                    >
                                      Your Result / Solution (saved locally)
                                    </label>

                                    <div
                                      className={`flex gap-2 ${
                                        isMultiline
                                          ? 'flex-col sm:flex-row sm:items-end'
                                          : 'flex-col sm:flex-row sm:items-center'
                                      }`}
                                    >
                                      {isMultiline ? (
                                        <textarea
                                          id={`answer-input-${prompt.id}`}
                                          rows={2}
                                          value={answerText}
                                          onChange={(e) =>
                                            onUpdatePromptAnswer(
                                              prompt.id,
                                              e.target.value
                                            )
                                          }
                                          placeholder={
                                            prompt.validation.inputPlaceholder
                                          }
                                          className="flex-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
                                        />
                                      ) : (
                                        <input
                                          id={`answer-input-${prompt.id}`}
                                          type="text"
                                          value={answerText}
                                          onChange={(e) =>
                                            onUpdatePromptAnswer(
                                              prompt.id,
                                              e.target.value
                                            )
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              onCheckPromptAnswer(prompt.id);
                                            }
                                          }}
                                          placeholder={
                                            prompt.validation.inputPlaceholder
                                          }
                                          className="flex-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
                                        />
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          onCheckPromptAnswer(prompt.id)
                                        }
                                        className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
                                      >
                                        Check Answer
                                      </button>
                                    </div>

                                    {checkStatus && checkFeedback && (
                                      <div
                                        role="status"
                                        className={`rounded-lg border px-3 py-2 text-xs leading-relaxed flex items-start gap-2 ${
                                          checkStatus === 'verified'
                                            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                                            : 'border-amber-200 bg-amber-50/70 text-amber-900'
                                        }`}
                                      >
                                        {checkStatus === 'verified' ? (
                                          <CheckCircle2
                                            className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"
                                            aria-hidden="true"
                                          />
                                        ) : (
                                          <AlertCircle
                                            className="w-4 h-4 text-amber-700 shrink-0 mt-0.5"
                                            aria-hidden="true"
                                          />
                                        )}
                                        <span>{checkFeedback}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Verification Hint & Separate Reference Answer Toggles */}
                                  <div className="space-y-2 pt-0.5">
                                    <div className="flex flex-wrap items-center gap-4">
                                      <button
                                        type="button"
                                        onClick={() => toggleHint(prompt.id)}
                                        aria-expanded={isHintOpen}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
                                      >
                                        <Lightbulb
                                          className="w-3.5 h-3.5 text-slate-400"
                                          aria-hidden="true"
                                        />
                                        <span>
                                          {isHintOpen
                                            ? 'Hide expected check'
                                            : 'Expected Check / Self-Verification'}
                                        </span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleReference(prompt.id)
                                        }
                                        aria-expanded={isReferenceOpen}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
                                      >
                                        {isReferenceOpen ? (
                                          <EyeOff
                                            className="w-3.5 h-3.5 text-slate-400"
                                            aria-hidden="true"
                                          />
                                        ) : (
                                          <Eye
                                            className="w-3.5 h-3.5 text-slate-400"
                                            aria-hidden="true"
                                          />
                                        )}
                                        <span>
                                          {isReferenceOpen
                                            ? 'Hide Reference Answer'
                                            : 'Reveal Reference Answer'}
                                        </span>
                                      </button>
                                    </div>

                                    {isHintOpen && (
                                      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 leading-relaxed">
                                        <span className="font-semibold text-slate-800 mr-1.5">
                                          Self-Check:
                                        </span>
                                        {prompt.expectedCheck}
                                      </div>
                                    )}

                                    {isReferenceOpen && (
                                      <div className="rounded-md border border-slate-200 bg-slate-900 text-slate-100 px-3 py-2.5 font-mono text-xs leading-relaxed">
                                        <div className="text-[10px] font-sans uppercase tracking-wider text-slate-400 mb-1">
                                          Reference Answer
                                        </div>
                                        {prompt.referenceAnswer}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Per-Topic Practice Notes */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor={`topic-note-${topic.moduleId}`}
                            className="text-xs font-medium text-slate-700"
                          >
                            Topic Practice Notes ({topic.indexLabel} {topic.title})
                          </label>
                          <span className="text-[11px] text-slate-400">
                            Saved locally
                          </span>
                        </div>
                        <textarea
                          id={`topic-note-${topic.moduleId}`}
                          rows={3}
                          value={topicNote}
                          onChange={(e) =>
                            onUpdateTopicNote(topic.moduleId, e.target.value)
                          }
                          placeholder={`Draft formulas, queries, or takeaways for ${topic.title}...`}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      {/* Topic Footer Controls: Mark/Clear + Prev/Next Topic Stepper */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() =>
                            onSetTopicAll(
                              activeLab.id,
                              topic.moduleId,
                              !allTopicDone
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            {allTopicDone
                              ? 'Clear topic'
                              : 'Mark topic practiced'}
                          </span>
                        </button>

                        <div className="flex items-center gap-2">
                          {prevTopic && (
                            <button
                              type="button"
                              onClick={() => stepToTopic(prevTopic)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Prev topic</span>
                            </button>
                          )}
                          {nextTopic && (
                            <button
                              type="button"
                              onClick={() => stepToTopic(nextTopic)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <span>Next topic</span>
                              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* Right: Topic Index + General Scratchpad */}
        <aside className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold text-slate-900">
                {activeLab.tool} Topic Checklist
              </h2>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {activeLabStats.completedPrompts}/{activeLabStats.totalPrompts}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {activeLab.topics.map((topic) => {
                const done = topic.prompts.filter((p) =>
                  checkedPromptSet.has(p.id)
                ).length;
                const total = topic.prompts.length;
                const isComplete = total > 0 && done === total;

                return (
                  <button
                    key={topic.moduleId}
                    type="button"
                    onClick={() => stepToTopic(topic)}
                    className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-slate-700 truncate">
                      <span className="font-mono text-slate-400 mr-2 tabular-nums">
                        {topic.indexLabel}
                      </span>
                      {topic.title}
                    </span>
                    <span
                      className={`font-mono text-xs tabular-nums shrink-0 ${
                        isComplete
                          ? 'text-emerald-700 font-medium'
                          : done > 0
                          ? 'text-blue-700 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {done}/{total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Practice Scratchpad
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Keep cross-subject SQL snippets, Excel formulas, or dataset links here alongside your per-topic notes.
            </p>
            <textarea
              rows={9}
              value={state.practiceScratchpad}
              onChange={(e) => onUpdateScratchpad(e.target.value)}
              aria-label="Practice scratchpad notes"
              placeholder="Example: Compare LEFT JOIN fan-out checks vs. Power BI single-direction 1:* relationships..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
            <p className="text-xs text-slate-400">
              Saved automatically in browser local storage.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
