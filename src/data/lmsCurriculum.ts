import { LmsLesson, LmsModule } from '../types/academy';

export const LMS_MODULES: LmsModule[] = [
  {
    id: 'mod-1',
    order: 1,
    title: 'Data Analytics Foundations & Business Thinking',
    subtitle: 'KPI Design, Metric Trees & Executive Framing',
    description:
      'Learn how professional analysts translate vague stakeholder requests into clear analytical questions, metric hierarchies, data quality checks, and decision-ready recommendations.',
    estimatedHours: 6,
    iconKey: 'business',
    prerequisites: ['None — designed as your starting point'],
    objectives: [
      'Convert open-ended stakeholder requests into testable problem statements and primary KPIs.',
      'Decompose top-line revenue, margin, and retention metrics into operational driver trees.',
      'Audit dataset granularity, missingness, and selection bias before calculating a single chart.',
      'Structure executive summaries using the Pyramid Principle (answer first, evidence second).',
    ],
    labId: 'lab-operations',
    quizId: 'quiz-mod-1',
  },
  {
    id: 'mod-2',
    order: 2,
    title: 'Microsoft Excel & Spreadsheet Modeling',
    subtitle: 'Lookups, Pivot Logic, Cleaning & Financial Formulas',
    description:
      'Master spreadsheet modeling used daily by analysts: resilient lookups, conditional aggregations, text/date cleaning formulas, and unit-economics models.',
    estimatedHours: 10,
    iconKey: 'excel',
    prerequisites: ['Module 1: Data Analytics Foundations'],
    objectives: [
      'Replace brittle VLOOKUP ranges with XLOOKUP and INDEX/MATCH for two-way and exact lookups.',
      'Build summary tables using SUMIFS, COUNTIFS, AVERAGEIFS, and PivotTable logic.',
      'Standardize messy CSV exports with TRIM, PROPER, CLEAN, IFERROR, and EOMONTH.',
      'Model net revenue, gross margin %, MoM growth, and break-even thresholds accurately.',
    ],
    labId: 'lab-operations',
    quizId: 'quiz-mod-2',
  },
  {
    id: 'mod-3',
    order: 3,
    title: 'SQL for Data Analysis',
    subtitle: 'Filtering, Joins, Aggregations, CTEs & Window Functions',
    description:
      'Write clean, bug-free analytical SQL from basic row filtering through multi-table joins, multi-step CTE pipelines, and analytical window functions.',
    estimatedHours: 14,
    iconKey: 'sql',
    prerequisites: ['Module 2: Spreadsheet Modeling'],
    objectives: [
      'Filter rows safely using WHERE, NULL-aware predicates, and conditional CASE WHEN logic.',
      'Join normalized fact and dimension tables without duplicating revenue via join fan-out.',
      'Aggregate metrics cleanly with GROUP BY, HAVING, and readable WITH (CTE) pipelines.',
      'Compute rankings, running totals, and partition shares using OVER (PARTITION BY ... ORDER BY ...).',
    ],
    labId: 'lab-retail',
    quizId: 'quiz-mod-3',
  },
  {
    id: 'mod-4',
    order: 4,
    title: 'Data Visualization & BI Storytelling',
    subtitle: 'Chart Selection, Dashboard Design, Star Schemas & DAX',
    description:
      'Design executive-grade dashboards backed by clean star-schema models, clear chart selection rules, and accurate DAX evaluation context.',
    estimatedHours: 10,
    iconKey: 'powerbi',
    prerequisites: ['Module 3: SQL for Data Analysis'],
    objectives: [
      'Match analytical intent (trend, comparison, part-to-whole, distribution) to the right visual.',
      'Structure star schemas with one-to-many single-direction filters from dimensions to facts.',
      'Distinguish row context from filter context and apply CALCULATE + DIVIDE safely in DAX.',
      'Eliminate chartjunk, dual-axis distortion, and misleading truncated scales.',
    ],
    labId: 'lab-retail',
    quizId: 'quiz-mod-4',
  },
  {
    id: 'mod-5',
    order: 5,
    title: 'Applied Business Case Studies & Capstone Projects',
    subtitle: 'Retail, Operations, Banking & HR End-to-End Cases',
    description:
      'Apply Excel, SQL, and BI reasoning across four realistic company datasets—diagnosing retail margins, carrier SLA delays, credit card risk, and employee attrition.',
    estimatedHours: 12,
    iconKey: 'projects',
    prerequisites: ['Modules 1–4 Completed'],
    objectives: [
      'Execute cross-table profit and discount-erosion audits in omnichannel retail.',
      'Pinpoint freight cost drivers and SLA breaches by carrier and regional hub.',
      'Quantify credit utilization risk, delinquency buckets, and cross-border fraud flags.',
      'Identify overtime-driven attrition pockets and payroll budget variances in HR.',
    ],
    labId: 'lab-banking',
    quizId: 'quiz-mod-5',
  },
  {
    id: 'mod-6',
    order: 6,
    title: 'Interview Prep & Scenario-Based Mock Tests',
    subtitle: 'SQL Debugging, Metric Investigations & Stakeholder Pushback',
    description:
      'Rehearse the exact technical and business-case prompts tested in Data Analyst hiring loops, plus complete your Final Job-Readiness Capstone Assessment.',
    estimatedHours: 8,
    iconKey: 'interview',
    prerequisites: ['Modules 1–5 Completed'],
    objectives: [
      'Spot subtle SQL bugs involving NULLs, LEFT JOIN filters in WHERE, and integer division.',
      'Walk interviewers through structured root-cause trees when a core KPI drops unexpectedly.',
      'Estimate funnel conversions and size business opportunities cleanly under time pressure.',
      'Deliver crisp STAR behavioral narratives and handle executive scope pushback.',
    ],
    labId: 'lab-hr',
    quizId: 'quiz-mod-6',
  },
];

