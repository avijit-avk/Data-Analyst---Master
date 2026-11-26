import { EMBEDDED_DATASETS } from './embeddedDatasets';
import {
  TimedAttemptRecord,
  TimedChallenge,
  TimedDifficulty,
  TimedLanguage,
} from '../types/academy';
import { simulatePythonCode } from '../utils/pythonSimulatorEngine';
import { executeSqlQuery } from '../utils/sqlSandboxEngine';

export const TIMED_CHALLENGES: TimedChallenge[] = [
  // =====================================
  // SQL CHALLENGES
  // =====================================
  {
    id: 'tc-sql-beg-1',
    language: 'sql',
    difficulty: 'beginner',
    topic: 'Filtering & Aggregation',
    title: 'Completed Freight Spend by Hub',
    businessPrompt:
      'Operations wants to know total freight_cost and shipment count by hub_id strictly for completed shipments (excluding "In Transit" rows where delivery_days IS NULL). Sort from highest total_freight to lowest.',
    datasetId: 'ds-operations',
    requiredColumns: ['hub_id', 'shipments', 'total_freight'],
    constraintsAndEdgeCases: [
      'Exclude rows where delivery_days IS NULL ("In Transit").',
      'Alias output columns clearly as hub_id, shipments, total_freight.',
      'Order descending by total_freight.',
    ],
    hint: 'Use WHERE delivery_days IS NOT NULL, GROUP BY hub_id, COUNT(*) AS shipments, and SUM(freight_cost) AS total_freight.',
    expectedRowCount: 4,
    expectedValuesToContain: ['HUB-W', 2910],
    requiredCodePatterns: [['delivery_days is not null', 'status <>', 'status !='], ['group by'], ['order by']],
    referenceSolution: `SELECT hub_id,
  COUNT(*) AS shipments,
  SUM(freight_cost) AS total_freight
FROM operations_shipments
WHERE delivery_days IS NOT NULL
GROUP BY hub_id
ORDER BY total_freight DESC;`,
    explanation:
      'HUB-W leads completed freight spend at $2,910 across 5 shipments, followed by HUB-NE ($1,650), HUB-MW ($1,265), and HUB-S ($1,295 — note HUB-W > HUB-NE > HUB-S > HUB-MW).',
  },
  {
    id: 'tc-sql-beg-2',
    language: 'sql',
    difficulty: 'beginner',
    topic: 'Conditional Aggregation',
    title: 'Approved Transaction Volume by Merchant Category',
    businessPrompt:
      'Summarize credit_card_transactions strictly for Approved authorizations: return merchant_category, txn_count, and ROUND(SUM(amount), 2) AS approved_spend, sorted descending by approved_spend.',
    datasetId: 'ds-banking',
    requiredColumns: ['merchant_category', 'txn_count', 'approved_spend'],
    constraintsAndEdgeCases: [
      'Exclude Declined and Flagged transactions using WHERE status = \'Approved\'.',
      'Return all 4 merchant categories present in Approved rows.',
    ],
    hint: 'Filter WHERE status = "Approved" before GROUP BY merchant_category.',
    expectedRowCount: 4,
    expectedValuesToContain: ['Travel', 2870],
    requiredCodePatterns: [['where'], ['approved'], ['group by']],
    referenceSolution: `SELECT merchant_category,
  COUNT(*) AS txn_count,
  ROUND(SUM(amount), 2) AS approved_spend
FROM credit_card_transactions
WHERE status = 'Approved'
GROUP BY merchant_category
ORDER BY approved_spend DESC;`,
    explanation:
      'Travel leads Approved spend at $2,870 across 3 transactions, followed by Electronics ($520), Utilities ($500), Groceries ($415), and Dining ($360) — wait: 5 categories! Let’s make sure expectedRowCount matches 5.',
  },
  {
    id: 'tc-sql-int-1',
    language: 'sql',
    difficulty: 'intermediate',
    topic: 'Multi-Table Joins & Revenue Math',
    title: 'Customer Segment Net Revenue & Margin',
    businessPrompt:
      'Join retail_orders, retail_customers, and retail_products to calculate Completed Net Revenue and Gross Profit per customer segment. Include only status = \'Completed\' orders and sort by net_revenue DESC.',
    datasetId: 'ds-retail',
    requiredColumns: ['segment', 'net_revenue', 'gross_profit'],
    constraintsAndEdgeCases: [
      'Net Revenue = quantity * unit_price * (1 - discount_pct).',
      'Gross Profit = Net Revenue - (quantity * unit_cost).',
      'Exclude Returned and Cancelled rows.',
    ],
    hint: 'JOIN retail_customers on customer_id and retail_products on product_id, filter WHERE o.status = "Completed", and GROUP BY c.segment.',
    expectedRowCount: 3,
    expectedValuesToContain: ['Enterprise', 2430, 972],
    requiredCodePatterns: [['join'], ['completed'], ['discount_pct'], ['group by']],
    referenceSolution: `SELECT c.segment,
  ROUND(SUM(o.quantity * p.unit_price * (1 - o.discount_pct)), 2) AS net_revenue,
  ROUND(SUM(o.quantity * (p.unit_price * (1 - o.discount_pct) - p.unit_cost)), 2) AS gross_profit
FROM retail_orders o
INNER JOIN retail_customers c ON o.customer_id = c.customer_id
INNER JOIN retail_products p ON o.product_id = p.product_id
WHERE o.status = 'Completed'
GROUP BY c.segment
ORDER BY net_revenue DESC;`,
    explanation:
      'Enterprise produces $2,430 net_revenue and $972 gross_profit; Consumer $1,578 / $674; SMB $1,332 / $636.',
  },
  {
    id: 'tc-sql-int-2',
    language: 'sql',
    difficulty: 'intermediate',
    topic: 'String Normalization & Ratios',
    title: 'Clean Carrier SLA Breach & Cost per Unit',
    businessPrompt:
      'Normalize dirty carrier casing in operations_shipments (e.g. "ApexFreight" vs "apexfreight"), exclude NULL delivery_days rows, and report carrier_clean, completed_cnt, delay_rate_pct, and cost_per_unit.',
    datasetId: 'ds-operations',
    requiredColumns: ['carrier_clean', 'completed_cnt', 'delay_rate_pct', 'cost_per_unit'],
    constraintsAndEdgeCases: [
      'Normalize carrier with LOWER(TRIM(carrier)).',
      'Exclude In Transit rows (delivery_days IS NOT NULL).',
      'Compute weighted cost_per_unit as SUM(freight_cost) / SUM(units).',
    ],
    hint: 'Group by LOWER(TRIM(carrier)) and use SUM(CASE WHEN status = "Delayed" THEN 1 ELSE 0 END) * 100.0 / COUNT(*).',
    expectedRowCount: 3,
    expectedValuesToContain: ['apexfreight', 3.7],
    requiredCodePatterns: [['lower'], ['delivery_days is not null'], ['case when'], ['group by']],
    referenceSolution: `SELECT LOWER(TRIM(carrier)) AS carrier_clean,
  COUNT(*) AS completed_cnt,
  ROUND(SUM(CASE WHEN status = 'Delayed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS delay_rate_pct,
  ROUND(SUM(freight_cost) / SUM(units), 2) AS cost_per_unit
FROM operations_shipments
WHERE delivery_days IS NOT NULL
GROUP BY LOWER(TRIM(carrier))
ORDER BY delay_rate_pct DESC;`,
    explanation:
      'Collapses 5 raw carrier spellings into 3 canonical carriers while excluding In Transit NULLs.',
  },
  {
    id: 'tc-sql-adv-1',
    language: 'sql',
    difficulty: 'interview',
    topic: 'CTEs & Budget Headroom',
    title: 'Active Payroll vs. Department Budget Headroom',
    businessPrompt:
      'Build a CTE aggregating active headcount and active annual_salary (attrition = "No") from hr_employees, LEFT JOIN it onto hr_department_budgets, and return department, active_payroll, annual_payroll_budget, and budget_headroom sorted tightest headroom first.',
    datasetId: 'ds-hr',
    requiredColumns: ['department', 'active_payroll', 'annual_payroll_budget', 'budget_headroom'],
    constraintsAndEdgeCases: [
      'Filter attrition = "No" BEFORE aggregating active payroll.',
      'Use LEFT JOIN from hr_department_budgets so departments with 0 active staff would still appear.',
      'Order ASC by budget_headroom.',
    ],
    hint: 'Use WITH active_dept AS (SELECT department, SUM(annual_salary) AS active_payroll FROM hr_employees WHERE attrition = "No" GROUP BY department) ...',
    expectedRowCount: 4,
    expectedValuesToContain: ['Finance', 24000],
    requiredCodePatterns: [['with '], ['left join'], ['attrition'], ['order by']],
    referenceSolution: `WITH active_dept AS (
  SELECT department,
    SUM(annual_salary) AS active_payroll
  FROM hr_employees
  WHERE attrition = 'No'
  GROUP BY department
)
SELECT b.department,
  COALESCE(a.active_payroll, 0) AS active_payroll,
  b.annual_payroll_budget,
  b.annual_payroll_budget - COALESCE(a.active_payroll, 0) AS budget_headroom
FROM hr_department_budgets b
LEFT JOIN active_dept a ON b.department = a.department
ORDER BY budget_headroom ASC;`,
    explanation:
      'Finance has the tightest remaining budget headroom ($24,000), followed by Engineering ($62,000), Sales ($178,000), and Operations ($224,000).',
  },
  {
    id: 'tc-sql-adv-2',
    language: 'sql',
    difficulty: 'interview',
    topic: 'Window Functions & Partition Share',
    title: 'Department Salary Rank & Pay Share %',
    businessPrompt:
      'Among active employees (attrition = "No"), compute each employee’s salary rank within their department using DENSE_RANK() and their percentage share of active department payroll (`pct_of_dept_pay`). Return only Engineering and Finance rows sorted by department and rank.',
    datasetId: 'ds-hr',
    requiredColumns: ['emp_id', 'department', 'annual_salary', 'dept_rank', 'pct_of_dept_pay'],
    constraintsAndEdgeCases: [
      'Exclude attrition = "Yes" employees.',
      'Use OVER (PARTITION BY department ORDER BY annual_salary DESC) for DENSE_RANK.',
      'Use OVER (PARTITION BY department) for total active department salary.',
    ],
    hint: 'Filter WHERE attrition = "No" AND department IN ("Engineering", "Finance") and apply window functions.',
    expectedRowCount: 8,
    expectedValuesToContain: ['EMP-12', 24.1],
    requiredCodePatterns: [['dense_rank'], ['over'], ['partition by'], ['attrition']],
    referenceSolution: `SELECT emp_id,
  department,
  annual_salary,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY annual_salary DESC) AS dept_rank,
  ROUND(annual_salary * 100.0 / SUM(annual_salary) OVER (PARTITION BY department), 1) AS pct_of_dept_pay
FROM hr_employees
WHERE attrition = 'No'
  AND department IN ('Engineering', 'Finance')
ORDER BY department ASC, dept_rank ASC;`,
    explanation:
      'Tessa Morales (EMP-12) ranks #1 in Engineering at $142,000 (24.1% of active Engineering pay); Noah Alvarez ranks #1 in Finance at $116,000 (43.6%).',
  },

  // =====================================
  // PYTHON CHALLENGES (Constrained Simulator)
  // =====================================
  {
    id: 'tc-py-beg-1',
    language: 'python',
    difficulty: 'beginner',
    topic: 'Filtering & String Cleaning',
    title: 'Clean Carrier Freight Totals in pandas',
    businessPrompt:
      'Load `operations_shipments.csv`, filter out rows with missing `delivery_days`, normalize `carrier` with `.str.strip().str.lower()` into `carrier_clean`, and group total `freight_cost` per cleaned carrier.',
    datasetId: 'ds-operations',
    requiredColumns: ['carrier_clean', 'freight_cost'],
    constraintsAndEdgeCases: [
      'Must remove the 2 In Transit rows using .notna().',
      'Must normalize casing before groupby.',
    ],
    hint: 'comp = df[df["delivery_days"].notna()].copy(); comp["carrier_clean"] = comp["carrier"].str.strip().str.lower()',
    expectedRowCount: 3,
    expectedValuesToContain: ['apexfreight', 3755],
    requiredCodePatterns: [['read_csv'], ['notna'], ['lower'], ['groupby']],
    referenceSolution: `import pandas as pd

df = pd.read_csv('operations_shipments.csv')
comp = df[df['delivery_days'].notna()].copy()
comp['carrier_clean'] = comp['carrier'].str.strip().str.lower()
comp.groupby('carrier_clean')['freight_cost'].sum().reset_index()`,
    explanation:
      'Merges mixed-case carrier labels into 3 clean groups totaling $3,755 (apexfreight), $2,530 (swifthaul), and $2,015 (northstar).',
  },
  {
    id: 'tc-py-beg-2',
    language: 'python',
    difficulty: 'beginner',
    topic: 'Skewness & Descriptive Stats',
    title: 'Card Spend Mean vs. Median Audit',
    businessPrompt:
      'Load `credit_card_transactions.csv`, filter strictly to `status == "Approved"`, compute both `np.mean(app["amount"])` and `np.median(app["amount"])` with print(), and return `app.groupby("merchant_category")["amount"].sum().reset_index()`.',
    datasetId: 'ds-banking',
    requiredColumns: ['merchant_category', 'amount'],
    constraintsAndEdgeCases: [
      'Filter status == "Approved" before computing stats.',
      'Print both mean ($388.75) and median ($195).',
    ],
    hint: 'Use app = df[df["status"] == "Approved"] then print(np.mean(app["amount"])) and print(np.median(app["amount"])).',
    expectedRowCount: 5,
    expectedValuesToContain: [388.75, 195, 'Travel', 2870],
    requiredCodePatterns: [['read_csv'], ['approved'], ['mean'], ['median'], ['groupby']],
    referenceSolution: `import pandas as pd
import numpy as np

df = pd.read_csv('credit_card_transactions.csv')
app = df[df['status'] == 'Approved']
print(np.mean(app['amount']))
print(np.median(app['amount']))
app.groupby('merchant_category')['amount'].sum().reset_index()`,
    explanation:
      'Approved mean ($388.75) is nearly 2x the Approved median ($195), driven by large Travel swipes ($2,870 total).',
  },
  {
    id: 'tc-py-int-1',
    language: 'python',
    difficulty: 'intermediate',
    topic: 'Multi-Table Merge & Margin Math',
    title: 'Retail Channel Net Revenue & Gross Profit',
    businessPrompt:
      'Load `retail_orders.csv` and `retail_products.csv`, merge on `product_id`, filter `status == "Completed"`, create `net_rev` and `gross_profit`, and aggregate both by `channel` sorted descending by `net_rev`.',
    datasetId: 'ds-retail',
    requiredColumns: ['channel', 'net_rev', 'gross_profit'],
    constraintsAndEdgeCases: [
      'net_rev = quantity * unit_price * (1 - discount_pct).',
      'gross_profit = net_rev - (quantity * unit_cost).',
      'Sort descending by net_rev.',
    ],
    hint: 'Chain orders.merge(products, on="product_id", how="inner"), filter Completed, compute derived columns, then groupby("channel").agg(...).reset_index().sort_values("net_rev", ascending=False).',
    expectedRowCount: 3,
    expectedValuesToContain: ['Web', 2172, 988],
    requiredCodePatterns: [['merge'], ['completed'], ['discount_pct'], ['groupby'], ['sort_values']],
    referenceSolution: `import pandas as pd

orders = pd.read_csv('retail_orders.csv')
products = pd.read_csv('retail_products.csv')
m = orders.merge(products, on='product_id', how='inner')
comp = m[m['status'] == 'Completed'].copy()
comp['net_rev'] = comp['quantity'] * comp['unit_price'] * (1 - comp['discount_pct'])
comp['gross_profit'] = comp['net_rev'] - (comp['quantity'] * comp['unit_cost'])
comp.groupby('channel').agg({'net_rev': 'sum', 'gross_profit': 'sum'}).reset_index().sort_values('net_rev', ascending=False)`,
    explanation:
      'Web generates $2,172 net_rev / $988 gross_profit, In-Store $1,830 / $730, and Mobile App $1,338 / $564.',
  },
  {
    id: 'tc-py-int-2',
    language: 'python',
    difficulty: 'intermediate',
    topic: 'Risk Ratio & Filtering',
    title: 'High-Utilization Account Triage',
    businessPrompt:
      'Load `cardholder_accounts.csv`, compute `utilization_pct = (current_balance / credit_limit) * 100`, filter accounts with `utilization_pct >= 50`, and sort descending by `utilization_pct`.',
    datasetId: 'ds-banking',
    requiredColumns: ['account_id', 'card_tier', 'utilization_pct', 'delinquency_days'],
    constraintsAndEdgeCases: [
      'Derive utilization_pct accurately as percentage (0–100 scale).',
      'Filter strictly >= 50%.',
      'Sort descending so ACC-105 (90%) appears first.',
    ],
    hint: 'df["utilization_pct"] = (df["current_balance"] / df["credit_limit"]) * 100',
    expectedRowCount: 3,
    expectedValuesToContain: ['ACC-105', 90, 'ACC-103', 'ACC-107'],
    requiredCodePatterns: [['read_csv'], ['utilization_pct'], ['sort_values']],
    referenceSolution: `import pandas as pd

accts = pd.read_csv('cardholder_accounts.csv')
accts['utilization_pct'] = (accts['current_balance'] / accts['credit_limit']) * 100
high_risk = accts[accts['utilization_pct'] >= 50].copy()
high_risk.sort_values('utilization_pct', ascending=False)`,
    explanation:
      'Surfaces ACC-105 (90%, 62 DPD), ACC-103 (80%, 35 DPD), and ACC-107 (55%, 15 DPD).',
  },
  {
    id: 'tc-py-adv-1',
    language: 'python',
    difficulty: 'interview',
    topic: '3-Table Star Pipeline',
    title: 'Enterprise & SMB Product Category Profit',
    businessPrompt:
      'Load `retail_orders.csv`, `retail_customers.csv`, and `retail_products.csv`, merge all three, filter to `status == "Completed"` and `segment.isin(["Enterprise", "SMB"])`, derive `net_rev` and `gross_profit`, and summarize by `segment` sorted descending.',
    datasetId: 'ds-retail',
    requiredColumns: ['segment', 'net_rev', 'gross_profit'],
    constraintsAndEdgeCases: [
      'Use .isin(["Enterprise", "SMB"]) cleanly alongside status == "Completed".',
      'Keep exact net_rev and gross_profit definitions.',
    ],
    hint: 'Combine boolean masks with & and parentheses: (m["status"] == "Completed") & (m["segment"].isin(["Enterprise", "SMB"])).',
    expectedRowCount: 2,
    expectedValuesToContain: ['Enterprise', 2430, 'SMB', 1332],
    requiredCodePatterns: [['merge'], ['isin'], ['groupby'], ['sort_values']],
    referenceSolution: `import pandas as pd

orders = pd.read_csv('retail_orders.csv')
customers = pd.read_csv('retail_customers.csv')
products = pd.read_csv('retail_products.csv')

m = orders.merge(customers, on='customer_id', how='inner').merge(products, on='product_id', how='inner')
b2b = m[(m['status'] == 'Completed') & (m['segment'].isin(['Enterprise', 'SMB']))].copy()
b2b['net_rev'] = b2b['quantity'] * b2b['unit_price'] * (1 - b2b['discount_pct'])
b2b['gross_profit'] = b2b['net_rev'] - (b2b['quantity'] * b2b['unit_cost'])
b2b.groupby('segment').agg({'net_rev': 'sum', 'gross_profit': 'sum'}).reset_index().sort_values('net_rev', ascending=False)`,
    explanation:
      'Isolates B2B commercial segments: Enterprise ($2,430 net_rev / $972 profit) and SMB ($1,332 net_rev / $636 profit).',
  },
  {
    id: 'tc-py-adv-2',
    language: 'python',
    difficulty: 'interview',
    topic: 'Cohort & Payroll Audit',
    title: 'Active HR Department Payroll & Mean Salary',
    businessPrompt:
      'Load `hr_employees.csv` and `hr_department_budgets.csv`. Filter active employees (`attrition == "No"`), aggregate `annual_salary` sum and `emp_id` count by `department`, merge with `hr_department_budgets`, compute `headroom = annual_payroll_budget - annual_salary`, and sort ascending by `headroom`.',
    datasetId: 'ds-hr',
    requiredColumns: ['department', 'annual_salary', 'annual_payroll_budget', 'headroom'],
    constraintsAndEdgeCases: [
      'Filter attrition == "No" BEFORE grouping.',
      'Compute headroom accurately and sort tightest first.',
    ],
    hint: 'Aggregate active employees first so merging with hr_department_budgets preserves 1 row per department.',
    expectedRowCount: 4,
    expectedValuesToContain: ['Finance', 24000, 'Engineering', 62000],
    requiredCodePatterns: [['attrition'], ['groupby'], ['merge'], ['headroom'], ['sort_values']],
    referenceSolution: `import pandas as pd

emps = pd.read_csv('hr_employees.csv')
budgets = pd.read_csv('hr_department_budgets.csv')
active = emps[emps['attrition'] == 'No']
dept = active.groupby('department').agg({'annual_salary': 'sum', 'emp_id': 'count'}).reset_index()
res = budgets.merge(dept, on='department', how='left')
res['headroom'] = res['annual_payroll_budget'] - res['annual_salary']
res.sort_values('headroom', ascending=True)`,
    explanation:
      'Matches the SQL HR CTE audit identically: Finance ($24k), Engineering ($62k), Sales ($178k), Operations ($224k).',
  },
];

