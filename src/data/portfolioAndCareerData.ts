import {
  BehavioralQuestion,
  JobGapAnalysisEntry,
  LmsLocalState,
  PortfolioProject,
  PortfolioRubricKey,
  PortfolioTemplateId,
} from '../types/academy';

// ==========================================
// PHASE 5: PORTFOLIO ARTIFACT WORKFLOW DATA
// ==========================================

export interface PortfolioTemplateDef {
  id: PortfolioTemplateId;
  label: string;
  domain: string;
  summary: string;
  defaults: Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt' | 'rubricSelfReview'>;
}

export const DEFAULT_PORTFOLIO_RUBRIC: Record<PortfolioRubricKey, boolean> = {
  businessFraming: false,
  dataQualityGrain: false,
  technicalAnalysis: false,
  metricAccuracy: false,
  visualStorytelling: false,
  recommendationQuality: false,
  reproducibility: false,
  communication: false,
};

export const PORTFOLIO_RUBRIC_DIMENSIONS: {
  key: PortfolioRubricKey;
  label: string;
  guidance: string;
}[] = [
  {
    key: 'businessFraming',
    label: '1. Business Problem Framing',
    guidance: 'Explicitly names the stakeholder, decision at stake, and success metric.',
  },
  {
    key: 'dataQualityGrain',
    label: '2. Data Quality & Row Grain Clarity',
    guidance: 'Defines what 1 row represents and documents NULL, duplicate, and casing fixes.',
  },
  {
    key: 'technicalAnalysis',
    label: '3. Technical SQL / Python / Excel Execution',
    guidance: 'Shows reproducible queries/scripts with safe joins and clean aggregations.',
  },
  {
    key: 'metricAccuracy',
    label: '4. Metric & Denominator Rigor',
    guidance: 'Excludes ineligible records consistently and avoids unweighted rate averages.',
  },
  {
    key: 'visualStorytelling',
    label: '5. Dashboard & Visual Design Plan',
    guidance: 'Maps KPIs to clear chart types with action titles and zero-baseline proportions.',
  },
  {
    key: 'recommendationQuality',
    label: '6. Quantified Recommendations & Trade-offs',
    guidance: 'Proposes specific operational actions tied to estimated dollar/SLA/risk impact.',
  },
  {
    key: 'reproducibility',
    label: '7. Limitations, Assumptions & Reproducibility',
    guidance: 'States sample-size limits, observational caveats, and step-by-step run notes.',
  },
  {
    key: 'communication',
    label: '8. Executive & README Clarity',
    guidance: 'Leads with BLUF summary and avoids jargon-heavy narrative.',
  },
];

