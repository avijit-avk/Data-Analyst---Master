import {
  Course,
  InterviewPrepTopic,
  NavSection,
  PracticeLabPreview,
} from '../types/academy';
import { PRACTICE_TOPICS_BY_COURSE } from './practiceDrills';
import { SAMPLE_FILES_BY_COURSE } from './sampleDatasets';

export const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'courses', label: 'Courses' },
  { id: 'practice-lab', label: 'Practice Lab' },
  { id: 'interview-prep', label: 'Interview Preparation' },
  { id: 'progress', label: 'Progress' },
];

export const COURSES: Course[] = [
  {
    id: 'excel',
    indexLabel: '01',
    title: 'Excel',
    category: 'Core Tools',
    iconKey: 'excel',
    shortDescription:
      'Structured spreadsheet modeling, lookup formulas, PivotTables, and Power Query cleaning.',
    outlineTopics: ['Lookup & Dynamic Arrays', 'PivotTables', 'Power Query'],
    estimatedHours: 14,
    overviewResources: [
      {
        title: 'Microsoft Excel Help & Learning',
        source: 'Microsoft Support',
        format: 'Official Docs / Guide',
        url: 'https://support.microsoft.com/en-us/excel',
      },
      {
        title: 'Microsoft Excel Video Training Library',
        source: 'Microsoft Support',
        format: 'Video Tutorial',
        url: 'https://support.microsoft.com/en-us/office/excel-video-training-9bc05390-e94c-46af-a5b3-d7c22f6990bb',
      },
      {
        title: 'GCFGlobal Interactive Excel Lessons',
        source: 'GCFGlobal',
        format: 'Interactive / Practice',
        url: 'https://edu.gcfglobal.org/en/excel/',
      },
    ],
    modules: [
      {
        id: 'excel-m1',
        title: 'Data Hygiene & Cell Referencing',
        summary: 'Absolute vs. relative references, named ranges, and data validation rules.',
        resources: [
          {
            title: 'Relative, Absolute & Mixed References',
            source: 'Microsoft Support',
            format: 'Official Docs / Guide',
            url: 'https://support.microsoft.com/en-us/office/switch-between-relative-absolute-and-mixed-references-dfec08cd-ae65-4f56-839e-5f0d8d0baca9',
          },
          {
            title: 'Relative & Absolute Cell References Video',
            source: 'GCFGlobal',
            format: 'Video Tutorial',
            url: 'https://edu.gcfglobal.org/en/excel/relative-and-absolute-cell-references/1/',
          },
          {
            title: 'Data Validation Walkthrough & Exercises',
            source: 'Excel Easy',
            format: 'Interactive / Practice',
            url: 'https://www.excel-easy.com/basics/data-validation.html',
          },
        ],
      },
      {
        id: 'excel-m2',
        title: 'Logical, Text & Date Functions',
        summary: 'Nested conditionals, IFS, TRIM/CLEAN, and calendar aggregation formulas.',
        resources: [
          {
            title: 'Excel Functions by Category Reference',
            source: 'Microsoft Support',
            format: 'Official Docs / Guide',
            url: 'https://support.microsoft.com/en-us/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb',
          },
          {
            title: 'Excel Formulas & Functions Video Courses',
            source: 'freeCodeCamp',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@freecodecamp/search?query=excel%20formulas',
          },
          {
            title: 'Logical, Text & Date Function Examples',
            source: 'Excel Easy',
            format: 'Interactive / Practice',
            url: 'https://www.excel-easy.com/functions.html',
          },
        ],
      },
      {
        id: 'excel-m3',
        title: 'XLOOKUP, INDEX-MATCH & Dynamic Arrays',
        summary: 'Multi-criteria table joins, FILTER, UNIQUE, and SORTBY workflows.',
        resources: [
          {
            title: 'XLOOKUP Function Official Reference',
            source: 'Microsoft Support',
            format: 'Official Docs / Guide',
            url: 'https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
          },
          {
            title: 'ExcelIsFun Lookup & Dynamic Array Playlists',
            source: 'ExcelIsFun (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@excelisfun/search?query=XLOOKUP',
          },
          {
            title: 'Dynamic Array Formulas & Spilled Behavior',
            source: 'Microsoft Support',
            format: 'Official Docs / Guide',
            url: 'https://support.microsoft.com/en-us/office/dynamic-array-formulas-and-spilled-array-behavior-205c6b06-03ba-4151-89a1-87a7eb36e531',
          },
          {
            title: 'INDEX & MATCH Practice Examples',
            source: 'Excel Easy',
            format: 'Interactive / Practice',
            url: 'https://www.excel-easy.com/examples/index-match.html',
          },
        ],
      },
      {
        id: 'excel-m4',
        title: 'PivotTables & Calculated Fields',
        summary: 'Multi-dimensional summarization, slicers, grouping, and KPI rollups.',
        resources: [
          {
            title: 'Create a PivotTable to Analyze Data',
            source: 'Microsoft Support',
            format: 'Official Docs / Guide',
            url: 'https://support.microsoft.com/en-us/office/create-a-pivottable-to-analyze-worksheet-data-a9a84538-bfe9-40a9-a8e9-f99134456576',
          },
          {
            title: 'PivotTables Video Training',
            source: 'Microsoft Support',
            format: 'Video Tutorial',
            url: 'https://support.microsoft.com/en-us/office/create-a-pivottable-and-analyze-your-data-7810597d-0837-41f7-9699-5911aa282760',
          },
          {
            title: 'PivotTables Step-by-Step Guide',
            source: 'Excel Easy',
            format: 'Interactive / Practice',
            url: 'https://www.excel-easy.com/data-analysis/pivot-tables.html',
          },
        ],
      },
      {
        id: 'excel-m5',
        title: 'Power Query ETL Foundations',
        summary: 'Repeatable CSV imports, unpivoting columns, and automated refresh steps.',
        resources: [
          {
            title: 'What Is Power Query?',
            source: 'Microsoft Learn',
            format: 'Official Docs / Guide',
            url: 'https://learn.microsoft.com/en-us/power-query/power-query-what-is-power-query',
          },
          {
            title: 'Power Query Tutorials & Walkthroughs',
            source: 'ExcelIsFun (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@excelisfun/search?query=Power%20Query',
          },
          {
            title: 'Unpivot Columns Guided Exercise',
            source: 'Microsoft Learn',
            format: 'Interactive / Practice',
            url: 'https://learn.microsoft.com/en-us/power-query/unpivot-column',
          },
        ],
      },
    ],
  },
  {
    id: 'sql',
    indexLabel: '02',
    title: 'SQL',
    category: 'Core Tools',
    iconKey: 'sql',
    shortDescription:
      'Relational querying from foundational joins and aggregations to CTEs and window functions.',
    outlineTopics: ['Joins & Grouping', 'CTEs', 'Window Functions'],
    estimatedHours: 18,
    overviewResources: [
      {
        title: 'PostgreSQL Official Tutorial',
        source: 'PostgreSQL Docs',
        format: 'Official Docs / Guide',
        url: 'https://www.postgresql.org/docs/current/tutorial.html',
      },
      {
        title: "CS50's Introduction to Databases with SQL",
        source: 'Harvard CS50',
        format: 'Video Tutorial',
        url: 'https://cs50.harvard.edu/sql/',
      },
      {
        title: 'SQLBolt Interactive SQL Lessons',
        source: 'SQLBolt',
        format: 'Interactive / Practice',
        url: 'https://sqlbolt.com/',
      },
    ],
    modules: [
      {
        id: 'sql-m1',
        title: 'SELECT, Filtering & Sorting',
        summary: 'Predicate logic, NULL semantics, pattern matching, and query execution order.',
        resources: [
          {
            title: 'PostgreSQL Queries Overview',
            source: 'PostgreSQL Docs',
            format: 'Official Docs / Guide',
            url: 'https://www.postgresql.org/docs/current/queries.html',
          },
          {
            title: 'CS50 SQL Lecture 0: Querying',
            source: 'Harvard CS50',
            format: 'Video Tutorial',
            url: 'https://cs50.harvard.edu/sql/2024/weeks/0/',
          },
          {
            title: 'SELECT Queries Interactive Sandbox',
            source: 'SQLBolt',
            format: 'Interactive / Practice',
            url: 'https://sqlbolt.com/lesson/select_queries_introduction',
          },
        ],
      },
      {
        id: 'sql-m2',
        title: 'Aggregations & GROUP BY',
        summary: 'COUNT, SUM, CASE WHEN pivots, and HAVING vs. WHERE filtering.',
        resources: [
          {
            title: 'PostgreSQL Aggregate Functions',
            source: 'PostgreSQL Docs',
            format: 'Official Docs / Guide',
            url: 'https://www.postgresql.org/docs/current/functions-aggregate.html',
          },
          {
            title: 'SQL Aggregate Functions Guide',
            source: 'Mode',
            format: 'Official Docs / Guide',
            url: 'https://mode.com/sql-tutorial/sql-aggregate-functions/',
          },
          {
            title: 'Khan Academy SQL Aggregation Videos',
            source: 'Khan Academy',
            format: 'Video Tutorial',
            url: 'https://www.khanacademy.org/computing/computer-programming/sql/sql-basics/v/aggregating-data',
          },
          {
            title: 'PostgreSQL Aggregation Exercises',
            source: 'PGExercises',
            format: 'Interactive / Practice',
            url: 'https://pgexercises.com/questions/aggregates/',
          },
        ],
      },
      {
        id: 'sql-m3',
        title: 'Relational Joins & Set Operations',
        summary: 'INNER, LEFT, FULL OUTER joins, self-joins, and preventing row fan-out.',
        resources: [
          {
            title: 'Table Expressions & Joins Reference',
            source: 'PostgreSQL Docs',
            format: 'Official Docs / Guide',
            url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html',
          },
          {
            title: 'CS50 SQL Lecture 1: Relating & Joins',
            source: 'Harvard CS50',
            format: 'Video Tutorial',
            url: 'https://cs50.harvard.edu/sql/2024/weeks/1/',
          },
          {
            title: 'Multi-Table Queries with JOINs',
            source: 'SQLBolt',
            format: 'Interactive / Practice',
            url: 'https://sqlbolt.com/lesson/select_queries_with_joins',
          },
          {
            title: 'Joins and Subqueries Practice',
            source: 'PGExercises',
            format: 'Interactive / Practice',
            url: 'https://pgexercises.com/questions/joins/',
          },
        ],
      },
      {
        id: 'sql-m4',
        title: 'Subqueries & Common Table Expressions',
        summary: 'Modular multi-step queries using WITH clauses for readable analytics.',
        resources: [
          {
            title: 'WITH Queries (Common Table Expressions)',
            source: 'PostgreSQL Docs',
            format: 'Official Docs / Guide',
            url: 'https://www.postgresql.org/docs/current/queries-with.html',
          },
          {
            title: 'Writing Subqueries in SQL',
            source: 'Mode',
            format: 'Official Docs / Guide',
            url: 'https://mode.com/sql-tutorial/sql-sub-queries/',
          },
          {
            title: 'SQL CTE & Subqueries Video Tutorials',
            source: 'freeCodeCamp',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@freecodecamp/search?query=SQL%20CTE',
          },
          {
            title: 'SQLZOO Nested SELECT Practice',
            source: 'SQLZOO',
            format: 'Interactive / Practice',
            url: 'https://sqlzoo.net/wiki/SELECT_within_SELECT_Tutorial',
          },
        ],
      },
      {
        id: 'sql-m5',
        title: 'Window Functions & Cohort Retention',
        summary: 'ROW_NUMBER, RANK, LAG/LEAD, rolling averages, and partition frames.',
        resources: [
          {
            title: 'Window Functions Official Tutorial',
            source: 'PostgreSQL Docs',
            format: 'Official Docs / Guide',
            url: 'https://www.postgresql.org/docs/current/tutorial-window.html',
          },
          {
            title: 'SQL Window Functions Guide',
            source: 'Mode',
            format: 'Official Docs / Guide',
            url: 'https://mode.com/sql-tutorial/sql-window-functions/',
          },
          {
            title: 'Window Functions Explained on YouTube',
            source: 'Alex The Analyst',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@AlexTheAnalyst/search?query=window%20functions',
          },
          {
            title: 'Window Function Practice Problems',
            source: 'DataLemur',
            format: 'Interactive / Practice',
            url: 'https://datalemur.com/questions',
          },
        ],
      },
    ],
  },
  {
    id: 'python',
    indexLabel: '03',
    title: 'Python',
    category: 'Core Tools',
    iconKey: 'python',
    shortDescription:
      'Programmatic data manipulation, exploratory analysis, and clean plotting with pandas and NumPy.',
    outlineTopics: ['pandas DataFrames', 'Cleaning Pipelines', 'Matplotlib & Seaborn'],
    estimatedHours: 22,
    overviewResources: [
      {
        title: 'Official Python Tutorial',
        source: 'Python.org',
        format: 'Official Docs / Guide',
        url: 'https://docs.python.org/3/tutorial/',
      },
      {
        title: "CS50's Introduction to Programming with Python",
        source: 'Harvard CS50',
        format: 'Video Tutorial',
        url: 'https://cs50.harvard.edu/python/',
      },
      {
        title: 'Kaggle Learn: Pandas',
        source: 'Kaggle',
        format: 'Interactive / Practice',
        url: 'https://www.kaggle.com/learn/pandas',
      },
    ],
    modules: [
      {
        id: 'py-m1',
        title: 'Python Foundations for Analysts',
        summary: 'Data structures, list comprehensions, functions, and virtual environments.',
        resources: [
          {
            title: 'Python Data Structures Documentation',
            source: 'Python.org',
            format: 'Official Docs / Guide',
            url: 'https://docs.python.org/3/tutorial/datastructures.html',
          },
          {
            title: "Google's Python Class Videos & Notes",
            source: 'Google Developers',
            format: 'Video Tutorial',
            url: 'https://developers.google.com/edu/python',
          },
          {
            title: 'Kaggle Learn: Intro to Python',
            source: 'Kaggle',
            format: 'Interactive / Practice',
            url: 'https://www.kaggle.com/learn/python',
          },
        ],
      },
      {
        id: 'py-m2',
        title: 'NumPy Arrays & Vectorized Math',
        summary: 'Broadcasting, boolean indexing, and fast numerical summaries.',
        resources: [
          {
            title: 'NumPy: Absolute Basics for Beginners',
            source: 'NumPy Docs',
            format: 'Official Docs / Guide',
            url: 'https://numpy.org/doc/stable/user/absolute_beginners.html',
          },
          {
            title: 'freeCodeCamp NumPy Video Walkthroughs',
            source: 'freeCodeCamp',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@freecodecamp/search?query=NumPy',
          },
          {
            title: 'Data Analysis with Python Curriculum',
            source: 'freeCodeCamp',
            format: 'Interactive / Practice',
            url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/',
          },
        ],
      },
      {
        id: 'py-m3',
        title: 'pandas Indexing, Merging & Grouping',
        summary: 'DataFrame filtering, multi-table merges, groupby aggregations, and reshape.',
        resources: [
          {
            title: '10 Minutes to pandas',
            source: 'pandas Docs',
            format: 'Official Docs / Guide',
            url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
          },
          {
            title: 'Corey Schafer pandas Video Series',
            source: 'Corey Schafer (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@coreyms/search?query=pandas',
          },
          {
            title: 'Kaggle Pandas Grouping & Sorting Lab',
            source: 'Kaggle',
            format: 'Interactive / Practice',
            url: 'https://www.kaggle.com/learn/pandas',
          },
        ],
      },
      {
        id: 'py-m4',
        title: 'Handling Missing & Messy Data',
        summary: 'Datetime parsing, outlier inspection, type coercion, and deduplication.',
        resources: [
          {
            title: 'Working with Missing Data in pandas',
            source: 'pandas Docs',
            format: 'Official Docs / Guide',
            url: 'https://pandas.pydata.org/docs/user_guide/missing_data.html',
          },
          {
            title: 'Data Cleaning Video Tutorials in Python',
            source: 'Keith Galli (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@KeithGalli/search?query=pandas%20data%20cleaning',
          },
          {
            title: 'Kaggle Learn: Data Cleaning Exercises',
            source: 'Kaggle',
            format: 'Interactive / Practice',
            url: 'https://www.kaggle.com/learn/data-cleaning',
          },
        ],
      },
      {
        id: 'py-m5',
        title: 'Exploratory Visualization',
        summary: 'Distribution plots, trend comparisons, and readable multi-panel charts.',
        resources: [
          {
            title: 'Matplotlib Quick Start & Seaborn Guide',
            source: 'Matplotlib Docs',
            format: 'Official Docs / Guide',
            url: 'https://matplotlib.org/stable/users/explain/quick_start.html',
          },
          {
            title: 'Seaborn & Matplotlib Video Tutorials',
            source: 'freeCodeCamp',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@freecodecamp/search?query=matplotlib%20seaborn',
          },
          {
            title: 'Kaggle Learn: Data Visualization',
            source: 'Kaggle',
            format: 'Interactive / Practice',
            url: 'https://www.kaggle.com/learn/data-visualization',
          },
        ],
      },
    ],
  },
  {
    id: 'statistics',
    indexLabel: '04',
    title: 'Statistics',
    category: 'Quantitative & BI',
    iconKey: 'statistics',
    shortDescription:
      'Descriptive distributions, probability intuition, confidence intervals, and A/B hypothesis testing.',
    outlineTopics: ['Distributions', 'Hypothesis Testing', 'Regression'],
    estimatedHours: 16,
    overviewResources: [
      {
        title: 'Introductory Statistics 2e',
        source: 'OpenStax',
        format: 'Official Docs / Guide',
        url: 'https://openstax.org/details/books/introductory-statistics-2e',
      },
      {
        title: 'StatQuest Statistics Fundamentals',
        source: 'StatQuest (YouTube)',
        format: 'Video Tutorial',
        url: 'https://www.youtube.com/@statquest',
      },
      {
        title: 'Seeing Theory: Visual Probability & Statistics',
        source: 'Brown University',
        format: 'Interactive / Practice',
        url: 'https://seeing-theory.brown.edu/',
      },
    ],
    modules: [
      {
        id: 'stat-m1',
        title: 'Descriptive Metrics & Spread',
        summary: 'Mean vs. median, quantiles, IQR, variance, and skewed business data.',
        resources: [
          {
            title: 'Descriptive Statistics Chapter',
            source: 'OpenStax',
            format: 'Official Docs / Guide',
            url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-introduction',
          },
          {
            title: 'StatQuest: Mean, Variance & Standard Deviation',
            source: 'StatQuest (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@statquest/search?query=variance%20standard%20deviation',
          },
          {
            title: 'Basic Probability & Expectation Explorer',
            source: 'Seeing Theory',
            format: 'Interactive / Practice',
            url: 'https://seeing-theory.brown.edu/basic-probability/index.html',
          },
        ],
      },
      {
        id: 'stat-m2',
        title: 'Probability & Sampling Distributions',
        summary: 'Conditional probability, Bayes rule intuition, and the Central Limit Theorem.',
        resources: [
          {
            title: 'MIT 18.05 Probability & Statistics Notes',
            source: 'MIT OpenCourseWare',
            format: 'Official Docs / Guide',
            url: 'https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/',
          },
          {
            title: '3Blue1Brown Probability & Bayes Videos',
            source: '3Blue1Brown',
            format: 'Video Tutorial',
            url: 'https://www.3blue1brown.com/topics/probability',
          },
          {
            title: 'Probability Distributions Interactive Visuals',
            source: 'Seeing Theory',
            format: 'Interactive / Practice',
            url: 'https://seeing-theory.brown.edu/probability-distributions/index.html',
          },
        ],
      },
      {
        id: 'stat-m3',
        title: 'Confidence Intervals & Estimation',
        summary: 'Standard error, margin of error, and communicating uncertainty clearly.',
        resources: [
          {
            title: 'Confidence Intervals Textbook Chapter',
            source: 'OpenStax',
            format: 'Official Docs / Guide',
            url: 'https://openstax.org/books/introductory-statistics-2e/pages/8-introduction',
          },
          {
            title: 'StatQuest: Confidence Intervals Explained',
            source: 'StatQuest (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@statquest/search?query=confidence%20intervals',
          },
          {
            title: 'Frequentist Inference Visualizations',
            source: 'Seeing Theory',
            format: 'Interactive / Practice',
            url: 'https://seeing-theory.brown.edu/frequentist-inference/index.html',
          },
        ],
      },
      {
        id: 'stat-m4',
        title: 'Hypothesis Testing & A/B Experiments',
        summary: 'Null frameworks, p-values, statistical power, and sample size planning.',
        resources: [
          {
            title: 'Hypothesis Testing with One Sample',
            source: 'OpenStax',
            format: 'Official Docs / Guide',
            url: 'https://openstax.org/books/introductory-statistics-2e/pages/9-introduction',
          },
          {
            title: 'StatQuest: p-values & Hypothesis Testing',
            source: 'StatQuest (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@statquest/search?query=p-values',
          },
          {
            title: 'A/B Testing Calculators & Power Tools',
            source: 'Evan Miller',
            format: 'Interactive / Practice',
            url: 'https://www.evanmiller.org/ab-testing/',
          },
        ],
      },
      {
        id: 'stat-m5',
        title: 'Correlation & Linear Regression',
        summary: 'R-squared interpretation, residuals, and correlation vs. causation checks.',
        resources: [
          {
            title: 'Linear Regression and Correlation',
            source: 'OpenStax',
            format: 'Official Docs / Guide',
            url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-introduction',
          },
          {
            title: 'StatQuest: Linear Regression & R-Squared',
            source: 'StatQuest (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@statquest/search?query=linear%20regression',
          },
          {
            title: 'Interactive Regression Analysis Sandbox',
            source: 'Seeing Theory',
            format: 'Interactive / Practice',
            url: 'https://seeing-theory.brown.edu/regression-analysis/index.html',
          },
        ],
      },
    ],
  },
  {
    id: 'power-bi',
    indexLabel: '05',
    title: 'Power BI',
    category: 'Quantitative & BI',
    iconKey: 'powerbi',
    shortDescription:
      'Star-schema data modeling, DAX measures, and executive-ready interactive report design.',
    outlineTopics: ['Star Schema', 'DAX Measures', 'Report Layout'],
    estimatedHours: 16,
    overviewResources: [
      {
        title: 'Power BI Official Documentation',
        source: 'Microsoft Learn',
        format: 'Official Docs / Guide',
        url: 'https://learn.microsoft.com/en-us/power-bi/',
      },
      {
        title: 'Guy in a Cube Power BI Video Channel',
        source: 'Guy in a Cube (YouTube)',
        format: 'Video Tutorial',
        url: 'https://www.youtube.com/@GuyInACube',
      },
      {
        title: 'Microsoft Learn Power BI Guided Modules',
        source: 'Microsoft Learn',
        format: 'Interactive / Practice',
        url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',
      },
    ],
    modules: [
      {
        id: 'pbi-m1',
        title: 'Power Query Shaping & Connections',
        summary: 'Connecting flat files and databases, query folding basics, and clean staging.',
        resources: [
          {
            title: 'Data Sources in Power BI Desktop',
            source: 'Microsoft Learn',
            format: 'Official Docs / Guide',
            url: 'https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-data-sources',
          },
          {
            title: 'Query Folding Explained Videos',
            source: 'Guy in a Cube (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@GuyInACube/search?query=query%20folding',
          },
          {
            title: 'Clean, Transform & Load Data Module',
            source: 'Microsoft Learn',
            format: 'Interactive / Practice',
            url: 'https://learn.microsoft.com/en-us/training/modules/clean-transform-and-load-data-with-power-bi/',
          },
        ],
      },
      {
        id: 'pbi-m2',
        title: 'Dimensional Star-Schema Modeling',
        summary: 'Fact vs. dimension tables, cardinality, and avoiding bi-directional traps.',
        resources: [
          {
            title: 'Understand Star Schema and Importance',
            source: 'Microsoft Learn',
            format: 'Official Docs / Guide',
            url: 'https://learn.microsoft.com/en-us/power-bi/guidance/star-schema',
          },
          {
            title: 'Star Schema & Data Modeling Videos',
            source: 'Guy in a Cube (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@GuyInACube/search?query=star%20schema',
          },
          {
            title: 'Design a Data Model in Power BI Lab',
            source: 'Microsoft Learn',
            format: 'Interactive / Practice',
            url: 'https://learn.microsoft.com/en-us/training/modules/design-model-power-bi/',
          },
        ],
      },
      {
        id: 'pbi-m3',
        title: 'DAX Fundamentals & Filter Context',
        summary: 'Calculated columns vs. measures, CALCULATE, and row/filter propagation.',
        resources: [
          {
            title: 'Data Analysis Expressions (DAX) Overview',
            source: 'Microsoft Learn',
            format: 'Official Docs / Guide',
            url: 'https://learn.microsoft.com/en-us/dax/dax-overview',
          },
          {
            title: 'Introducing DAX Free Video Course',
            source: 'SQLBI',
            format: 'Video Tutorial',
            url: 'https://www.sqlbi.com/p/introducing-dax-video-course/',
          },
          {
            title: 'DAX Function & Syntax Reference',
            source: 'SQLBI DAX.guide',
            format: 'Interactive / Practice',
            url: 'https://dax.guide/',
          },
        ],
      },
      {
        id: 'pbi-m4',
        title: 'Time Intelligence Patterns',
        summary: 'Dedicated date tables, YoY variance, MTD/YTD totals, and moving windows.',
        resources: [
          {
            title: 'DAX Time Intelligence Functions',
            source: 'Microsoft Learn',
            format: 'Official Docs / Guide',
            url: 'https://learn.microsoft.com/en-us/dax/time-intelligence-functions-dax',
          },
          {
            title: 'Time Intelligence & Date Tables Videos',
            source: 'SQLBI (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@SQLBI/search?query=time%20intelligence',
          },
          {
            title: 'Create DAX Calculations Training Module',
            source: 'Microsoft Learn',
            format: 'Interactive / Practice',
            url: 'https://learn.microsoft.com/en-us/training/modules/dax-power-bi-add-measures/',
          },
        ],
      },
      {
        id: 'pbi-m5',
        title: 'Visual Hierarchy & Drill-Through UX',
        summary: 'KPI cards, clean chart selection, bookmarks, and tooltip pages.',
        resources: [
          {
            title: 'Set Up Drillthrough in Power BI Reports',
            source: 'Microsoft Learn',
            format: 'Official Docs / Guide',
            url: 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough',
          },
          {
            title: 'Power BI Report Design & Bookmarks Videos',
            source: 'Guy in a Cube (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@GuyInACube/search?query=report%20design',
          },
          {
            title: 'Design Power BI Reports Training Module',
            source: 'Microsoft Learn',
            format: 'Interactive / Practice',
            url: 'https://learn.microsoft.com/en-us/training/modules/power-bi-effective-visuals/',
          },
        ],
      },
    ],
  },
  {
    id: 'business-analytics',
    indexLabel: '06',
    title: 'Business Analytics',
    category: 'Quantitative & BI',
    iconKey: 'business',
    shortDescription:
      'KPI trees, funnel diagnostics, unit economics, and translating raw metrics into recommendations.',
    outlineTopics: ['KPI Trees', 'Cohort & Funnel', 'Stakeholder Framing'],
    estimatedHours: 12,
    overviewResources: [
      {
        title: 'Analytics Engineering Best Practices',
        source: 'dbt Docs',
        format: 'Official Docs / Guide',
        url: 'https://docs.getdbt.com/best-practices',
      },
      {
        title: 'YC Library: Metrics & Growth Talks',
        source: 'Y Combinator',
        format: 'Video Tutorial',
        url: 'https://www.ycombinator.com/library',
      },
      {
        title: 'SQL Business Analytics Case Training',
        source: 'Mode',
        format: 'Interactive / Practice',
        url: 'https://mode.com/sql-tutorial/sql-business-analytics-training/',
      },
    ],
    modules: [
      {
        id: 'ba-m1',
        title: 'Defining North Star & Driver Metrics',
        summary: 'Decomposing revenue, margin, and retention into actionable input levers.',
        resources: [
          {
            title: 'North Star Metric Playbook',
            source: 'Amplitude',
            format: 'Official Docs / Guide',
            url: 'https://amplitude.com/books/north-star',
          },
          {
            title: 'How to Measure Your Product & KPIs',
            source: 'Y Combinator',
            format: 'Video Tutorial',
            url: 'https://www.ycombinator.com/library/search?query=metrics',
          },
          {
            title: 'AARRR Funnel Framework Breakdown',
            source: 'PostHog',
            format: 'Interactive / Practice',
            url: 'https://posthog.com/blog/aarrr-pirate-funnel',
          },
        ],
      },
      {
        id: 'ba-m2',
        title: 'Funnel Conversion & Drop-Off Analysis',
        summary: 'Activation stages, bottleneck sizing, and segmenting user journeys.',
        resources: [
          {
            title: 'Conversion Funnels Methodology',
            source: 'PostHog Docs',
            format: 'Official Docs / Guide',
            url: 'https://posthog.com/docs/product-analytics/funnels',
          },
          {
            title: 'Google Analytics Skillshop Training',
            source: 'Google Skillshop',
            format: 'Video Tutorial',
            url: 'https://skillshop.withgoogle.com/',
          },
          {
            title: 'Funnel Exploration Documentation',
            source: 'Google Analytics Help',
            format: 'Interactive / Practice',
            url: 'https://support.google.com/analytics/answer/9327974',
          },
        ],
      },
      {
        id: 'ba-m3',
        title: 'Unit Economics & SaaS/Retail Metrics',
        summary: 'CAC, LTV, payback period, gross margin, and churn rate definitions.',
        resources: [
          {
            title: 'SaaS Metrics to Track Guide',
            source: 'Stripe Resources',
            format: 'Official Docs / Guide',
            url: 'https://stripe.com/resources/more/saas-metrics-to-track',
          },
          {
            title: '16 Startup & Business Metrics',
            source: 'a16z',
            format: 'Official Docs / Guide',
            url: 'https://a16z.com/16-startup-metrics/',
          },
          {
            title: 'Unit Economics & Startup Metrics Talks',
            source: 'Y Combinator',
            format: 'Video Tutorial',
            url: 'https://www.ycombinator.com/library/search?query=unit%20economics',
          },
        ],
      },
      {
        id: 'ba-m4',
        title: 'Root-Cause Diagnostic Frameworks',
        summary: 'Isolating seasonality, mix shifts, and pricing effects from real declines.',
        resources: [
          {
            title: 'Retention & Cohort Analysis Docs',
            source: 'PostHog Docs',
            format: 'Official Docs / Guide',
            url: 'https://posthog.com/docs/product-analytics/retention',
          },
          {
            title: 'Business Case Diagnostics Walkthroughs',
            source: 'Emma Ding (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@EmmaDing/search?query=metric%20drop',
          },
          {
            title: 'Investigating a Metric Drop Case Study',
            source: 'Mode',
            format: 'Interactive / Practice',
            url: 'https://mode.com/sql-tutorial/a-drop-in-user-engagement/',
          },
        ],
      },
      {
        id: 'ba-m5',
        title: 'Executive Memo & Insight Storytelling',
        summary: 'Headline-first charts and quantifying business impact in plain language.',
        resources: [
          {
            title: 'Datawrapper Chart Design Academy',
            source: 'Datawrapper',
            format: 'Official Docs / Guide',
            url: 'https://academy.datawrapper.de/',
          },
          {
            title: 'Data Storytelling Talks & Examples',
            source: 'Storytelling with Data (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@storytellingwithdata',
          },
          {
            title: 'FT Visual Vocabulary Chart Picker',
            source: 'Financial Times',
            format: 'Interactive / Practice',
            url: 'https://ft-interactive.github.io/visual-vocabulary/',
          },
        ],
      },
    ],
  },
  {
    id: 'real-world-projects',
    indexLabel: '07',
    title: 'Real-World Projects',
    category: 'Applied & Career',
    iconKey: 'projects',
    shortDescription:
      'End-to-end portfolio case studies spanning data cleaning, SQL modeling, Python EDA, and BI.',
    outlineTopics: ['E-Commerce Cohort', 'Ops Bottleneck', 'Executive BI'],
    estimatedHours: 24,
    overviewResources: [
      {
        title: 'Writing Great Repository READMEs',
        source: 'GitHub Docs',
        format: 'Official Docs / Guide',
        url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes',
      },
      {
        title: 'Data Analyst Portfolio Project Series',
        source: 'Alex The Analyst (YouTube)',
        format: 'Video Tutorial',
        url: 'https://www.youtube.com/@AlexTheAnalyst',
      },
      {
        title: 'Kaggle Open Public Datasets',
        source: 'Kaggle',
        format: 'Interactive / Practice',
        url: 'https://www.kaggle.com/datasets',
      },
    ],
    modules: [
      {
        id: 'proj-m1',
        title: 'Project Scoping & Question Framing',
        summary: 'Translating an open-ended stakeholder prompt into measurable hypotheses.',
        resources: [
          {
            title: 'Google Dataset Search',
            source: 'Google Research',
            format: 'Official Docs / Guide',
            url: 'https://datasetsearch.research.google.com/',
          },
          {
            title: 'How to Scope an Analytics Portfolio Project',
            source: 'Alex The Analyst (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@AlexTheAnalyst/search?query=portfolio%20project',
          },
          {
            title: 'UCI Machine Learning & Analytics Archive',
            source: 'UC Irvine',
            format: 'Interactive / Practice',
            url: 'https://archive.ics.uci.edu/datasets',
          },
        ],
      },
      {
        id: 'proj-m2',
        title: 'Retail Revenue & Retention Analysis (SQL + BI)',
        summary: 'Multi-table order exploration, RFM segmentation, and executive dashboard.',
        resources: [
          {
            title: 'Online Retail Transactional Dataset',
            source: 'UCI Archive',
            format: 'Official Docs / Guide',
            url: 'https://archive.ics.uci.edu/dataset/352/online+retail',
          },
          {
            title: 'End-to-End SQL & Tableau/BI Project Video',
            source: 'Alex The Analyst (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@AlexTheAnalyst/search?query=SQL%20data%20exploration',
          },
          {
            title: 'E-Commerce Datasets & Notebooks',
            source: 'Kaggle',
            format: 'Interactive / Practice',
            url: 'https://www.kaggle.com/datasets?search=ecommerce',
          },
        ],
      },
      {
        id: 'proj-m3',
        title: 'Subscription Churn & Cohort Study (Python)',
        summary: 'Exploratory notebook identifying behavioral drivers of early cancellation.',
        resources: [
          {
            title: 'pandas Intro Tutorials for EDA',
            source: 'pandas Docs',
            format: 'Official Docs / Guide',
            url: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html',
          },
          {
            title: 'freeCodeCamp Data Analysis Python Projects',
            source: 'freeCodeCamp',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@freecodecamp/search?query=data%20analysis%20with%20python',
          },
          {
            title: 'Telco Customer Churn Dataset & Colab',
            source: 'Kaggle',
            format: 'Interactive / Practice',
            url: 'https://www.kaggle.com/datasets/blastchar/telco-customer-churn',
          },
        ],
      },
      {
        id: 'proj-m4',
        title: 'Supply Chain Lead-Time Audit (Excel)',
        summary: 'Power Query consolidation and variance modeling across regional warehouses.',
        resources: [
          {
            title: 'Power Query Data Shaping Guide',
            source: 'Microsoft Learn',
            format: 'Official Docs / Guide',
            url: 'https://learn.microsoft.com/en-us/power-query/power-query-what-is-power-query',
          },
          {
            title: 'Full Excel Dashboard Project Walkthrough',
            source: 'Alex The Analyst (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@AlexTheAnalyst/search?query=Excel%20project',
          },
          {
            title: 'Data.gov Logistics & Supply Datasets',
            source: 'Data.gov',
            format: 'Interactive / Practice',
            url: 'https://catalog.data.gov/dataset?q=supply+chain',
          },
        ],
      },
      {
        id: 'proj-m5',
        title: 'Portfolio Repository & Case Write-Up',
        summary: 'Structuring READMEs, architecture notes, and concise business takeaways.',
        resources: [
          {
            title: 'About Repository READMEs',
            source: 'GitHub Docs',
            format: 'Official Docs / Guide',
            url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes',
          },
          {
            title: 'Building a Data Analyst Portfolio Website',
            source: 'Alex The Analyst (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@AlexTheAnalyst/search?query=portfolio%20website',
          },
          {
            title: 'Publish with GitHub Pages Guide',
            source: 'GitHub Docs',
            format: 'Interactive / Practice',
            url: 'https://docs.github.com/en/pages',
          },
        ],
      },
    ],
  },
  {
    id: 'interview-preparation',
    indexLabel: '08',
    title: 'Interview Preparation',
    category: 'Applied & Career',
    iconKey: 'interview',
    shortDescription:
      'Timed SQL and Python problem patterns, product case prompts, and portfolio walkthroughs.',
    outlineTopics: ['SQL Patterns', 'Product Cases', 'Portfolio Pitch'],
    estimatedHours: 14,
    overviewResources: [
      {
        title: 'MIT Career Interview Preparation Guide',
        source: 'MIT CAPD',
        format: 'Official Docs / Guide',
        url: 'https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/',
      },
      {
        title: 'Data Analyst Interview Prep Videos',
        source: 'Alex The Analyst (YouTube)',
        format: 'Video Tutorial',
        url: 'https://www.youtube.com/@AlexTheAnalyst/search?query=interview',
      },
      {
        title: 'DataLemur Free SQL & Analytics Questions',
        source: 'DataLemur',
        format: 'Interactive / Practice',
        url: 'https://datalemur.com/questions',
      },
    ],
    modules: [
      {
        id: 'int-m1',
        title: 'SQL Live-Coding Pattern Drills',
        summary: 'Top-N per group, retention gaps, rolling windows, and edge-case handling.',
        resources: [
          {
            title: 'PostgreSQL Window & Query Reference',
            source: 'PostgreSQL Docs',
            format: 'Official Docs / Guide',
            url: 'https://www.postgresql.org/docs/current/tutorial-window.html',
          },
          {
            title: 'SQL Interview Walkthroughs',
            source: 'DataLemur (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@NickSinghTech/search?query=SQL%20interview',
          },
          {
            title: 'Free SQL Interview Questions',
            source: 'DataLemur',
            format: 'Interactive / Practice',
            url: 'https://datalemur.com/questions',
          },
          {
            title: 'Database Problem Set',
            source: 'LeetCode',
            format: 'Interactive / Practice',
            url: 'https://leetcode.com/problemset/database/',
          },
        ],
      },
      {
        id: 'int-m2',
        title: 'Python & Data Manipulation Prompts',
        summary: 'Clean pandas transformations, string parsing, and complexity awareness.',
        resources: [
          {
            title: 'pandas Comparison & Cookbook Guide',
            source: 'pandas Docs',
            format: 'Official Docs / Guide',
            url: 'https://pandas.pydata.org/docs/user_guide/cookbook.html',
          },
          {
            title: 'Python Coding Interview Patterns',
            source: 'freeCodeCamp',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@freecodecamp/search?query=python%20interview',
          },
          {
            title: 'StrataScratch Python Questions',
            source: 'StrataScratch',
            format: 'Interactive / Practice',
            url: 'https://www.stratascratch.com/',
          },
        ],
      },
      {
        id: 'int-m3',
        title: 'Metric & A/B Experiment Case Rounds',
        summary: 'Diagnosing sudden KPI drops and designing valid controlled tests.',
        resources: [
          {
            title: 'Trustworthy Online Controlled Experiments',
            source: 'ExperimentGuide',
            format: 'Official Docs / Guide',
            url: 'https://experimentguide.com/',
          },
          {
            title: 'Product & A/B Testing Case Videos',
            source: 'Emma Ding (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@EmmaDing/search?query=A%2FB%20testing',
          },
          {
            title: 'Sample Size Calculator & Formulas',
            source: 'Evan Miller',
            format: 'Interactive / Practice',
            url: 'https://www.evanmiller.org/ab-testing/sample-size.html',
          },
        ],
      },
      {
        id: 'int-m4',
        title: 'Portfolio & Project Deep-Dive Narrative',
        summary: 'Explaining trade-offs, data caveats, and business impact in 3 minutes.',
        resources: [
          {
            title: 'Managing Your GitHub Profile README',
            source: 'GitHub Docs',
            format: 'Official Docs / Guide',
            url: 'https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme',
          },
          {
            title: 'How to Present Analytics Projects',
            source: 'Luke Barousse (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@LukeBarousse/search?query=portfolio',
          },
          {
            title: 'Data Visualization Storytelling Guide',
            source: 'Datawrapper Academy',
            format: 'Interactive / Practice',
            url: 'https://academy.datawrapper.de/',
          },
        ],
      },
      {
        id: 'int-m5',
        title: 'Behavioral & Cross-Functional Scenarios',
        summary: 'Handling conflicting stakeholder priorities and unclear requirements.',
        resources: [
          {
            title: 'The STAR Method for Behavioral Interviews',
            source: 'MIT CAPD',
            format: 'Official Docs / Guide',
            url: 'https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/',
          },
          {
            title: 'Prepare for an Interview Guide',
            source: 'Harvard Career Services',
            format: 'Official Docs / Guide',
            url: 'https://careerservices.fas.harvard.edu/channels/prepare-for-an-interview/',
          },
          {
            title: 'Analyst Behavioral Interview Walkthroughs',
            source: 'Alex The Analyst (YouTube)',
            format: 'Video Tutorial',
            url: 'https://www.youtube.com/@AlexTheAnalyst/search?query=behavioral%20interview',
          },
        ],
      },
    ],
  },
];

