import { EMBEDDED_DATASETS } from './embeddedDatasets';
import {
  OpenEndedTask,
  RubricCriterion,
} from '../types/academy';
import { evaluatePracticeAnswer } from '../utils/practiceAnswerChecker';
import { simulatePythonCode } from '../utils/pythonSimulatorEngine';
import { executeSqlQuery } from '../utils/sqlSandboxEngine';

export const OPEN_ENDED_DEFAULT_RUBRIC: RubricCriterion[] = [
  {
    id: 'rubric-correctness',
    label: 'Correctness & Metric Logic',
    weightPercent: 40,
    description: 'Uses accurate formulas, numerators/denominators, filters, and reconciles with source data.',
  },
  {
    id: 'rubric-edge',
    label: 'Edge-Case & Grain Handling',
    weightPercent: 25,
    description: 'Accounts for NULLs, duplicate/fan-out grain, casing drift, cancelled/returned exclusions, or sample limits.',
  },
  {
    id: 'rubric-tech',
    label: 'Technical Implementation',
    weightPercent: 15,
    description: 'Clean SQL/Python/Excel/DAX syntax with safe functions (DIVIDE, LOWER, LEFT JOIN ON, notna).',
  },
  {
    id: 'rubric-clarity',
    label: 'Clarity & Structure',
    weightPercent: 10,
    description: 'Follows the requested format cleanly (Answer-First, explicit assumptions, concise bullets).',
  },
  {
    id: 'rubric-action',
    label: 'Actionability & Trade-offs',
    weightPercent: 10,
    description: 'States a concrete business decision, next step, or operational trade-off rather than raw numbers alone.',
  },
];

