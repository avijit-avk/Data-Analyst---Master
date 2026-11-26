import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Plus,
  SearchCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  APPLICATION_READINESS_CHECKLIST,
  evaluateJobGapLocally,
  parseJobDescriptionLocally,
} from '../data/portfolioAndCareerData';
import {
  JobApplicationEntry,
  JobApplicationStatus,
  JobGapAnalysisEntry,
  LmsLocalState,
  ResumeWorksheet,
} from '../types/academy';

interface CareerReadinessViewProps {
  state: LmsLocalState;
  onUpdateResume: (patch: Partial<ResumeWorksheet>) => void;
  onToggleChecklist: (itemId: string) => void;
  onSaveJdGap: (entry: JobGapAnalysisEntry) => void;
  onDeleteJdGap: (id: string) => void;
  onUpsertApplication: (entry: JobApplicationEntry) => void;
  onDeleteApplication: (id: string) => void;
}

type CareerTab = 'resume' | 'checklist' | 'jd-analyzer' | 'tracker';

const STATUS_OPTIONS: JobApplicationStatus[] = [
  'Saved',
  'Applied',
  'Recruiter Screen',
  'Technical / SQL',
  'Case / Final',
  'Offer',
  'Archived',
];

function downloadFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
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

export function CareerReadinessView({
  state,
  onUpdateResume,
  onToggleChecklist,
  onSaveJdGap,
  onDeleteJdGap,
  onUpsertApplication,
  onDeleteApplication,
}: CareerReadinessViewProps) {
  const [activeTab, setActiveTab] = useState<CareerTab>('resume');

  // JD Analyzer local form state
  const [jdRoleTitle, setJdRoleTitle] = useState('');
  const [jdRawText, setJdRawText] = useState('');
  const [activeGapId, setActiveGapId] = useState<string | null>(
    state.jdGapAnalyses[0]?.id ?? null
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [newTagGroup, setNewTagGroup] = useState<'requiredTools' | 'technicalSkills' | 'domainSkills'>('requiredTools');

  // Application Tracker form state
  const [appCompany, setAppCompany] = useState('');
  const [appRole, setAppRole] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appDate, setAppDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [appStatus, setAppStatus] = useState<JobApplicationStatus>('Applied');
  const [appFollowUp, setAppFollowUp] = useState('');
  const [appSkills, setAppSkills] = useState('');
  const [appStage, setAppStage] = useState('');
  const [appNotes, setAppNotes] = useState('');
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  const checklistCompleted = APPLICATION_READINESS_CHECKLIST.filter(
    (item) => state.careerChecklist[item.id]
  ).length;

  const activeGap = state.jdGapAnalyses.find((g) => g.id === activeGapId) ?? state.jdGapAnalyses[0];

  const handleAnalyzeJd = () => {
    if (!jdRawText.trim()) return;
    const parsed = parseJobDescriptionLocally(jdRawText);
    const entry: JobGapAnalysisEntry = {
      id: `jd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roleTitle: jdRoleTitle.trim() || 'Target Data Analyst Role',
      rawDescription: jdRawText.trim(),
      ...parsed,
      createdAt: new Date().toISOString(),
    };
    onSaveJdGap(entry);
    setActiveGapId(entry.id);
    setJdRoleTitle('');
    setJdRawText('');
  };

  const handleAddSkillTag = () => {
    if (!activeGap || !newTagInput.trim()) return;
    const tag = newTagInput.trim();
    const updated: JobGapAnalysisEntry = {
      ...activeGap,
      [newTagGroup]: Array.from(new Set([...activeGap[newTagGroup], tag])),
    };
    onSaveJdGap(updated);
    setNewTagInput('');
  };

  const handleRemoveSkillTag = (
    group: 'requiredTools' | 'technicalSkills' | 'domainSkills',
    tag: string
  ) => {
    if (!activeGap) return;
    onSaveJdGap({
      ...activeGap,
      [group]: activeGap[group].filter((t) => t !== tag),
    });
  };

  const handleSaveApplication = () => {
    if (!appCompany.trim() || !appRole.trim()) return;
    onUpsertApplication({
      id: editingAppId ?? `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      company: appCompany.trim(),
      role: appRole.trim(),
      jobUrl: appUrl.trim(),
      dateApplied: appDate,
      status: appStatus,
      followUpDate: appFollowUp,
      skillsEmphasized: appSkills.trim(),
      interviewStage: appStage.trim(),
      notes: appNotes.trim(),
    });
    setEditingAppId(null);
    setAppCompany('');
    setAppRole('');
    setAppUrl('');
    setAppFollowUp('');
    setAppSkills('');
    setAppStage('');
    setAppNotes('');
  };

  const handleExportTrackerCsv = () => {
    const headers = [
      'company',
      'role',
      'job_url',
      'date_applied',
      'status',
      'follow_up_date',
      'skills_emphasized',
      'interview_stage',
      'notes',
    ];
    const esc = (v: string) =>
      v.includes(',') || v.includes('"') || v.includes('\n')
        ? `"${v.replace(/"/g, '""')}"`
        : v;
    const lines = [
      headers.join(','),
      ...state.jobApplications.map((a) =>
        [
          a.company,
          a.role,
          a.jobUrl,
          a.dateApplied,
          a.status,
          a.followUpDate,
          a.skillsEmphasized,
          a.interviewStage,
          a.notes,
        ]
          .map(esc)
          .join(',')
      ),
    ];
    downloadFile('job-application-tracker.csv', lines.join('\n'), 'text/csv;charset=utf-8');
  };

  const handleDownloadResumeDraft = () => {
    const r = state.resumeWorksheet;
    const text = `TARGET ROLE: ${r.targetRole}
LINKS: ${r.links}

SUMMARY
${r.professionalSummary}

SKILLS & TOOLS
Skills: ${r.skills}
Tools: ${r.toolsAndTechnologies}

PORTFOLIO PROJECTS
${r.portfolioProjects}

EXPERIENCE (TRANSFERABLE & VERIFIED IMPACT)
${r.priorExperienceAndBullets}

EDUCATION & TRAINING
${r.education}
${r.certificationsOrMentorship}
`;
    downloadFile('data-analyst-resume-worksheet.txt', text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            100% Browser-Local Career Workspace
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Career Readiness, Resume &amp; Application Tracker
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Build an honest one-page analyst resume, verify your 15 readiness milestones, analyze
            job descriptions privately in your browser, and manage applications locally.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <a
            href="#/portfolio"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl"
          >
            <span>Portfolio Builder</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
          <a
            href="#/module/mod-6"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl"
          >
            <span>Behavioral Interview Studio</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {(
          [
            ['resume', '1. Resume Worksheet', FileText],
            ['checklist', `2. Readiness Checklist (${checklistCompleted}/15)`, ClipboardList],
            ['jd-analyzer', '3. Local JD Gap Analyzer', SearchCheck],
            ['tracker', `4. Application Tracker (${state.jobApplications.length})`, Briefcase],
          ] as [CareerTab, string, typeof FileText][]
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              activeTab === key
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: ONE-PAGE RESUME WORKSHEET */}
      {activeTab === 'resume' && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                One-Page Data Analyst Resume Worksheet
              </h2>
              <p className="text-xs text-slate-600">
                Honesty Policy: Frame prior roles truthfully using Action + Method/Tool + Quantified
                Result. Showcase portfolio case studies cleanly—never fabricate Data Analyst titles.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadResumeDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export Resume Worksheet (.txt)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResumeInput
              id="rw-role"
              label="Target Role"
              value={state.resumeWorksheet.targetRole}
              onChange={(v) => onUpdateResume({ targetRole: v })}
              placeholder="Junior Data Analyst / Business Analyst"
            />
            <ResumeInput
              id="rw-links"
              label="Portfolio, GitHub & LinkedIn Links"
              value={state.resumeWorksheet.links}
              onChange={(v) => onUpdateResume({ links: v })}
              placeholder="github.com/username | linkedin.com/in/username"
            />
          </div>

          <ResumeTextarea
            id="rw-summary"
            label="Professional Summary (2–3 Honest Lines)"
            value={state.resumeWorksheet.professionalSummary}
            onChange={(v) => onUpdateResume({ professionalSummary: v })}
            rows={2}
            placeholder="Example: Operations specialist transitioning into Data Analytics with verified portfolio case studies in SQL (CTEs, window functions), Python/pandas, Excel modeling, and KPI design..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResumeTextarea
              id="rw-skills"
              label="Analytical Skills"
              value={state.resumeWorksheet.skills}
              onChange={(v) => onUpdateResume({ skills: v })}
              rows={2}
              placeholder="KPI Design, Data Cleaning, Cohort & Margin Analysis, Root-Cause Investigation, Statistical Testing"
            />
            <ResumeTextarea
              id="rw-tools"
              label="Tools & Technologies"
              value={state.resumeWorksheet.toolsAndTechnologies}
              onChange={(v) => onUpdateResume({ toolsAndTechnologies: v })}
              rows={2}
              placeholder="SQL, Microsoft Excel (XLOOKUP, SUMIFS, Pivots), Python (pandas, NumPy), Power BI / DAX"
            />
          </div>

          <ResumeTextarea
            id="rw-projects"
            label="Portfolio Projects (Action + Tool + Quantified Scope)"
            value={state.resumeWorksheet.portfolioProjects}
            onChange={(v) => onUpdateResume({ portfolioProjects: v })}
            rows={4}
            placeholder="Omnichannel Retail Margin Audit — Reconciled $5,340 Completed Net Revenue across 3 relational tables using SQL joins & pandas, isolating 16.7% order fallout and SKU discount erosion..."
          />

          <ResumeTextarea
            id="rw-exp"
            label="Prior Experience & Transferable Action-Result Bullets"
            value={state.resumeWorksheet.priorExperienceAndBullets}
            onChange={(v) => onUpdateResume({ priorExperienceAndBullets: v })}
            rows={4}
            placeholder="Operations Coordinator (Company, Years) — Standardized weekly Excel vendor trackers using lookup & validation formulas, cutting reconciliation errors and saving ~2 hrs/week..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResumeTextarea
              id="rw-edu"
              label="Education"
              value={state.resumeWorksheet.education}
              onChange={(v) => onUpdateResume({ education: v })}
              rows={2}
              placeholder="B.S. in ... / Relevant quantitative coursework"
            />
            <ResumeTextarea
              id="rw-certs"
              label="Structured Training / Self-Study Completion"
              value={state.resumeWorksheet.certificationsOrMentorship}
              onChange={(v) => onUpdateResume({ certificationsOrMentorship: v })}
              rows={2}
              placeholder="Data Analytics Masters Self-Contained Curriculum (SQL, Python, Statistics, BI)"
            />
          </div>
        </section>
      )}

      {/* TAB 2: 15-ITEM READINESS CHECKLIST */}
      {activeTab === 'checklist' && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                15-Point Application Readiness Checklist
              </h2>
              <p className="text-xs text-slate-600">
                Track concrete preparation milestones before sending high-priority applications.
              </p>
            </div>
            <span className="font-display text-lg font-bold text-blue-600 tabular-nums">
              {checklistCompleted} / 15 Completed
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl px-4">
            {APPLICATION_READINESS_CHECKLIST.map((item) => {
              const checked = Boolean(state.careerChecklist[item.id]);
              return (
                <label
                  key={item.id}
                  className="py-3 flex items-start gap-3 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleChecklist(item.id)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-blue-600 uppercase mr-2">
                      {item.category}
                    </span>
                    <span className={checked ? 'line-through text-slate-400' : 'text-slate-800'}>
                      {item.label}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: LOCAL JD GAP ANALYZER */}
      {activeTab === 'jd-analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Local Job-Description Gap Analyzer
              </h2>
              <p className="text-xs text-slate-600">
                100% private &amp; local: pasted job text stays exclusively inside your browser and
                is matched against your completed LMS modules, labs, and quizzes.
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="jd-role" className="block text-xs font-semibold text-slate-800">
                Role Title
              </label>
              <input
                id="jd-role"
                type="text"
                value={jdRoleTitle}
                onChange={(e) => setJdRoleTitle(e.target.value)}
                placeholder="e.g., Junior Operations Data Analyst"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="jd-text" className="block text-xs font-semibold text-slate-800">
                Paste Job Description
              </label>
              <textarea
                id="jd-text"
                rows={7}
                value={jdRawText}
                onChange={(e) => setJdRawText(e.target.value)}
                placeholder="Paste responsibilities and requirements (SQL, Excel, Python, Power BI, KPI design, A/B testing, stakeholder reporting)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleAnalyzeJd}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
            >
              <SearchCheck className="w-4 h-4" aria-hidden="true" />
              <span>Analyze Skill Gaps Locally</span>
            </button>

            {state.jdGapAnalyses.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Saved Analyses</p>
                {state.jdGapAnalyses.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                      entry.id === activeGap?.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveGapId(entry.id)}
                      className="text-left font-medium flex-1 cursor-pointer"
                    >
                      {entry.roleTitle}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteJdGap(entry.id)}
                      aria-label={`Delete ${entry.roleTitle}`}
                      className="p-1 opacity-70 hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            {!activeGap ? (
              <div className="py-10 text-center space-y-2">
                <p className="font-display text-base font-semibold text-slate-900">
                  Paste a Job Description to Compare Against Your Progress
                </p>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  The analyzer extracts Required Tools, Technical Skills, Domain Skills, and
                  Experience/Communication expectations, then lets you edit tags and see internal LMS modules to close gaps.
                </p>
              </div>
            ) : (() => {
              const gapEval = evaluateJobGapLocally(activeGap, state);
              return (
                <>
                  <div className="space-y-1 border-b border-slate-100 pb-4">
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      {activeGap.roleTitle}
                    </h3>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Experience Note: </span>
                      {activeGap.experienceExpectations}
                    </p>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Communication Focus: </span>
                      {activeGap.communicationExpectations}
                    </p>
                  </div>

                  {/* Editable Skill Groups */}
                  <div className="space-y-3">
                    {(
                      [
                        ['requiredTools', 'Required Tools'],
                        ['technicalSkills', 'Technical Skills'],
                        ['domainSkills', 'Domain & Stakeholder Skills'],
                      ] as const
                    ).map(([groupKey, groupTitle]) => (
                      <div key={groupKey} className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-700">{groupTitle}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeGap[groupKey].length === 0 ? (
                            <span className="text-xs text-slate-400">None detected — add manually below if needed.</span>
                          ) : (
                            activeGap[groupKey].map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs"
                              >
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkillTag(groupKey, tag)}
                                  aria-label={`Remove ${tag}`}
                                  className="text-slate-500 hover:text-red-700 cursor-pointer"
                                >
                                  <X className="w-3 h-3" aria-hidden="true" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <select
                        value={newTagGroup}
                        onChange={(e) =>
                          setNewTagGroup(
                            e.target.value as 'requiredTools' | 'technicalSkills' | 'domainSkills'
                          )
                        }
                        aria-label="Skill category"
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs"
                      >
                        <option value="requiredTools">Tool</option>
                        <option value="technicalSkills">Technical Skill</option>
                        <option value="domainSkills">Domain Skill</option>
                      </select>
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="Add custom skill tag (e.g., SQL, Python)..."
                        className="flex-1 min-w-[180px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkillTag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Add Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* Comparison Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-xs">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <p className="font-semibold text-emerald-900">
                        Strong Matches ({gapEval.strongMatches.length})
                      </p>
                      <ul className="space-y-1 text-emerald-800">
                        {gapEval.strongMatches.map((m, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{m.skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                      <p className="font-semibold text-amber-900">
                        Partial Matches ({gapEval.partialMatches.length})
                      </p>
                      <ul className="space-y-1.5 text-amber-900">
                        {gapEval.partialMatches.map((m, i) => (
                          <li key={i}>
                            <p className="font-medium">{m.skill}</p>
                            {m.rule && (
                              <a
                                href={m.rule.lmsHref}
                                className="text-[11px] text-blue-700 underline"
                              >
                                Finish: {m.rule.lmsRecommendation}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <p className="font-semibold text-slate-900">
                        Gaps to Address ({gapEval.missingSkills.length})
                      </p>
                      <ul className="space-y-1.5 text-slate-700">
                        {gapEval.missingSkills.map((m, i) => (
                          <li key={i}>
                            <p className="font-medium">{m.skill}</p>
                            {m.rule && (
                              <a
                                href={m.rule.lmsHref}
                                className="text-[11px] text-blue-600 underline"
                              >
                                Study: {m.rule.lmsRecommendation}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              );
            })()}
          </section>
        </div>
      )}

      {/* TAB 4: LOCAL APPLICATION TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                {editingAppId ? 'Edit Job Application' : 'Add Job Application'}
              </h2>
              {state.jobApplications.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportTrackerCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Export Tracker CSV</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ResumeInput
                id="app-co"
                label="Company *"
                value={appCompany}
                onChange={setAppCompany}
                placeholder="Acme Logistics"
              />
              <ResumeInput
                id="app-role"
                label="Role *"
                value={appRole}
                onChange={setAppRole}
                placeholder="Data Analyst"
              />
              <ResumeInput
                id="app-url"
                label="Job Posting Reference / URL"
                value={appUrl}
                onChange={setAppUrl}
                placeholder="Optional posting link or ID"
              />
              <div>
                <label htmlFor="app-status" className="block text-xs font-semibold text-slate-800 mb-1">
                  Status
                </label>
                <select
                  id="app-status"
                  value={appStatus}
                  onChange={(e) => setAppStatus(e.target.value as JobApplicationStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="app-date" className="block text-xs font-semibold text-slate-800 mb-1">
                  Date Applied
                </label>
                <input
                  id="app-date"
                  type="date"
                  value={appDate}
                  onChange={(e) => setAppDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="app-fu" className="block text-xs font-semibold text-slate-800 mb-1">
                  Follow-up Date
                </label>
                <input
                  id="app-fu"
                  type="date"
                  value={appFollowUp}
                  onChange={(e) => setAppFollowUp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <ResumeInput
                id="app-skills"
                label="Skills Emphasized"
                value={appSkills}
                onChange={setAppSkills}
                placeholder="SQL, Excel, Operations KPIs"
              />
              <ResumeInput
                id="app-stage"
                label="Interview Stage"
                value={appStage}
                onChange={setAppStage}
                placeholder="e.g., Recruiter Call / SQL Screen"
              />
            </div>

            <ResumeTextarea
              id="app-notes"
              label="Notes"
              value={appNotes}
              onChange={setAppNotes}
              rows={2}
              placeholder="Portfolio project sent, hiring manager name, prep focus..."
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveApplication}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{editingAppId ? 'Update Application' : 'Add Application'}</span>
              </button>
              {editingAppId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAppId(null);
                    setAppCompany('');
                    setAppRole('');
                  }}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </section>

          {state.jobApplications.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Company &amp; Role</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Applied / Follow-Up</th>
                      <th className="px-4 py-3 font-semibold">Skills / Stage</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    {state.jobApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{app.company}</p>
                          <p className="text-slate-600">{app.role}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={app.status}
                            aria-label={`Status for ${app.company}`}
                            onChange={(e) =>
                              onUpsertApplication({
                                ...app,
                                status: e.target.value as JobApplicationStatus,
                              })
                            }
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800"
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <p>Applied: {app.dateApplied || '—'}</p>
                          <p>Follow-up: {app.followUpDate || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-xs">
                          <p className="truncate">{app.skillsEmphasized || '—'}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {app.interviewStage || app.notes || ''}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAppId(app.id);
                              setAppCompany(app.company);
                              setAppRole(app.role);
                              setAppUrl(app.jobUrl);
                              setAppDate(app.dateApplied);
                              setAppStatus(app.status);
                              setAppFollowUp(app.followUpDate);
                              setAppSkills(app.skillsEmphasized);
                              setAppStage(app.interviewStage);
                              setAppNotes(app.notes);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteApplication(app.id)}
                            className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResumeInput({
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
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-800">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
      />
    </div>
  );
}

function ResumeTextarea({
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
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none leading-relaxed"
      />
    </div>
  );
}