export const PRACTICE_LAB_PREVIEWS: PracticeLabPreview[] = [
  {
    id: 'lab-excel',
    courseId: 'excel',
    title: 'Spreadsheet Modeling & Lookup Drills',
    tool: 'Excel',
    scopeSummary: 'Formula auditing, dynamic array lookups, and PivotTable summary tables.',
    drillTopics: ['XLOOKUP multi-key join', 'Monthly cohort PivotTable', 'Power Query unpivot'],
    sampleFiles: SAMPLE_FILES_BY_COURSE.excel,
    topics: PRACTICE_TOPICS_BY_COURSE.excel,
  },
  {
    id: 'lab-sql',
    courseId: 'sql',
    title: 'Relational Query & Window Exercises',
    tool: 'SQL',
    scopeSummary: 'Multi-table analytical queries using CTEs, ranking, and period-over-period comparisons.',
    drillTopics: ['7-day rolling revenue', 'First-touch attribution', 'Duplicate order audit'],
    sampleFiles: SAMPLE_FILES_BY_COURSE.sql,
    topics: PRACTICE_TOPICS_BY_COURSE.sql,
  },
  {
    id: 'lab-python',
    courseId: 'python',
    title: 'DataFrame Cleaning & Exploratory Notebooks',
    tool: 'Python',
    scopeSummary: 'Cleaning messy CSV exports, reshaping time series, and validating distributions.',
    drillTopics: ['Null & outlier triage', 'GroupBy retention matrix', 'Subplots trend report'],
    sampleFiles: SAMPLE_FILES_BY_COURSE.python,
    topics: PRACTICE_TOPICS_BY_COURSE.python,
  },
  {
    id: 'lab-statistics',
    courseId: 'statistics',
    title: 'Experiment Sizing & Significance Checks',
    tool: 'Statistics',
    scopeSummary: 'Evaluating A/B test outcomes, checking variance assumptions, and interpreting p-values.',
    drillTopics: ['Two-proportion z-test', 'Confidence interval bounds', 'Sample size check'],
    sampleFiles: SAMPLE_FILES_BY_COURSE.statistics,
    topics: PRACTICE_TOPICS_BY_COURSE.statistics,
  },
  {
    id: 'lab-powerbi',
    courseId: 'power-bi',
    title: 'Star Schema & DAX Measure Patterns',
    tool: 'Power BI',
    scopeSummary: 'Structuring clean fact/dimension relationships and writing filter-context-safe DAX.',
    drillTopics: ['YoY growth measure', 'Dynamic date slicer', 'Cross-filter audit'],
    sampleFiles: SAMPLE_FILES_BY_COURSE['power-bi'],
    topics: PRACTICE_TOPICS_BY_COURSE['power-bi'],
  },
];

