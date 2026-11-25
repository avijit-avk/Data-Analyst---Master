import { COURSES } from '../data/curriculum';
import { Course, CourseModule } from '../types/academy';

export interface AutoMatchResult {
  course: Course;
  modules: CourseModule[];
  isFullCourse: boolean;
  confidence: 'matched' | 'fallback';
  matchedTerms: string[];
}

const COURSE_KEYWORDS: Record<string, string[]> = {
  excel: [
    'excel',
    'spreadsheet',
    'spreadsheets',
    'xlsx',
    'workbook',
    'worksheet',
    'xlookup',
    'vlookup',
    'hlookup',
    'index match',
    'pivottable',
    'pivot table',
    'pivot tables',
    'power query',
    'powerquery',
    'excel-easy',
    'excelisfun',
    'gcfglobal',
    'dynamic array',
    'slicer',
    'macro',
  ],
  sql: [
    'sql',
    'postgres',
    'postgresql',
    'mysql',
    'sqlite',
    'bigquery',
    'snowflake',
    'tsql',
    'select',
    'group by',
    'having',
    'join',
    'joins',
    'left join',
    'inner join',
    'cte',
    'ctes',
    'common table expression',
    'subquery',
    'subqueries',
    'window function',
    'window functions',
    'row_number',
    'dense_rank',
    'sqlbolt',
    'pgexercises',
    'sqlzoo',
    'cs50.harvard.edu/sql',
    'mode.com/sql-tutorial',
  ],
  python: [
    'python',
    'pandas',
    'numpy',
    'matplotlib',
    'seaborn',
    'dataframe',
    'dataframes',
    'jupyter',
    'colab',
    'anaconda',
    'conda',
    'pip',
    'groupby',
    'fillna',
    'dropna',
    'vectorized',
    'broadcasting',
    'python.org',
    'cs50.harvard.edu/python',
    'coreyms',
    'keithgalli',
  ],
  statistics: [
    'stat',
    'stats',
    'statistics',
    'statistical',
    'probability',
    'distribution',
    'distributions',
    'mean',
    'median',
    'variance',
    'standard deviation',
    'iqr',
    'quantile',
    'bayes',
    'central limit',
    'sampling',
    'confidence interval',
    'confidence intervals',
    'hypothesis',
    'p-value',
    'pvalue',
    'p value',
    'ab test',
    'a/b test',
    'a/b testing',
    'regression',
    'correlation',
    'r-squared',
    'statquest',
    'seeing-theory',
    'openstax',
    'evanmiller',
    '3blue1brown',
  ],
  'power-bi': [
    'power bi',
    'powerbi',
    'pbi',
    'dax',
    'star schema',
    'fact table',
    'dimension table',
    'filter context',
    'calculate',
    'time intelligence',
    'drillthrough',
    'drill-through',
    'bookmark',
    'bookmarks',
    'query folding',
    'sqlbi',
    'dax.guide',
    'guyinacube',
    'pbix',
  ],
  'business-analytics': [
    'business analytics',
    'kpi',
    'kpis',
    'north star',
    'funnel',
    'funnels',
    'conversion',
    'drop-off',
    'unit economics',
    'cac',
    'ltv',
    'churn',
    'payback',
    'gross margin',
    'saas metrics',
    'root cause',
    'root-cause',
    'seasonality',
    'storytelling',
    'executive memo',
    'stakeholder',
    'amplitude',
    'posthog',
    'datawrapper',
    'mixpanel',
    'aarrr',
    'visual vocabulary',
  ],
  'real-world-projects': [
    'project',
    'projects',
    'portfolio',
    'case study',
    'case studies',
    'capstone',
    'dataset',
    'datasets',
    'kaggle',
    'data.gov',
    'uci',
    'github',
    'readme',
    'e-commerce',
    'ecommerce',
    'retail',
    'rfm',
    'supply chain',
    'lead time',
    'lead-time',
    'telco',
    'alextheanalyst',
  ],
  'interview-preparation': [
    'interview',
    'interviews',
    'interview prep',
    'live coding',
    'live-coding',
    'take-home',
    'take home',
    'datalemur',
    'stratascratch',
    'leetcode',
    'hackerrank',
    'behavioral',
    'star method',
    'pitch',
    'walkthrough',
    'mock interview',
    'case round',
  ],
};