export const PORTFOLIO_TEMPLATES: PortfolioTemplateDef[] = [
  {
    id: 'retail-margin',
    label: 'Omnichannel Retail Margin & Discount Audit',
    domain: 'Retail Sales',
    summary: 'Analyze product profitability, segment mix, discount erosion, and return fallout across 3 relational retail tables.',
    defaults: {
      templateId: 'retail-margin',
      title: 'Omnichannel Retail Margin & Discount Erosion Audit',
      businessProblem:
        'Commercial Finance noticed rising gross order demand alongside flat profit contribution and needs to know which customer segments, channels, and discount tiers drive profitable Completed Net Revenue.',
      stakeholderPersona: 'VP of Commercial Finance & Merchandising Lead',
      datasetDescription:
        'Embedded 3-table star schema: retail_orders (18 rows), retail_customers (10 accounts across Enterprise, SMB, Consumer), and retail_products (6 SKUs across 4 categories).',
      dataDictionary:
        'order_id (PK), order_date, customer_id (FK), product_id (FK), quantity, discount_pct (0.00–0.20), status (Completed/Returned/Cancelled), unit_price, unit_cost.',
      datasetGrain:
        '1 row in retail_orders = 1 customer order transaction line; retail_customers = 1 row per account; retail_products = 1 row per SKU.',
      cleaningDecisions:
        'Excluded 2 Returned orders (ORD-503, ORD-511) and 1 Cancelled order (ORD-506) from Completed Net Revenue; kept fallout rows separate for Return/Cancel Guardrail % (16.7%). Verified unique PKs on dimensions to guarantee 0 join fan-out.',
      analysisQuestions:
        '1) What is total Completed Net Revenue and Gross Margin %? 2) Which customer segment and channel lead profit? 3) How do 15–20% discounts compress SKU contribution margin?',
      workNotes:
        'Reconciled SQL multi-table JOINs against pandas merge+groupby pipeline: Completed Net Revenue = $5,340, COGS = $3,058, Gross Profit = $2,282 (42.7% margin). Enterprise leads ($2,430 rev / $972 profit); Hardware leads category profit ($900).',
      kpiDefinitions:
        'Net Revenue = SUM(quantity * unit_price * (1 - discount_pct)) for status = Completed; Gross Margin % = (Net Revenue - COGS) / Net Revenue; Order Fallout Rate = (Returned + Cancelled) / All Orders.',
      dashboardPlan:
        'Executive KPI Row (Net Rev $5,340, Gross Margin 42.7%, Fallout 16.7%) -> Sorted Horizontal Bar: Profit by Segment -> Channel Mix Comparison -> Discount Tier Margin Sensitivity Table.',
      findings:
        '1) Enterprise drives 45.5% of Completed Net Revenue ($2,430) with $972 Gross Profit. 2) Web leads channels ($2,172) ahead of In-Store ($1,830). 3) Order fallout is 16.7% (3 of 18 orders). 4) Steep 20% discounts cut Hardware margins sharply.',
      quantifiedRecommendations:
        'Cap blanket Web discounts at 10% on Hardware/Accessories and shift Enterprise incentives toward multi-unit bundles—preserving ~5–8 pp of Gross Margin while monitoring Return Rate <= 12%.',
      limitationsAndAssumptions:
        'Small sample snapshot (18 February 2025 orders); does not include fulfillment shipping costs or customer acquisition spend (CAC).',
      nextSteps:
        'Extend audit across 90 days of historical orders and A/B test bundle thresholds vs. flat % coupons.',
      skillsDemonstrated: 'SQL Joins & CTEs, pandas Merge/GroupBy, Star Schema Modeling, DAX DIVIDE/ALL, Margin Sensitivity',
      shortSummary:
        'Audited omnichannel retail orders across 3 relational tables, reconciling $5,340 Completed Net Revenue (42.7% margin) in SQL and pandas and pinpointing segment profit and discount erosion levers.',
      longCaseStudy: '',
      readmeDraft: '',
    },
  },
  {
    id: 'operations-sla',
    label: 'Logistics Carrier SLA & Unit Freight Cost Benchmark',
    domain: 'Operations',
    summary: 'Clean casing drift, handle pending NULL deliveries, and isolate SLA breaches across 4 warehouse hubs.',
    defaults: {
      templateId: 'operations-sla',
      title: 'Logistics Carrier SLA & Unit Freight Cost Benchmark',
      businessProblem:
        'Operations leadership wants to reduce SLA delivery breaches without inflating freight cost per unit across four regional warehouse hubs.',
      stakeholderPersona: 'VP of Supply Chain & Logistics Operations',
      datasetDescription:
        'operations_shipments (20 dispatch records) joined to warehouse_hubs (4 regional facilities with monthly fixed overhead).',
      dataDictionary:
        'shipment_id (PK), hub_id (FK), carrier (dirty casing), ship_date, delivery_days (NULL if In Transit), sla_target_days, units, freight_cost, status.',
      datasetGrain:
        '1 row in operations_shipments = 1 individual freight dispatch; 1 row in warehouse_hubs = 1 regional hub.',
      cleaningDecisions:
        'Normalized carrier strings via LOWER(TRIM(carrier)) / .str.strip().str.lower() to merge ApexFreight/apexfreight and SwiftHaul/swifthaul. Excluded 2 "In Transit" NULL rows (SHP-1013, SHP-1018) from completed SLA & transit averages.',
      analysisQuestions:
        '1) What is the true completed SLA breach rate and delayed freight spend? 2) How do carriers compare on normalized Cost per Unit? 3) Which hubs generate the most delayed freight dollars?',
      workNotes:
        '6 of 18 completed dispatches breached SLA (33.3%), totaling $2,900 delayed freight. HUB-W accounted for $1,400 of delayed freight (SHP-1007, SHP-1015). Weighted cost/unit: SwiftHaul $3.64, NorthStar $3.66, ApexFreight $3.70.',
      kpiDefinitions:
        'SLA Breach Rate = Delayed / Completed Shipments (delivery_days IS NOT NULL); Freight Cost per Unit = SUM(freight_cost) / SUM(units).',
      dashboardPlan:
        'Top KPI strip (33.3% breach, $2,900 delayed spend, $3.67 avg cost/unit) -> Carrier Cost vs. Delay Rate Matrix -> Hub-level SLA Waterfall.',
      findings:
        '1) Data cleaning collapsed 5 fragmented carrier strings into 3 true carriers. 2) HUB-W drives nearly half ($1,400 of $2,900) of delayed freight spend. 3) SwiftHaul offers lowest unit cost ($3.64/unit) but needs West/Midwest lane review.',
      quantifiedRecommendations:
        'Re-route non-urgent HUB-W overflow to NorthStar during peak weeks and renegotiate SLA penalty credits on lanes exceeding 25% delay rates.',
      limitationsAndAssumptions:
        '20-row January 2025 operational extract; excludes carrier dimensional-weight surcharges and weather disruptions.',
      nextSteps:
        'Track weekly hub-carrier SLA variance and standard deviation of delivery_days over a full 12-week window.',
      skillsDemonstrated: 'Data Quality Auditing, Excel XLOOKUP/SUMIFS, SQL Case Normalization, pandas Cleaning, SLA Break-Even',
      shortSummary:
        'Cleaned carrier casing drift and pending-shipment NULLs across 20 logistics dispatches, uncovering a 33.3% SLA breach rate and $1,400 West Hub delay concentration.',
      longCaseStudy: '',
      readmeDraft: '',
    },
  },
  {
    id: 'banking-risk',
    label: 'Credit Card Utilization, Delinquency & Fraud Triage',
    domain: 'Banking & Credit Cards',
    summary: 'Segment credit utilization exposure, separate settled interchange revenue from declined/flagged attempts, and avoid false-positive fraud rules.',
    defaults: {
      templateId: 'banking-risk',
      title: 'Credit Card Utilization, Delinquency & Cross-Border Risk Audit',
      businessProblem:
        'Consumer Card Risk needs to prioritize collections outreach on high-utilization delinquent accounts while refining cross-border fraud alerts without blocking legitimate Platinum travel spend.',
      stakeholderPersona: 'Head of Consumer Card Risk & Fraud Operations',
      datasetDescription:
        'credit_card_transactions (16 authorization events) and cardholder_accounts (8 cardholder profiles across Platinum, Gold, Standard).',
      dataDictionary:
        'txn_id (PK), account_id (FK), merchant_category, amount, interchange_fee, is_international (0/1), status; credit_limit, current_balance, delinquency_days.',
      datasetGrain:
        '1 row in credit_card_transactions = 1 authorization attempt; 1 row in cardholder_accounts = 1 cardholder account.',
      cleaningDecisions:
        'Separated Approved ($4,665 settled spend, $105.15 interchange) from Declined ($2,160) and Flagged ($2,990) before calculating revenue; aggregated transaction metrics before joining to account credit limits to prevent fan-out.',
      analysisQuestions:
        '1) Which accounts carry simultaneous >=80% utilization and 30+ DPD delinquency? 2) Why does mean ($613.44) diverge from median ($420)? 3) Should all international transactions be blocked?',
      workNotes:
        'ACC-105 (90% util, 62 DPD) and ACC-103 (80% util, 35 DPD) sit in high-risk Standard tier. Only 2 of 5 international txns were Flagged; 2 Platinum Travel txns ($2,230) were legitimate Approved spend.',
      kpiDefinitions:
        'Credit Utilization % = current_balance / credit_limit; Approved Interchange Revenue = SUM(interchange_fee) WHERE status = Approved; International False-Positive Exposure = Approved International Volume.',
      dashboardPlan:
        'Account Risk Quadrant (Utilization % vs. DPD) -> Card Tier Approved Spend & Interchange Bar -> Skewness Summary (Mean vs Median/IQR).',
      findings:
        '1) Standard accounts ACC-105 & ACC-103 carry acute credit risk (80–90% util, 35–62 DPD). 2) Platinum drives 56.1% of Approved spend ($2,615) with 0 DPD. 3) Blanket international blocks would disrupt $2,230 in legitimate Platinum travel.',
      quantifiedRecommendations:
        'Trigger early collections outreach at 75% utilization and deploy 2FA SMS step-up verification for cross-border charges > $750 instead of hard declines.',
      limitationsAndAssumptions:
        'Small observational extract (16 txns, 8 accounts); n=2 flagged events cannot prove causation or train automated ML blocks.',
      nextSteps:
        'Evaluate 6-month chargeback recovery rates and pilot step-up SMS verification on Gold/Standard cross-border swipes.',
      skillsDemonstrated: 'SQL Multi-Table Joins, Skewness & IQR Analysis, Conditional Probability / Base-Rate Guardrails',
      shortSummary:
        'Quantified $4,665 settled interchange volume, isolated 80–90% utilization delinquency pockets, and replaced blanket international blocks with step-up verification framing.',
      longCaseStudy: '',
      readmeDraft: '',
    },
  },
  {
    id: 'hr-attrition',
    label: 'Workforce Overtime Attrition & Payroll Headroom Study',
    domain: 'Human Resources',
    summary: 'Diagnose overtime-linked turnover cohorts, audit active payroll headroom via CTEs, and quantify retention ROI carefully.',
    defaults: {
      templateId: 'hr-attrition',
      title: 'Workforce Overtime Attrition & Department Payroll Headroom Study',
      businessProblem:
        'People Analytics & Finance need to reduce voluntary attrition and plan replacement hiring within strict department payroll budgets.',
      stakeholderPersona: 'Chief People Officer & FP&A Partner',
      datasetDescription:
        'hr_employees (16 staff records with salary, tenure, overtime, attrition) and hr_department_budgets (4 department payroll caps).',
      dataDictionary:
        'emp_id (PK), department, role_level (Junior/Mid/Senior), annual_salary, tenure_months, performance_score, overtime (Yes/No), attrition (Yes/No); annual_payroll_budget.',
      datasetGrain:
        '1 row in hr_employees = 1 employee record; 1 row in hr_department_budgets = 1 department budget envelope.',
      cleaningDecisions:
        'Filtered strictly to attrition = "No" before computing active payroll headroom so departed staff salaries did not understate remaining budget.',
      analysisQuestions:
        '1) How does attrition differ by overtime status and tenure? 2) Which departments have tightest vs. widest budget headroom? 3) What replacement savings come from cutting 3 departures?',
      workNotes:
        'Overall attrition = 31.25% (5/16). Overtime="Yes" attrition = 83.3% (5/6) vs. 0% (0/10) for non-overtime. Finance headroom is $24,000 vs. Operations $224,000.',
      kpiDefinitions:
        'Attrition Rate = Departed / Total Cohort Headcount; Active Payroll Headroom = annual_payroll_budget - SUM(annual_salary WHERE attrition = No).',
      dashboardPlan:
        'Overtime Cohort Attrition Comparison -> Department Active Payroll vs. Budget Bullet Chart -> Active Pay Concentration Table (DENSE_RANK).',
      findings:
        '1) All 5 departures logged Overtime="Yes" (Operations & Sales Junior/Mid <20 months tenure). 2) Finance has tightest budget headroom ($24,000). 3) Preventing 3 departures saves ~$54,000 annually at $18k/hire.',
      quantifiedRecommendations:
        'Audit shift allocation in Operations (using part of its $224k headroom if needed) and territory load in Sales; avoid unplanned headcount additions in Finance.',
      limitationsAndAssumptions:
        'Small observational snapshot (n=16, 1 person = 6.25 pp swing); cannot assert overtime alone caused departures without isolating role level, tenure, and manager factors.',
      nextSteps:
        'Pull 24-month historical HRIS exit records and track overtime hours continuously as a leading turnover indicator.',
      skillsDemonstrated: 'SQL CTEs & Window Functions (DENSE_RANK), Python GroupBy, Small-Sample Statistical Caution',
      shortSummary:
        'Diagnosed an 83.3% attrition concentration among overtime staff alongside Finance’s $24k payroll cap, sizing $54,000 in annual replacement savings with honest small-sample caveats.',
      longCaseStudy: '',
      readmeDraft: '',
    },
  },
  {
    id: 'custom',
    label: 'Custom Blank Portfolio Case Study',
    domain: 'Custom Dataset / Personal Project',
    summary: 'Start from a clean structured scaffold to document your own personal dataset analysis.',
    defaults: {
      templateId: 'custom',
      title: '',
      businessProblem: '',
      stakeholderPersona: '',
      datasetDescription: '',
      dataDictionary: '',
      datasetGrain: '',
      cleaningDecisions: '',
      analysisQuestions: '',
      workNotes: '',
      kpiDefinitions: '',
      dashboardPlan: '',
      findings: '',
      quantifiedRecommendations: '',
      limitationsAndAssumptions: '',
      nextSteps: '',
      skillsDemonstrated: '',
      shortSummary: '',
      longCaseStudy: '',
      readmeDraft: '',
    },
  },
];

