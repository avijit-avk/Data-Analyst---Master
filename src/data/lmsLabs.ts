import { LmsLab } from '../types/academy';

export const LMS_LABS: LmsLab[] = [
  {
    id: 'lab-operations',
    moduleIds: ['mod-1', 'mod-2'],
    title: 'Logistics SLA & Spreadsheet Modeling Lab',
    domain: 'Operations',
    datasetId: 'ds-operations',
    overview:
      'Audit dispatch quality, build Excel lookup/SUMIFS formulas, normalize dirty carrier names, and benchmark regional warehouse unit economics.',
    businessBrief:
      'Operations leadership suspects carrier delays in the West and Midwest are inflating unit freight cost. Use the embedded Operations tables (and SQL sandbox or CSV download) to isolate SLA breaches and verify unit costs.',
    supportsSqlSandbox: true,
    defaultSqlQuery: `SELECT LOWER(TRIM(carrier)) AS carrier_clean,
  COUNT(*) AS completed_shipments,
  SUM(CASE WHEN status = 'Delayed' THEN 1 ELSE 0 END) AS delayed_count,
  ROUND(AVG(delivery_days), 2) AS avg_delivery_days,
  ROUND(SUM(freight_cost) / SUM(units), 2) AS cost_per_unit
FROM operations_shipments
WHERE delivery_days IS NOT NULL
GROUP BY LOWER(TRIM(carrier))
ORDER BY delayed_count DESC;`,
    exercises: [
      {
        id: 'lab-ops-1',
        labId: 'lab-operations',
        order: 1,
        kind: 'metric',
        title: 'Data Quality & Overall SLA Breach Rate',
        prompt:
          'Excluding the 2 "In Transit" shipments (NULL delivery_days), how many completed shipments were Delayed out of the 18 completed rows, and what is the Delayed Freight Spend ($)?',
        hint: 'Run a SQL filter WHERE delivery_days IS NOT NULL and sum freight_cost where status = "Delayed".',
        starterSql: `SELECT COUNT(*) AS completed_cnt,
  SUM(CASE WHEN status = 'Delayed' THEN 1 ELSE 0 END) AS delayed_cnt,
  SUM(CASE WHEN status = 'Delayed' THEN freight_cost ELSE 0 END) AS delayed_freight
FROM operations_shipments
WHERE delivery_days IS NOT NULL;`,
        validationRule: {
          expectedNumbers: [{ value: 6 }, { value: 2900, tolerance: 1 }],
          nudge: 'Include both the delayed shipment count (out of 18) and total delayed freight cost ($).',
        },
        solutionSteps: [
          'Exclude SHP-1013 and SHP-1018 (status = "In Transit", delivery_days IS NULL) leaving 18 completed rows.',
          'Count rows where status = "Delayed": 6 shipments (33.3% breach rate).',
          'Sum freight_cost across those 6 delayed rows: $360 + $390 + $680 + $410 + $720 + $340 = $2,900.',
        ],
        referenceAnswer: '6 delayed shipments totaling $2,900 in delayed freight cost (33.3% SLA breach rate).',
      },
      {
        id: 'lab-ops-2',
        labId: 'lab-operations',
        order: 2,
        kind: 'formula',
        title: 'Excel XLOOKUP Hub Region Enrichment',
        prompt:
          'Write an Excel formula in operations_shipments (hub_id in B2) to pull the matching region (Column C) from warehouse_hubs (hub_id in Hubs!$A$2:$A$5, region in Hubs!$C$2:$C$5), returning "Unknown" if missing.',
        hint: 'Use XLOOKUP(lookup_value, lookup_array, return_array, if_not_found) or IFERROR(INDEX(..., MATCH(..., 0)), ...).',
        validationRule: {
          requiredKeywordGroups: [
            ['xlookup', 'index'],
            ['$a$2:$a$5', 'a2:a5'],
            ['$c$2:$c$5', 'c2:c5'],
          ],
          nudge: 'Write a complete XLOOKUP or INDEX/MATCH formula referencing Hubs!$A$2:$A$5 and Hubs!$C$2:$C$5.',
        },
        solutionSteps: [
          'Anchor the lookup array Hubs!$A$2:$A$5 and return array Hubs!$C$2:$C$5 with $ locks.',
          'Provide "Unknown" as the 4th argument of XLOOKUP (or wrap INDEX/MATCH in IFERROR).',
        ],
        referenceAnswer: '=XLOOKUP(B2, Hubs!$A$2:$A$5, Hubs!$C$2:$C$5, "Unknown")',
      },
      {
        id: 'lab-ops-3',
        labId: 'lab-operations',
        order: 3,
        kind: 'formula',
        title: 'Excel SUMIFS Delayed Freight by Hub',
        prompt:
          'Write an Excel SUMIFS formula summing freight_cost ($H$2:$H$21) where hub_id ($B$2:$B$21) equals "HUB-W" AND status ($I$2:$I$21) equals "Delayed". Also state the dollar total for HUB-W.',
        hint: 'Remember SUMIFS puts the sum_range FIRST, and HUB-W has 2 delayed shipments (SHP-1007 and SHP-1015).',
        validationRule: {
          expectedNumbers: [{ value: 1400, tolerance: 1 }],
          requiredKeywordGroups: [['sumifs']],
          nudge: 'Include both your =SUMIFS(...) formula and the dollar result ($680 + $720).',
        },
        solutionSteps: [
          'Formula: =SUMIFS($H$2:$H$21, $B$2:$B$21, "HUB-W", $I$2:$I$21, "Delayed")',
          'Matching rows: SHP-1007 ($680) + SHP-1015 ($720) = $1,400.',
        ],
        referenceAnswer: '=SUMIFS($H$2:$H$21, $B$2:$B$21, "HUB-W", $I$2:$I$21, "Delayed") -> $1,400',
      },
      {
        id: 'lab-ops-4',
        labId: 'lab-operations',
        order: 4,
        kind: 'sql',
        title: 'Normalized Carrier Unit Cost Benchmark',
        prompt:
          'Using the SQL sandbox, normalize carrier casing with LOWER() on completed rows (delivery_days IS NOT NULL). What is SwiftHaul’s cost_per_unit ($/unit) rounded to 2 decimals?',
        hint: 'Group by LOWER(TRIM(carrier)) and compute ROUND(SUM(freight_cost) / SUM(units), 2).',
        starterSql: `SELECT LOWER(TRIM(carrier)) AS carrier_clean,
  ROUND(SUM(freight_cost) / SUM(units), 2) AS cost_per_unit
FROM operations_shipments
WHERE delivery_days IS NOT NULL
GROUP BY LOWER(TRIM(carrier));`,
        validationRule: {
          expectedNumbers: [{ value: 3.64, tolerance: 0.02 }],
          nudge: 'Run the carrier grouping query with LOWER(carrier) and delivery_days IS NOT NULL, then check SwiftHaul cost_per_unit.',
        },
        solutionSteps: [
          'Merge "SwiftHaul" and "swifthaul" using LOWER(carrier), excluding In Transit row SHP-1018.',
          'SwiftHaul completed freight = $2,530 across 695 units -> $3.64/unit.',
        ],
        referenceAnswer: '$3.64 per unit (ApexFreight $3.70, NorthStar $3.66, SwiftHaul $3.64).',
      },
    ],
  },
  {
    id: 'lab-retail',
    moduleIds: ['mod-3', 'mod-4'],
    title: 'Omnichannel Retail SQL & BI Margin Lab',
    domain: 'Retail Sales',
    datasetId: 'ds-retail',
    overview:
      'Join star-schema retail tables in SQL, audit order fallout, compute segment gross margin, and translate revenue logic into DAX measures.',
    businessBrief:
      'Commercial finance wants a verified breakdown of Completed Net Revenue, COGS, Gross Profit, and Customer Segment mix across retail_orders, retail_customers, and retail_products.',
    supportsSqlSandbox: true,
    defaultSqlQuery: `SELECT c.segment,
  COUNT(*) AS completed_orders,
  ROUND(SUM(o.quantity * p.unit_price * (1 - o.discount_pct)), 2) AS net_revenue,
  ROUND(SUM(o.quantity * p.unit_cost), 2) AS total_cogs,
  ROUND(SUM(o.quantity * (p.unit_price * (1 - o.discount_pct) - p.unit_cost)), 2) AS gross_profit
FROM retail_orders o
INNER JOIN retail_customers c ON o.customer_id = c.customer_id
INNER JOIN retail_products p ON o.product_id = p.product_id
WHERE o.status = 'Completed'
GROUP BY c.segment
ORDER BY net_revenue DESC;`,
    exercises: [
      {
        id: 'lab-ret-1',
        labId: 'lab-retail',
        order: 1,
        kind: 'sql',
        title: 'Total Completed Net Revenue & Gross Profit',
        prompt:
          'Join retail_orders and retail_products for status = "Completed" orders. Report total Completed Net Revenue ($) and total Gross Profit ($).',
        hint: 'Net Revenue = quantity * unit_price * (1 - discount_pct). Gross Profit = Net Revenue - (quantity * unit_cost).',
        starterSql: `SELECT ROUND(SUM(o.quantity * p.unit_price * (1 - o.discount_pct)), 2) AS net_revenue,
  ROUND(SUM(o.quantity * (p.unit_price * (1 - o.discount_pct) - p.unit_cost)), 2) AS gross_profit
FROM retail_orders o
INNER JOIN retail_products p ON o.product_id = p.product_id
WHERE o.status = 'Completed';`,
        validationRule: {
          expectedNumbers: [
            { value: 5340, tolerance: 1 },
            { value: 2282, tolerance: 1 },
          ],
          nudge: 'Filter WHERE o.status = "Completed" and report both Net Revenue ($5,340) and Gross Profit ($2,282).',
        },
        solutionSteps: [
          'Join retail_orders o to retail_products p on o.product_id = p.product_id.',
          'Filter o.status = "Completed" (15 orders).',
          'Net Revenue = $5,340; COGS = $3,058; Gross Profit = $2,282 (42.7% margin).',
        ],
        referenceAnswer: 'Net Revenue = $5,340 and Gross Profit = $2,282 (42.73% Gross Margin).',
      },
      {
        id: 'lab-ret-2',
        labId: 'lab-retail',
        order: 2,
        kind: 'sql',
        title: 'Customer Segment Mix & Window Share %',
        prompt:
          'Which customer segment generates the highest Completed Net Revenue, and what is Enterprise’s Gross Profit ($)?',
        hint: 'Join retail_customers c and GROUP BY c.segment WHERE o.status = "Completed".',
        starterSql: `WITH seg AS (
  SELECT c.segment,
    ROUND(SUM(o.quantity * p.unit_price * (1 - o.discount_pct)), 2) AS net_rev,
    ROUND(SUM(o.quantity * (p.unit_price * (1 - o.discount_pct) - p.unit_cost)), 2) AS gross_profit
  FROM retail_orders o
  JOIN retail_customers c ON o.customer_id = c.customer_id
  JOIN retail_products p ON o.product_id = p.product_id
  WHERE o.status = 'Completed'
  GROUP BY c.segment
)
SELECT segment, net_rev, gross_profit,
  ROUND(net_rev * 100.0 / SUM(net_rev) OVER (), 1) AS rev_share_pct
FROM seg
ORDER BY net_rev DESC;`,
        validationRule: {
          expectedNumbers: [{ value: 972, tolerance: 1 }],
          requiredKeywordGroups: [['enterprise']],
          nudge: 'Name the top segment ("Enterprise") and state its Completed Gross Profit ($).',
        },
        solutionSteps: [
          'Enterprise: $2,430 Net Revenue (45.5% share), $972 Gross Profit.',
          'Consumer: $1,578 Net Revenue, $674 Gross Profit.',
          'SMB: $1,332 Net Revenue, $636 Gross Profit.',
        ],
        referenceAnswer: 'Enterprise leads with $2,430 Net Revenue and $972 Gross Profit.',
      },
      {
        id: 'lab-ret-3',
        labId: 'lab-retail',
        order: 3,
        kind: 'formula',
        title: 'DAX Safe Gross Margin & Segment Share',
        prompt:
          'Write a DAX measure for [Gross Margin %] using safe division over [Net Revenue] and [Total COGS], returning 0 if revenue is zero.',
        hint: 'Use DIVIDE(numerator, denominator, alternate_result) instead of the "/" operator.',
        validationRule: {
          requiredKeywordGroups: [
            ['divide'],
            ['net revenue'],
            ['cogs'],
          ],
          nudge: 'Use DIVIDE([Net Revenue] - [Total COGS], [Net Revenue], 0).',
        },
        solutionSteps: [
          'Subtract [Total COGS] from [Net Revenue] in the numerator.',
          'Divide safely with DIVIDE(..., [Net Revenue], 0) so empty filter slices return 0 instead of Infinity.',
        ],
        referenceAnswer: 'Gross Margin % = DIVIDE([Net Revenue] - [Total COGS], [Net Revenue], 0)',
      },
      {
        id: 'lab-ret-4',
        labId: 'lab-retail',
        order: 4,
        kind: 'metric',
        title: 'Order Fallout Rate (Returned + Cancelled)',
        prompt:
          'Across all 18 rows in retail_orders, how many orders were Returned or Cancelled combined, and what is the Fallout Rate % (to 1 decimal place)?',
        hint: 'Count rows where status IN ("Returned", "Cancelled") and divide by 18 total orders.',
        starterSql: `SELECT COUNT(*) AS total_orders,
  SUM(CASE WHEN status IN ('Returned', 'Cancelled') THEN 1 ELSE 0 END) AS fallout_orders,
  ROUND(SUM(CASE WHEN status IN ('Returned', 'Cancelled') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS fallout_pct
FROM retail_orders;`,
        validationRule: {
          expectedNumbers: [
            { value: 3 },
            { value: 16.7, tolerance: 0.2, allowPercentRatio: true },
          ],
          nudge: 'Count Returned + Cancelled orders out of 18 total orders and calculate the percentage.',
        },
        solutionSteps: [
          '2 Returned (ORD-503, ORD-511) + 1 Cancelled (ORD-506) = 3 fallout orders.',
          '3 / 18 = 16.7% order fallout rate.',
        ],
        referenceAnswer: '3 fallout orders out of 18 total (16.7% fallout rate).',
      },
    ],
  },
  {
    id: 'lab-banking',
    moduleIds: ['mod-5'],
    title: 'Banking Credit Card Risk & Fraud Lab',
    domain: 'Banking & Credit Cards',
    datasetId: 'ds-banking',
    overview:
      'Audit credit card utilization exposure, delinquent accounts, approved interchange revenue, and cross-border fraud flags.',
    businessBrief:
      'Consumer Card Risk needs a pre-committee brief sizing high-utilization accounts (>= 75% utilization), total Approved interchange revenue, and blocked international spend.',
    supportsSqlSandbox: true,
    defaultSqlQuery: `SELECT a.account_id, a.card_tier, a.credit_limit, a.current_balance,
  ROUND(a.current_balance * 100.0 / a.credit_limit, 1) AS utilization_pct,
  a.delinquency_days
FROM cardholder_accounts a
ORDER BY utilization_pct DESC;`,
    exercises: [
      {
        id: 'lab-bnk-1',
        labId: 'lab-banking',
        order: 1,
        kind: 'sql',
        title: 'Approved Spend & Interchange Fee Revenue',
        prompt:
          'Filter credit_card_transactions to status = "Approved". What is the total Approved spend ($) and total interchange_fee ($)?',
        hint: 'Group or filter WHERE status = "Approved" and sum amount + interchange_fee.',
        starterSql: `SELECT COUNT(*) AS approved_cnt,
  ROUND(SUM(amount), 2) AS approved_spend,
  ROUND(SUM(interchange_fee), 2) AS total_interchange
FROM credit_card_transactions
WHERE status = 'Approved';`,
        validationRule: {
          expectedNumbers: [
            { value: 4665, tolerance: 1 },
            { value: 105.15, tolerance: 0.1 },
          ],
          nudge: 'Sum amount and interchange_fee strictly for status = "Approved" (12 transactions).',
        },
        solutionSteps: [
          '12 Approved transactions total $4,665.00 in settled spend.',
          'Total interchange_fee across Approved transactions = $105.15.',
        ],
        referenceAnswer: '$4,665.00 Approved spend and $105.15 interchange fee revenue.',
      },
      {
        id: 'lab-bnk-2',
        labId: 'lab-banking',
        order: 2,
        kind: 'metric',
        title: 'High-Utilization Delinquency Watchlist',
        prompt:
          'Which account has the highest credit utilization % (current_balance / credit_limit) in cardholder_accounts, what is its utilization %, and how many delinquency_days does it carry?',
        hint: 'Sort cardholder_accounts by current_balance * 100.0 / credit_limit DESC.',
        validationRule: {
          expectedNumbers: [
            { value: 90, tolerance: 0.5, allowPercentRatio: true },
            { value: 62 },
          ],
          requiredKeywordGroups: [['acc-105']],
          nudge: 'Identify account ACC-105, its utilization % (90%), and delinquency_days (62).',
        },
        solutionSteps: [
          'ACC-105 (Standard): $2,700 / $3,000 = 90.0% utilization, 62 days past due.',
          'ACC-103 (Standard): $3,200 / $4,000 = 80.0% utilization, 35 days past due.',
        ],
        referenceAnswer: 'ACC-105 with 90.0% utilization and 62 delinquency days.',
      },
      {
        id: 'lab-bnk-3',
        labId: 'lab-banking',
        order: 3,
        kind: 'sql',
        title: 'Cross-Border Flagged Transaction Exposure',
        prompt:
          'How much total transaction volume ($) was Flagged, and are all Flagged transactions international (is_international = 1)?',
        hint: 'Filter WHERE status = "Flagged" and inspect is_international and SUM(amount).',
        starterSql: `SELECT txn_id, account_id, merchant_category, amount, is_international
FROM credit_card_transactions
WHERE status = 'Flagged';`,
        validationRule: {
          expectedNumbers: [{ value: 2990, tolerance: 1 }],
          requiredKeywordGroups: [['yes', 'all', '100', 'international']],
          nudge: 'Sum amount for Flagged transactions ($890 + $2,100) and confirm whether is_international = 1 on all of them.',
        },
        solutionSteps: [
          'TXN-903 ($890, Electronics, is_international = 1) + TXN-909 ($2,100, Travel, is_international = 1).',
          'Total Flagged exposure = $2,990; Yes, 100% of Flagged transactions are international.',
        ],
        referenceAnswer: '$2,990 total Flagged exposure; Yes, 100% (2 of 2) are international.',
      },
      {
        id: 'lab-bnk-4',
        labId: 'lab-banking',
        order: 4,
        kind: 'sql',
        title: 'Approved Spend by Card Tier (JOIN)',
        prompt:
          'Join credit_card_transactions to cardholder_accounts. How much Approved spend ($) came from Platinum cardholders?',
        hint: 'Join on account_id, filter t.status = "Approved", and group by a.card_tier.',
        starterSql: `SELECT a.card_tier,
  COUNT(*) AS approved_txns,
  ROUND(SUM(t.amount), 2) AS approved_spend
FROM credit_card_transactions t
INNER JOIN cardholder_accounts a ON t.account_id = a.account_id
WHERE t.status = 'Approved'
GROUP BY a.card_tier
ORDER BY approved_spend DESC;`,
        validationRule: {
          expectedNumbers: [{ value: 2615, tolerance: 1 }],
          nudge: 'Join transactions to cardholder_accounts on account_id with status = "Approved" and check Platinum spend.',
        },
        solutionSteps: [
          'Platinum: 4 approved transactions totaling $2,615 ($1,250 + $210 + $175 + $980).',
          'Gold: $1,570 | Standard: $480.',
        ],
        referenceAnswer: '$2,615 Approved spend from Platinum cardholders (56.1% of approved volume).',
      },
    ],
  },
  {
    id: 'lab-hr',
    moduleIds: ['mod-6'],
    title: 'HR Attrition, Payroll & SQL Debugging Lab',
    domain: 'Human Resources',
    datasetId: 'ds-hr',
    overview:
      'Investigate overtime-driven employee attrition, audit active payroll vs. department budgets using CTEs, and compute window salary ranks.',
    businessBrief:
      'People Analytics & Finance are preparing next quarter’s retention and hiring plan. Validate turnover cohorts, department budget headroom, and salary distribution.',
    supportsSqlSandbox: true,
    defaultSqlQuery: `WITH active_dept AS (
  SELECT department,
    COUNT(*) AS active_headcount,
    SUM(annual_salary) AS active_payroll
  FROM hr_employees
  WHERE attrition = 'No'
  GROUP BY department
)
SELECT b.department,
  a.active_headcount,
  b.target_headcount,
  a.active_payroll,
  b.annual_payroll_budget,
  b.annual_payroll_budget - a.active_payroll AS budget_headroom
FROM hr_department_budgets b
LEFT JOIN active_dept a ON b.department = a.department
ORDER BY budget_headroom ASC;`,
    exercises: [
      {
        id: 'lab-hr-1',
        labId: 'lab-hr',
        order: 1,
        kind: 'metric',
        title: 'Overall vs. Overtime Attrition Rate',
        prompt:
          'Across hr_employees (16 employees), what is the overall attrition rate (%) and what is the attrition rate (%) specifically among employees with overtime = "Yes"?',
        hint: 'Group by overtime and compute SUM(CASE WHEN attrition="Yes" THEN 1 ELSE 0 END) * 100.0 / COUNT(*).',
        starterSql: `SELECT overtime,
  COUNT(*) AS headcount,
  SUM(CASE WHEN attrition = 'Yes' THEN 1 ELSE 0 END) AS departures,
  ROUND(SUM(CASE WHEN attrition = 'Yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS attrition_pct
FROM hr_employees
GROUP BY overtime;`,
        validationRule: {
          expectedNumbers: [
            { value: 31.25, tolerance: 0.3, allowPercentRatio: true },
            { value: 83.3, tolerance: 0.3, allowPercentRatio: true },
          ],
          nudge: 'Report both overall attrition (5/16 = 31.25%) and overtime="Yes" attrition (5/6 = 83.3%).',
        },
        solutionSteps: [
          'Overall: 5 departed out of 16 = 31.25%.',
          'Overtime = "Yes": 5 departed out of 6 = 83.3% (vs. 0.0% among 10 non-overtime staff).',
        ],
        referenceAnswer: '31.25% overall attrition; 83.3% attrition among overtime = "Yes" workers.',
      },
      {
        id: 'lab-hr-2',
        labId: 'lab-hr',
        order: 2,
        kind: 'sql',
        title: 'Active Payroll Budget Headroom (CTE + JOIN)',
        prompt:
          'Using a CTE for active employees (attrition = "No") joined to hr_department_budgets, which department has the tightest remaining budget headroom ($), and how much headroom remains?',
        hint: 'Headroom = annual_payroll_budget - active_payroll (only counting attrition = "No").',
        validationRule: {
          expectedNumbers: [{ value: 24000, tolerance: 10 }],
          requiredKeywordGroups: [['finance']],
          nudge: 'Identify the department with the smallest (annual_payroll_budget - active_payroll) and give the dollar headroom.',
        },
        solutionSteps: [
          'Finance: $290,000 budget - $266,000 active payroll = $24,000 headroom.',
          'Engineering: $62,000 headroom | Sales: $178,000 | Operations: $224,000.',
        ],
        referenceAnswer: 'Finance has the tightest headroom at $24,000.',
      },
      {
        id: 'lab-hr-3',
        labId: 'lab-hr',
        order: 3,
        kind: 'sql',
        title: 'Window Function: Top Earner Share of Department Pay',
        prompt:
          'Among active employees (attrition = "No"), what percentage (%) of Engineering active payroll does the highest-paid Engineer (Tessa Morales, $142,000) represent?',
        hint: 'Use ROUND(annual_salary * 100.0 / SUM(annual_salary) OVER (PARTITION BY department), 1).',
        starterSql: `SELECT emp_id, full_name, department, annual_salary,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY annual_salary DESC) AS dept_rank,
  ROUND(annual_salary * 100.0 / SUM(annual_salary) OVER (PARTITION BY department), 1) AS pct_of_dept_pay
FROM hr_employees
WHERE attrition = 'No'
ORDER BY department, dept_rank;`,
        validationRule: {
          expectedNumbers: [{ value: 24.1, tolerance: 0.2, allowPercentRatio: true }],
          nudge: 'Divide Tessa Morales’s $142,000 salary by total active Engineering payroll ($588,000).',
        },
        solutionSteps: [
          'Active Engineering payroll = $142,000 + $138,000 + $112,000 + $108,000 + $88,000 = $588,000.',
          '$142,000 / $588,000 = 24.1%.',
        ],
        referenceAnswer: '24.1% of active Engineering payroll ($142,000 / $588,000).',
      },
      {
        id: 'lab-hr-4',
        labId: 'lab-hr',
        order: 4,
        kind: 'metric',
        title: 'Interview Case Sizing: Retention Cost Savings',
        prompt:
          'If reducing overtime cuts annual departures by 3 employees and each replacement hire costs $18,000 in recruiting and ramp loss, what are the annual replacement savings ($)?',
        hint: 'Multiply prevented departures by replacement cost per hire.',
        validationRule: {
          expectedNumbers: [{ value: 54000, tolerance: 1 }],
          nudge: 'Multiply 3 prevented departures × $18,000 replacement cost.',
        },
        solutionSteps: [
          '3 prevented departures × $18,000 = $54,000 annual recruiting and onboarding savings.',
        ],
        referenceAnswer: '$54,000 annual replacement cost savings.',
      },
    ],
  },
];

export function getLabById(id: string): LmsLab | undefined {
  return LMS_LABS.find((l) => l.id === id);
}

export function getLabForModule(moduleId: string): LmsLab | undefined {
  return LMS_LABS.find((l) => l.moduleIds.includes(moduleId));
}
