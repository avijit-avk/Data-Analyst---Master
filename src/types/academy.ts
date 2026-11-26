export type ModuleIconKey =
  | 'business'
  | 'excel'
  | 'sql'
  | 'powerbi'
  | 'projects'
  | 'interview';

export type NavSection =
  | 'dashboard'
  | 'modules'
  | 'module'
  | 'lesson'
  | 'lab'
  | 'quiz'
  | 'progress';

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

export interface LmsLesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  summary: string;
  durationMinutes: number;
  coreConcepts: LessonConceptBlock[];
  syntaxReference: LessonSyntaxItem[];
  workedExample: {
    scenario: string;
    steps: LessonWorkedStep[];
    outcome: string;
  };
  commonPitfalls: LessonPitfall[];
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

export type LabExerciseKind = 'formula' | 'sql' | 'metric';

export interface LabExercise {
  id: string;
  labId: string;
  order: number;
  kind: LabExerciseKind;
  title: string;
  prompt: string;
  hint: string;
  starterSql?: string;
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
  defaultSqlQuery: string;
  exercises: LabExercise[];
}

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
  completedLessonIds: string[];
  lessonNotes: Record<string, string>;
  exerciseAnswers: Record<string, string>;
  exerciseCheckStatus: Record<string, PracticeCheckStatus>;
  exerciseFeedback: Record<string, string>;
  labNotes: Record<string, string>;
  quizResults: Record<string, QuizAttemptRecord>;
  settings: PersonalSettings;
}