const MODULE_KEYWORDS: Record<string, string[]> = {
  // Excel
  'excel-m1': ['hygiene', 'cell reference', 'referencing', 'absolute', 'relative', 'named range', 'validation', 'basics', 'beginners'],
  'excel-m2': ['logical', 'text', 'date', 'ifs', 'trim', 'clean', 'if function', 'formulas'],
  'excel-m3': ['xlookup', 'vlookup', 'index', 'match', 'dynamic array', 'filter', 'unique', 'sortby', 'spilled', 'lookup'],
  'excel-m4': ['pivot', 'pivottable', 'pivottables', 'calculated field', 'slicer', 'slicers', 'rollup'],
  'excel-m5': ['power query', 'powerquery', 'etl', 'unpivot', 'csv import', 'refresh'],

  // SQL
  'sql-m1': ['select', 'where', 'filter', 'sorting', 'order by', 'null', 'like', 'basics', 'beginners'],
  'sql-m2': ['aggregate', 'aggregates', 'aggregation', 'group by', 'having', 'count', 'sum', 'case when'],
  'sql-m3': ['join', 'joins', 'inner join', 'left join', 'full outer', 'self-join', 'union', 'fan-out'],
  'sql-m4': ['subquery', 'subqueries', 'cte', 'ctes', 'with clause', 'common table'],
  'sql-m5': ['window', 'window function', 'window functions', 'row_number', 'rank', 'dense_rank', 'lag', 'lead', 'partition', 'rolling', 'cohort'],

  // Python
  'py-m1': ['foundation', 'foundations', 'comprehension', 'list', 'dict', 'function', 'environment', 'intro to python', 'python basics', 'data analysis with python', 'beginners'],
  'py-m2': ['numpy', 'array', 'arrays', 'vectorized', 'broadcasting', 'boolean indexing'],
  'py-m3': ['pandas', 'dataframe', 'dataframes', 'indexing', 'merging', 'merge', 'groupby', 'grouping', 'reshape', '10 minutes'],
  'py-m4': ['missing', 'messy', 'clean', 'cleaning', 'datetime', 'outlier', 'deduplication', 'fillna', 'dropna'],
  'py-m5': ['visualization', 'data visualization', 'visualizing', 'plot', 'plotting', 'chart', 'matplotlib', 'seaborn', 'exploratory'],

  // Statistics
  'stat-m1': ['descriptive', 'mean', 'median', 'quantile', 'quantiles', 'iqr', 'variance', 'standard deviation', 'skewed'],
  'stat-m2': ['probability', 'sampling', 'bayes', 'conditional', 'central limit', 'distribution', 'distributions'],
  'stat-m3': ['confidence interval', 'confidence intervals', 'estimation', 'standard error', 'margin of error', 'frequentist'],
  'stat-m4': ['hypothesis', 'a/b', 'ab test', 'p-value', 'pvalue', 'power', 'sample size', 'experiment'],
  'stat-m5': ['correlation', 'regression', 'linear regression', 'r-squared', 'residual', 'residuals', 'causation'],

  // Power BI
  'pbi-m1': ['power query', 'shaping', 'connection', 'connections', 'query folding', 'staging'],
  'pbi-m2': ['star schema', 'star-schema', 'dimensional', 'fact', 'dimension', 'cardinality', 'relationship', 'relationships'],
  'pbi-m3': ['dax', 'filter context', 'calculate', 'measure', 'measures', 'calculated column'],
  'pbi-m4': ['time intelligence', 'date table', 'yoy', 'mtd', 'ytd', 'moving window'],
  'pbi-m5': ['visual', 'hierarchy', 'drillthrough', 'drill-through', 'bookmark', 'bookmarks', 'tooltip', 'report design', 'dashboard'],

  // Business Analytics
  'ba-m1': ['north star', 'driver', 'kpi', 'kpis', 'metrics', 'revenue', 'aarrr'],
  'ba-m2': ['funnel', 'funnels', 'conversion', 'drop-off', 'activation', 'journey'],
  'ba-m3': ['unit economics', 'cac', 'ltv', 'payback', 'margin', 'churn', 'saas'],
  'ba-m4': ['root-cause', 'root cause', 'diagnostic', 'seasonality', 'mix shift', 'cohort', 'retention'],
  'ba-m5': ['memo', 'storytelling', 'executive', 'headline', 'stakeholder', 'chart selection', 'visual vocabulary'],

  // Real-World Projects
  'proj-m1': ['scoping', 'question framing', 'dataset search', 'hypothesis', 'uci'],
  'proj-m2': ['retail', 'e-commerce', 'ecommerce', 'rfm', 'revenue', 'order'],
  'proj-m3': ['subscription', 'churn', 'telco', 'eda', 'notebook'],
  'proj-m4': ['supply chain', 'lead-time', 'lead time', 'warehouse', 'logistics', 'data.gov'],
  'proj-m5': ['repository', 'readme', 'write-up', 'github pages', 'portfolio'],

  // Interview Preparation
  'int-m1': ['sql', 'live-coding', 'live coding', 'top-n', 'datalemur', 'leetcode', 'window'],
  'int-m2': ['python', 'pandas', 'manipulation', 'hackerrank', 'stratascratch', 'coding'],
  'int-m3': ['metric', 'a/b', 'experiment', 'case round', 'kpi drop', 'sample size'],
  'int-m4': ['portfolio', 'deep-dive', 'narrative', 'pitch', 'present', 'profile readme'],
  'int-m5': ['behavioral', 'star', 'cross-functional', 'stakeholder', 'conflict'],
};

