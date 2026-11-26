import {
  CheckCircle2,
  Circle,
  Copy,
  Download,
  FileText,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DEFAULT_PORTFOLIO_RUBRIC,
  evaluatePortfolioProjectQuality,
  generatePortfolioPlainTextCaseStudy,
  generatePortfolioReadmeMarkdown,
  PORTFOLIO_RUBRIC_DIMENSIONS,
  PORTFOLIO_TEMPLATES,
} from '../data/portfolioAndCareerData';
import {
  LmsLocalState,
  PortfolioProject,
  PortfolioRubricKey,
  PortfolioTemplateId,
} from '../types/academy';

interface PortfolioViewProps {
  projectId?: string;
  state: LmsLocalState;
  onUpsertProject: (project: PortfolioProject) => void;
  onDeleteProject: (projectId: string) => void;
}

type EditorStep = 'framing' | 'cleaning' | 'analysis' | 'narrative' | 'export';

function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function PortfolioView({
  projectId,
  state,
  onUpsertProject,
  onDeleteProject,
}: PortfolioViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    projectId ?? state.portfolioProjects[0]?.id ?? null
  );
  const [activeStep, setActiveStep] = useState<EditorStep>('framing');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && state.portfolioProjects.some((p) => p.id === projectId)) {
      setSelectedId(projectId);
    } else if (!selectedId && state.portfolioProjects.length > 0) {
      setSelectedId(state.portfolioProjects[0].id);
    }
  }, [projectId, state.portfolioProjects.length]);

  const activeProject = state.portfolioProjects.find((p) => p.id === selectedId);

  const handleCreateFromTemplate = (templateId: PortfolioTemplateId) => {
    const tpl = PORTFOLIO_TEMPLATES.find((t) => t.id === templateId) ?? PORTFOLIO_TEMPLATES[0];
    const now = new Date().toISOString();
    const created: PortfolioProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      ...tpl.defaults,
      rubricSelfReview: { ...DEFAULT_PORTFOLIO_RUBRIC },
    };
    created.readmeDraft = generatePortfolioReadmeMarkdown(created);
    onUpsertProject(created);
    setSelectedId(created.id);
    setActiveStep('framing');
  };

  const updateField = <K extends keyof PortfolioProject>(key: K, value: PortfolioProject[K]) => {
    if (!activeProject) return;
    onUpsertProject({
      ...activeProject,
      [key]: value,
    });
  };

  const toggleRubric = (key: PortfolioRubricKey) => {
    if (!activeProject) return;
    onUpsertProject({
      ...activeProject,
      rubricSelfReview: {
        ...activeProject.rubricSelfReview,
        [key]: !activeProject.rubricSelfReview[key],
      },
    });
  };

  const copyToClipboard = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`${label} copied to clipboard.`);
      window.setTimeout(() => setCopyStatus(null), 2500);
    } catch {
      setCopyStatus('Clipboard permission unavailable — use Download instead.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            Guided Portfolio Artifact Workflow
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Portfolio Case Study Builder
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Turn your SQL, Python, Excel, and BI analysis into hiring-ready portfolio documentation
            with validated completion checks, an 8-dimension rubric, and local README / case-study exports.
          </p>
        </div>

        <a
          href="#/career-readiness"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shrink-0"
        >
          <FileText className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span>Open Career &amp; Resume Workspace</span>
        </a>
      </div>

      {/* Template Launcher Strip */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Start a Portfolio Case Study from Template or Blank Scaffold
            </h2>
            <p className="text-xs text-slate-500">
              Templates pre-populate verified embedded dataset context so you can customize, add insights, and export cleanly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PORTFOLIO_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleCreateFromTemplate(tpl.id)}
              className="text-left p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 transition-colors flex flex-col justify-between gap-2 cursor-pointer"
            >
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                  {tpl.domain}
                </p>
                <p className="font-display text-xs font-semibold text-slate-900 leading-snug">
                  {tpl.label}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Create Draft</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Saved Projects Workspace */}
      {state.portfolioProjects.length === 0 ? (
        <section className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            No Portfolio Projects Created Yet
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Select one of the four embedded business templates above (or Custom Blank Case Study) to
            create your first documented analytics case study.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Project Switcher + Completion Checklist */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
                Your Saved Projects ({state.portfolioProjects.length})
              </h2>
              <div className="space-y-1.5">
                {state.portfolioProjects.map((proj) => {
                  const q = evaluatePortfolioProjectQuality(proj);
                  const isCurr = proj.id === activeProject?.id;
                  return (
                    <div
                      key={proj.id}
                      className={`p-3 rounded-xl border transition-colors flex items-start justify-between gap-2 ${
                        isCurr
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(proj.id)}
                        className="text-left flex-1 cursor-pointer"
                      >
                        <p className="text-xs font-semibold leading-snug">
                          {proj.title.trim() || 'Untitled Project'}
                        </p>
                        <p
                          className={`text-[11px] mt-1 tabular-nums ${
                            isCurr ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {q.completedCount}/{q.totalChecklist} checks · Rubric {q.rubricCheckedCount}/
                          {q.totalRubric}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteProject(proj.id);
                          if (isCurr) setSelectedId(null);
                        }}
                        aria-label={`Delete ${proj.title || 'project'}`}
                        className={`p-1 rounded hover:bg-red-600/20 cursor-pointer ${
                          isCurr ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-red-700'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {activeProject && (() => {
              const evalQuality = evaluatePortfolioProjectQuality(activeProject);
              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold text-slate-900">
                      10-Point Readiness Checks
                    </h3>
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        evalQuality.isPortfolioComplete ? 'text-emerald-700' : 'text-blue-600'
                      }`}
                    >
                      {evalQuality.completedCount} / {evalQuality.totalChecklist}
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {evalQuality.checklistResults.map((item) => (
                      <li key={item.id} className="flex items-start gap-2 text-xs">
                        {item.passed ? (
                          <CheckCircle2
                            className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle
                            className="w-4 h-4 text-slate-300 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                        <div>
                          <p
                            className={`font-medium ${
                              item.passed ? 'text-slate-800' : 'text-slate-600'
                            }`}
                          >
                            {item.label}
                          </p>
                          {!item.passed && (
                            <p className="text-[11px] text-amber-700 mt-0.5">{item.reason}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </aside>

          {/* Main Project Editor */}
          {activeProject && (
            <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5">
                {(
                  [
                    ['framing', '1. Framing & Grain'],
                    ['cleaning', '2. Cleaning & Questions'],
                    ['analysis', '3. KPIs & Dashboard'],
                    ['narrative', '4. Findings & Rubric'],
                    ['export', '5. README & Exports'],
                  ] as [EditorStep, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveStep(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      activeStep === key
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {activeStep === 'framing' && (
                  <>
                    <FieldInput
                      id="pf-title"
                      label="Project Title"
                      value={activeProject.title}
                      onChange={(v) => updateField('title', v)}
                      placeholder="e.g., Omnichannel Retail Margin & Discount Erosion Audit"
                    />
                    <FieldInput
                      id="pf-stakeholder"
                      label="Stakeholder Persona"
                      value={activeProject.stakeholderPersona}
                      onChange={(v) => updateField('stakeholderPersona', v)}
                      placeholder="e.g., VP of Commercial Finance"
                    />
                    <FieldTextarea
                      id="pf-problem"
                      label="Business Problem & Decision at Stake"
                      value={activeProject.businessProblem}
                      onChange={(v) => updateField('businessProblem', v)}
                      rows={3}
                    />
                    <FieldTextarea
                      id="pf-dataset"
                      label="Dataset Description"
                      value={activeProject.datasetDescription}
                      onChange={(v) => updateField('datasetDescription', v)}
                      rows={2}
                    />
                    <FieldTextarea
                      id="pf-grain"
                      label="Dataset Grain (What 1 Row Represents)"
                      value={activeProject.datasetGrain}
                      onChange={(v) => updateField('datasetGrain', v)}
                      rows={2}
                    />
                    <FieldTextarea
                      id="pf-dict"
                      label="Data Dictionary / Key Columns"
                      value={activeProject.dataDictionary}
                      onChange={(v) => updateField('dataDictionary', v)}
                      rows={2}
                    />
                  </>
                )}

                {activeStep === 'cleaning' && (
                  <>
                    <FieldTextarea
                      id="pf-cleaning"
                      label="Cleaning Decisions & Exclusions (NULLs, Casing, Duplicates, Returns)"
                      value={activeProject.cleaningDecisions}
                      onChange={(v) => updateField('cleaningDecisions', v)}
                      rows={4}
                    />
                    <FieldTextarea
                      id="pf-questions"
                      label="Analytical Questions Investigated"
                      value={activeProject.analysisQuestions}
                      onChange={(v) => updateField('analysisQuestions', v)}
                      rows={3}
                    />
                    <FieldTextarea
                      id="pf-notes"
                      label="SQL / Python / Excel Work Notes & Verification"
                      value={activeProject.workNotes}
                      onChange={(v) => updateField('workNotes', v)}
                      rows={4}
                    />
                    <FieldInput
                      id="pf-skills"
                      label="Skills & Tools Demonstrated"
                      value={activeProject.skillsDemonstrated}
                      onChange={(v) => updateField('skillsDemonstrated', v)}
                      placeholder="e.g., SQL Joins & CTEs, pandas, Star Schema DAX"
                    />
                  </>
                )}

                {activeStep === 'analysis' && (
                  <>
                    <FieldTextarea
                      id="pf-kpis"
                      label="Exact KPI & Guardrail Definitions"
                      value={activeProject.kpiDefinitions}
                      onChange={(v) => updateField('kpiDefinitions', v)}
                      rows={4}
                    />
                    <FieldTextarea
                      id="pf-dashboard"
                      label="Visual & Dashboard Design Plan"
                      value={activeProject.dashboardPlan}
                      onChange={(v) => updateField('dashboardPlan', v)}
                      rows={4}
                    />
                    <FieldTextarea
                      id="pf-limits"
                      label="Limitations, Sample Caveats & Assumptions"
                      value={activeProject.limitationsAndAssumptions}
                      onChange={(v) => updateField('limitationsAndAssumptions', v)}
                      rows={3}
                    />
                    <FieldTextarea
                      id="pf-next"
                      label="Recommended Next Steps"
                      value={activeProject.nextSteps}
                      onChange={(v) => updateField('nextSteps', v)}
                      rows={2}
                    />
                  </>
                )}

                {activeStep === 'narrative' && (
                  <>
                    <FieldTextarea
                      id="pf-findings"
                      label="Quantified Key Findings (Include Concrete Numbers)"
                      value={activeProject.findings}
                      onChange={(v) => updateField('findings', v)}
                      rows={4}
                    />
                    <FieldTextarea
                      id="pf-recs"
                      label="Quantified Business Recommendations & Trade-offs"
                      value={activeProject.quantifiedRecommendations}
                      onChange={(v) => updateField('quantifiedRecommendations', v)}
                      rows={3}
                    />
                    <FieldTextarea
                      id="pf-short"
                      label="Short Resume / Portfolio Card Summary (2–3 Sentences)"
                      value={activeProject.shortSummary}
                      onChange={(v) => updateField('shortSummary', v)}
                      rows={2}
                    />
                    <FieldTextarea
                      id="pf-long"
                      label="Extended Case Study Narrative (Optional)"
                      value={activeProject.longCaseStudy}
                      onChange={(v) => updateField('longCaseStudy', v)}
                      rows={4}
                      placeholder="Optional deep-dive narrative for blog posts or interview prep..."
                    />

                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <h3 className="font-display text-sm font-semibold text-slate-900">
                        8-Dimension Portfolio Quality Self-Review
                      </h3>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl px-4">
                        {PORTFOLIO_RUBRIC_DIMENSIONS.map((dim) => (
                          <label
                            key={dim.key}
                            className="py-2.5 flex items-start gap-2.5 text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(activeProject.rubricSelfReview[dim.key])}
                              onChange={() => toggleRubric(dim.key)}
                              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <div>
                              <span className="font-semibold text-slate-900">{dim.label}</span>
                              <span className="text-slate-600"> — {dim.guidance}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeStep === 'export' && (() => {
                  const generatedMd = generatePortfolioReadmeMarkdown(activeProject);
                  const readmeValue = activeProject.readmeDraft.trim()
                    ? activeProject.readmeDraft
                    : generatedMd;
                  const plainTextStudy = generatePortfolioPlainTextCaseStudy(activeProject);

                  return (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="font-display text-sm font-semibold text-slate-900">
                            Editable GitHub README.md Draft
                          </h3>
                          <p className="text-xs text-slate-500">
                            Auto-built from your 19 structured project fields—customize or regenerate anytime.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateField('readmeDraft', generatedMd)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                        >
                          Regenerate README from Fields
                        </button>
                      </div>

                      <textarea
                        rows={12}
                        value={readmeValue}
                        onChange={(e) => updateField('readmeDraft', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                      />

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile(
                              `${(activeProject.title || 'portfolio-case-study')
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')}-README.md`,
                              readmeValue,
                              'text/markdown;charset=utf-8'
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Download README.md</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile(
                              `${(activeProject.title || 'case-study')
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')}.txt`,
                              plainTextStudy
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Download Plain-Text Case Study</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => copyToClipboard('README Markdown', readmeValue)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copy README</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              'Summary & Key Findings',
                              `${activeProject.shortSummary}\n\nKey Findings:\n${activeProject.findings}`
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copy Resume Summary</span>
                        </button>
                      </div>

                      {copyStatus && (
                        <p className="text-xs font-medium text-emerald-700">{copyStatus}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function FieldInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-800">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
      />
    </div>
  );
}

function FieldTextarea({
  id,
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-800">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none leading-relaxed"
      />
    </div>
  );
}