export interface PortfolioChecklistItem {
  id: string;
  label: string;
  validate: (p: PortfolioProject) => { passed: boolean; reason: string };
}

function hasMeaningfulText(val: string, minChars: number, minWords = 4): boolean {
  const cleaned = val.trim();
  if (cleaned.length < minChars) return false;
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.length >= minWords;
}

export const PORTFOLIO_COMPLETION_CHECKLIST: PortfolioChecklistItem[] = [
  {
    id: 'chk-title',
    label: 'Clear project title & stakeholder persona defined',
    validate: (p) => ({
      passed: hasMeaningfulText(p.title, 8, 2) && hasMeaningfulText(p.stakeholderPersona, 5, 2),
      reason: 'Include a descriptive project title (8+ chars) and target stakeholder role.',
    }),
  },
  {
    id: 'chk-problem',
    label: 'Business problem states decision at stake',
    validate: (p) => ({
      passed: hasMeaningfulText(p.businessProblem, 35, 7),
      reason: 'Explain the concrete business problem or decision (at least ~7 words).',
    }),
  },
  {
    id: 'chk-grain',
    label: 'Dataset grain & schema/dictionary documented',
    validate: (p) => ({
      passed: hasMeaningfulText(p.datasetGrain, 20, 4) && hasMeaningfulText(p.dataDictionary, 20, 4),
      reason: 'Define what 1 row represents (grain) and list key columns/types.',
    }),
  },
  {
    id: 'chk-cleaning',
    label: 'Data cleaning & exclusion decisions documented',
    validate: (p) => ({
      passed: hasMeaningfulText(p.cleaningDecisions, 30, 6),
      reason: 'Specify how NULLs, duplicates, casing drift, or cancelled/returned rows were handled.',
    }),
  },
  {
    id: 'chk-questions',
    label: 'Analytical questions & technical work notes logged',
    validate: (p) => ({
      passed: hasMeaningfulText(p.analysisQuestions, 25, 5) && hasMeaningfulText(p.workNotes, 25, 5),
      reason: 'List 2+ analytical questions and key SQL/Python/Excel verification notes.',
    }),
  },
  {
    id: 'chk-kpis',
    label: 'Exact KPI definitions (numerator/denominator) written',
    validate: (p) => ({
      passed: hasMeaningfulText(p.kpiDefinitions, 25, 5),
      reason: 'Write explicit KPI formulas so stakeholders know inclusions and denominators.',
    }),
  },
  {
    id: 'chk-dashboard',
    label: 'Visual / dashboard plan aligned to questions',
    validate: (p) => ({
      passed: hasMeaningfulText(p.dashboardPlan, 20, 4),
      reason: 'Outline key dashboard views or chart choices.',
    }),
  },
  {
    id: 'chk-findings',
    label: 'Quantified findings include specific numbers/rates',
    validate: (p) => ({
      passed: hasMeaningfulText(p.findings, 30, 6) && /\d/.test(p.findings),
      reason: 'Include at least 30 characters AND concrete numerical figures inside Findings.',
    }),
  },
  {
    id: 'chk-recs',
    label: 'Actionable recommendations with trade-offs or impact',
    validate: (p) => ({
      passed: hasMeaningfulText(p.quantifiedRecommendations, 30, 6),
      reason: 'State concrete operational recommendations and expected impact or trade-offs.',
    }),
  },
  {
    id: 'chk-limits',
    label: 'Limitations, assumptions & short resume summary completed',
    validate: (p) => ({
      passed:
        hasMeaningfulText(p.limitationsAndAssumptions, 25, 5) &&
        hasMeaningfulText(p.shortSummary, 25, 5),
      reason: 'Document honest data limitations/assumptions plus a concise resume summary.',
    }),
  },
];