const FULL_COURSE_PHRASES = [
  'full course',
  'complete course',
  'crash course',
  'bootcamp',
  'full tutorial',
  'from scratch',
  'zero to hero',
  'all in one',
  'masterclass',
];

const STOP_WORDS = new Set([
  'http',
  'https',
  'www',
  'com',
  'org',
  'edu',
  'io',
  'net',
  'html',
  'index',
  'watch',
  'video',
  'docs',
  'guide',
  'tutorial',
  'learn',
  'course',
  'free',
  'and',
  'for',
  'the',
  'with',
  'from',
  'into',
  'your',
  'using',
  'data',
  'analytics',
  'analysis',
]);

function normalizeText(text: string): string {
  let decoded = text;
  try {
    decoded = decodeURIComponent(text);
  } catch {
    decoded = text;
  }
  return decoded
    .toLowerCase()
    .replace(/[^a-z0-9/+.#-]+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s/+._-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

function scoreModuleSpecific(
  mod: CourseModule,
  normalizedCombined: string,
  inputTokens: Set<string>
): { score: number; matched: string[] } {
  let score = 0;
  const matched: string[] = [];

  const modKeywords = MODULE_KEYWORDS[mod.id] ?? [];
  for (const kw of modKeywords) {
    if (kw.includes(' ')) {
      if (normalizedCombined.includes(kw)) {
        score += 8;
        if (!matched.includes(kw)) matched.push(kw);
      }
    } else if (inputTokens.has(kw)) {
      score += 6;
      if (!matched.includes(kw)) matched.push(kw);
    } else if (kw.length >= 4 && normalizedCombined.includes(kw)) {
      score += 3;
      if (!matched.includes(kw)) matched.push(kw);
    }
  }

  for (const tok of tokenize(mod.title)) {
    if (inputTokens.has(tok)) {
      score += 5;
      if (!matched.includes(tok)) matched.push(tok);
    }
  }

  for (const tok of tokenize(mod.summary)) {
    if (inputTokens.has(tok)) {
      score += 2;
      if (!matched.includes(tok)) matched.push(tok);
    }
  }

  return { score, matched };
}

export function autoAssignStudyResource(
  title: string,
  url: string,
  fallbackCourseId: string
): AutoMatchResult {
  const fallbackCourse =
    COURSES.find((c) => c.id === fallbackCourseId) ?? COURSES[0];
  const fallbackModule = fallbackCourse.modules[0];

  const combinedRaw = `${title} ${url}`;
  const normalizedCombined = normalizeText(combinedRaw);
  const inputTokens = new Set(tokenize(combinedRaw));

  if (inputTokens.size === 0 && !normalizedCombined) {
    return {
      course: fallbackCourse,
      modules: [fallbackModule],
      isFullCourse: false,
      confidence: 'fallback',
      matchedTerms: [],
    };
  }

  // Step 1: Score all 8 courses (course-level + cumulative module-level signals)
  let bestCourse = fallbackCourse;
  let bestCourseTotalScore = 0;
  let bestCourseTerms: string[] = [];
  let bestModuleResults: { mod: CourseModule; score: number; matched: string[] }[] = [];

  for (const course of COURSES) {
    let courseScore = 0;
    const courseMatched: string[] = [];

    const courseKeywords = COURSE_KEYWORDS[course.id] ?? [];
    for (const kw of courseKeywords) {
      if (kw.includes(' ')) {
        if (normalizedCombined.includes(kw)) {
          courseScore += 6;
          courseMatched.push(kw);
        }
      } else if (inputTokens.has(kw) || normalizedCombined.includes(kw)) {
        const exact = inputTokens.has(kw);
        courseScore += exact ? 5 : 2;
        courseMatched.push(kw);
      }
    }

    for (const topic of [course.title, ...course.outlineTopics]) {
      for (const tok of tokenize(topic)) {
        if (inputTokens.has(tok)) {
          courseScore += 3;
          if (!courseMatched.includes(tok)) courseMatched.push(tok);
        }
      }
    }

    const moduleResults = course.modules.map((mod) => {
      const res = scoreModuleSpecific(mod, normalizedCombined, inputTokens);
      return { mod, ...res };
    });

    const totalModuleScore = moduleResults.reduce((sum, r) => sum + r.score, 0);
    let totalCourseScore = courseScore + totalModuleScore;

    // Slight tie-breaker for currently open course
    if (course.id === fallbackCourse.id && totalCourseScore > 0) {
      totalCourseScore += 0.5;
    }

    if (totalCourseScore > bestCourseTotalScore) {
      bestCourseTotalScore = totalCourseScore;
      bestCourse = course;
      bestCourseTerms = courseMatched;
      bestModuleResults = moduleResults;
    }
  }

  if (bestCourseTotalScore <= 0) {
    return {
      course: fallbackCourse,
      modules: [fallbackModule],
      isFullCourse: false,
      confidence: 'fallback',
      matchedTerms: [],
    };
  }

  // Step 2: Select all relevant modules within the winning course
  const matchedSpecificModules = bestModuleResults.filter((r) => r.score >= 3);
  const hasFullCoursePhrase = FULL_COURSE_PHRASES.some((phrase) =>
    normalizedCombined.includes(phrase)
  );

  let selectedModules: CourseModule[];
  let isFullCourse = false;

  if (matchedSpecificModules.length > 0) {
    selectedModules = matchedSpecificModules.map((r) => r.mod);
    if (
      matchedSpecificModules.length === bestCourse.modules.length ||
      (hasFullCoursePhrase && matchedSpecificModules.length >= 3)
    ) {
      selectedModules = [...bestCourse.modules];
      isFullCourse = true;
    }
  } else if (hasFullCoursePhrase) {
    // Full course phrase without specific module keywords -> all modules
    selectedModules = [...bestCourse.modules];
    isFullCourse = true;
  } else {
    // Course keyword matched without specific module keywords -> pick highest scoring module or module 01
    const topMod = [...bestModuleResults].sort((a, b) => b.score - a.score)[0];
    selectedModules = [topMod ? topMod.mod : bestCourse.modules[0]];
  }

  const allTerms = Array.from(
    new Set([
      ...bestCourseTerms,
      ...matchedSpecificModules.flatMap((r) => r.matched),
    ])
  ).slice(0, 5);

  return {
    course: bestCourse,
    modules: selectedModules,
    isFullCourse,
    confidence: 'matched',
    matchedTerms: allTerms,
  };
}
