export type ModuleIconKey =
  | 'business'
  | 'excel'
  | 'sql'
  | 'python'
  | 'statistics'
  | 'powerbi'
  | 'projects'
  | 'interview';

export type NavSection =
  | 'dashboard'
  | 'modules'
  | 'module'
  | 'lesson'
  | 'lab'
  | 'timed-practice'
  | 'portfolio'
  | 'career-readiness'
  | 'quiz'
  | 'progress'
  | 'not-found';

export interface LessonConceptBlock {
  heading: string;
  explanation: string;
  keyTakeaway: string;
}

export interface LessonSyntaxItem {
  label: string;
  syntax: string;
  usage: string;
}

export interface LessonWorkedStep {
  stepTitle: string;
  detail: string;
  codeOrFormula?: string;
}

export interface LessonPitfall {
  mistake: string;
  whyItBreaks: string;
  fix: string;
}

export interface LessonGuidedExercise {
  prompt: string;
  hint: string;
  solution: string;
  starterCode?: string;
}

export interface LessonStatisticsFraming {
  assumptions: string[];
  justified: string;
  notJustified: string;
  decision: string;
}

export interface LmsLesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  summary: string;
  durationMinutes: number;
  learningObjective?: string;
  coreConcepts: LessonConceptBlock[];
  syntaxReference: LessonSyntaxItem[];
  workedExample: {
    scenario: string;
    steps: LessonWorkedStep[];
    expectedOutput?: string;
    outcome: string;
  };
  commonPitfalls: LessonPitfall[];
  guidedExercise?: LessonGuidedExercise;
  businessInterpretation?: string;
  statisticalFraming?: LessonStatisticsFraming;
  cheatSheet: string[];
}

export interface LmsModule {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  estimatedHours: number;
  iconKey: ModuleIconKey;
  prerequisites: string[];
  objectives: string[];
  labId: string;
  quizId: string;
}

export type ColumnDataType = 'TEXT' | 'INT' | 'FLOAT' | 'DATE';

export interface EmbeddedColumn {
  name: string;
  type: ColumnDataType;
  description: string;
}

export type DatasetRowValue = string | number | null;
export type DatasetRow = Record<string, DatasetRowValue>;

export interface EmbeddedTable {
  name: string;
  csvFilename: string;
  columns: EmbeddedColumn[];
  rows: DatasetRow[];
}

export type BusinessDomain =
  | 'Operations'
  | 'Retail Sales'
  | 'Banking & Credit Cards'
  | 'Human Resources';

export interface EmbeddedDataset {
  id: string;
  domain: BusinessDomain;
  title: string;
  description: string;
  tables: EmbeddedTable[];
}

export type PracticeCheckStatus = 'unchecked' | 'verified' | 'needs_review';

export interface PracticeNumericTarget {
  value: number;
  tolerance?: number;
  allowPercentRatio?: boolean;
}

export interface PracticeAnswerValidationRule {
  expectedNumbers?: PracticeNumericTarget[];
  requiredKeywordGroups?: string[][];
  acceptedExactValues?: string[];
  nudge: string;
}

export type LabExerciseKind = 'formula' | 'sql' | 'metric' | 'python' | 'statistics';

export interface LabExercise {
  id: string;
  labId: string;
  order: number;
  kind: LabExerciseKind;
  title: string;
  prompt: string;
  hint: string;
  starterSql?: string;
  starterPython?: string;
  validationRule: PracticeAnswerValidationRule;
  solutionSteps: string[];
  referenceAnswer: string;
}

export interface LmsLab {
  id: string;
  moduleIds: string[];
  title: string;
  domain: BusinessDomain;
  datasetId: string;
  overview: string;
  businessBrief: string;
  supportsSqlSandbox: boolean;
  supportsPythonSimulator?: boolean;
  defaultSqlQuery: string;
  defaultPythonCode?: string;
  exercises: LabExercise[];
}

