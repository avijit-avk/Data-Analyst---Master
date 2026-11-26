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
      learnerVerifiedOriginalWork: false,
      rubricSelfReview: { ...DEFAULT_PORTFOLIO_RUBRIC },
      readmeDraft: '',
    };
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

      {projectId && !state.portfolioProjects.some((p) => p.id === projectId) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
          <span>
            Portfolio project <code className="font-mono font-semibold">{projectId}</code> was not found in this browser’s local storage. Create a case study from a template below or open an existing saved project.
          </span>
          <a
            href="#/portfolio"
            className="font-semibold text-amber-900 underline hover:text-amber-700 shrink-0"
          >
            Reset Portfolio URL
          </a>
        </div>
      )}

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
          {/* Project Switcher + Final Quality Gate + Structure Checklist */}
          <aside className="lg:col-span-4 min-w-0 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
                Your Saved Projects ({state.portfolioProjects.length})
              </h2>
              <div className="space-y-1.5">
                {state.portfolioProjects.map((proj) => {
                  const q = evaluatePortfolioProjectQuality(proj);
                  const isCurr = proj.id === activeProject?.id;
                  const statusColor = q.isPortfolioComplete
                    ? isCurr
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : q.isTemplateBaseline
                      ? isCurr
                        ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                      : isCurr
                        ? 'bg-blue-500/20 text-blue-200 border-blue-400/40'
                        : 'bg-blue-50 text-blue-800 border-blue-200';

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
                        className="text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <p className="text-xs font-semibold leading-snug break-words">
                          {proj.title.trim() || 'Untitled Project'}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusColor}`}
                          >
                            {q.statusLabel}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] mt-1 tabular-nums ${
                            isCurr ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          Structure {q.completedCount}/{q.totalChecklist} · Gate{' '}
                          {q.qualityGatePassedCount}/{q.qualityGateTotal}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteProject(proj.id);
                          if (isCurr) setSelectedId(null);
                        }}
                        aria-label={`Delete ${proj.title || 'project'}`}
                        className={`p-1 rounded hover:bg-red-600/20 shrink-0 cursor-pointer ${
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
                <>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-sm font-semibold text-slate-900">
                          Final Portfolio Quality Gate
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Required to graduate from draft to Job-Ready Artifact
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold tabular-nums shrink-0 ${
                          evalQuality.qualityGatePassedCount === evalQuality.qualityGateTotal
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {evalQuality.qualityGatePassedCount} / {evalQuality.qualityGateTotal}
                      </span>
                    </div>

                    {evalQuality.isTemplateBaseline && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 leading-relaxed">
                        Template Starter Draft detected: structure fields are pre-filled as a scaffold only. Customize your work notes and findings, complete 6+ rubric checks, and sign the Step 4 attestation.
                      </div>
                    )}

                    <ul className="space-y-2.5">
                      {evalQuality.qualityGateResults.map((gate) => (
                        <li key={gate.id} className="flex items-start gap-2 text-xs">
                          {gate.passed ? (
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          ) : (
                            <Circle
                              className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          )}
                          <div className="min-w-0">
                            <p
                              className={`font-medium ${
                                gate.passed ? 'text-slate-800' : 'text-slate-700'
                              }`}
                            >
                              {gate.label}
                            </p>
                            {!gate.passed && (
                              <p className="text-[11px] text-amber-700 mt-0.5">{gate.reason}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-semibold text-slate-900">
                        10-Point Structure Checks
                      </h3>
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          evalQuality.completedCount === evalQuality.totalChecklist
                            ? 'text-emerald-700'
                            : 'text-blue-600'
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
                          <div className="min-w-0">
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
                </>
              );
            })()}
          </aside>

          {/* Main Project Editor */}
          {activeProject && (() => {
            const evalQuality = evaluatePortfolioProjectQuality(activeProject);
            return (
            <section className="lg:col-span-8 min-w-0 bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {activeProject.title.trim() || 'Untitled Project'}
                  </p>
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    Structure {evalQuality.completedCount}/{evalQuality.totalChecklist} · Quality Gate{' '}
                    {evalQuality.qualityGatePassedCount}/{evalQuality.qualityGateTotal} · Rubric{' '}
                    {evalQuality.rubricCheckedCount}/{evalQuality.totalRubric}
                  </p>
                </div>
                <span
                  className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded border shrink-0 ${
                    evalQuality.isPortfolioComplete
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : evalQuality.isTemplateBaseline
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  {evalQuality.statusLabel}
                </span>
              </div>

              <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5">
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

              <div className="p-4 sm:p-6 space-y-5">
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
                              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 shrink-0"
                            />
                            <div>
                              <span className="font-semibold text-slate-900">{dim.label}</span>
                              <span className="text-slate-600"> — {dim.guidance}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display text-sm font-semibold text-slate-900">
                          Final Quality Gate: Original Work Attestation
                        </h3>
                        <span className="text-xs font-semibold tabular-nums text-slate-600">
                          Gate {evalQuality.qualityGatePassedCount} / {evalQuality.qualityGateTotal}
                        </span>
                      </div>
                      <label
                        htmlFor="pf-attestation"
                        className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs cursor-pointer ${
                          activeProject.learnerVerifiedOriginalWork
                            ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                            : 'border-amber-200 bg-amber-50/60 text-slate-800'
                        }`}
                      >
                        <input
                          id="pf-attestation"
                          type="checkbox"
                          checked={Boolean(activeProject.learnerVerifiedOriginalWork)}
                          onChange={() =>
                            updateField(
                              'learnerVerifiedOriginalWork',
                              !activeProject.learnerVerifiedOriginalWork
                            )
                          }
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 shrink-0"
                        />
                        <span className="leading-relaxed">
                          I ran these SQL, Python, or Excel analyses on the dataset myself, verified every figure reported in Findings, and tailored the executive summary and recommendations in my own words.
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {activeStep === 'export' && (() => {
                  const generatedMd = generatePortfolioReadmeMarkdown(activeProject);
                  const readmeValue = activeProject.readmeDraft.trim()
                    ? activeProject.readmeDraft
                    : generatedMd;
                  const plainTextStudy = generatePortfolioPlainTextCaseStudy(activeProject);
                  const unmetGates = evalQuality.qualityGateResults.filter((g) => !g.passed);

                  return (
                    <div className="space-y-5">
                      {!evalQuality.isPortfolioComplete && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 space-y-1.5">
                          <p className="font-semibold">
                            Status: {evalQuality.statusLabel} — Complete the Final Quality Gate before publishing to GitHub
                          </p>
                          {unmetGates.length > 0 && (
                            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                              {unmetGates.map((g) => (
                                <li key={g.id}>{g.reason}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="font-display text-sm font-semibold text-slate-900">
                            Editable GitHub README.md Draft
                          </h3>
                          <p className="text-xs text-slate-500">
                            Auto-built from your structured project fields—customize or regenerate anytime.
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
            );
          })()}
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