export function evaluatePortfolioProjectQuality(project: PortfolioProject) {
  const results = PORTFOLIO_COMPLETION_CHECKLIST.map((item) => ({
    ...item,
    ...item.validate(project),
  }));
  const completedCount = results.filter((r) => r.passed).length;
  const rubricCheckedCount = Object.values(project.rubricSelfReview).filter(Boolean).length;

  const tpl =
    project.templateId !== 'custom'
      ? PORTFOLIO_TEMPLATES.find((t) => t.id === project.templateId)
      : undefined;

  const workNotesCustomized = tpl
    ? project.workNotes.trim() !== tpl.defaults.workNotes.trim() &&
      hasMeaningfulText(project.workNotes, 25, 5)
    : hasMeaningfulText(project.workNotes, 25, 5);

  const findingsOrRecsCustomized = tpl
    ? (project.findings.trim() !== tpl.defaults.findings.trim() &&
        hasMeaningfulText(project.findings, 30, 6)) ||
      (project.quantifiedRecommendations.trim() !== tpl.defaults.quantifiedRecommendations.trim() &&
        hasMeaningfulText(project.quantifiedRecommendations, 30, 6)) ||
      (project.shortSummary.trim() !== tpl.defaults.shortSummary.trim() &&
        hasMeaningfulText(project.shortSummary, 25, 5))
    : hasMeaningfulText(project.findings, 30, 6) &&
      hasMeaningfulText(project.quantifiedRecommendations, 30, 6);

  const rubricThresholdMet = rubricCheckedCount >= 6;
  const learnerAttested = Boolean(project.learnerVerifiedOriginalWork);

  const qualityGateResults = [
    {
      id: 'gate-work-notes',
      label: 'Own SQL / Python / Excel work notes added',
      passed: workNotesCustomized,
      reason: tpl
        ? 'Replace the starter workNotes with your own executed queries, calculations, and verification checks.'
        : 'Document your executed SQL/Python/Excel queries and output checks (25+ chars).',
    },
    {
      id: 'gate-findings-customized',
      label: 'Findings, recommendations, or summary tailored in own words',
      passed: findingsOrRecsCustomized,
      reason: tpl
        ? 'Edit the pre-populated findings, recommendations, or short summary so they reflect your own verified analysis.'
        : 'Customize quantified findings and business recommendations in your own words.',
    },
    {
      id: 'gate-rubric',
      label: 'Rubric self-review completed (6+ of 8 dimensions)',
      passed: rubricThresholdMet,
      reason: `Check at least 6 of 8 self-review dimensions in Step 4 (${rubricCheckedCount}/8 checked).`,
    },
    {
      id: 'gate-attestation',
      label: 'Original work attestation signed',
      passed: learnerAttested,
      reason: 'Confirm in Step 4 that you ran these analyses yourself and verified the figures.',
    },
  ];

  const qualityGatePassedCount = qualityGateResults.filter((g) => g.passed).length;
  const isTemplateBaseline = Boolean(tpl && !workNotesCustomized && !findingsOrRecsCustomized);
  const isPortfolioComplete =
    completedCount === PORTFOLIO_COMPLETION_CHECKLIST.length &&
    qualityGatePassedCount === qualityGateResults.length;

  const statusLabel: 'Template Starter Draft' | 'In Review (Needs Verification)' | 'Job-Ready Artifact' =
    isPortfolioComplete
      ? 'Job-Ready Artifact'
      : isTemplateBaseline
        ? 'Template Starter Draft'
        : 'In Review (Needs Verification)';

  return {
    checklistResults: results,
    completedCount,
    totalChecklist: PORTFOLIO_COMPLETION_CHECKLIST.length,
    rubricCheckedCount,
    totalRubric: PORTFOLIO_RUBRIC_DIMENSIONS.length,
    qualityGateResults,
    qualityGatePassedCount,
    qualityGateTotal: qualityGateResults.length,
    isTemplateBaseline,
    statusLabel,
    isPortfolioComplete,
  };
}

export function generatePortfolioReadmeMarkdown(p: PortfolioProject): string {
  return `# ${p.title || 'Untitled Data Analytics Case Study'}

> **Target Stakeholder:** ${p.stakeholderPersona || 'TBD'}  
> **Skills & Tools:** ${p.skillsDemonstrated || 'SQL, Excel, Python, BI'}

## Executive Summary
${p.shortSummary || p.findings || 'Add a concise 2-3 sentence summary of findings and impact.'}

## 1. Business Problem
${p.businessProblem || '_Document the decision at stake and business context._'}

## 2. Dataset, Grain & Schema
- **Dataset Overview:** ${p.datasetDescription || 'TBD'}
- **Row Grain:** ${p.datasetGrain || 'TBD'}
- **Key Columns:** ${p.dataDictionary || 'TBD'}

## 3. Data Cleaning & Edge-Case Decisions
${p.cleaningDecisions || '_Document NULL handling, string normalization, deduplication, and exclusions._'}

## 4. Key Questions & KPI Definitions
**Analytical Questions**
${p.analysisQuestions || '_List key questions investigated._'}

**KPI Formulas**
${p.kpiDefinitions || '_Define numerators, denominators, and guardrails._'}

## 5. Analysis Notes & Dashboard Plan
- **Technical Verification:** ${p.workNotes || 'TBD'}
- **Dashboard Architecture:** ${p.dashboardPlan || 'TBD'}

## 6. Key Findings
${p.findings || '_Summarize quantified findings._'}

## 7. Quantified Recommendations
${p.quantifiedRecommendations || '_Outline operational actions and expected business impact._'}

## 8. Limitations, Assumptions & Next Steps
- **Limitations & Assumptions:** ${p.limitationsAndAssumptions || 'TBD'}
- **Next Steps:** ${p.nextSteps || 'TBD'}
`;
}