export const LMS_LESSONS: LmsLesson[] = [
  // ============================================================
  // MODULE 1: DATA ANALYTICS FOUNDATIONS & BUSINESS THINKING
  // ============================================================
  {
    id: 'm1-l1',
    moduleId: 'mod-1',
    order: 1,
    title: 'Translating Business Questions into Measurable KPIs',
    summary:
      'Turn ambiguous executive prompts into crisp analytical hypotheses, explicit denominators, and decision thresholds.',
    durationMinutes: 20,
    coreConcepts: [
      {
        heading: 'From Symptom to Decision Question',
        explanation:
          'Stakeholders rarely hand analysts an exact SQL specification. They say "sales feel soft" or "shipping is getting expensive." Before opening a spreadsheet, restate the request as: What decision will change based on the number I deliver, what time window applies, and what population is included?',
        keyTakeaway: 'Every metric needs a clear numerator, denominator, population filter, and time grain.',
      },
      {
        heading: 'Leading vs. Lagging Indicators',
        explanation:
          'Lagging metrics (monthly revenue, quarterly churn) confirm what already happened. Leading metrics (checkout drop-off rate, SLA transit delay rate, trial activation within 48 hours) signal change early enough for operators to intervene.',
        keyTakeaway: 'Pair every lagging outcome KPI with 1–2 actionable leading operational levers.',
      },
      {
        heading: 'Vanity Metrics vs. Actionable Ratios',
        explanation:
          'Cumulative totals like "total registered users" only rise and hide trouble. Actionable metrics normalize by exposure—such as Revenue per Active Customer, On-Time Delivery Rate, or Net Margin %.',
        keyTakeaway: 'Rates and unit economics reveal efficiency; raw cumulative counts mask deterioration.',
      },
    ],
    syntaxReference: [
      {
        label: 'Problem Framing Template',
        syntax: 'Decision + Primary Metric + Segment/Grain + Time Window + Baseline',
        usage: 'Write this one-sentence contract at the top of every analysis brief before querying.',
      },
      {
        label: 'Rate / Ratio Standard',
        syntax: 'Rate = Qualified Event Count / Exposed Eligible Population',
        usage: 'Always exclude canceled/ineligible records consistently from both numerator and denominator.',
      },
    ],
    workedExample: {
      scenario:
        'A VP of Operations asks: "Why are our shipping costs exploding this month?" You have access to operations_shipments.',
      steps: [
        {
          stepTitle: '1. Clarify the unit of measure',
          detail:
            'Total freight spend naturally rises when order volume grows. Normalize spend by units shipped: Freight Cost per Unit = SUM(freight_cost) / SUM(units).',
        },
        {
          stepTitle: '2. Isolate operational segments',
          detail:
            'Split Cost per Unit and Delay Rate by carrier (ApexFreight, SwiftHaul, NorthStar) and origin hub (HUB-NE, HUB-MW, HUB-W, HUB-S).',
        },
        {
          stepTitle: '3. Define the action threshold',
          detail:
            'Flag any carrier-hub lane whose Cost per Unit exceeds $4.20 or whose SLA delay rate exceeds 25% for contract renegotiation.',
        },
      ],
      outcome:
        'Instead of reporting a generic "$8,810 total freight cost," you deliver an actionable lane-level cost-per-unit benchmark tied directly to carrier allocation.',
    },
    commonPitfalls: [
      {
        mistake: 'Comparing mismatched time windows (e.g., 28-day February vs. 31-day January)',
        whyItBreaks: 'A 10% drop in monthly totals can simply be 3 fewer calendar days.',
        fix: 'Compare daily run-rates (Spend / Day) or trailing 28-day windows across months.',
      },
      {
        mistake: 'Averaging percentages without weighting',
        whyItBreaks: 'Taking the simple mean of 3 hub delay rates treats a 10-shipment hub equally with a 1,000-shipment hub.',
        fix: 'Always compute SUM(delayed_shipments) / SUM(total_shipments) across combined segments.',
      },
    ],
    cheatSheet: [
      'Ask: "If this number is X vs. Y, what action will the team take?"',
      'Always define Numerator, Denominator, Inclusion Rules, and Time Grain.',
      'Normalize volume-sensitive metrics (Cost per Unit, Revenue per Order, Margin %).',
      'Never average pre-computed rates; re-aggregate raw numerators and denominators.',
    ],
  },
  {
    id: 'm1-l2',
    moduleId: 'mod-1',
    order: 2,
    title: 'Metric Trees, North Star & Guardrail Metrics',
    summary:
      'Break high-level financial goals into multiplicative and additive components so teams know which lever actually moved.',
    durationMinutes: 22,
    coreConcepts: [
      {
        heading: 'Decomposing a Metric Tree',
        explanation:
          'A metric tree expresses an outcome KPI mathematically as sub-metrics. For example, Net Retail Revenue = Orders × Average Units per Order × Net Selling Price per Unit, or Total Gross Profit = Completed Orders × (Net Revenue per Order − COGS per Order).',
        keyTakeaway: 'When a top KPI shifts, a metric tree isolates whether volume, mix, price, or discount drove the change.',
      },
      {
        heading: 'North Star + Guardrail Pairing',
        explanation:
          'Optimizing a single metric in isolation causes unintended harm. Pushing Sales Order Volume up via heavy discounts can destroy Gross Margin. Pushing Credit Card Spend up by loosening underwriting increases 60+ Day Delinquency.',
        keyTakeaway: 'Every primary target metric requires at least one opposing guardrail metric.',
      },
    ],
    syntaxReference: [
      {
        label: 'Retail Revenue Decomposition',
        syntax: 'Net Revenue = SUM(quantity * unit_price * (1 - discount_pct))',
        usage: 'Separates unit volume, list price mix, and discount leakage.',
      },
      {
        label: 'Gross Margin %',
        syntax: 'Gross Margin % = (Net Revenue - COGS) / Net Revenue',
        usage: 'Primary profitability guardrail against aggressive promotional discounting.',
      },
    ],
    workedExample: {
      scenario:
        'Retail Sales leadership wants to boost Q1 unit volume by running a flat 20% site-wide coupon.',
      steps: [
        {
          stepTitle: '1. Build the baseline unit economics',
          detail:
            'Take PRD-A (Ergonomic Dock): List price = $150, Unit cost = $90. At 0% discount, gross profit per unit is $60 (40.0% margin).',
        },
        {
          stepTitle: '2. Stress-test the 20% discount guardrail',
          detail:
            'At 20% off, net price drops to $120. Unit cost stays $90, so gross profit plunges by half to $30 per unit (25.0% margin).',
          codeOrFormula: 'New Margin = (120 - 90) / 120 = 30 / 120 = 25.0%',
        },
        {
          stepTitle: '3. Calculate required volume lift to break even on profit',
          detail:
            'To earn the same $60 profit, volume must double (+100% lift) just to stand still in total gross profit dollars.',
        },
      ],
      outcome:
        'The metric tree exposes that a 20% discount requires 2× unit volume to maintain profit—guiding leadership toward targeted bundle discounts instead.',
    },
    commonPitfalls: [
      {
        mistake: 'Celebrating gross GMV while ignoring returns and cancellations',
        whyItBreaks: 'Returned and cancelled orders consume shipping/handling cost with zero retained revenue.',
        fix: 'Track Completed Net Revenue separately alongside Return Rate % as a guardrail.',
      },
      {
        mistake: 'Confusing percentage-point change with relative % change',
        whyItBreaks: 'A margin falling from 40% to 30% is a 10 percentage-point drop, which equals a 25% relative decline.',
        fix: 'Label absolute differences as "pp" (percentage points) and relative shifts as "%".',
      },
    ],
    cheatSheet: [
      'Write the algebraic equation for your North Star metric before slicing data.',
      'Pair Growth KPIs with Margin, Return Rate, or Delinquency guardrails.',
      'Use "pp" for differences between two percentages (e.g., 40% -> 35% = -5 pp).',
    ],
  },
  {
    id: 'm1-l3',
    moduleId: 'mod-1',
    order: 3,
    title: 'Data Quality Audits, Granularity & Bias Detection',
    summary:
      'Systematically audit row grain, primary-key duplicates, NULL semantics, casing drift, and survivorship bias before reporting.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Verify Row Granularity First',
        explanation:
          'Granularity defines what one row represents. In retail_orders, one row is an order; in credit_card_transactions, one row is an authorization event; in warehouse_hubs, one row is a facility. Mixing grains without aggregating first causes silent overcounting.',
        keyTakeaway: 'Always confirm COUNT(*) equals COUNT(DISTINCT primary_key) on entity tables.',
      },
      {
        heading: 'Three Faces of Missingness (NULL)',
        explanation:
          'A NULL in delivery_days for an "In Transit" shipment is structurally valid (not yet delivered). A NULL in customer_id on a completed order is an ingestion defect. Treating structural NULLs as 0 distorts average delivery times downward.',
        keyTakeaway: 'Never blindly coerce NULL to 0—check why the value is missing first.',
      },
      {
        heading: 'Casing Drift & Dirty Categories',
        explanation:
          'When source systems log "ApexFreight" and "apexfreight" separately, case-sensitive tools split one carrier into two buckets. Standardizing text case early prevents fragmented group totals.',
        keyTakeaway: 'Profile DISTINCT category values with TRIM() and LOWER() during initial QA.',
      },
    ],
    syntaxReference: [
      {
        label: 'Grain / Duplicate Check',
        syntax: 'COUNT(*) - COUNT(DISTINCT primary_key) AS duplicate_rows',
        usage: 'Must equal 0 on any table expected to have unique primary keys.',
      },
      {
        label: 'Null Rate Audit',
        syntax: 'SUM(CASE WHEN col IS NULL THEN 1 ELSE 0 END) * 1.0 / COUNT(*)',
        usage: 'Quantifies missingness per column before modeling.',
      },
    ],
    workedExample: {
      scenario:
        'You load operations_shipments (20 rows) to compute average delivery_days and carrier performance.',
      steps: [
        {
          stepTitle: '1. Inspect status and NULL distribution',
          detail:
            'Rows SHP-1013 and SHP-1018 have status = "In Transit" and delivery_days = NULL. Excluding NULLs leaves 18 completed/delayed shipments.',
        },
        {
          stepTitle: '2. Inspect carrier strings',
          detail:
            'SHP-1002 logs "apexfreight" and SHP-1008 logs "swifthaul". Without case normalization, GROUP BY carrier yields 5 groups instead of 3.',
        },
        {
          stepTitle: '3. Compute clean baseline',
          detail:
            'Normalizing carrier names with LOWER()/PROPER() and excluding In Transit rows from transit-time averages yields clean, unbiased carrier metrics.',
        },
      ],
      outcome:
        'A 2-minute QA audit catches both the casing split and the 2 in-transit NULL rows before they corrupt executive KPIs.',
    },
    commonPitfalls: [
      {
        mistake: 'Replacing NULL delivery_days with 0 in Excel AVERAGE()',
        whyItBreaks: 'Adding two artificial zeros drags average transit time down artificially.',
        fix: 'Leave blank/NULL for uncompleted events and average only Delivered/Delayed rows.',
      },
      {
        mistake: 'Analyzing only active employees to study attrition causes',
        whyItBreaks: 'Survivorship bias omits everyone who already quit due to burnout or pay.',
        fix: 'Include both attrition = "Yes" and "No" cohorts when computing turnover drivers.',
      },
    ],
    cheatSheet: [
      'Check 5 things on every new table: Row Count, Unique PK, Date Range, NULLs, Distinct Categories.',
      'Structural NULL != Zero; keep uncompleted events out of cycle-time averages.',
      'Always normalize whitespace and case on categorical join/group keys.',
    ],
  },
  {
    id: 'm1-l4',
    moduleId: 'mod-1',
    order: 4,
    title: 'Executive Communication & Recommendation Framing',
    summary:
      'Deliver findings using Answer-First structure, quantified dollar/risk impact, and concrete next actions.',
    durationMinutes: 18,
    coreConcepts: [
      {
        heading: 'The Pyramid Principle (BLUF)',
        explanation:
          'Analysts work chronologically (clean data -> explore -> test -> conclude), but executives read top-down. Lead with the Bottom Line Up Front (BLUF): the core finding, its quantified business impact, and your recommended action—then back it with 2–3 supporting data points.',
        keyTakeaway: 'Never bury the conclusion at the bottom of a slide or memo.',
      },
      {
        heading: 'Quantify Impact & Trade-offs',
        explanation:
          '"SwiftHaul has delays" is an observation. "SwiftHaul missed SLA on 2 of 6 completed shipments (33.3%), concentrated in HUB-MW and HUB-W; shifting HUB-MW overflow to NorthStar saves ~1.5 transit days" is an executive recommendation.',
        keyTakeaway: 'Pair every insight with scale (how many dollars/orders/people) and a realistic trade-off.',
      },
    ],
    syntaxReference: [
      {
        label: '3-Part Insight Sentence',
        syntax: '[What changed + Magnitude] driven by [Root Driver], resulting in [Action + Expected Impact].',
        usage: 'Standardize chart titles and executive summary bullets around this template.',
      },
    ],
    workedExample: {
      scenario:
        'Summarizing HR attrition findings for the Chief People Officer based on hr_employees.',
      steps: [
        {
          stepTitle: '1. State the headline finding',
          detail:
            'Voluntary attrition is 31.25% overall (5 of 16 employees), but 83.3% of overtime workers (5 of 6) left versus 0% of non-overtime staff.',
        },
        {
          stepTitle: '2. Pinpoint affected departments',
          detail:
            'Operations (2 departures) and Sales (2 departures) carry all overtime-linked churn, heavily concentrated in Junior/Mid roles under 20 months tenure.',
        },
        {
          stepTitle: '3. Propose a measurable intervention',
          detail:
            'Audit shift scheduling in Operations and Sales territory load within budget headroom before adding new headcount.',
        },
      ],
      outcome:
        'Leadership receives a crisp, quantified diagnosis with zero fluff and an immediate operational focus.',
    },
    commonPitfalls: [
      {
        mistake: 'Writing descriptive chart titles like "Sales by Region"',
        whyItBreaks: 'Forces busy stakeholders to decode the takeaway themselves.',
        fix: 'Use action titles: "East Region Drives 48% of Completed Retail Revenue".',
      },
      {
        mistake: 'Presenting correlation as proven causation',
        whyItBreaks: 'Claiming overtime "caused" attrition without controlling for role level or pay invites valid pushback.',
        fix: 'State association clearly and note confounding variables to verify.',
      },
    ],
    cheatSheet: [
      'Lead with the answer, then provide 2–3 supporting numbers, then state the recommendation.',
      'Replace generic chart titles ("Attrition by Dept") with conclusion titles.',
      'Always state sample size or denominator alongside percentages (e.g., "5 of 6").',
    ],
  },

  // ============================================================
  // MODULE 2: MICROSOFT EXCEL & SPREADSHEET MODELING
  // ============================================================
  {
    id: 'm2-l1',
    moduleId: 'mod-2',
    order: 1,
    title: 'Dynamic Lookups (XLOOKUP, INDEX/MATCH & Error Handling)',
    summary:
      'Join dimension attributes onto fact tables in Excel without column-index breakage or #N/A cascades.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Why XLOOKUP & INDEX/MATCH Beat VLOOKUP',
        explanation:
          'VLOOKUP requires the lookup key to sit in the leftmost column, defaults to approximate match if you omit FALSE, and breaks silently if someone inserts a column. XLOOKUP looks up in any direction, defaults to exact match, and accepts a built-in fallback string when a key is missing.',
        keyTakeaway: 'Prefer XLOOKUP where supported, and INDEX/MATCH for universal backward compatibility.',
      },
      {
        heading: 'Locking Reference Ranges ($)',
        explanation:
          'Dragging a lookup formula down 5,000 rows without absolute dollar locks ($A$2:$A$50) shifts the lookup array downward row by row, producing mysterious #N/A errors halfway down the sheet.',
        keyTakeaway: 'Always lock lookup and return arrays with $ (or use Excel Table structured references).',
      },
    ],
    syntaxReference: [
      {
        label: 'XLOOKUP Standard',
        syntax: '=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode])',
        usage: 'Exact lookup by default; pass "Missing" as the 4th argument to catch orphan IDs.',
      },
      {
        label: 'INDEX / MATCH Pattern',
        syntax: '=IFERROR(INDEX(return_range, MATCH(key, lookup_range, 0)), "Missing")',
        usage: 'Works in all Excel versions; 0 enforces exact match.',
      },
    ],
    workedExample: {
      scenario:
        'Enrich operations_shipments (Hub ID in B2) with Region from warehouse_hubs (Hub ID in Hubs!$A$2:$A$5, Region in Hubs!$C$2:$C$5).',
      steps: [
        {
          stepTitle: '1. Write the XLOOKUP formula',
          detail: 'Anchor the lookup and return columns with absolute references.',
          codeOrFormula: '=XLOOKUP(B2, Hubs!$A$2:$A$5, Hubs!$C$2:$C$5, "Unknown Hub")',
        },
        {
          stepTitle: '2. Equivalent INDEX/MATCH for older workbooks',
          detail: 'Use MATCH(..., 0) wrapped in IFERROR.',
          codeOrFormula: '=IFERROR(INDEX(Hubs!$C$2:$C$5, MATCH(B2, Hubs!$A$2:$A$5, 0)), "Unknown Hub")',
        },
        {
          stepTitle: '3. Audit for "Unknown Hub"',
          detail: 'Run COUNTIF on the new column for "Unknown Hub" to catch unmapped foreign keys immediately.',
        },
      ],
      outcome:
        'Every shipment row receives its exact hub region while missing keys are surfaced cleanly instead of crashing downstream sums.',
    },
    commonPitfalls: [
      {
        mistake: 'Hidden leading/trailing spaces or number-stored-as-text mismatches',
        whyItBreaks: '"HUB-NE " does not equal "HUB-NE", causing valid keys to return #N/A.',
        fix: 'Clean keys with TRIM() or normalize types before matching.',
      },
      {
        mistake: 'Using approximate match (omitting 0/FALSE in VLOOKUP or MATCH)',
        whyItBreaks: 'Returns the nearest smaller key on unsorted tables—a silent corruption bug.',
        fix: 'Always specify 0 (MATCH) or FALSE (VLOOKUP) or rely on XLOOKUP exact default.',
      },
    ],
    cheatSheet: [
      '=XLOOKUP(key, key_col, val_col, "Not Found")',
      '=IFERROR(INDEX(val_col, MATCH(key, key_col, 0)), "Not Found")',
      'Always lock lookup ranges ($A$2:$A$100) or use Table[Column] notation.',
    ],
  },
  {
    id: 'm2-l2',
    moduleId: 'mod-2',
    order: 2,
    title: 'Multi-Criteria Aggregation (SUMIFS, COUNTIFS & Pivot Logic)',
    summary:
      'Summarize filtered KPIs dynamically across multiple conditions and verify totals against PivotTables.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'SUMIFS Argument Order (Opposite of SUMIF)',
        explanation:
          'In SUMIFS, the sum_range always comes FIRST, followed by pairs of (criteria_range, criteria). Every criteria_range must have the exact same row count as sum_range or Excel throws #VALUE!.',
        keyTakeaway: 'SUMIFS = Sum range first, then (range1, crit1, range2, crit2...).',
      },
      {
        heading: 'Wildcards & Comparison Operators in Quotes',
        explanation:
          'When passing inequalities or partial text checks into SUMIFS/COUNTIFS, wrap operators in quotes and concatenate cell references using & (e.g., ">"&$G$1 or "HUB-*").',
        keyTakeaway: 'Use ">"&B1—never ">B1", which looks for the literal text "B1".',
      },
    ],
    syntaxReference: [
      {
        label: 'SUMIFS Multi-Condition',
        syntax: '=SUMIFS(sum_range, crit_range1, crit1, crit_range2, crit2)',
        usage: 'Case-insensitive conditional summing across up to 127 criteria pairs.',
      },
      {
        label: 'COUNTIFS / AVERAGEIFS',
        syntax: '=COUNTIFS(range1, crit1, range2, ">0")',
        usage: 'Counts or averages rows matching all AND conditions simultaneously.',
      },
    ],
    workedExample: {
      scenario:
        'Compute total freight_cost (col H) for Delayed shipments (col I = "Delayed") originating from HUB-W (col B = "HUB-W").',
      steps: [
        {
          stepTitle: '1. Specify sum range first',
          detail: 'Freight cost sits in $H$2:$H$21.',
        },
        {
          stepTitle: '2. Add hub and status criteria pairs',
          detail: 'Match $B$2:$B$21 to "HUB-W" and $I$2:$I$21 to "Delayed".',
          codeOrFormula: '=SUMIFS($H$2:$H$21, $B$2:$B$21, "HUB-W", $I$2:$I$21, "Delayed")',
        },
        {
          stepTitle: '3. Verify via PivotTable cross-check',
          detail:
            'In HUB-W, Delayed shipments SHP-1007 ($680) + SHP-1015 ($720) = $1,400.',
        },
      ],
      outcome:
        'Dynamic summary tables update automatically whenever raw data refreshes and reconcile 100% with PivotTables.',
    },
    commonPitfalls: [
      {
        mistake: 'Using mismatched range heights (e.g., H2:H21 vs B2:B20)',
        whyItBreaks: 'Causes an immediate #VALUE! error.',
        fix: 'Reference whole named Table columns or identical start/end row bounds.',
      },
      {
        mistake: 'Expecting SUMIFS to distinguish "ApexFreight" from "apexfreight"',
        whyItBreaks: 'Excel SUMIFS/COUNTIFS are case-insensitive—helpful for dirty casing, risky if case carries meaning.',
        fix: 'Normalize casing explicitly in a clean staging column so PivotTables also group cleanly.',
      },
    ],
    cheatSheet: [
      'SUMIFS(sum_range, crit_range1, crit1, ...) -> sum_range is ALWAYS first.',
      'Concatenate dynamic thresholds: ">="&C1, "<>"&"Cancelled".',
      'AVERAGEIFS already ignores blank cells; combine with ">0" if 0s are invalid.',
    ],
  },
  {
    id: 'm2-l3',
    moduleId: 'mod-2',
    order: 3,
    title: 'Text & Date Cleaning Pipelines (TRIM, PROPER, EOMONTH)',
    summary:
      'Build repeatable staging columns to fix casing drift, stray whitespace, and inconsistent date periods.',
    durationMinutes: 22,
    coreConcepts: [
      {
        heading: 'Standardizing Dirty Text Fields',
        explanation:
          'Exports from CRM and ERP systems routinely contain trailing spaces, non-printing line breaks, and inconsistent capitalization. Chaining PROPER(TRIM(CLEAN(A2))) turns "  apexfreight " into "Apexfreight" consistently across PivotTables.',
        keyTakeaway: 'Clean staging columns prevent PivotTable category fragmentation.',
      },
      {
        heading: 'Month Bucketing with EOMONTH',
        explanation:
          'Grouping daily dates into monthly cohorts using text formatting ("Feb 2025") sorts alphabetically ("Apr", "Aug", "Feb"). Converting every date to its month-start or month-end serial date with =EOMONTH(date,-1)+1 preserves true chronological sorting.',
        keyTakeaway: 'Store reporting months as real Excel dates (1st of month), formatted as yyyy-mm.',
      },
    ],
    syntaxReference: [
      {
        label: 'Clean & Normalize Text',
        syntax: '=PROPER(TRIM(CLEAN(cell)))',
        usage: 'Strips non-printable characters, collapses extra spaces, and standardizes Title Case.',
      },
      {
        label: 'First Day of Month Bucket',
        syntax: '=EOMONTH(date_cell, -1) + 1',
        usage: 'Maps any date in a month to the 1st of that month for chronological Pivot grouping.',
      },
      {
        label: 'Safe Date Difference',
        syntax: '=IF(ISBLANK(end_date), "", end_date - start_date)',
        usage: 'Avoids negative huge serial numbers when end_date is missing.',
      },
    ],
    workedExample: {
      scenario:
        'Operations exported carrier names containing "ApexFreight", "apexfreight", and "swifthaul".',
      steps: [
        {
          stepTitle: '1. Create a helper column carrier_clean',
          detail: 'Normalize whitespace and case without overwriting raw audit data.',
          codeOrFormula: '=UPPER(LEFT(TRIM(C2),1)) & LOWER(MID(TRIM(C2),2,99))',
        },
        {
          stepTitle: '2. Or standardize strictly with LOWER/PROPER',
          detail: 'PROPER(TRIM(C2)) or LOWER(TRIM(C2)) guarantees identical Pivot keys.',
          codeOrFormula: '=LOWER(TRIM(C2))',
        },
        {
          stepTitle: '3. Bucket ship_date to month-start',
          detail: 'Use EOMONTH(D2, -1) + 1 so monthly freight trends sort chronologically.',
        },
      ],
      outcome:
        'Your PivotTable collapses 5 messy carrier spellings into 3 clean carrier rows.',
    },
    commonPitfalls: [
      {
        mistake: 'Using TEXT(date, "mmm-yyyy") for PivotTable axis columns',
        whyItBreaks: 'TEXT() converts dates to strings, sorting Apr before Feb before Jan.',
        fix: 'Keep numeric date values via EOMONTH() and apply custom number formatting.',
      },
      {
        mistake: 'Overwriting raw source columns in place',
        whyItBreaks: 'Destroys auditability when you need to trace an anomaly back to the raw CSV.',
        fix: 'Keep raw columns untouched and place cleaned values in dedicated staging columns.',
      },
    ],
    cheatSheet: [
      'Text cleanup: =TRIM(CLEAN(text)) + LOWER() or PROPER().',
      'Month start date: =EOMONTH(date, -1) + 1.',
      'Month end date: =EOMONTH(date, 0).',
    ],
  },
  {
    id: 'm2-l4',
    moduleId: 'mod-2',
    order: 4,
    title: 'Financial & Business Modeling (Margin, MoM & Break-Even)',
    summary:
      'Construct audit-ready unit economics, growth formulas, and sensitivity checks inside spreadsheets.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Growth & Variance Without #DIV/0!',
        explanation:
          'Month-over-Month (MoM) growth is (Current - Prior) / Prior. Whenever Prior can equal 0 or blank, wrap the ratio in IFERROR or check Prior > 0 so executive scorecards never display #DIV/0!.',
        keyTakeaway: 'Always guard denominators with IF(Prior<=0, "", (Current-Prior)/Prior).',
      },
      {
        heading: 'Contribution Margin & Break-Even Units',
        explanation:
          'Contribution Margin per Unit = Net Selling Price − Variable Unit Cost. Break-Even Units = Fixed Overhead / Contribution Margin per Unit. This formula answers "how many orders must a warehouse or product line move to cover fixed costs?"',
        keyTakeaway: 'Break-Even Volume = Fixed Costs / (Unit Price − Variable Cost per Unit).',
      },
    ],
    syntaxReference: [
      {
        label: 'MoM / YoY Growth %',
        syntax: '=IF(prior_val=0, NA(), (current_val - prior_val) / prior_val)',
        usage: 'Clean period-over-period growth rate.',
      },
      {
        label: 'Net Line Revenue',
        syntax: '=quantity * unit_price * (1 - discount_pct)',
        usage: 'Computes net revenue after promotional discount.',
      },
      {
        label: 'Net Present Value (Cash Flows)',
        syntax: '=NPV(discount_rate, cf_year1:cf_yearN) + initial_outlay_year0',
        usage: 'In Excel, NPV starts discounting at period 1—add negative Year 0 investment outside NPV().',
      },
    ],
    workedExample: {
      scenario:
        'A regional warehouse hub (HUB-S) carries $39,000 monthly overhead. Average order contribution margin after variable freight is $65 per order.',
      steps: [
        {
          stepTitle: '1. Verify fixed and variable inputs',
          detail: 'Fixed Cost = $39,000/month. Contribution Margin per Order = $65.',
        },
        {
          stepTitle: '2. Apply the break-even formula',
          detail: 'Divide monthly fixed overhead by unit contribution margin.',
          codeOrFormula: '=39000 / 65  -->  600 orders/month',
        },
        {
          stepTitle: '3. Add sensitivity check',
          detail: 'If variable freight rises by $5/order (margin drops to $60), break-even jumps to 650 orders (+8.3% volume required).',
        },
      ],
      outcome:
        'Operations sees the exact volume threshold required before HUB-S turns profitable.',
    },
    commonPitfalls: [
      {
        mistake: 'Including Year 0 initial investment inside Excel =NPV(rate, C1:C5)',
        whyItBreaks: 'Excel discounts the first argument inside NPV() by one period (1 + r)^1 instead of treating it as Today (t=0).',
        fix: 'Put Year 0 cash flow OUTSIDE: =NPV(rate, Year1:YearN) + Year0_Outflow.',
      },
      {
        mistake: 'Mixing Markup % with Gross Margin %',
        whyItBreaks: 'Cost $60 sold for $100 is 66.7% markup ($40/$60) but 40.0% gross margin ($40/$100).',
        fix: 'In business analytics, Margin % always uses Revenue in the denominator.',
      },
    ],
    cheatSheet: [
      'Growth % = (New - Old) / Old.',
      'Gross Margin % = (Net Revenue - COGS) / Net Revenue.',
      'Break-Even Units = Fixed Cost / (Unit Price - Unit Variable Cost).',
      'Excel NPV: =NPV(rate, CF1:CFn) + CF0.',
    ],
  },

  // ============================================================
  // MODULE 3: SQL FOR DATA ANALYSIS
  // ============================================================
  {
    id: 'm3-l1',
    moduleId: 'mod-3',
    order: 1,
    title: 'Relational Filtering, CASE WHEN & Null-Safe Cleaning',
    summary:
      'Write expressive WHERE clauses, normalize dirty text, handle NULL three-valued logic, and bucket metrics with CASE WHEN.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Logical Execution Order vs. Written Order',
        explanation:
          'You write SELECT ... FROM ... WHERE ..., but SQL evaluates FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT. That is why a column alias created in SELECT cannot be referenced inside WHERE.',
        keyTakeaway: 'WHERE runs before SELECT; put raw expressions or a CTE around aliases you need to filter.',
      },
      {
        heading: 'Three-Valued Logic (TRUE, FALSE, UNKNOWN)',
        explanation:
          'Comparing anything to NULL with = or != evaluates to UNKNOWN, never TRUE. Writing WHERE status != "Cancelled" silently drops rows where status IS NULL unless you explicitly allow IS NULL or wrap in COALESCE.',
        keyTakeaway: 'Use IS NULL / IS NOT NULL—never = NULL or != NULL.',
      },
      {
        heading: 'Conditional Bucketing with CASE WHEN',
        explanation:
          'CASE WHEN lets you classify rows (e.g., SLA Met vs. Breached, or Credit Utilization Tiers) and compute conditional counts inside SUM(CASE WHEN ... THEN 1 ELSE 0 END).',
        keyTakeaway: 'CASE evaluates top-to-bottom and stops at the first matching WHEN.',
      },
    ],
    syntaxReference: [
      {
        label: 'Null-Safe & Case-Normalized Filter',
        syntax: "SELECT * FROM operations_shipments WHERE LOWER(TRIM(carrier)) = 'apexfreight' AND delivery_days IS NOT NULL;",
        usage: 'Combines casing normalization with safe NULL exclusion.',
      },
      {
        label: 'Conditional Flagging',
        syntax: "CASE WHEN delivery_days > sla_target_days THEN 'Breach' ELSE 'On Time' END AS sla_flag",
        usage: 'Creates reusable classification dimensions inline.',
      },
    ],
    workedExample: {
      scenario:
        'Audit operations_shipments for completed shipments that breached SLA without accidentally misclassifying "In Transit" NULL rows.',
      steps: [
        {
          stepTitle: '1. Exclude uncompleted rows explicitly',
          detail: 'Filter WHERE delivery_days IS NOT NULL so open shipments are excluded.',
        },
        {
          stepTitle: '2. Normalize carrier name and flag breaches',
          detail: 'Use LOWER(carrier) and CASE WHEN delivery_days > sla_target_days.',
          codeOrFormula:
            "SELECT shipment_id, LOWER(carrier) AS carrier_clean, delivery_days, sla_target_days,\n  CASE WHEN delivery_days > sla_target_days THEN 'Breached' ELSE 'Met' END AS sla_status\nFROM operations_shipments\nWHERE delivery_days IS NOT NULL;",
        },
      ],
      outcome:
        'You get 18 clean rows with normalized carrier names and accurate SLA status flags.',
    },
    commonPitfalls: [
      {
        mistake: 'Using WHERE alias_name = ... in the same SELECT block',
        whyItBreaks: 'WHERE executes before SELECT projections exist.',
        fix: 'Repeat the expression in WHERE or compute it in a CTE first.',
      },
      {
        mistake: 'Writing WHERE col != "A" when NULLs are present',
        whyItBreaks: 'NULL != "A" is UNKNOWN, silently dropping NULL rows.',
        fix: 'Use COALESCE(col, "") != "A" or (col != "A" OR col IS NULL).',
      },
    ],
    cheatSheet: [
      'SQL order: FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.',
      'Always test NULLs with IS NULL / IS NOT NULL or COALESCE().',
      'Conditional count pattern: SUM(CASE WHEN cond THEN 1 ELSE 0 END).',
    ],
  },
  {
    id: 'm3-l2',
    moduleId: 'mod-3',
    order: 2,
    title: 'Multi-Table INNER vs LEFT JOIN & Fan-Out Prevention',
    summary:
      'Combine orders, customers, and products accurately while preventing duplicate rows and broken LEFT JOIN filters.',
    durationMinutes: 28,
    coreConcepts: [
      {
        heading: 'INNER JOIN vs. LEFT JOIN',
        explanation:
          'INNER JOIN returns only keys present in both tables. LEFT JOIN preserves every row from the left table and fills unmatched right columns with NULL—essential for finding customers with zero orders or hubs with zero shipments.',
        keyTakeaway: 'Use LEFT JOIN whenever losing unmatched left-table entities would bias your denominator.',
      },
      {
        heading: 'The Silent LEFT JOIN Murderer',
        explanation:
          'If you LEFT JOIN orders onto customers and then put WHERE o.status = "Completed" in the WHERE clause, NULL rows from non-ordering customers fail the check—turning your LEFT JOIN back into an INNER JOIN!',
        keyTakeaway: 'Put right-table filter conditions inside the ON clause (AND o.status = "Completed") to preserve unmatched left rows.',
      },
      {
        heading: 'Join Fan-Out Check',
        explanation:
          'Joining two one-to-many tables directly multiplies rows (e.g., 3 order items × 2 shipments = 6 rows), inflating SUM(order_total). Always verify row count before and after joining.',
        keyTakeaway: 'Aggregate child tables to the parent grain in a CTE before joining.',
      },
    ],
    syntaxReference: [
      {
        label: 'Multi-Table Retail Star Join',
        syntax:
          'SELECT o.order_id, c.segment, p.category, o.quantity * p.unit_price * (1 - o.discount_pct) AS net_rev\nFROM retail_orders o\nINNER JOIN retail_customers c ON o.customer_id = c.customer_id\nINNER JOIN retail_products p ON o.product_id = p.product_id;',
        usage: 'Joins fact table to two dimension tables cleanly.',
      },
      {
        label: 'Preserving Unmatched Left Rows',
        syntax:
          "SELECT c.customer_id, COUNT(o.order_id) AS completed_orders\nFROM retail_customers c\nLEFT JOIN retail_orders o ON c.customer_id = o.customer_id AND o.status = 'Completed'\nGROUP BY c.customer_id;",
        usage: 'Keeps customers who have 0 completed orders.',
      },
    ],
    workedExample: {
      scenario:
        'Find total Completed net revenue and gross profit by customer segment using retail_orders, retail_customers, and retail_products.',
      steps: [
        {
          stepTitle: '1. Verify join keys are unique on dimensions',
          detail: 'retail_customers is unique on customer_id (10 rows); retail_products is unique on product_id (6 rows). Zero fan-out risk.',
        },
        {
          stepTitle: '2. Join fact to both dimensions and filter Completed',
          detail: 'Compute Net Revenue and COGS per order line.',
          codeOrFormula:
            "SELECT c.segment,\n  ROUND(SUM(o.quantity * p.unit_price * (1 - o.discount_pct)), 2) AS net_revenue,\n  ROUND(SUM(o.quantity * (p.unit_price * (1 - o.discount_pct) - p.unit_cost)), 2) AS gross_profit\nFROM retail_orders o\nJOIN retail_customers c ON o.customer_id = c.customer_id\nJOIN retail_products p ON o.product_id = p.product_id\nWHERE o.status = 'Completed'\nGROUP BY c.segment\nORDER BY net_revenue DESC;",
        },
      ],
      outcome:
        'Enterprise, SMB, and Consumer segments reconcile cleanly with exact net revenue and gross profit totals.',
    },
    commonPitfalls: [
      {
        mistake: 'Filtering a LEFT JOINed table in WHERE instead of ON',
        whyItBreaks: 'Drops all unmatched left rows whose right columns are NULL.',
        fix: 'Move right-table predicates into the ON clause.',
      },
      {
        mistake: 'Joining two many-to-one tables without checking key uniqueness',
        whyItBreaks: 'Multiplies sums silently without throwing any SQL error.',
        fix: 'Check row counts before vs. after each JOIN.',
      },
    ],
    cheatSheet: [
      'LEFT JOIN + right filter in ON preserves 0-match rows; filter in WHERE converts to INNER.',
      'Check grain: Fact -> Dimension is safe; Fact -> Fact risks fan-out.',
      'Use table aliases (o, c, p) and qualify every column in multi-table queries.',
    ],
  },
  {
    id: 'm3-l3',
    moduleId: 'mod-3',
    order: 3,
    title: 'Group Aggregations, HAVING & Multi-Step WITH CTEs',
    summary:
      'Structure complex analyses into clean, readable Common Table Expressions and filter aggregated groups with HAVING.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'WHERE vs. HAVING',
        explanation:
          'WHERE filters individual input rows BEFORE grouping. HAVING filters aggregated groups AFTER GROUP BY completes (for example, keeping only customers with >= 2 orders or departments exceeding budget).',
        keyTakeaway: 'Row filter -> WHERE. Aggregate filter (COUNT, SUM, AVG) -> HAVING.',
      },
      {
        heading: 'Composing Pipelines with CTEs (WITH)',
        explanation:
          'Deeply nested subqueries are hard to debug and harder for teammates to review. Common Table Expressions (WITH step1 AS (...), step2 AS (...)) let you read analytical logic top-to-bottom like recipes.',
        keyTakeaway: 'Use one CTE per logical transformation: clean -> aggregate -> rank/compare.',
      },
    ],
    syntaxReference: [
      {
        label: 'GROUP BY + HAVING',
        syntax:
          'SELECT account_id, COUNT(*) AS txn_count, SUM(amount) AS total_spend\nFROM credit_card_transactions\nGROUP BY account_id\nHAVING COUNT(*) >= 2;',
        usage: 'Filters to active multi-transaction accounts after grouping.',
      },
      {
        label: 'Multi-Step CTE Pipeline',
        syntax:
          'WITH base AS (SELECT ...), summary AS (SELECT ... FROM base GROUP BY ...)\nSELECT * FROM summary;',
        usage: 'Avoids nested subqueries and prevents fan-out when combining metrics.',
      },
    ],
    workedExample: {
      scenario:
        'Compare each HR department actual active payroll against its approved budget using a CTE + JOIN.',
      steps: [
        {
          stepTitle: '1. Aggregate active employees by department in a CTE',
          detail: "Filter attrition = 'No' first so departed employees are excluded from active payroll.",
        },
        {
          stepTitle: '2. Join aggregated CTE to hr_department_budgets',
          detail: 'Compute budget variance (budget - actual_payroll).',
          codeOrFormula:
            "WITH active_payroll AS (\n  SELECT department, COUNT(*) AS active_headcount, SUM(annual_salary) AS total_salary\n  FROM hr_employees\n  WHERE attrition = 'No'\n  GROUP BY department\n)\nSELECT b.department, a.active_headcount, b.target_headcount, a.total_salary, b.annual_payroll_budget,\n  b.annual_payroll_budget - a.total_salary AS budget_headroom\nFROM hr_department_budgets b\nLEFT JOIN active_payroll a ON b.department = a.department\nORDER BY budget_headroom ASC;",
        },
      ],
      outcome:
        'Finance sees exact active headcount vs. target and remaining salary headroom per department.',
    },
    commonPitfalls: [
      {
        mistake: 'Including ungrouped non-aggregate columns in SELECT',
        whyItBreaks: 'Standard SQL rejects columns in SELECT that are neither in GROUP BY nor inside an aggregate.',
        fix: 'Every non-aggregated SELECT expression must appear in GROUP BY.',
      },
      {
        mistake: 'Using COUNT(*) instead of COUNT(col) when checking non-null counts',
        whyItBreaks: 'COUNT(*) counts every row including NULLs; COUNT(col) counts only non-null values.',
        fix: 'Choose COUNT(*) for row totals and COUNT(col) when NULLs should be skipped.',
      },
    ],
    cheatSheet: [
      'WHERE = before GROUP BY; HAVING = after GROUP BY.',
      'COUNT(*) counts NULLs; COUNT(col) ignores NULLs; COUNT(DISTINCT col) deduplicates.',
      'Pre-aggregate in a CTE before joining summary tables to avoid fan-out.',
    ],
  },
  {
    id: 'm3-l4',
    moduleId: 'mod-3',
    order: 4,
    title: 'Window Functions (ROW_NUMBER, RANK & Partition Shares)',
    summary:
      'Compute top-N per group, running totals, and % of category totals without collapsing individual rows.',
    durationMinutes: 30,
    coreConcepts: [
      {
        heading: 'Window Functions Keep Row Granularity',
        explanation:
          'Unlike GROUP BY, which collapses 20 rows into 4 group rows, a window function (OVER (...)) computes an aggregate or rank across related rows while preserving every individual row.',
        keyTakeaway: 'GROUP BY shrinks rows; OVER() enriches rows.',
      },
      {
        heading: 'ROW_NUMBER vs. RANK vs. DENSE_RANK',
        explanation:
          'Given ties [100, 100, 90]: ROW_NUMBER assigns 1, 2, 3 (arbitrary tie-break); RANK assigns 1, 1, 3 (skips 2); DENSE_RANK assigns 1, 1, 2 (no gaps). Use DENSE_RANK or RANK when ties represent equal merit.',
        keyTakeaway: 'Use ROW_NUMBER() for deterministic deduplication (with unique tie-breaker); use DENSE_RANK() for top-N tiers.',
      },
      {
        heading: 'Share of Partition Total',
        explanation:
          'Dividing a row metric by SUM(metric) OVER (PARTITION BY group) computes each row or sub-category’s share of its parent total in a single pass—no self-join required.',
        keyTakeaway: 'metric * 100.0 / SUM(metric) OVER (PARTITION BY parent) gives instant mix %.',
      },
    ],
    syntaxReference: [
      {
        label: 'Top-N Per Category',
        syntax:
          'WITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY department ORDER BY annual_salary DESC) AS sal_rank\n  FROM hr_employees\n)\nSELECT * FROM ranked WHERE sal_rank <= 2;',
        usage: 'Cleanest SQL pattern for "top 2 earners per department".',
      },
      {
        label: 'Running Cumulative Total',
        syntax:
          'SELECT txn_id, txn_date, amount, SUM(amount) OVER (ORDER BY txn_date, txn_id) AS running_spend\nFROM credit_card_transactions;',
        usage: 'Adding ORDER BY inside OVER() switches SUM() from partition total to running cumulative sum.',
      },
    ],
    workedExample: {
      scenario:
        'Rank employees within each department by annual_salary and calculate each employee’s % share of their department payroll.',
      steps: [
        {
          stepTitle: '1. Partition by department',
          detail: 'Both DENSE_RANK() and SUM(annual_salary) share PARTITION BY department.',
        },
        {
          stepTitle: '2. Write the window query',
          detail: 'Multiply by 100.0 to avoid integer division.',
          codeOrFormula:
            "SELECT emp_id, full_name, department, annual_salary,\n  DENSE_RANK() OVER (PARTITION BY department ORDER BY annual_salary DESC) AS dept_rank,\n  ROUND(annual_salary * 100.0 / SUM(annual_salary) OVER (PARTITION BY department), 1) AS pct_of_dept_pay\nFROM hr_employees\nWHERE attrition = 'No'\nORDER BY department, dept_rank;",
        },
      ],
      outcome:
        'Leadership sees exact within-department pay ranks and payroll concentration without writing multiple subqueries.',
    },
    commonPitfalls: [
      {
        mistake: 'Trying to filter a window function in WHERE (WHERE ROW_NUMBER() OVER (...) = 1)',
        whyItBreaks: 'Window functions execute AFTER WHERE and GROUP BY.',
        fix: 'Wrap the window query in a CTE and filter in the outer SELECT.',
      },
      {
        mistake: 'Forgetting ORDER BY tie-breakers in running totals',
        whyItBreaks: 'Non-unique dates cause peer rows to share cumulative sums unexpectedly.',
        fix: 'Include the unique primary key as the final ORDER BY tie-breaker (e.g., ORDER BY ship_date, shipment_id).',
      },
    ],
    cheatSheet: [
      'Filter window results in a CTE (never directly in WHERE).',
      'ROW_NUMBER: 1,2,3 | RANK: 1,1,3 | DENSE_RANK: 1,1,2.',
      'OVER (PARTITION BY x) = group total; OVER (PARTITION BY x ORDER BY y) = running total.',
    ],
  },

  // ============================================================
  // MODULE 4: DATA VISUALIZATION & BI STORYTELLING
  // ============================================================
  {
    id: 'm4-l1',
    moduleId: 'mod-4',
    order: 1,
    title: 'Visual Encoding & Chart Selection Matrix',
    summary:
      'Pick the highest-precision visual encoding for trends, category comparisons, distributions, and part-to-whole shares.',
    durationMinutes: 20,
    coreConcepts: [
      {
        heading: 'Cleveland & McGill Perceptual Hierarchy',
        explanation:
          'Human eyes judge position along a common scale (bar charts, line charts, dot plots) far more accurately than angles or area (pie charts, treemaps, bubble sizes). Default to bar and line charts unless a specialized encoding adds clear value.',
        keyTakeaway: 'Position on a shared axis beats area, angle, and color intensity every time.',
      },
      {
        heading: 'Intent-to-Chart Mapping',
        explanation:
          'Use Line charts for continuous time trends; Horizontal Bar charts for ranked categories with long labels; Scatter plots for 2-variable relationships (e.g., Credit Limit vs. Balance); Histograms/Boxplots for spread and outliers.',
        keyTakeaway: 'Never use a line chart across unordered nominal categories—lines imply sequence.',
      },
    ],
    syntaxReference: [
      {
        label: 'Time Trend -> Line Chart',
        syntax: 'X-axis: Chronological Date | Y-axis: Metric | <= 4 Series Lines',
        usage: 'More than 4 overlapping lines creates spaghetti—switch to small multiples.',
      },
      {
        label: 'Category Ranking -> Sorted Horizontal Bar',
        syntax: 'Y-axis: Sorted Categories (Desc) | X-axis: Metric starting strictly at 0',
        usage: 'Always start bar charts at zero; truncated bar axes exaggerate differences.',
      },
    ],
    workedExample: {
      scenario:
        'A manager asks for a 3D pie chart showing freight cost across 12 regional carriers.',
      steps: [
        {
          stepTitle: '1. Diagnose why 3D pie fails',
          detail: '12 slices create unreadable legend hopping, and 3D tilt distorts slice angles.',
        },
        {
          stepTitle: '2. Replace with Sorted Horizontal Bar + Cumulative %',
          detail: 'Sort the top 8 carriers descending and group the bottom 4 into "Other" if minor.',
        },
      ],
      outcome:
        'Stakeholders identify the top 3 cost drivers in under 3 seconds.',
    },
    commonPitfalls: [
      {
        mistake: 'Truncating a bar chart Y-axis above zero (e.g., starting at $90 to compare $95 vs $100)',
        whyItBreaks: 'Makes a 5% difference look visually like a 100% jump.',
        fix: 'Bar lengths encode magnitude from 0; only line charts may zoom with clear axis labels.',
      },
      {
        mistake: 'Dual Y-axes with arbitrary independent scales',
        whyItBreaks: 'Crossing lines look meaningful even when scales were stretched arbitrarily.',
        fix: 'Stack two synchronized charts vertically sharing the same X-axis instead.',
      },
    ],
    cheatSheet: [
      'Ranking / Comparison -> Sorted Horizontal Bar (0-baseline).',
      'Trend over Time -> Line Chart (<= 4 lines; else small multiples).',
      'Relationship -> Scatter Plot with trend/quadrant lines.',
      'Part-to-Whole -> 100% Stacked Bar (avoid >3 slices in pies).',
    ],
  },
  {
    id: 'm4-l2',
    moduleId: 'mod-4',
    order: 2,
    title: 'Star Schema Data Modeling & Filter Propagation',
    summary:
      'Structure BI models into clean Fact and Dimension tables so slicers cross-filter accurately at scale.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Fact Tables vs. Dimension Tables',
        explanation:
          'Fact tables record measurable business events (retail_orders, credit_card_transactions) with foreign keys and numeric quantities—tall and narrow. Dimension tables describe entities (retail_customers, retail_products, Date Calendar)—wide and unique on their primary key.',
        keyTakeaway: 'Slice by Dimensions (who, what, where, when); Aggregate Facts (how much, how many).',
      },
      {
        heading: 'Why Flat Tables & Bi-Directional Filters Fail',
        explanation:
          'Bi-directional cross-filtering and many-to-many joins introduce ambiguous filter paths and slow DAX queries. Maintain clean one-to-many (1:*) single-direction relationships flowing from Dimension -> Fact.',
        keyTakeaway: 'Dimensions sit at the top ("1" side) and filter Facts ("*" side) downward.',
      },
    ],
    syntaxReference: [
      {
        label: 'Star Schema Relationship Standard',
        syntax: 'Dim_Product[product_id] (1) ---> (*) Fact_Orders[product_id]',
        usage: 'Single-direction cross-filter from dimension to fact.',
      },
      {
        label: 'Dedicated Date Dimension Rule',
        syntax: 'Dim_Date[date_key] (1) ---> (*) Fact_Orders[order_date]',
        usage: 'Required for reliable MoM, YTD, and YoY time intelligence calculations.',
      },
    ],
    workedExample: {
      scenario:
        'Connect retail_orders, retail_customers, and retail_products in Power BI.',
      steps: [
        {
          stepTitle: '1. Assign roles',
          detail: 'Fact: retail_orders. Dimensions: retail_customers (PK: customer_id), retail_products (PK: product_id), plus a continuous Date table.',
        },
        {
          stepTitle: '2. Set cardinalities and direction',
          detail: '1:* single-direction from retail_customers -> retail_orders and retail_products -> retail_orders.',
        },
        {
          stepTitle: '3. Hide foreign keys on the Fact table',
          detail: 'Hide retail_orders[customer_id] and retail_orders[product_id] in Report View so users always drag fields from Dimensions.',
        },
      ],
      outcome:
        'Any slicer on Customer Segment or Product Category filters Orders cleanly without ambiguous paths.',
    },
    commonPitfalls: [
      {
        mistake: 'Turning on "Both" (bi-directional) filter direction to make a slicer work',
        whyItBreaks: 'Causes circular ambiguity once a second Fact table (e.g., Budgets) joins the model.',
        fix: 'Use explicit DAX CROSSFILTER inside a specific measure when truly needed.',
      },
      {
        mistake: 'Using auto-generated local date hierarchies instead of a Calendar table',
        whyItBreaks: 'Missing days break time-intelligence functions like SAMEPERIODLASTYEAR.',
        fix: 'Create one continuous Calendar dimension covering full min-to-max years.',
      },
    ],
    cheatSheet: [
      'Fact = events & numbers; Dimension = descriptive attributes with unique PK.',
      '1:* relationships flowing top-down (Dimension -> Fact).',
      'Always use an explicit continuous Calendar table for time intelligence.',
    ],
  },
  {
    id: 'm4-l3',
    moduleId: 'mod-4',
    order: 3,
    title: 'DAX Evaluation Context & CALCULATE Patterns',
    summary:
      'Master Filter Context, Row Context, SUMX iterators, safe DIVIDE(), and context modification via CALCULATE().',
    durationMinutes: 28,
    coreConcepts: [
      {
        heading: 'Row Context vs. Filter Context',
        explanation:
          'Filter Context is the active set of slicer/visual filters restricting rows before a measure runs (e.g., Segment = "Enterprise"). Row Context means iterating row-by-row inside a calculated column or an X-function like SUMX(Orders, qty * price).',
        keyTakeaway: 'Never aggregate columns in a calculated column without awareness; write Measures for visuals.',
      },
      {
        heading: 'SUMX + RELATED for Multi-Table Line Math',
        explanation:
          'When quantity lives on Fact_Orders and unit_price lives on Dim_Product, SUM(Fact_Orders[quantity]) * SUM(Dim_Product[unit_price]) is WRONG because it multiplies totals instead of row pairs. Use SUMX to multiply row-by-row.',
        keyTakeaway: 'Multiply price × quantity per row inside SUMX(), never SUM() × SUM().',
      },
      {
        heading: 'CALCULATE & Safe DIVIDE',
        explanation:
          'CALCULATE(expression, filter1, filter2) is the only DAX function that alters filter context—enabling Completed Revenue, All-Region Shares, and YoY growth. Always replace "/" with DIVIDE(num, denom, 0) to prevent Infinity errors.',
        keyTakeaway: 'CALCULATE modifies filter context; DIVIDE safeguards every ratio.',
      },
    ],
    syntaxReference: [
      {
        label: 'Net Revenue Measure (SUMX + RELATED)',
        syntax:
          "Net Revenue = SUMX(FILTER(retail_orders, retail_orders[status] = \"Completed\"), retail_orders[quantity] * RELATED(retail_products[unit_price]) * (1 - retail_orders[discount_pct]))",
        usage: 'Accurate row-by-row revenue evaluation across related Fact and Dimension tables.',
      },
      {
        label: 'Gross Margin % Measure',
        syntax: 'Gross Margin % = DIVIDE([Net Revenue] - [Total COGS], [Net Revenue], 0)',
        usage: 'Handles zero-revenue slices cleanly without Infinity/NaN.',
      },
      {
        label: 'Share of All Segments',
        syntax: 'Segment Share = DIVIDE([Net Revenue], CALCULATE([Net Revenue], ALL(retail_customers[segment])))',
        usage: 'Removes the segment filter in the denominator to compute % of total.',
      },
    ],
    workedExample: {
      scenario:
        'Compute Completed Order Count and Segment Revenue Share in Power BI on the Retail dataset.',
      steps: [
        {
          stepTitle: '1. Base Completed Orders measure',
          detail: 'Use CALCULATE with an explicit status filter.',
          codeOrFormula: 'Completed Orders = CALCULATE(COUNTROWS(retail_orders), retail_orders[status] = "Completed")',
        },
        {
          stepTitle: '2. Category Share measure',
          detail: 'Divide current segment Net Revenue by ALL(retail_customers[segment]) revenue.',
          codeOrFormula: 'Revenue Share % = DIVIDE([Net Revenue], CALCULATE([Net Revenue], ALL(retail_customers[segment])), 0)',
        },
      ],
      outcome:
        'Matrix visuals display exact revenue and % share per segment that dynamically recalculate under any Region or Channel slicer.',
    },
    commonPitfalls: [
      {
        mistake: 'Multiplying two SUMs: SUM(qty) * SUM(price)',
        whyItBreaks: 'Multiplies total quantity by sum of all unit prices—off by orders of magnitude.',
        fix: 'Use SUMX(fact_table, fact[qty] * RELATED(dim[price])).',
      },
      {
        mistake: 'Writing raw A / B instead of DIVIDE(A, B)',
        whyItBreaks: 'Any filtered slice with B = 0 renders "Infinity" on dashboard cards.',
        fix: 'Always use DIVIDE(numerator, denominator, 0 or BLANK()).',
      },
    ],
    cheatSheet: [
      'Measures respond dynamically to slicers; calculated columns freeze at refresh.',
      'Row-level multiplication across tables = SUMX(..., fact[qty] * RELATED(dim[price])).',
      'Always wrap division in DIVIDE(num, den, BLANK()).',
    ],
  },
  {
    id: 'm4-l4',
    moduleId: 'mod-4',
    order: 4,
    title: 'Executive Dashboard Architecture & Visual Hygiene',
    summary:
      'Organize dashboard grids using F-pattern visual hierarchy, clear variance indicators, and low cognitive clutter.',
    durationMinutes: 20,
    coreConcepts: [
      {
        heading: 'Three-Tier Z/F-Pattern Layout',
        explanation:
          'Top row: 3–4 KPI cards showing headline value + comparison delta vs. target/prior period. Middle tier: 1–2 primary diagnostic charts (trend + driver breakdown). Bottom tier: actionable detail table for drill-through.',
        keyTakeaway: 'Never show a KPI number without context (vs. Target, Prior Month, or Benchmark).',
      },
      {
        heading: 'Color With Semantic Restraint',
        explanation:
          'Reserve saturated color strictly for meaning (emerald for on-target, amber/red for alert/SLA breach, blue for primary focus). Keep backgrounds, gridlines, and non-highlighted bars neutral slate.',
        keyTakeaway: 'Gray is your most important color—it makes real anomalies pop immediately.',
      },
    ],
    syntaxReference: [
      {
        label: 'KPI Card Anatomy',
        syntax: 'Metric Title | Formatted Big Number | Delta vs. Baseline (+4.2 pp vs. Prior)',
        usage: 'Answers "How are we doing?" and "Compared to what?" at a glance.',
      },
    ],
    workedExample: {
      scenario:
        'Redesign a cluttered 12-chart Operations spreadsheet dump into a single-screen executive SLA dashboard.',
      steps: [
        {
          stepTitle: '1. Select 4 top KPIs',
          detail: 'Completed Shipments, On-Time SLA Rate %, Avg Freight Cost/Unit, Delayed Freight Spend.',
        },
        {
          stepTitle: '2. Place 2 diagnostic charts in the middle',
          detail: 'Left: SLA Delay Rate % by Carrier (sorted bar). Right: Cost per Unit by Origin Hub vs. $4.00 target line.',
        },
        {
          stepTitle: '3. Add exception table below',
          detail: 'Show only Delayed shipments sorted by highest freight_cost so managers act immediately.',
        },
      ],
      outcome:
        'Decision latency drops from 15 minutes of hunting across tabs to 30 seconds on one page.',
    },
    commonPitfalls: [
      {
        mistake: 'Cramming 10+ charts and rainbow palettes onto one canvas',
        whyItBreaks: 'Overloads working memory so stakeholders ignore the dashboard.',
        fix: 'Limit each dashboard view to 1 question, 3–4 KPIs, and 2–3 focused charts.',
      },
      {
        mistake: 'Using inconsistent decimal precision ($4,123.4567 vs 41.2%)',
        whyItBreaks: 'Clutters tables and creates false precision.',
        fix: 'Format dollars cleanly ($4,123 or $4.1K) and rates to 1 decimal place (41.2%).',
      },
    ],
    cheatSheet: [
      'Top: KPIs with baselines | Middle: Primary drivers | Bottom: Actionable exception rows.',
      'Use muted slate for context and bold accent colors strictly for focus/alerts.',
      'Align numbers right and use tabular numerals in every table.',
    ],
  },

  // ============================================================
  // MODULE 5: APPLIED BUSINESS CASE STUDIES & CAPSTONE PROJECTS
  // ============================================================
  {
    id: 'm5-l1',
    moduleId: 'mod-5',
    order: 1,
    title: 'Retail Margin & Return-Rate Diagnostic Case',
    summary:
      'Audit omnichannel retail profitability across customer segments, discount tiers, and product lines.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Gross vs. Net Revenue Leakage',
        explanation:
          'Gross list value (quantity × unit_price) overstates commercial performance whenever discounting and product returns rise. Analysts isolate both Cancelled/Returned leakage and promotional discount erosion.',
        keyTakeaway: 'Separate gross demand, discount giveback, returns, and COGS in a profitability waterfall.',
      },
    ],
    syntaxReference: [
      {
        label: 'Return + Cancel Rate %',
        syntax: "SUM(CASE WHEN status IN ('Returned','Cancelled') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)",
        usage: 'Measures order fallout across channels or SKUs.',
      },
    ],
    workedExample: {
      scenario:
        'Examine retail_orders (18 orders) joined with retail_products and retail_customers.',
      steps: [
        {
          stepTitle: '1. Audit order status mix',
          detail: '15 orders are Completed, 2 are Returned (ORD-503, ORD-511), and 1 is Cancelled (ORD-506). Fallout rate = 3/18 = 16.7%.',
        },
        {
          stepTitle: '2. Quantify Completed Net Revenue & Gross Margin',
          detail: 'Completed net revenue totals $5,340.00 against $3,058.00 COGS, yielding $2,282.00 Gross Profit (42.7% margin).',
        },
      ],
      outcome:
        'You can pinpoint which channel/segment generates the highest margin dollars rather than just top-line volume.',
    },
    commonPitfalls: [
      {
        mistake: 'Including Returned or Cancelled orders inside Completed Net Revenue',
        whyItBreaks: 'Overstates recognized revenue and distorts unit margin.',
        fix: "Filter status = 'Completed' for revenue/margin and report return rate separately.",
      },
    ],
    cheatSheet: [
      'Profitability Waterfall: Gross List -> Less Discounts -> Net Completed Revenue -> Less COGS = Gross Profit.',
      'Check discount_pct alongside margin_pct per segment to spot margin erosion.',
    ],
  },
  {
    id: 'm5-l2',
    moduleId: 'mod-5',
    order: 2,
    title: 'Operations SLA & Freight Cost Optimization Case',
    summary:
      'Evaluate carrier reliability, hub bottlenecks, and unit freight economics using operations_shipments.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Carrier Reliability vs. Cost Trade-Off',
        explanation:
          'The cheapest freight carrier is rarely optimal if late deliveries trigger SLA penalties or warehouse backlog. Compare Cost per Unit (SUM(freight_cost) / SUM(units)) right next to On-Time Rate.',
        keyTakeaway: 'Plot Cost/Unit against Delay Rate to find Pareto-dominant carriers.',
      },
    ],
    syntaxReference: [
      {
        label: 'Carrier Cost per Unit & Delay Rate',
        syntax:
          "SELECT LOWER(TRIM(carrier)) AS carrier, COUNT(*) AS completed, SUM(CASE WHEN status='Delayed' THEN 1 ELSE 0 END) AS delayed_cnt, ROUND(SUM(freight_cost)/SUM(units), 2) AS cost_per_unit FROM operations_shipments WHERE delivery_days IS NOT NULL GROUP BY LOWER(TRIM(carrier));",
        usage: 'Cleanly benchmarks carrier cost efficiency and SLA reliability.',
      },
    ],
    workedExample: {
      scenario:
        'Evaluate the 18 completed/delayed shipments in operations_shipments (excluding the 2 In Transit shipments).',
      steps: [
        {
          stepTitle: '1. Normalize carrier names',
          detail: 'Merge "apexfreight" into "ApexFreight" and "swifthaul" into "SwiftHaul".',
        },
        {
          stepTitle: '2. Benchmark delay rates',
          detail: '6 of 18 completed shipments are Delayed (33.3% overall breach rate), costing $2,900 in delayed freight.',
        },
      ],
      outcome:
        'Operations gains exact carrier and hub targets to cut SLA breaches.',
    },
    commonPitfalls: [
      {
        mistake: 'Including In Transit rows in the SLA denominator before they deliver',
        whyItBreaks: 'Artificially lowers the delay rate by inflating the denominator with open shipments.',
        fix: 'Evaluate SLA only on closed deliveries (status IN ("Delivered", "Delayed")).',
      },
    ],
    cheatSheet: [
      'Exclude In Transit rows when computing completed transit days and SLA %.',
      'Always evaluate Cost/Unit alongside SLA Delay Rate %.',
    ],
  },
  {
    id: 'm5-l3',
    moduleId: 'mod-5',
    order: 3,
    title: 'Credit Card Risk, Utilization & Fraud Triage Case',
    summary:
      'Analyze credit utilization, delinquency exposure, authorization decline rates, and international fraud flags.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Credit Utilization & Delinquency Exposure',
        explanation:
          'Credit Utilization = current_balance / credit_limit. Accounts crossing 75%+ utilization often exhibit elevated delinquency and transaction declines, threatening credit loss reserves.',
        keyTakeaway: 'Join cardholder_accounts with transaction statuses to tie risk tiers to spend loss.',
      },
      {
        heading: 'Interchange Revenue vs. Fraud Exposure',
        explanation:
          'Approved transactions generate interchange_fee revenue, whereas Declined and Flagged events generate $0 interchange and signal either credit distress or cross-border fraud risk.',
        keyTakeaway: 'Segment international vs. domestic transactions by status to isolate false-positive vs. fraud patterns.',
      },
    ],
    syntaxReference: [
      {
        label: 'Account Utilization %',
        syntax: 'ROUND(current_balance * 100.0 / credit_limit, 1) AS utilization_pct',
        usage: 'Identifies high-risk revolving accounts near credit exhaustion.',
      },
    ],
    workedExample: {
      scenario:
        'Audit cardholder_accounts (8 accounts) and credit_card_transactions (16 transactions).',
      steps: [
        {
          stepTitle: '1. Flag high-utilization accounts (>= 75%)',
          detail: 'ACC-103 ($3,200/$4,000 = 80.0%, 35 DPD) and ACC-105 ($2,700/$3,000 = 90.0%, 62 DPD) are both delinquent.',
        },
        {
          stepTitle: '2. Inspect Flagged international spend',
          detail: 'Both Flagged transactions (TXN-903 $890, TXN-909 $2,100) have is_international = 1—totaling $2,990 in blocked cross-border volume.',
        },
      ],
      outcome:
        'Risk teams receive clear high-utilization watchlists and cross-border rule thresholds.',
    },
    commonPitfalls: [
      {
        mistake: 'Summing transaction amount across Approved + Declined + Flagged without filtering',
        whyItBreaks: 'Overstates settled card volume and confuses attempted spend with booked volume.',
        fix: "Filter status = 'Approved' for settled volume and interchange revenue.",
      },
    ],
    cheatSheet: [
      'Utilization = current_balance / credit_limit.',
      'Separate Approved (revenue-bearing) vs. Declined/Flagged (risk/friction) spend.',
    ],
  },
  {
    id: 'm5-l4',
    moduleId: 'mod-5',
    order: 4,
    title: 'Workforce Attrition & Compensation Equity Case',
    summary:
      'Diagnose turnover drivers, overtime burn, tenure vulnerability, and department budget variances in HR.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Segmented Attrition Rates',
        explanation:
          'Headline company turnover hides where talent actually leaves. Cutting attrition by Overtime (Yes/No), Department, and Role Level isolates whether departures reflect burnout, early-tenure onboarding gaps, or pay compression.',
        keyTakeaway: 'Cross-tabulate attrition by overtime and tenure band to find actionable levers.',
      },
    ],
    syntaxReference: [
      {
        label: 'Segmented Attrition Rate',
        syntax:
          "SELECT overtime, COUNT(*) AS headcount, SUM(CASE WHEN attrition='Yes' THEN 1 ELSE 0 END) AS departures, ROUND(SUM(CASE WHEN attrition='Yes' THEN 1 ELSE 0 END)*100.0/COUNT(*), 1) AS attrition_pct FROM hr_employees GROUP BY overtime;",
        usage: 'Exposes overtime correlation cleanly.',
      },
    ],
    workedExample: {
      scenario:
        'Investigate the 16 records in hr_employees against hr_department_budgets.',
      steps: [
        {
          stepTitle: '1. Measure overall and overtime attrition',
          detail: '5 of 16 employees left (31.25% overall). Among the 6 overtime workers, 5 left (83.3%); among 10 non-overtime workers, 0 left (0.0%).',
        },
        {
          stepTitle: '2. Check active payroll vs. budget',
          detail: 'Active Engineering payroll ($588,000 across 5 active engineers) leaves $62,000 headroom vs. its $650,000 budget.',
        },
      ],
      outcome:
        'People Ops gets an immediate retention target—rebalancing overtime workloads in Sales and Operations.',
    },
    commonPitfalls: [
      {
        mistake: 'Including already-departed employees in current active payroll cost',
        whyItBreaks: 'Overstates current run-rate payroll against department budgets.',
        fix: "Filter attrition = 'No' when auditing current active headcount and budget headroom.",
      },
    ],
    cheatSheet: [
      'Always filter attrition = "No" for active headcount and payroll budgets.',
      'Compare attrition rates across cohorts (overtime, tenure, level) rather than raw departure counts alone.',
    ],
  },

  // ============================================================
  // MODULE 6: INTERVIEW PREP & SCENARIO-BASED MOCK TESTS
  // ============================================================
  {
    id: 'm6-l1',
    moduleId: 'mod-6',
    order: 1,
    title: 'SQL Live Coding & Debugging Patterns',
    summary:
      'Spot the 5 classic SQL interview traps—integer division, LEFT JOIN WHERE filters, NULLs in NOT IN, and duplicate ranks.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'Top 4 Interview SQL Traps',
        explanation:
          '1) Integer division: 3 / 4 evaluates to 0 in PostgreSQL/SQLite unless multiplied by 1.0 or CAST to FLOAT. 2) NOT IN (subquery with NULL) returns 0 rows because x != NULL is UNKNOWN—use NOT EXISTS instead. 3) Filtering a LEFT JOIN right table in WHERE turns it into INNER JOIN. 4) ROW_NUMBER() drops tied 2nd-place winners when prompt asks for "top 2 salaries" (use DENSE_RANK()).',
        keyTakeaway: 'Narrate edge cases (NULLs, ties, zero denominators) out loud during live coding.',
      },
    ],
    syntaxReference: [
      {
        label: 'Safe Ratio & Zero Guard',
        syntax: 'ROUND(numerator * 100.0 / NULLIF(denominator, 0), 1)',
        usage: 'Prevents both integer truncation and divide-by-zero crashes.',
      },
      {
        label: 'Anti-Join Safe Against NULLs',
        syntax: 'SELECT c.* FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);',
        usage: 'Never fails when subqueries contain NULL keys (unlike NOT IN).',
      },
    ],
    workedExample: {
      scenario:
        'Interview prompt: "This query returns 0 rows when finding customers who never ordered, even though 3 customers have no orders. Fix it."',
      steps: [
        {
          stepTitle: '1. Inspect the buggy query',
          detail: 'SELECT * FROM retail_customers WHERE customer_id NOT IN (SELECT customer_id FROM retail_orders); — suppose one test order has customer_id IS NULL.',
        },
        {
          stepTitle: '2. Explain why NOT IN fails',
          detail: 'x NOT IN (1, 2, NULL) expands to x != 1 AND x != 2 AND x != NULL -> UNKNOWN for every row.',
        },
        {
          stepTitle: '3. Rewrite with LEFT JOIN ... IS NULL or NOT EXISTS',
          detail: 'LEFT JOIN retail_orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL.',
        },
      ],
      outcome:
        'You fix the bug in 30 seconds and explain three-valued NULL logic clearly to the interviewer.',
    },
    commonPitfalls: [
      {
        mistake: 'Jumping straight to typing SQL without confirming output grain and edge cases',
        whyItBreaks: 'Misunderstanding "top 2 per group with ties" vs "exactly 2 rows" costs interview points.',
        fix: 'Spend 45 seconds confirming: grain of output, NULL handling, tie-breaking, and sort order.',
      },
    ],
    cheatSheet: [
      'Always use 100.0 * num / NULLIF(den, 0) for SQL percentages.',
      'Prefer NOT EXISTS or LEFT JOIN ... IS NULL over NOT IN.',
      'Clarify ties: ROW_NUMBER (strict count) vs. DENSE_RANK (tie-inclusive).',
    ],
  },
  {
    id: 'm6-l2',
    moduleId: 'mod-6',
    order: 2,
    title: 'Product & Business Case Sizing Frameworks',
    summary:
      'Break down open-ended market sizing, funnel sizing, and experiment lift prompts with structured arithmetic.',
    durationMinutes: 22,
    coreConcepts: [
      {
        heading: 'Funnel & Impact Sizing Structure',
        explanation:
          'Interviewers test whether you think in structured trees: Traffic × Conversion Rate × AOV × Gross Margin %. State your assumptions explicitly, use round numbers for mental math, and sensitivity-check the most uncertain rate.',
        keyTakeaway: 'Clear assumptions + clean funnel math > memorizing obscure facts.',
      },
    ],
    syntaxReference: [
      {
        label: 'E-Commerce Funnel Impact Equation',
        syntax: 'Incremental Profit = Monthly Sessions * Funnel Lift (pp) * AOV * Gross Margin %',
        usage: 'Sizes the dollar value of a checkout or product fix in interviews.',
      },
    ],
    workedExample: {
      scenario:
        'Prompt: "Our checkout page gets 100,000 sessions/month with a 3.0% conversion rate, $120 AOV, and 40% gross margin. How much annual gross profit does a +0.5 pp conversion lift generate?"',
      steps: [
        {
          stepTitle: '1. Monthly incremental orders',
          detail: '100,000 × 0.5% (0.005) = 500 incremental orders/month.',
        },
        {
          stepTitle: '2. Monthly incremental gross profit',
          detail: '500 orders × $120 AOV × 40% margin = 500 × $48 = $24,000/month.',
        },
        {
          stepTitle: '3. Annualize cleanly',
          detail: '$24,000 × 12 months = $288,000/year incremental gross profit.',
        },
      ],
      outcome:
        'You walk the interviewer smoothly from sessions -> orders -> revenue -> gross profit in 60 seconds.',
    },
    commonPitfalls: [
      {
        mistake: 'Quoting gross revenue lift as pure profit impact',
        whyItBreaks: 'Forgetting COGS/margin overstates bottom-line impact by 2×–3×.',
        fix: 'Always ask or multiply by Gross Margin % when estimating business ROI.',
      },
    ],
    cheatSheet: [
      'Write the equation first, plug clean numbers second.',
      'Distinguish Revenue Impact from Gross Profit Impact (Revenue × Margin %).',
    ],
  },
  {
    id: 'm6-l3',
    moduleId: 'mod-6',
    order: 3,
    title: 'Metric Drop Root-Cause Investigation Playbook',
    summary:
      'Diagnose sudden KPI drops systematically using the 5-layer checklist: Data -> External -> Seasonality -> Segment -> Funnel.',
    durationMinutes: 25,
    coreConcepts: [
      {
        heading: 'The 5-Layer Diagnostic Sequence',
        explanation:
          'Never guess a single cause first ("maybe competitors ran a promo"). Always rule out measurement issues before business shifts: (1) Logging/ETL/Metric definition bug, (2) Calendar/Seasonality/Holidays, (3) External shocks/Outages, (4) Mix shift or isolated segment (browser, mobile app, region, carrier), (5) Upstream/downstream funnel shift.',
        keyTakeaway: 'Rule out data bugs and calendar shifts first; then isolate which segment moved.',
      },
    ],
    syntaxReference: [
      {
        label: 'Mix-Shift vs. Rate-Change Check',
        syntax: 'Total Rate = SUM(Segment Share * Segment Rate)',
        usage: 'Simpson’s Paradox happens when every segment improves or stays flat, yet overall average drops because low-converting traffic surged.',
      },
    ],
    workedExample: {
      scenario:
        'Prompt: "Our overall Retail Net Margin % dropped 4.0 percentage points week-over-week. How do you investigate?"',
      steps: [
        {
          stepTitle: '1. Verify data integrity',
          detail: 'Check row counts, duplicate order IDs, NULL product costs, or promo discount_pct ingestion errors.',
        },
        {
          stepTitle: '2. Slice by channel, category, and segment',
          detail: 'Did Mobile App shift from high-margin Accessories (50% margin) toward lower-margin Hardware (40% margin)? Or did discount_pct jump on one promo?',
        },
        {
          stepTitle: '3. Check returns/cancellations timing',
          detail: 'Verify whether a batch of delayed returns posted in the current week.',
        },
      ],
      outcome:
        'You separate logging artifacts, mix shifts, and true unit-margin erosion methodically.',
    },
    commonPitfalls: [
      {
        mistake: 'Ignoring Simpson’s Paradox (traffic mix shift)',
        whyItBreaks: 'Blaming checkout UX when a surge of low-intent paid social traffic diluted overall conversion.',
        fix: 'Inspect segment volumes alongside segment rates.',
      },
    ],
    cheatSheet: [
      'Order of diagnosis: 1) Data/ETL -> 2) Seasonality -> 3) External -> 4) Segment/Mix Shift -> 5) Funnel Step.',
      'Always check both Volume Share and Rate per segment (Simpson’s Paradox).',
    ],
  },
  {
    id: 'm6-l4',
    moduleId: 'mod-6',
    order: 4,
    title: 'Behavioral STAR Stories & Stakeholder Pushback',
    summary:
      'Present analytical wins cleanly using STAR-I (Situation, Task, Action, Result, Impact) and navigate scope creep tactfully.',
    durationMinutes: 18,
    coreConcepts: [
      {
        heading: 'Analytical STAR-I Storytelling',
        explanation:
          'Keep Situation/Task under 20% of your answer. Spend 60% on Action (how you diagnosed the metric, caught a data flaw, or built the SQL/BI solution) and 20% on quantified Result/Impact (hours saved, margin protected, decision changed).',
        keyTakeaway: 'Focus on YOUR analytical judgment and quantified outcome, not team background.',
      },
      {
        heading: 'Handling "Just Pull Me This Data" Requests',
        explanation:
          'When an executive demands an unvalidated data dump immediately, never simply say "no." Acknowledge the urgency, clarify the underlying decision, offer a quick directional figure with caveats, and schedule the clean validated cut.',
        keyTakeaway: 'Align on the decision first; offer fast directional clarity while protecting data integrity.',
      },
    ],
    syntaxReference: [
      {
        label: 'Stakeholder Trade-Off Script',
        syntax:
          '"To make sure I pull the exact cut you need for [Decision], should we include [Edge Case]? I can share a directional view by [Time] and full QA-verified numbers by [Time]."',
        usage: 'Turns ad-hoc data pulls into strategic analytical partnerships.',
      },
    ],
    workedExample: {
      scenario:
        'Prompt: "Tell me about a time a stakeholder disagreed with your numbers."',
      steps: [
        {
          stepTitle: '1. Situation & Task',
          detail: 'Sales VP saw $6,100 gross list value in a raw export while my BI dashboard showed $5,340 net completed revenue.',
        },
        {
          stepTitle: '2. Action',
          detail: 'Reconciled row-by-row in 10 minutes: raw export included 2 Returned orders and 1 Cancelled order plus unapplied discounts.',
        },
        {
          stepTitle: '3. Result & Impact',
          detail: 'Added an explicit "Gross Demand vs. Completed Net Revenue" bridge to the dashboard, eliminating weekly reconciliation disputes.',
        },
      ],
      outcome:
        'Demonstrates calm troubleshooting, empathy for the stakeholder’s view, and lasting process improvement.',
    },
    commonPitfalls: [
      {
        mistake: 'Being defensive when numbers differ from a stakeholder’s spreadsheet',
        whyItBreaks: 'Usually both numbers come from different valid definitions (gross vs. net, booked vs. shipped).',
        fix: 'Treat discrepancies as definition alignment—reconcile the exact bridge together.',
      },
    ],
    cheatSheet: [
      'STAR timing: 20% Situation/Task, 60% Analytical Action, 20% Quantified Impact.',
      'Reconcile number disputes with a clear bridge (Gross -> Exclusions -> Net).',
    ],
  },
];

export function getModuleById(id: string): LmsModule | undefined {
  return LMS_MODULES.find((m) => m.id === id);
}

export function getLessonsForModule(moduleId: string): LmsLesson[] {
  return LMS_LESSONS.filter((l) => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string): LmsLesson | undefined {
  return LMS_LESSONS.find((l) => l.id === id);
}