export const INTERVIEW_CHECKLIST: InterviewPrepTopic[] = [
  {
    id: 'ic-sql-joins',
    area: 'SQL & Modeling',
    title: 'Explain LEFT vs. INNER join row multiplication',
    description: 'Walk through how many-to-many keys affect aggregate sums and how to validate row counts.',
  },
  {
    id: 'ic-sql-windows',
    area: 'SQL & Modeling',
    title: 'Write Top-N per category with DENSE_RANK and CTEs',
    description: 'Handle ties cleanly and filter window output inside an outer query or CTE.',
  },
  {
    id: 'ic-stat-ab',
    area: 'Statistics & Testing',
    title: 'Outline an end-to-end A/B test design',
    description: 'Define primary metric, guardrail metrics, randomization unit, and stopping rules.',
  },
  {
    id: 'ic-case-drop',
    area: 'Business Case',
    title: 'Diagnose a 15% week-over-week conversion drop',
    description: 'Separate tracking bugs, seasonality, traffic mix shifts, and funnel step regressions.',
  },
  {
    id: 'ic-python-clean',
    area: 'Python',
    title: 'Summarize pandas merge strategies and missing values',
    description: 'Articulate inner/left merges, validation flags, and when to drop vs. impute.',
  },
  {
    id: 'ic-portfolio-story',
    area: 'Portfolio Walkthrough',
    title: 'Deliver a concise 3-minute project walkthrough',
    description: 'State the business question, dataset limitations, method choice, and concrete outcome.',
  },
];