export function generatePortfolioPlainTextCaseStudy(p: PortfolioProject): string {
  const body = p.longCaseStudy.trim()
    ? `\nEXTENDED CASE NARRATIVE\n${p.longCaseStudy.trim()}\n`
    : '';
  return `${(p.title || 'DATA ANALYTICS CASE STUDY').toUpperCase()}
Stakeholder: ${p.stakeholderPersona || 'N/A'}
Skills Demonstrated: ${p.skillsDemonstrated || 'N/A'}

EXECUTIVE SUMMARY
${p.shortSummary || 'N/A'}

BUSINESS PROBLEM
${p.businessProblem || 'N/A'}

DATASET & GRAIN
${p.datasetDescription || 'N/A'}
Grain: ${p.datasetGrain || 'N/A'}
Dictionary: ${p.dataDictionary || 'N/A'}

CLEANING & KPI DEFINITIONS
Cleaning: ${p.cleaningDecisions || 'N/A'}
KPIs: ${p.kpiDefinitions || 'N/A'}

FINDINGS
${p.findings || 'N/A'}

RECOMMENDATIONS
${p.quantifiedRecommendations || 'N/A'}

LIMITATIONS & NEXT STEPS
Limitations: ${p.limitationsAndAssumptions || 'N/A'}
Next Steps: ${p.nextSteps || 'N/A'}
${body}`;
}

// ==========================================
// PHASE 6: BEHAVIORAL INTERVIEW STUDIO DATA
// ==========================================

export const BEHAVIORAL_RUBRIC_ITEMS: { id: string; label: string }[] = [
  { id: 'br-context', label: 'Clear Situation & Role without jargon (<= 20% of time)' },
  { id: 'br-ownership', label: 'Uses "I" for personal actions rather than vague "we"' },
  { id: 'br-method', label: 'Names concrete analytical tools, checks, or methodology' },
  { id: 'br-quantified', label: 'Includes honest numbers, scale, or measurable outcome' },
  { id: 'br-honest', label: '100% truthful—never exaggerates titles or invents analyst jobs' },
  { id: 'br-reflection', label: 'Shares what you learned or would improve next time' },
  { id: 'br-concise', label: 'Deliverable clearly in ~90–120 seconds (2-minute limit)' },
  { id: 'br-audience', label: 'Frames business impact in language a non-technical manager values' },
];