// ==========================================
// PHASE 3: OPEN-ENDED EVALUATION
// ==========================================

export type OpenEndedTaskType =
  | 'sql_from_question'
  | 'dataset_grain'
  | 'kpi_definition'
  | 'interpret_result_table'
  | 'executive_recommendation'
  | 'data_quality_risks'
  | 'debug_query_formula'
  | 'chart_defense'
  | 'python_transformation'
  | 'statistical_interpretation'
  | 'dax_modeling';

export interface RubricCriterion {
  id: string;
  label: string;
  weightPercent: number;
  description: string;
}

export interface OpenEndedTask {
  id: string;
  moduleId: string;
  labId?: string;
  taskType: OpenEndedTaskType;
  title: string;
  prompt: string;
  contextData: string;
  datasetId?: string;
  requiredResponseFormat: string;
  recommendedLength: string;
  hint: string;
  rubric: RubricCriterion[];
  expectedSqlColumns?: string[];
  expectedSqlMinRows?: number;
  validationRule?: PracticeAnswerValidationRule;
  referenceAnswer: string;
  explanation: string;
}

export interface OpenEndedSubmissionRecord {
  taskId: string;
  draftText: string;
  submittedText: string;
  submittedAt: string | null;
  attempts: number;
  automatedScorePercent: number | null;
  automatedChecksSummary: string[];
  selfRubricChecks: Record<string, boolean>;
  combinedScorePercent: number | null;
}

// ==========================================
// PHASE 4: TIMED LIVE-CODING PRACTICE
// ==========================================

export type TimedLanguage = 'sql' | 'python';
export type TimedDifficulty = 'beginner' | 'intermediate' | 'interview';
export type TimedDurationMinutes = 15 | 30 | 45;

export interface TimedChallenge {
  id: string;
  language: TimedLanguage;
  difficulty: TimedDifficulty;
  topic: string;
  title: string;
  businessPrompt: string;
  datasetId: string;
  requiredColumns: string[];
  constraintsAndEdgeCases: string[];
  hint: string;
  expectedRowCount?: number;
  expectedValuesToContain?: (string | number)[];
  requiredCodePatterns?: string[][];
  referenceSolution: string;
  explanation: string;
}

export interface TimedAttemptRecord {
  id: string;
  challengeId: string;
  language: TimedLanguage;
  difficulty: TimedDifficulty;
  durationAllocatedSec: number;
  durationUsedSec: number;
  codeSubmitted: string;
  autoSubmitted: boolean;
  hintsUsed: number;
  attemptNumber: number;
  scorePercent: number;
  scoreBreakdown: {
    outputScore: number;
    qualityScore: number;
    edgeCaseScore: number;
    timeScore: number;
    hintPenalty: number;
  };
  feedback: string[];
  submittedAt: string;
}

// ==========================================
// PHASE 5: PORTFOLIO ARTIFACT WORKFLOW
// ==========================================

export type PortfolioTemplateId =
  | 'retail-margin'
  | 'operations-sla'
  | 'banking-risk'
  | 'hr-attrition'
  | 'custom';

export type PortfolioRubricKey =
  | 'businessFraming'
  | 'dataQualityGrain'
  | 'technicalAnalysis'
  | 'metricAccuracy'
  | 'visualStorytelling'
  | 'recommendationQuality'
  | 'reproducibility'
  | 'communication';

export interface PortfolioProject {
  id: string;
  templateId: PortfolioTemplateId;
  createdAt: string;
  updatedAt: string;
  title: string;
  businessProblem: string;
  stakeholderPersona: string;
  datasetDescription: string;
  dataDictionary: string;
  datasetGrain: string;
  cleaningDecisions: string;
  analysisQuestions: string;
  workNotes: string;
  kpiDefinitions: string;
  dashboardPlan: string;
  findings: string;
  quantifiedRecommendations: string;
  limitationsAndAssumptions: string;
  nextSteps: string;
  skillsDemonstrated: string;
  shortSummary: string;
  longCaseStudy: string;
  readmeDraft: string;
  rubricSelfReview: Record<PortfolioRubricKey, boolean>;
  learnerVerifiedOriginalWork?: boolean;
}