export const OPEN_ENDED_TASKS: OpenEndedTask[] = [
  {
    id: 'oe-m1-kpi-grain',
    moduleId: 'mod-1',
    labId: 'lab-operations',
    taskType: 'kpi_definition',
    title: 'Define Carrier SLA KPI & Row Grain Contract',
    prompt:
      'Operations leadership asks: "Give us one KPI to hold carriers accountable this quarter." Define the exact KPI formula (numerator, denominator, inclusion/exclusion rules), identify the grain of operations_shipments, and state one guardrail metric so carriers cannot game SLA speed.',
    contextData:
      'Table: operations_shipments (20 rows; 12 Delivered, 6 Delayed, 2 In Transit with delivery_days = NULL; carrier contains mixed casing like "ApexFreight" and "apexfreight").',
    datasetId: 'ds-operations',
    requiredResponseFormat:
      '3 short labeled parts: (1) Row Grain, (2) KPI Formula + Exclusions, (3) Guardrail Metric.',
    recommendedLength: '4–7 lines (80–150 words)',
    hint: 'One row = one shipment dispatch (shipment_id). Exclude "In Transit" (NULL delivery_days) from completed SLA rate, normalize carrier casing, and pair speed with Freight Cost per Unit.',
    rubric: OPEN_ENDED_DEFAULT_RUBRIC,
    validationRule: {
      requiredKeywordGroups: [
        ['shipment', 'grain', 'shipment_id'],
        ['in transit', 'null', 'completed', 'exclude'],
        ['cost', 'freight', 'guardrail', 'damage'],
      ],
      nudge: 'Explicitly cover (1) shipment-level grain, (2) excluding In Transit/NULL rows from the denominator, and (3) a cost or quality guardrail.',
    },
    referenceAnswer:
      '1) Row Grain: 1 row = 1 individual shipment dispatch (shipment_id).\n2) Primary KPI (On-Time SLA Rate): COUNT(completed shipments where delivery_days <= sla_target_days) / COUNT(completed shipments where delivery_days IS NOT NULL), normalized by LOWER(TRIM(carrier)). Exclude "In Transit" rows because delivery is pending.\n3) Guardrail Metric: Freight Cost per Unit (SUM(freight_cost) / SUM(units)) so carriers do not expedite late orders at excessive freight cost.',
    explanation:
      'Strong KPI contracts prevent denominator gaming (treating pending shipments as on-time or splitting/inflating freight cost to meet speed SLAs).',
  },
  {
    id: 'oe-m2-excel-debug',
    moduleId: 'mod-2',
    labId: 'lab-operations',
    taskType: 'debug_query_formula',
    title: 'Debug Broken Excel SUMIFS & Lookup Workbook',
    prompt:
      'A junior analyst wrote `=SUMIFS(B2:B21, "HUB-W", I2:I21, "Delayed", H2:H20)` to calculate Delayed freight spend for HUB-W and `=VLOOKUP(B2, Hubs!A2:C5, 3)` to pull Region. Identify TWO distinct bugs in these formulas and write the corrected formulas.',
    contextData:
      'operations_shipments sheet: Hub ID in B2:B21, Freight Cost in H2:H21, Status in I2:I21. Hubs sheet: hub_id in A2:A5, region in C2:C5.',
    datasetId: 'ds-operations',
    requiredResponseFormat:
      'Bullet the bugs you found + provide corrected SUMIFS and XLOOKUP (or INDEX/MATCH) formulas.',
    recommendedLength: '4–6 lines',
    hint: 'Check argument order and mismatched row bounds ($H$2:$H$21 vs H2:H20) in SUMIFS, plus exact-match mode (FALSE/0) and range locking ($) in the lookup.',
    rubric: OPEN_ENDED_DEFAULT_RUBRIC,
    validationRule: {
      requiredKeywordGroups: [
        ['sum_range', 'first', 'order', 'h2:h21', '$h$2:$h$21', 'mismatch', 'height', 'h2:h20'],
        ['sumifs'],
        ['xlookup', 'index', 'false', ', 0', ',0'],
      ],
      nudge: 'Identify both the SUMIFS range-order/height mismatch and the VLOOKUP missing exact-match/unlocked-range bug, then write corrected formulas.',
    },
    referenceAnswer:
      'Bugs: (1) SUMIFS placed sum_range last instead of FIRST and used mismatched height H2:H20 vs B2:B21 (#VALUE! error); (2) VLOOKUP omitted FALSE (defaulting to approximate match) and forgot $ locks.\nCorrected SUMIFS: =SUMIFS($H$2:$H$21, $B$2:$B$21, "HUB-W", $I$2:$I$21, "Delayed") -> $1,400.\nCorrected Lookup: =XLOOKUP(B2, Hubs!$A$2:$A$5, Hubs!$C$2:$C$5, "Unknown").',
    explanation:
      'Debugging mismatched SUMIFS array dimensions and approximate VLOOKUP defaults prevents silent #VALUE! and wrong-match errors in live finance workbooks.',
  },
  {
    id: 'oe-m3-sql-revenue',
    moduleId: 'mod-3',
    labId: 'lab-retail',
    taskType: 'sql_from_question',
    title: 'Write & Run SQL: Category Margin Ranking',
    prompt:
      'Commercial Finance asks: "Show each product category’s Completed orders count, Net Revenue, and Gross Profit, ranked from highest Gross Profit to lowest." Write a complete SQL query against `retail_orders` and `retail_products` that returns those exact columns.',
    contextData:
      'Tables: retail_orders (order_id, product_id, quantity, discount_pct, status), retail_products (product_id, category, unit_price, unit_cost). Include only status = \'Completed\'.',
    datasetId: 'ds-retail',
    requiredResponseFormat:
      'Executable SQL SELECT query returning category, completed_orders, net_revenue, gross_profit.',
    recommendedLength: '6–10 lines of SQL',
    hint: 'Join retail_orders o to retail_products p on o.product_id = p.product_id, filter WHERE o.status = "Completed", GROUP BY p.category, and ORDER BY gross_profit DESC.',
    rubric: OPEN_ENDED_DEFAULT_RUBRIC,
    expectedSqlColumns: ['category', 'gross_profit'],
    expectedSqlMinRows: 4,
    validationRule: {
      requiredKeywordGroups: [
        ['select'],
        ['join'],
        ['completed'],
        ['group by'],
      ],
      nudge: 'Write an executable SQL query joining retail_orders and retail_products, filtering status = \'Completed\', grouping by category, and aliasing gross_profit.',
    },
    referenceAnswer:
      "SELECT p.category,\n  COUNT(*) AS completed_orders,\n  ROUND(SUM(o.quantity * p.unit_price * (1 - o.discount_pct)), 2) AS net_revenue,\n  ROUND(SUM(o.quantity * (p.unit_price * (1 - o.discount_pct) - p.unit_cost)), 2) AS gross_profit\nFROM retail_orders o\nINNER JOIN retail_products p ON o.product_id = p.product_id\nWHERE o.status = 'Completed'\nGROUP BY p.category\nORDER BY gross_profit DESC;",
    explanation:
      'Returns 4 categories led by Hardware ($900 gross_profit) and Accessories ($864 gross_profit), excluding Returned and Cancelled rows cleanly.',
  },
  {
    id: 'oe-py-carrier-clean',
    moduleId: 'mod-python',
    labId: 'lab-python',
    taskType: 'python_transformation',
    title: 'Python Pipeline: Clean Carriers & Summarize Completed Spend',
    prompt:
      'Write a constrained pandas script loading `operations_shipments.csv` that: (1) filters out NULL `delivery_days` rows, (2) normalizes `carrier` with `.str.strip().str.lower()`, and (3) produces a grouped summary of total `freight_cost` and `units` per cleaned carrier.',
    contextData:
      'Dataset file: operations_shipments.csv (columns include carrier, delivery_days, units, freight_cost).',
    datasetId: 'ds-operations',
    requiredResponseFormat:
      'Python/pandas code runnable in the Constrained Python & pandas Simulator.',
    recommendedLength: '5–8 lines of Python',
    hint: 'Use df[df["delivery_days"].notna()].copy(), assign carrier_clean, then call .groupby("carrier_clean").agg({"freight_cost": "sum", "units": "sum"}).reset_index().',
    rubric: OPEN_ENDED_DEFAULT_RUBRIC,
    validationRule: {
      requiredKeywordGroups: [
        ['read_csv'],
        ['notna'],
        ['lower'],
        ['groupby'],
      ],
      nudge: 'Load operations_shipments.csv, filter delivery_days.notna(), normalize carrier with .str.lower(), and aggregate with groupby().',
    },
    referenceAnswer:
      "import pandas as pd\ndf = pd.read_csv('operations_shipments.csv')\ncomp = df[df['delivery_days'].notna()].copy()\ncomp['carrier_clean'] = comp['carrier'].str.strip().str.lower()\ncomp.groupby('carrier_clean').agg({'freight_cost': 'sum', 'units': 'sum'}).reset_index()",
    explanation:
      'Produces 3 clean carrier groups (apexfreight: $3,755 / 1,015 units; swifthaul: $2,530 / 695 units; northstar: $2,015 / 550 units) with zero In Transit leakage.',
  },
  {
    id: 'oe-st-ab-risk',
    moduleId: 'mod-stats',
    labId: 'lab-statistics',
    taskType: 'statistical_interpretation',
    title: 'Statistical Interpretation: Small-Sample Risk & Base-Rate Trap',
    prompt:
      'A manager reviews `credit_card_transactions` (n=16): "Both Flagged transactions (2/2 = 100%) were international, so let’s automatically decline every international card swipe." Critique this conclusion by stating: (1) the conditional probability error, (2) what the data actually supports vs. does NOT support, and (3) a safer risk rule.',
    contextData:
      'credit_card_transactions: 16 total rows. 5 international rows: 2 Flagged ($890, $2,100), 1 Declined ($740), and 2 Approved Platinum Travel ($1,250, $980 = $2,230 legit spend).',
    datasetId: 'ds-banking',
    requiredResponseFormat:
      '3 structured paragraphs or bullets: Conditional Probability Flaw, Justified vs. Unsupported Claims, Safer Decision.',
    recommendedLength: '5–8 sentences (90–160 words)',
    hint: 'Distinguish P(International | Flagged) = 100% from P(Flagged | International) = 40% (2/5), note n=2 is too small for causal rules, and protect $2,230 in legitimate Platinum international travel.',
    rubric: OPEN_ENDED_DEFAULT_RUBRIC,
    validationRule: {
      requiredKeywordGroups: [
        ['conditional', 'denominator', 'p(', '40%', '2/5', '2 of 5', 'false positive', 'base rate'],
        ['approved', 'platinum', '2,230', '2230', 'legitimate', 'small sample', 'caus'],
        ['step-up', '2fa', 'verify', 'alert', 'threshold', 'review'],
      ],
      nudge: 'Contrast P(Intl|Flagged) vs P(Flagged|Intl), cite the $2,230 legitimate Approved international travel or small n=2 sample, and propose a step-up verification rule.',
    },
    referenceAnswer:
      '1) Probability Flaw: Confuses P(International | Flagged) = 100% (2/2) with P(Flagged | International) = 40% (2/5). Blocking all international swipes ignores that 40% of international rows ($2,230) were valid Approved Platinum travel.\n2) Scope of Evidence: With only n=2 flagged events in an observational table, we CANNOT claim international status causes fraud. We CAN say high-dollar cross-border Electronics/Travel events warrant extra scrutiny.\n3) Safer Decision: Trigger low-friction 2FA / SMS step-up verification on international transactions above $750 for non-travel history rather than blanket declines.',
    explanation:
      'Separating conditional directions and weighing false-positive cost protects revenue while managing fraud risk.',
  },
  {
    id: 'oe-bi-chart-dax',
    moduleId: 'mod-4',
    labId: 'lab-retail',
    taskType: 'chart_defense',
    title: 'Defend Chart Choice & Write Star-Schema DAX Share Measure',
    prompt:
      'Part A (Chart Defense): A stakeholder wants a 3D Pie Chart comparing Net Revenue across 6 products (`retail_products`) and a truncated bar chart starting at $2,000 for Customer Segments. Explain why both hurt readability and name better alternatives.\nPart B (DAX Modeling): Write the DAX measure `[Segment Revenue Share %]` using `DIVIDE` and `CALCULATE(..., ALL(...))`.',
    contextData:
      'Star schema: Fact `retail_orders` connected 1:* single-direction from `retail_customers` and `retail_products`.',
    datasetId: 'ds-retail',
    requiredResponseFormat:
      'Part A: Chart critique + replacements. Part B: DAX formula.',
    recommendedLength: '5–8 lines',
    hint: 'Sorted horizontal bar charts with a zero baseline outperform 3D pies and truncated bars. In DAX, divide [Net Revenue] by CALCULATE([Net Revenue], ALL(retail_customers[segment])).',
    rubric: OPEN_ENDED_DEFAULT_RUBRIC,
    validationRule: {
      requiredKeywordGroups: [
        ['bar', 'zero', 'baseline', 'angle', 'distort', '3d'],
        ['divide'],
        ['calculate'],
        ['all'],
      ],
      nudge: 'Critique 3D pie distortion + zero-baseline rule for bars, and write DAX combining DIVIDE, CALCULATE, and ALL.',
    },
    referenceAnswer:
      'Part A: 3D perspective distorts slice areas and makes 6 product comparisons slow; use a Sorted Horizontal Bar Chart starting at $0. Truncating bar baselines above $0 exaggerates small segment differences; bars must always start at 0.\nPart B: Segment Revenue Share % = DIVIDE([Net Revenue], CALCULATE([Net Revenue], ALL(retail_customers[segment])), 0)',
    explanation:
      'Visual honesty and filter-context mastery ensure executives read proportions accurately across slicers.',
  },
  {
    id: 'oe-case-data-risks',
    moduleId: 'mod-5',
    labId: 'lab-banking',
    taskType: 'interpret_result_table',
    title: 'Interpret Banking Table & Identify Data Quality Risks',
    prompt:
      'Review this summary from `cardholder_accounts` & `credit_card_transactions`: Platinum (4 Approved txns = $2,615, 0 DPD), Gold (4 Approved txns = $1,570, ACC-107 at 15 DPD & 55% util), Standard (4 Approved txns = $480, ACC-103 at 80% util & 35 DPD, ACC-105 at 90% util & 62 DPD). Summarize 2 actionable risk insights AND list 2 data quality / analytical risks if someone summed raw `amount` directly.',
    contextData:
      'credit_card_transactions includes Approved, Declined ($2,160), and Flagged ($2,990) statuses alongside cardholder_accounts.',
    datasetId: 'ds-banking',
    requiredResponseFormat:
      'Two labeled lists: (A) Key Insights, (B) Data Quality / Analytical Risks.',
    recommendedLength: '6–8 concise bullets/lines',
    hint: 'Insights: Platinum drives 56% of approved spend with 0 delinquency; Standard carries acute credit risk (ACC-103/105 at 80–90% util & 35–62 DPD). Risks: summing Declined/Flagged rows as settled spend, and join fan-out if summing credit_limit across transaction rows!',
    rubric: OPEN_ENDED_DEFAULT_RUBRIC,
    validationRule: {
      requiredKeywordGroups: [
        ['platinum', '2,615', '2615', 'acc-105', 'acc-103', 'standard', 'delinquen'],
        ['declined', 'flagged', 'settled', 'approved'],
        ['fan-out', 'fan out', 'duplicate', 'credit_limit', 'grain', 'small'],
      ],
      nudge: 'Cover both tier risk insights AND analytical pitfalls (including Declined/Flagged amounts vs settled spend, plus join fan-out if aggregating account credit_limit after joining transactions).',
    },
    referenceAnswer:
      'A) Insights: (1) Platinum generates 56.1% of Approved volume ($2,615) with zero delinquency—prioritize travel protection rather than blanket blocks; (2) Standard accounts ACC-105 (90% util, 62 DPD) and ACC-103 (80% util, 35 DPD) represent immediate charge-off risk.\nB) Data Risks: (1) Summing raw `amount` without filtering `status = "Approved"` inflates settled spend by $5,150 of Declined/Flagged authorizations; (2) Joining transactions onto accounts and summing `credit_limit` duplicates account limits per swipe (join fan-out).',
    explanation:
      'Real portfolio briefs combine tier insights with guardrails against status leakage and grain duplication.',
  },
  {
    id: 'oe-int-exec-rec',
    moduleId: 'mod-6',
    labId: 'lab-hr',
    taskType: 'executive_recommendation',
    title: 'Executive Recommendation: HR Overtime Attrition Brief',
    prompt:
      'Using `hr_employees` and `hr_department_budgets`, deliver a BLUF (Answer-First) memo to the Chief People Officer diagnosing voluntary attrition, quantifying replacement savings if overtime departures drop by 3 ($18,000/hire), noting Finance’s $24k budget constraint, and stating 1 honest statistical caveat.',
    contextData:
      'Overall attrition: 5/16 (31.25%). Overtime="Yes" attrition: 5/6 (83.3%) vs Overtime="No": 0/10 (0%). Operations (2) and Sales (2) lead attrition. Finance budget headroom is $24,000; Operations headroom is $224,000.',
    datasetId: 'ds-hr',
    requiredResponseFormat:
      '4 concise lines: Headline, Evidence, Action & Savings, Caveat.',
    recommendedLength: '5–8 sentences (90–150 words)',
    hint: 'Lead with the 83.3% overtime attrition concentration -> cite Ops/Sales + $54,000 savings -> respect Finance’s tight $24k headroom -> note n=16 observational limit & confounders (junior/mid tenure).',
    rubric: OPEN_ENDED_DEFAULT_RUBRIC,
    validationRule: {
      requiredKeywordGroups: [
        ['83.3', '5/6', '5 of 6', 'overtime'],
        ['54,000', '54000', '$54k'],
        ['finance', '24,000', '24000', 'headroom', 'operations'],
        ['n=16', 'n = 16', 'small', 'caus', 'confound', 'tenure'],
      ],
      nudge: 'Include the 83.3% (5/6) overtime rate, $54,000 savings, Finance/Operations budget context, and the small-sample / confounding caveat.',
    },
    referenceAnswer:
      'Headline: Voluntary attrition (31.25% overall) is heavily concentrated among overtime staff (5 of 6 = 83.3% vs. 0% non-overtime), especially Junior/Mid roles in Operations and Sales.\nAction & Impact: Rebalancing shift schedules in Operations (which has $224k budget headroom) to prevent 3 annual departures saves ~$54,000/year in replacement costs—whereas Finance has only $24,000 headroom and should prioritize workflow automation over new hires.\nCaveat: With n=16 observational records, overtime is a strong correlation rather than proven sole causation; validate against tenure and compensation bands across historical cohorts.',
    explanation:
      'Combines Answer-First clarity, financial quantification, budget realism, and statistical humility.',
  },
];