export const BEHAVIORAL_QUESTIONS: BehavioralQuestion[] = [
  {
    id: 'beh-1',
    category: 'Career Transition',
    prompt:
      'You are transitioning into Data Analytics from another background. Why analytics, and how does your prior experience prepare you?',
    whyInterviewersAsk:
      'Tests genuine motivation, transferable problem-solving habits, and whether you can frame past work honestly without inventing analyst titles.',
    strongExample:
      'Situation/Task: In my previous operations coordinator role, I tracked weekly vendor schedules in spreadsheets and noticed repeated bottlenecks. Action: I built standardized pivot trackers, cleaned inconsistent vendor names, and later completed structured SQL, Python, and BI portfolio projects on logistics and retail datasets. Result: My tracker cut weekly schedule reconciliation time by ~2 hours/week, and my portfolio proves I can translate messy operational workflows into reliable SQL and KPI reporting.',
    weakExample:
      'I worked as a Senior Data Analyst at my last job (even though my title was Coordinator) and I love numbers because AI and big data are the future.',
    redFlags: [
      'Inflating non-analyst job titles into "Data Analyst" when asked directly',
      'Giving generic "I love data" answers with zero concrete workflow example',
    ],
    improvementTips: [
      'Anchor on real analytical habits from your prior domain (reconciling spreadsheets, tracking errors, prioritizing bottlenecks).',
      'Point clearly to verifiable SQL/Python/BI portfolio projects as your technical proof.',
    ],
  },
  {
    id: 'beh-2',
    category: 'Portfolio Walkthrough',
    prompt:
      'Walk me through a data analysis project you built from raw table inspection to business recommendation.',
    whyInterviewersAsk:
      'Evaluates end-to-end analytical thinking: problem framing, data cleaning, edge cases, metric rigor, and communication.',
    strongExample:
      'In my Omnichannel Retail Margin Audit, Finance needed clarity on segment profitability across 3 tables. Before aggregating, I audited primary keys to prevent join fan-out and excluded Returned/Cancelled orders (16.7% fallout) from Completed Net Revenue ($5,340, 42.7% margin). I found Enterprise drove 45.5% of revenue ($972 profit) and modeled how 20% flat coupons erode SKU margins—recommending targeted bundle thresholds instead.',
    weakExample:
      'I loaded a CSV, ran SELECT * and made a nice pie chart showing sales went up in February.',
    redFlags: [
      'Unable to name dataset grain, cleaning steps, or exclusions',
      'Describing charts without tying them to a business decision',
    ],
    improvementTips: [
      'Follow the 5-step arc: Decision Question -> Data Cleaning/Grain -> Key Finding -> Quantified Recommendation -> Limitation.',
    ],
    isProjectSpecific: true,
  },
  {
    id: 'beh-3',
    category: 'Ambiguous Requirements',
    prompt:
      'Tell me about a time you received a vague or ambiguous request ("can you pull some data on performance?") and how you clarified it.',
    whyInterviewersAsk:
      'Tests whether you ask clarifying questions upfront instead of building the wrong report for 3 days.',
    strongExample:
      'When asked "why are shipping costs rising?", I paused before querying and aligned with the stakeholder on three things: (1) decision at stake (carrier contract review), (2) normalized KPI (freight cost per unit rather than raw spend), and (3) exclusions (pending In Transit shipments). Clarifying upfront saved two rounds of rework and delivered a carrier-hub benchmark they used immediately.',
    weakExample:
      'I pulled every column from the shipments table into a 10-tab spreadsheet and asked them to tell me what they wanted.',
    redFlags: [
      'Dumping raw exports without scoping the decision',
      'Complaining that stakeholders don’t know what they want',
    ],
    improvementTips: [
      'Mention confirming Numerator, Denominator, Time Window, and Decision Owner.',
    ],
  },
  {
    id: 'beh-4',
    category: 'Stakeholder Disagreement',
    prompt:
      'Describe a time a stakeholder disagreed with your numbers or preferred a different metric.',
    whyInterviewersAsk:
      'Checks emotional maturity, reconciliation discipline, and ability to align definitions collaboratively.',
    strongExample:
      'In a review scenario, a stakeholder’s manual sheet showed $6,100 gross sales while my SQL report showed $5,340. Rather than arguing who was right, I built a 3-line Gross-to-Net bridge in 10 minutes showing two Returned orders and one Cancelled order accounted for the gap. Agreeing on a single Completed Net Revenue definition eliminated future mismatches.',
    weakExample:
      'Their Excel sheet was wrong so I sent them my SQL query to prove it.',
    redFlags: [
      'Being defensive or dismissive of stakeholder spreadsheets',
      'Changing your query secretly just to match an executive’s guess',
    ],
    improvementTips: [
      'Always emphasize building a transparent reconciliation bridge between two definitions.',
    ],
  },
  {
    id: 'beh-5',
    category: 'Delivering Bad News',
    prompt:
      'Tell me about a time your analysis uncovered an unwelcome result or showed a favorite initiative was underperforming.',
    whyInterviewersAsk:
      'Tests analytical objectivity and tact when presenting uncomfortable truths.',
    strongExample:
      'When evaluating a proposed 20% site-wide promotional discount, my unit-economics model showed unit gross profit on our flagship $150 dock ($90 cost) dropped 50% (from $60 to $30), requiring double unit volume just to break even on profit dollars. I framed the presentation constructively—showing the math and offering a targeted bundle alternative that protected margin.',
    weakExample:
      'I showed them the campaign failed and told marketing their idea didn’t make sense.',
    redFlags: [
      'Softening or hiding negative metrics to please leadership',
      'Delivering critique without offering an actionable alternative',
    ],
    improvementTips: [
      'Pair bad news with clear unit-economics evidence and 1–2 constructive options.',
    ],
  },
  {
    id: 'beh-6',
    category: 'Data Quality Catch',
    prompt:
      'Share an example of when you caught a hidden data quality issue before it reached a report or decision.',
    whyInterviewersAsk:
      'Great junior analysts inspect raw data skeptically; interviewers look for defensive QA habits.',
    strongExample:
      'While benchmarking carrier transit performance in the operations dataset, GROUP BY carrier produced 5 rows instead of 3 due to casing drift ("ApexFreight" vs "apexfreight"), and two In Transit rows had NULL delivery_days. I normalized casing with LOWER(TRIM()) and kept NULLs out of transit averages instead of coercing to 0—preventing distorted carrier rankings.',
    weakExample:
      'I never had data errors because our database is already clean.',
    redFlags: [
      'Assuming source tables have zero duplicates, NULLs, or casing drift',
      'Replacing structural NULLs with 0 blindly',
    ],
    improvementTips: [
      'Name exact QA checks you run: row count vs. distinct PK, NULL profiling, and category casing checks.',
    ],
    isProjectSpecific: true,
  },
  {
    id: 'beh-7',
    category: 'Prioritization & Deadlines',
    prompt:
      'How do you prioritize when multiple teams send urgent data requests at the same time?',
    whyInterviewersAsk:
      'Assesses business judgment, time management, and transparent expectation setting.',
    strongExample:
      'I triage requests along two axes: business decision urgency (e.g., board review today vs. exploratory curiosity) and analytical effort. On a tight deadline, I confirm whether a verified directional metric today followed by a deeper breakdown tomorrow meets the need—and communicate realistic delivery times upfront.',
    weakExample:
      'I just work on whichever Slack message arrived last or stay up all night doing everything at once.',
    redFlags: [
      'Saying "yes" to every timeline without negotiating scope',
      'Skipping QA checks to rush numbers out',
    ],
    improvementTips: [
      'Mention separating "directional now" vs. "deep dive later" while never compromising metric accuracy.',
    ],
  },
  {
    id: 'beh-8',
    category: 'Mistake & Accountability',
    prompt:
      'Tell me about a mistake you made in an analysis or formula and how you resolved it.',
    whyInterviewersAsk:
      'Tests integrity, root-cause learning, and whether you put safeguards in place afterward.',
    strongExample:
      'Early in a spreadsheet exercise, I omitted the exact-match flag and range locks on a lookup, which caused #N/A and wrong matches lower in the sheet. As soon as I spotted totals mismatching my PivotTable cross-check, I flagged it, replaced it with locked XLOOKUP + COUNTIF error audit, and adopted a rule to cross-check every summary table against raw totals.',
    weakExample:
      'I’m a perfectionist so I rarely make mistakes—maybe I worked too hard once.',
    redFlags: [
      'Claiming you never make mistakes',
      'Blaming someone else or hiding an error after discovery',
    ],
    improvementTips: [
      'Own the error in 1 sentence, focus 60% on detection + fix, and close with the permanent checklist habit you added.',
    ],
  },
  {
    id: 'beh-9',
    category: 'Executive Communication',
    prompt:
      'Explain a complex technical concept (like SQL LEFT JOIN traps, DAX filter context, or statistical skewness) to a non-technical executive.',
    whyInterviewersAsk:
      'Analysts bridge technical tables and non-technical leaders; clarity without jargon is vital.',
    strongExample:
      'When explaining why mean transaction size ($613) looked high while typical swipes were smaller ($420 median), I avoided math jargon: "Imagine nine customers spending $100 and one VIP spending $5,000—the average says $590 even though almost everyone spent $100. So we use the median to size typical customer behavior and total sum for revenue."',
    weakExample:
      'Well, the third central moment indicates positive skewness where the expectation exceeds the 50th quantile.',
    redFlags: [
      'Using academic jargon or SQL syntax when speaking to business stakeholders',
    ],
    improvementTips: [
      'Use a tiny concrete analogy and connect immediately back to what decision changes.',
    ],
  },
  {
    id: 'beh-10',
    category: 'Working With Uncertainty',
    prompt:
      'Tell me how you handle making a recommendation when the dataset is small, incomplete, or observational.',
    whyInterviewersAsk:
      'Checks statistical maturity—avoiding overconfident causal claims while still helping teams decide.',
    strongExample:
      'In my Banking Risk & HR case studies (16–20 rows), the signals were strong—such as 5 of 6 overtime staff leaving—but n was too small for causal proof. I explicitly framed what was justified (prioritizing Operations/Sales shift audits) vs. what was not (claiming overtime alone causes 83% turnover everywhere), and recommended pulling 12+ months of historical cohorts before policy overhaul.',
    weakExample:
      'Since 100% of flagged rows were international, the data proved international transactions cause fraud.',
    redFlags: [
      'Asserting causation from small observational tables',
      'Freezing and refusing to give any actionable next step',
    ],
    improvementTips: [
      'Balance directional action ("audit this segment next") with explicit sample/confounding caveats.',
    ],
    isProjectSpecific: true,
  },
  {
    id: 'beh-11',
    category: 'Cross-Functional Collaboration',
    prompt:
      'Describe a time you worked with another team (e.g., engineering, finance, operations) to solve an operational or data problem.',
    whyInterviewersAsk:
      'Tests empathy for upstream data producers and downstream operators.',
    strongExample:
      'In my prior workflow coordinating vendor records, inconsistent naming forced manual cleanup every Monday. I partnered with the two intake teammates to agree on 3 standardized dropdown labels rather than free-text entry—cutting cleanup time and eliminating mismatched summaries downstream.',
    weakExample:
      'I just fixed the data myself every week because other teams don’t care about clean inputs.',
    redFlags: [
      'Treating upstream teams as adversaries instead of partners',
    ],
    improvementTips: [
      'Highlight fixing root-cause intake friction collaboratively rather than complaining.',
    ],
  },
  {
    id: 'beh-12',
    category: 'Continuous Improvement',
    prompt:
      'Why do you believe you are ready to contribute on a Data Analytics team right now?',
    whyInterviewersAsk:
      'Lets you summarize verifiable evidence cleanly without overpromising.',
    strongExample:
      'While I am early in my analytics career, I have built end-to-end fluency across the core workflow: defining KPI guardrails, modeling in Excel, writing multi-table SQL CTEs and window functions, cleaning DataFrames in pandas, applying statistical caution, and documenting complete case studies with reconciled metrics and limitations.',
    weakExample:
      'Because I completed an online course certificate so I already know everything about analytics.',
    redFlags: [
      'Overclaiming senior-level mastery or pretending courses equal years of production tenure',
    ],
    improvementTips: [
      'Ground confidence in concrete artifacts: SQL queries, cleaned datasets, and portfolio case studies.',
    ],
  },
];