// Fix tc-sql-beg-2 expectedRowCount to 5 categories
const beg2 = TIMED_CHALLENGES.find((c) => c.id === 'tc-sql-beg-2');
if (beg2) {
  beg2.expectedRowCount = 5;
  beg2.constraintsAndEdgeCases[1] = 'Return all 5 merchant categories present in Approved rows.';
}

export function getTimedChallengeById(id: string): TimedChallenge | undefined {
  return TIMED_CHALLENGES.find((c) => c.id === id);
}

export function filterTimedChallenges(
  language: TimedLanguage,
  difficulty: TimedDifficulty | 'all',
  topic: string
): TimedChallenge[] {
  return TIMED_CHALLENGES.filter((c) => {
    if (c.language !== language) return false;
    if (difficulty !== 'all' && c.difficulty !== difficulty) return false;
    if (topic !== 'all' && c.topic !== topic) return false;
    return true;
  });
}

export function getTimedTopicsForLanguage(language: TimedLanguage): string[] {
  return Array.from(
    new Set(TIMED_CHALLENGES.filter((c) => c.language === language).map((c) => c.topic))
  );
}

export interface TimedEvaluationOutput {
  scorePercent: number;
  scoreBreakdown: TimedAttemptRecord['scoreBreakdown'];
  feedback: string[];
}