// ==========================================
// PHASE 6: BEHAVIORAL INTERVIEW STUDIO
// ==========================================

export type BehavioralPracticeMode = 'untimed' | 'timed_2min';

export interface BehavioralQuestion {
  id: string;
  category: string;
  prompt: string;
  whyInterviewersAsk: string;
  strongExample: string;
  weakExample: string;
  redFlags: string[];
  improvementTips: string[];
  isProjectSpecific?: boolean;
}

export interface BehavioralAnswerRecord {
  id: string;
  questionId: string;
  mode: BehavioralPracticeMode;
  durationSec: number;
  situation: string;
  task: string;
  actions: string;
  result: string;
  reflection: string;
  rubricChecks: Record<string, boolean>;
  savedAt: string;
}

// ==========================================
// PHASE 7: CAREER READINESS & TRACKER
// ==========================================

export interface ResumeWorksheet {
  targetRole: string;
  professionalSummary: string;
  skills: string;
  toolsAndTechnologies: string;
  portfolioProjects: string;
  certificationsOrMentorship: string;
  priorExperienceAndBullets: string;
  education: string;
  links: string;
}

export interface JobGapAnalysisEntry {
  id: string;
  roleTitle: string;
  rawDescription: string;
  requiredTools: string[];
  technicalSkills: string[];
  domainSkills: string[];
  experienceExpectations: string;
  communicationExpectations: string;
  createdAt: string;
}

export type JobApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'Recruiter Screen'
  | 'Technical / SQL'
  | 'Case / Final'
  | 'Offer'
  | 'Archived';

export interface JobApplicationEntry {
  id: string;
  company: string;
  role: string;
  jobUrl: string;
  dateApplied: string;
  status: JobApplicationStatus;
  followUpDate: string;
  skillsEmphasized: string;
  interviewStage: string;
  notes: string;
}

// ==========================================
// QUIZZES, SETTINGS & LOCAL STATE
// ==========================================

export interface QuizQuestion {
  id: string;
  topicTag: string;
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LmsQuiz {
  id: string;
  moduleId?: string;
  title: string;
  subtitle: string;
  passingPercent: number;
  isCapstone?: boolean;
  questions: QuizQuestion[];
}

export interface QuizAttemptRecord {
  attempts: number;
  bestScorePercent: number;
  lastScorePercent: number;
  passed: boolean;
  lastAnswers: Record<string, number>;
  lastSubmittedAt: string;
}

export type CardDensity = 'comfortable' | 'compact';

export interface PersonalSettings {
  learnerName: string;
  targetRole: string;
  weeklyHoursGoal: number | null;
  cardDensity: CardDensity;
  showModulePreview: boolean;
}

export interface LmsLocalState {
  schemaVersion: number;
  completedLessonIds: string[];
  lessonNotes: Record<string, string>;
  exerciseAnswers: Record<string, string>;
  exerciseCheckStatus: Record<string, PracticeCheckStatus>;
  exerciseFeedback: Record<string, string>;
  labNotes: Record<string, string>;
  quizResults: Record<string, QuizAttemptRecord>;
  openEndedSubmissions: Record<string, OpenEndedSubmissionRecord>;
  timedAttempts: TimedAttemptRecord[];
  portfolioProjects: PortfolioProject[];
  behavioralAnswers: BehavioralAnswerRecord[];
  resumeWorksheet: ResumeWorksheet;
  careerChecklist: Record<string, boolean>;
  jdGapAnalyses: JobGapAnalysisEntry[];
  jobApplications: JobApplicationEntry[];
  settings: PersonalSettings;
}