// ==========================================
// PHASE 7: CAREER READINESS, JD ANALYZER & CHECKLIST
// ==========================================

export const APPLICATION_READINESS_CHECKLIST: {
  id: string;
  category: string;
  label: string;
}[] = [
  { id: 'cr-1', category: 'Curriculum', label: 'Completed Modules 1–3 (Foundations, Excel, SQL)' },
  { id: 'cr-2', category: 'Curriculum', label: 'Completed Modules 4–5 (Python & Statistics)' },
  { id: 'cr-3', category: 'Curriculum', label: 'Completed Modules 6–8 (BI/DAX, Business Cases, Interview Prep)' },
  { id: 'cr-4', category: 'Hands-On', label: 'Verified guided lab challenges across Operations, Retail, Banking & HR' },
  { id: 'cr-5', category: 'Hands-On', label: 'Completed at least 2 Timed Practice drills (SQL & Python)' },
  { id: 'cr-6', category: 'Assessments', label: 'Passed Final Job-Readiness Capstone Assessment (>= 80%)' },
  { id: 'cr-7', category: 'Portfolio', label: 'Built & exported at least 1 complete Portfolio Case Study + README' },
  { id: 'cr-8', category: 'Portfolio', label: 'Reviewed portfolio against all 8 quality rubric dimensions' },
  { id: 'cr-9', category: 'Resume', label: 'Drafted 1-page honest Data Analyst Resume Worksheet (no fabricated experience)' },
  { id: 'cr-10', category: 'Resume', label: 'Every bullet follows Action + Method/Tool + Quantified Result / Scope' },
  { id: 'cr-11', category: 'Behavioral', label: 'Saved STAR/CAR drafts for Career Transition + Portfolio Walkthrough' },
  { id: 'cr-12', category: 'Behavioral', label: 'Practiced 3+ behavioral answers under the 2-Minute Timer Mode' },
  { id: 'cr-13', category: 'Job Search', label: 'Analyzed at least 1 real target job description with the local JD Gap Analyzer' },
  { id: 'cr-14', category: 'Job Search', label: 'Prepared project links (GitHub/Portfolio PDF/Case Studies) ready to share' },
  { id: 'cr-15', category: 'Job Search', label: 'Set up weekly follow-up cadence in the local Application Tracker' },
];

export interface JdSkillRule {
  skill: string;
  category: 'tool' | 'technical' | 'domain';
  patterns: string[];
  lmsRecommendation: string;
  lmsHref: string;
  isSatisfied: (state: LmsLocalState) => 'strong' | 'partial' | 'missing';
}

function hasAnyPassedQuiz(state: LmsLocalState, quizIds: string[]): boolean {
  return quizIds.some((id) => state.quizResults[id]?.passed);
}

function countLessonsDone(state: LmsLocalState, prefix: string): number {
  return state.completedLessonIds.filter((id) => id.startsWith(prefix)).length;
}

