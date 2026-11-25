export type NavSection =
  | 'dashboard'
  | 'courses'
  | 'practice-lab'
  | 'interview-prep'
  | 'progress';

export type CourseCategory =
  | 'Core Tools'
  | 'Quantitative & BI'
  | 'Applied & Career';

export type CourseStatus = 'not_started' | 'in_progress' | 'completed';

export type CourseIconKey =
  | 'excel'
  | 'sql'
  | 'python'
  | 'statistics'
  | 'powerbi'
  | 'business'
  | 'projects'
  | 'interview';

export type CuratedResourceFormat =
  | 'Official Docs / Guide'
  | 'Video Tutorial'
  | 'Interactive / Practice';

export type PersonalLinkFormat =
  | 'Video'
  | 'NotebookLM'
  | 'Article'
  | 'Practice';

export interface CuratedResource {
  title: string;
  source: string;
  format: CuratedResourceFormat;
  url: string;
}

export interface CourseModule {
  id: string;
  title: string;
  summary: string;
  resources: CuratedResource[];
}

export interface Course {
  id: string;
  indexLabel: string;
  title: string;
  category: CourseCategory;
  iconKey: CourseIconKey;
  shortDescription: string;
  outlineTopics: string[];
  estimatedHours: number;
  overviewResources: CuratedResource[];
  modules: CourseModule[];
}

export interface PersonalStudyLink {
  id: string;
  label: string;
  url: string;
  format: PersonalLinkFormat;
  moduleIds: string[];
  startSeconds?: number | null;
  addedAt: string;
}

export interface CourseProgressEntry {
  status: CourseStatus;
  completedModuleIds: string[];
  notes: string;
  bookmarked: boolean;
  personalLinks: PersonalStudyLink[];
  updatedAt: string | null;
}

export interface PersonalSettings {
  learnerName: string;
  targetRole: string;
  weeklyHoursGoal: number | null;
  cardDensity: 'comfortable' | 'compact';
  showModulePreview: boolean;
  focusCourseId: string | null;
}

export type PracticePromptKind = 'Scenario' | 'Edge Case' | 'Formula / Query';

export type SampleColumnType =
  | 'TEXT'
  | 'INTEGER'
  | 'DECIMAL'
  | 'DATE'
  | 'BOOLEAN';

export interface SampleDatasetColumn {
  name: string;
  type: SampleColumnType;
  description: string;
}

export interface SampleDatasetFile {
  id: string;
  filename: string;
  roleLabel: string;
  description: string;
  columns: SampleDatasetColumn[];
  rows: Record<string, string | number | null>[];
}

export type PracticeCheckStatus = 'verified' | 'needs_review';

export interface PracticeNumericTarget {
  value: number;
  tolerance?: number;
  /** If true, also accept decimal/percent ratio equivalents (e.g. 41.7 and 0.417) */
  allowPercentRatio?: boolean;
}

export interface PracticeAnswerValidationRule {
  expectedNumbers?: PracticeNumericTarget[];
  /** Each inner array represents acceptable aliases for one required keyword/token */
  requiredKeywordGroups?: string[][];
  /** Optional normalized short-answer exact strings */
  acceptedExactValues?: string[];
  nudge: string;
  inputPlaceholder: string;
  inputMode?: 'line' | 'multiline';
}

export interface PracticeAnswerSubmission {
  answerText: string;
  status: PracticeCheckStatus | null;
  feedback: string | null;
  checkedAt: string | null;
}

export interface PracticePrompt {
  id: string;
  kind: PracticePromptKind;
  title: string;
  prompt: string;
  expectedCheck: string;
  referenceAnswer: string;
  validation: PracticeAnswerValidationRule;
}

export interface PracticeTopic {
  moduleId: string;
  indexLabel: string;
  title: string;
  summary: string;
  prompts: PracticePrompt[];
}

export interface PracticeLabPreview {
  id: string;
  courseId: string;
  title: string;
  tool: string;
  scopeSummary: string;
  drillTopics: string[];
  sampleFiles: SampleDatasetFile[];
  topics: PracticeTopic[];
}

export interface LearningStage {
  id: string;
  stageNumber: string;
  title: string;
  subtitle: string;
  outcome: string;
  courseIds: string[];
}

export interface InterviewPrepTopic {
  id: string;
  area: string;
  title: string;
  description: string;
  practiceLabId?: string;
  practiceModuleId?: string;
  courseId?: string;
  courseModuleId?: string;
}

export interface InterviewRoundGuide {
  id: string;
  roundLabel: string;
  title: string;
  summary: string;
  focusSkills: string[];
  practiceLabId?: string;
  courseId: string;
  courseModuleId?: string;
  freeResourceTitle: string;
  freeResourceSource: string;
  freeResourceUrl: string;
}

export interface AcademyLocalState {
  version: number;
  settings: PersonalSettings;
  courseProgress: Record<string, CourseProgressEntry>;
  practicedLabIds: string[];
  practicedPromptIds: string[];
  practiceTopicNotes: Record<string, string>;
  practicePromptAnswers: Record<string, PracticeAnswerSubmission>;
  completedInterviewItemIds: string[];
  practiceScratchpad: string;
}