export function getOpenEndedTasksForModule(moduleId: string): OpenEndedTask[] {
  return OPEN_ENDED_TASKS.filter((t) => t.moduleId === moduleId);
}

export function getOpenEndedTasksForLab(labId: string): OpenEndedTask[] {
  return OPEN_ENDED_TASKS.filter((t) => t.labId === labId);
}

export function getOpenEndedTaskById(taskId: string): OpenEndedTask | undefined {
  return OPEN_ENDED_TASKS.find((t) => t.id === taskId);
}

export interface OpenEndedEvalResult {
  automatedScorePercent: number;
  checksSummary: string[];
  combinedScorePercent: number;
}

export function evaluateOpenEndedSubmission(
  task: OpenEndedTask,
  responseText: string,
  selfRubricChecks: Record<string, boolean>
): OpenEndedEvalResult {
  const trimmed = responseText.trim();
  const checksSummary: string[] = [];
  let autoScore = 0;

  if (!trimmed) {
    return {
      automatedScorePercent: 0,
      checksSummary: ['Submission is empty. Write your structured response before submitting.'],
      combinedScorePercent: 0,
    };
  }

  const allTables = EMBEDDED_DATASETS.flatMap((d) => d.tables);

  // 1. Live SQL verification if task requires SQL from question
  if (task.taskType === 'sql_from_question' && task.datasetId) {
    const ds = EMBEDDED_DATASETS.find((d) => d.id === task.datasetId);
    const sqlRes = executeSqlQuery(trimmed, ds ? ds.tables : allTables);
    if (sqlRes.ok) {
      autoScore += 50;
      checksSummary.push(`SQL Engine: Executed cleanly (${sqlRes.rows.length} rows returned).`);

      const lowerCols = sqlRes.columns.map((c) => c.toLowerCase());
      const missingCols = (task.expectedSqlColumns ?? []).filter(
        (col) => !lowerCols.includes(col.toLowerCase())
      );
      if (missingCols.length === 0) {
        autoScore += 25;
        checksSummary.push('Required output columns verified.');
      } else {
        checksSummary.push(`Missing expected column alias(es): ${missingCols.join(', ')}.`);
      }

      if (!task.expectedSqlMinRows || sqlRes.rows.length >= task.expectedSqlMinRows) {
        autoScore += 25;
        checksSummary.push('Row granularity matches expected groups.');
      } else {
        checksSummary.push(`Expected at least ${task.expectedSqlMinRows} rows, got ${sqlRes.rows.length}.`);
      }
    } else {
      checksSummary.push(`SQL Execution Error: ${sqlRes.error}`);
    }
  } else if (task.taskType === 'python_transformation') {
    // 2. Live Python simulator verification
    const pyRes = simulatePythonCode(trimmed, allTables);
    if (pyRes.ok) {
      autoScore += 50;
      checksSummary.push('Python Simulator: Executed without syntax errors.');
      const ruleEval = task.validationRule
        ? evaluatePracticeAnswer(trimmed, task.validationRule)
        : null;
      const hasCarrierTable =
        pyRes.resultTable &&
        pyRes.resultTable.rows.length === 3 &&
        JSON.stringify(pyRes.resultTable.rows).toLowerCase().includes('apexfreight');

      if (hasCarrierTable) {
        autoScore += 30;
        checksSummary.push('Verified 3 cleaned carrier groups in simulator output table.');
      } else {
        checksSummary.push('Simulator did not output the 3 cleaned carrier groups yet.');
      }

      if (!ruleEval || ruleEval.status === 'verified') {
        autoScore += 20;
        checksSummary.push('Required pandas cleaning & aggregation patterns present.');
      } else {
        checksSummary.push(ruleEval.feedback);
      }
    } else {
      checksSummary.push(`Simulator Error: ${pyRes.error}`);
    }
  } else {
    // 3. Rule + structural length / reasoning checks for analytical & modeling tasks
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 18) {
      autoScore += 25;
      checksSummary.push(`Length check passed (${wordCount} words).`);
    } else {
      checksSummary.push(`Response is quite brief (${wordCount} words) — add supporting reasoning.`);
    }

    if (task.validationRule) {
      const ruleRes = evaluatePracticeAnswer(trimmed, task.validationRule);
      if (ruleRes.status === 'verified') {
        autoScore += 75;
        checksSummary.push('Core domain concepts, metrics, and edge-case checks matched.');
      } else {
        // Compute partial score from validationRule keyword/number matches
        const lower = trimmed.toLowerCase();
        const groups = task.validationRule.requiredKeywordGroups ?? [];
        const matched = groups.filter((g) => g.some((kw) => lower.includes(kw.toLowerCase()))).length;
        const partial = groups.length > 0 ? Math.round((matched / groups.length) * 65) : 25;
        autoScore += partial;
        checksSummary.push(ruleRes.feedback);
      }
    } else {
      autoScore += 60;
    }
  }

  autoScore = Math.max(0, Math.min(100, autoScore));

  // Self-rubric weighted score
  let rubricEarned = 0;
  let rubricTotal = 0;
  for (const crit of task.rubric) {
    rubricTotal += crit.weightPercent;
    if (selfRubricChecks[crit.id]) {
      rubricEarned += crit.weightPercent;
    }
  }
  const hasAnyRubricChecked = Object.values(selfRubricChecks).some(Boolean);
  const selfPct = rubricTotal > 0 ? Math.round((rubricEarned / rubricTotal) * 100) : 0;

  // Combined: 60% automated checks + 40% self-rubric if reviewed, else automated score
  const combinedScorePercent = hasAnyRubricChecked
    ? Math.round(autoScore * 0.6 + selfPct * 0.4)
    : autoScore;

  return {
    automatedScorePercent: autoScore,
    checksSummary,
    combinedScorePercent,
  };
}