export const JD_SKILL_RULES: JdSkillRule[] = [
  {
    skill: 'SQL (Joins, CTEs, Window Functions)',
    category: 'tool',
    patterns: ['sql', 'postgres', 'mysql', 'snowflake', 'bigquery', 'cte', 'window function'],
    lmsRecommendation: 'Module 3 (SQL) + Retail/HR Labs + Timed SQL Practice',
    lmsHref: '#/module/mod-3',
    isSatisfied: (s) => {
      const l = countLessonsDone(s, 'm3-');
      const q = hasAnyPassedQuiz(s, ['quiz-mod-3']);
      const timedSql = s.timedAttempts.some((a) => a.language === 'sql' && a.scorePercent >= 70);
      if (l >= 3 && (q || timedSql)) return 'strong';
      if (l >= 1 || timedSql) return 'partial';
      return 'missing';
    },
  },
  {
    skill: 'Microsoft Excel / Spreadsheets',
    category: 'tool',
    patterns: ['excel', 'spreadsheet', 'xlookup', 'vlookup', 'pivot', 'sumifs'],
    lmsRecommendation: 'Module 2 (Excel Modeling) + Operations Lab',
    lmsHref: '#/module/mod-2',
    isSatisfied: (s) => {
      const l = countLessonsDone(s, 'm2-');
      const q = hasAnyPassedQuiz(s, ['quiz-mod-2']);
      if (l >= 3 && q) return 'strong';
      if (l >= 1) return 'partial';
      return 'missing';
    },
  },
  {
    skill: 'Python & pandas',
    category: 'tool',
    patterns: ['python', 'pandas', 'numpy', 'jupyter', 'dataframe'],
    lmsRecommendation: 'Module 4 (Python for Data Analysis) + Python Lab & Timed Practice',
    lmsHref: '#/module/mod-python',
    isSatisfied: (s) => {
      const l = countLessonsDone(s, 'py-');
      const q = hasAnyPassedQuiz(s, ['quiz-mod-python']);
      const timedPy = s.timedAttempts.some((a) => a.language === 'python' && a.scorePercent >= 70);
      if (l >= 6 && (q || timedPy)) return 'strong';
      if (l >= 1 || timedPy) return 'partial';
      return 'missing';
    },
  },
  {
    skill: 'BI Dashboards / Power BI / Tableau / DAX',
    category: 'tool',
    patterns: ['power bi', 'powerbi', 'tableau', 'looker', 'dax', 'dashboard', 'bi ', 'star schema'],
    lmsRecommendation: 'Module 6 (Data Visualization, Star Schemas & DAX)',
    lmsHref: '#/module/mod-4',
    isSatisfied: (s) => {
      const l = countLessonsDone(s, 'm4-');
      const q = hasAnyPassedQuiz(s, ['quiz-mod-4']);
      if (l >= 3 && q) return 'strong';
      if (l >= 1) return 'partial';
      return 'missing';
    },
  },
  {
    skill: 'Statistics & A/B Experimentation',
    category: 'technical',
    patterns: ['statistic', 'a/b', 'ab test', 'hypothesis', 'p-value', 'confidence interval', 'regression', 'probability', 'experiment'],
    lmsRecommendation: 'Module 5 (Statistics & Experimentation) + Statistics Lab',
    lmsHref: '#/module/mod-stats',
    isSatisfied: (s) => {
      const l = countLessonsDone(s, 'st-');
      const q = hasAnyPassedQuiz(s, ['quiz-mod-stats']);
      if (l >= 6 && q) return 'strong';
      if (l >= 1) return 'partial';
      return 'missing';
    },
  },
  {
    skill: 'KPI Design & Metric Trees',
    category: 'domain',
    patterns: ['kpi', 'metric', 'okr', 'north star', 'root cause', 'funnel', 'retention', 'margin'],
    lmsRecommendation: 'Module 1 (Business Thinking & KPI Design) + Module 7 Cases',
    lmsHref: '#/module/mod-1',
    isSatisfied: (s) => {
      const l = countLessonsDone(s, 'm1-');
      const q = hasAnyPassedQuiz(s, ['quiz-mod-1', 'quiz-mod-5']);
      if (l >= 3 && q) return 'strong';
      if (l >= 1) return 'partial';
      return 'missing';
    },
  },
  {
    skill: 'Data Cleaning & Quality Assurance',
    category: 'technical',
    patterns: ['data clean', 'data quality', 'etl', 'wrangl', 'grain', 'deduplicat', 'validation'],
    lmsRecommendation: 'Data Quality Audits (m1-l3, py-l7) + Operations Lab',
    lmsHref: '#/lesson/m1-l3',
    isSatisfied: (s) => {
      const hasQA =
        s.completedLessonIds.includes('m1-l3') || s.completedLessonIds.includes('py-l7');
      const opsLab = s.exerciseCheckStatus['lab-ops-1'] === 'verified';
      if (hasQA && opsLab) return 'strong';
      if (hasQA || opsLab) return 'partial';
      return 'missing';
    },
  },
  {
    skill: 'Stakeholder Communication & Storytelling',
    category: 'domain',
    patterns: ['stakeholder', 'storytelling', 'executive', 'presentation', 'communicate', 'recommendation', 'cross-functional'],
    lmsRecommendation: 'Behavioral Interview Studio (Module 8) + Portfolio Case Study Builder',
    lmsHref: '#/portfolio',
    isSatisfied: (s) => {
      const hasPortfolio = s.portfolioProjects.length > 0;
      const hasBehavioral = s.behavioralAnswers.length >= 2;
      if (hasPortfolio && hasBehavioral) return 'strong';
      if (hasPortfolio || hasBehavioral || s.completedLessonIds.includes('m1-l4')) return 'partial';
      return 'missing';
    },
  },
];

export function parseJobDescriptionLocally(rawText: string): {
  requiredTools: string[];
  technicalSkills: string[];
  domainSkills: string[];
  experienceExpectations: string;
  communicationExpectations: string;
} {
  const lower = rawText.toLowerCase();
  const requiredTools: string[] = [];
  const technicalSkills: string[] = [];
  const domainSkills: string[] = [];

  for (const rule of JD_SKILL_RULES) {
    if (rule.patterns.some((p) => lower.includes(p))) {
      if (rule.category === 'tool') requiredTools.push(rule.skill);
      else if (rule.category === 'technical') technicalSkills.push(rule.skill);
      else domainSkills.push(rule.skill);
    }
  }

  // Extract years/experience clues purely locally
  const yearMatch = rawText.match(/(\d+\+?\s*(?:to|-|–)?\s*\d*\s*years?[^.\n]*)/i);
  const experienceExpectations = yearMatch
    ? yearMatch[1].trim()
    : lower.includes('entry') || lower.includes('junior') || lower.includes('associate')
      ? 'Entry / Junior level analytical fluency emphasized'
      : 'Not explicitly specified — highlight verified portfolio & transferable impact';

  const commHits: string[] = [];
  if (lower.includes('stakeholder')) commHits.push('partnering with stakeholders');
  if (lower.includes('executive') || lower.includes('leadership')) commHits.push('executive reporting');
  if (lower.includes('present') || lower.includes('story')) commHits.push('data storytelling');
  if (lower.includes('cross-functional')) commHits.push('cross-functional alignment');
  const communicationExpectations =
    commHits.length > 0
      ? `Emphasizes ${commHits.join(', ')}`
      : 'Translate metrics clearly into actionable business recommendations';

  return {
    requiredTools,
    technicalSkills,
    domainSkills,
    experienceExpectations,
    communicationExpectations,
  };
}

export function evaluateJobGapLocally(
  entry: Pick<JobGapAnalysisEntry, 'requiredTools' | 'technicalSkills' | 'domainSkills'>,
  state: LmsLocalState
) {
  const requestedSkills = Array.from(
    new Set([...entry.requiredTools, ...entry.technicalSkills, ...entry.domainSkills])
  );

  const strongMatches: { skill: string; rule?: JdSkillRule }[] = [];
  const partialMatches: { skill: string; rule?: JdSkillRule }[] = [];
  const missingSkills: { skill: string; rule?: JdSkillRule }[] = [];

  for (const skillName of requestedSkills) {
    const matchedRule = JD_SKILL_RULES.find(
      (r) =>
        r.skill.toLowerCase() === skillName.toLowerCase() ||
        r.patterns.some((p) => skillName.toLowerCase().includes(p))
    );
    if (!matchedRule) {
      missingSkills.push({ skill: skillName });
      continue;
    }
    const status = matchedRule.isSatisfied(state);
    if (status === 'strong') strongMatches.push({ skill: skillName, rule: matchedRule });
    else if (status === 'partial') partialMatches.push({ skill: skillName, rule: matchedRule });
    else missingSkills.push({ skill: skillName, rule: matchedRule });
  }

  return {
    strongMatches,
    partialMatches,
    missingSkills,
  };
}