export function evaluateTimedSubmission(
  challenge: TimedChallenge,
  code: string,
  durationAllocatedSec: number,
  durationUsedSec: number,
  hintsUsed: number
): TimedEvaluationOutput {
  const trimmed = code.trim();
  const feedback: string[] = [];

  if (!trimmed) {
    return {
      scorePercent: 0,
      scoreBreakdown: {
        outputScore: 0,
        qualityScore: 0,
        edgeCaseScore: 0,
        timeScore: 0,
        hintPenalty: hintsUsed * 8,
      },
      feedback: ['No code was submitted before completion.'],
    };
  }

  const ds = EMBEDDED_DATASETS.find((d) => d.id === challenge.datasetId);
  const tables = ds ? ds.tables : EMBEDDED_DATASETS.flatMap((d) => d.tables);

  let outputScore = 0; // max 45
  let qualityScore = 0; // max 20
  let edgeCaseScore = 0; // max 25
  let timeScore = 0; // max 10
  const hintPenalty = Math.min(20, hintsUsed * 8);

  if (challenge.language === 'sql') {
    const res = executeSqlQuery(trimmed, tables);
    if (!res.ok) {
      feedback.push(`SQL execution failed: ${res.error}`);
    } else {
      outputScore += 20;
      feedback.push(`Query executed cleanly (${res.rows.length} rows).`);

      const lowerCols = res.columns.map((c) => c.toLowerCase());
      const matchedCols = challenge.requiredColumns.filter((c) =>
        lowerCols.includes(c.toLowerCase())
      ).length;
      if (matchedCols === challenge.requiredColumns.length) {
        outputScore += 15;
        feedback.push('All required output columns present.');
      } else {
        const ratio = matchedCols / Math.max(1, challenge.requiredColumns.length);
        outputScore += Math.round(ratio * 15);
        feedback.push(
          `Matched ${matchedCols}/${challenge.requiredColumns.length} required column names.`
        );
      }

      const serialized = JSON.stringify(res.rows).toLowerCase();
      const valueHits = (challenge.expectedValuesToContain ?? []).filter((v) =>
        serialized.includes(String(v).toLowerCase())
      ).length;
      const expectedHits = (challenge.expectedValuesToContain ?? []).length;
      const rowOk =
        challenge.expectedRowCount === undefined || res.rows.length === challenge.expectedRowCount;

      if (rowOk && (expectedHits === 0 || valueHits >= Math.ceil(expectedHits * 0.7))) {
        outputScore += 10;
        feedback.push('Expected result values and row grain verified.');
      } else {
        feedback.push(
          `Expected ${challenge.expectedRowCount ?? 'matching'} rows and key metrics; check filters/grouping.`
        );
      }
    }
  } else {
    const pyRes = simulatePythonCode(trimmed, EMBEDDED_DATASETS.flatMap((d) => d.tables));
    if (!pyRes.ok) {
      feedback.push(`Python Simulator failed: ${pyRes.error}`);
    } else {
      outputScore += 20;
      feedback.push('Python script executed in the Constrained Simulator.');

      const combinedOutput = [
        ...pyRes.outputLines,
        JSON.stringify(pyRes.resultTable ?? {}),
        String(pyRes.scalarResult ?? ''),
      ]
        .join(' ')
        .toLowerCase();

      const colHits = challenge.requiredColumns.filter((c) =>
        combinedOutput.includes(c.toLowerCase())
      ).length;
      if (colHits >= Math.max(1, challenge.requiredColumns.length - 1)) {
        outputScore += 15;
        feedback.push('Expected result columns/fields verified.');
      } else {
        outputScore += Math.round((colHits / Math.max(1, challenge.requiredColumns.length)) * 15);
        feedback.push(`Check output column coverage (${colHits}/${challenge.requiredColumns.length}).`);
      }

      const valTargets = challenge.expectedValuesToContain ?? [];
      const valHits = valTargets.filter((v) =>
        combinedOutput.includes(String(v).toLowerCase())
      ).length;
      if (valTargets.length === 0 || valHits >= Math.ceil(valTargets.length * 0.65)) {
        outputScore += 10;
        feedback.push('Expected numeric/category outputs confirmed.');
      } else {
        feedback.push('Output values did not yet match all expected metrics—verify filters & formulas.');
      }
    }
  }

  // Quality & Edge-case checks (deterministic regex/keyword rules)
  const lowerCode = trimmed.toLowerCase();
  const patterns = challenge.requiredCodePatterns ?? [];
  let patternHits = 0;
  for (const group of patterns) {
    if (group.some((p) => lowerCode.includes(p.toLowerCase()))) {
      patternHits += 1;
    }
  }
  edgeCaseScore =
    patterns.length > 0 ? Math.round((patternHits / patterns.length) * 25) : 20;
  if (patternHits === patterns.length) {
    feedback.push('Edge-case constraints and filtering safeguards applied.');
  } else {
    feedback.push(
      `Edge-case check: ${patternHits}/${patterns.length} defensive patterns detected.`
    );
  }

  // Readability / Code Quality (aliases, formatting, multi-line clarity, explicit joins)
  const lines = trimmed.split('\n').filter((l) => l.trim().length > 0).length;
  if (lines >= 4) qualityScore += 10;
  else qualityScore += 5;
  if (
    challenge.language === 'sql'
      ? lowerCode.includes(' as ') && !lowerCode.includes('select *')
      : !lowerCode.includes('unnamed') && trimmed.length >= 80
  ) {
    qualityScore += 10;
  } else {
    qualityScore += 4;
    feedback.push('Tip: Use explicit column selection/aliases and clear multi-line formatting.');
  }

  // Time efficiency bonus (max 10 points; only awarded if outputScore >= 25)
  if (outputScore >= 25 && durationAllocatedSec > 0) {
    const ratioUsed = durationUsedSec / durationAllocatedSec;
    if (ratioUsed <= 0.65) timeScore = 10;
    else if (ratioUsed <= 0.9) timeScore = 7;
    else timeScore = 4;
  }

  const rawTotal = outputScore + qualityScore + edgeCaseScore + timeScore - hintPenalty;
  const scorePercent = Math.max(0, Math.min(100, rawTotal));

  return {
    scorePercent,
    scoreBreakdown: {
      outputScore,
      qualityScore,
      edgeCaseScore,
      timeScore,
      hintPenalty,
    },
    feedback,
  };
}
