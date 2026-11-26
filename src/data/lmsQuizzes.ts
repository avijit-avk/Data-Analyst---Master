import { LmsQuiz } from '../types/academy';

export const LMS_QUIZZES: LmsQuiz[] = [
  {
    id: 'quiz-mod-1',
    moduleId: 'mod-1',
    title: 'Module 1 Quiz: Analytics Foundations & Business Thinking',
    subtitle: 'KPI design, metric trees, data quality audits, and executive communication.',
    passingPercent: 80,
    questions: [
      {
        id: 'q1-1',
        topicTag: 'KPI Design',
        prompt:
          'Hub A had 20 delayed shipments out of 200 (10%), and Hub B had 10 delayed out of 50 (20%). How should you calculate the combined delay rate?',
        options: [
          'Average the two hub rates: (10% + 20%) / 2 = 15.0%',
          'Re-aggregate raw totals: (20 + 10) / (200 + 50) = 12.0%',
          'Use the median hub delay rate: 15.0%',
          'Weight equally by number of hubs, then subtract cancellations',
        ],
        correctIndex: 1,
        explanation:
          'Never average pre-computed percentages across unequal denominators. Always sum raw numerators (30 delayed) and divide by summed raw denominators (250 total) = 12.0%.',
      },
      {
        id: 'q1-2',
        topicTag: 'Guardrail Metrics',
        prompt:
          'Your company launches a 20% site-wide coupon to grow order volume. Which guardrail metric directly protects unit profitability?',
        options: [
          'Total social media impressions',
          'Gross Margin % and Return Rate %',
          'Cumulative lifetime registered users',
          'Average page load latency only',
        ],
        correctIndex: 1,
        explanation:
          'Heavy discounting can lift order volume while eroding Gross Margin % below break-even and attracting lower-intent orders with higher returns.',
      },
      {
        id: 'q1-3',
        topicTag: 'NULL Semantics',
        prompt:
          'In operations_shipments, two "In Transit" rows have NULL in delivery_days. What happens if you replace those NULLs with 0 before computing AVG(delivery_days)?',
        options: [
          'Average delivery time increases artificially',
          'Average delivery time drops artificially because uncompleted shipments are counted as 0-day deliveries',
          'SQL throws a divide-by-zero error',
          'Nothing changes because 0 and NULL behave identically in AVG()',
        ],
        correctIndex: 1,
        explanation:
          'AVG() automatically skips NULLs, whereas coercing structural NULLs to 0 injects two fake "instant 0-day" deliveries and understates actual transit time.',
      },
      {
        id: 'q1-4',
        topicTag: 'Metric Variance',
        prompt:
          'A product line’s Gross Margin falls from 45% to 36%. Which statement reports both absolute and relative change accurately?',
        options: [
          'Margin fell by 9% relative and 20 percentage points absolute',
          'Margin fell by 9 percentage points (a 20% relative decline)',
          'Margin fell by 20 percentage points',
          'Margin stayed within 9% of baseline',
        ],
        correctIndex: 1,
        explanation:
          '45% - 36% = 9 percentage points (pp) absolute decline; 9 / 45 = 20% relative decline.',
      },
      {
        id: 'q1-5',
        topicTag: 'Executive Framing',
        prompt:
          'Which chart title follows Answer-First (Pyramid Principle) communication best practices?',
        options: [
          'Freight Cost by Carrier (Q1)',
          'Operations Data Analysis Table 2',
          'ApexFreight Delays in West Hub Drove $1,400 in Excess Freight Spend',
          'All Carrier Metrics Overview',
        ],
        correctIndex: 2,
        explanation:
          'Action titles state the takeaway and quantified magnitude immediately so busy executives understand the insight before reading axis labels.',
      },
    ],
  },
  {
    id: 'quiz-mod-2',
    moduleId: 'mod-2',
    title: 'Module 2 Quiz: Excel & Spreadsheet Modeling',
    subtitle: 'XLOOKUP, INDEX/MATCH, SUMIFS, text/date cleaning, and financial modeling.',
    passingPercent: 80,
    questions: [
      {
        id: 'q2-1',
        topicTag: 'Lookups',
        prompt:
          'Why is =XLOOKUP(B2, Hubs!$A$2:$A$5, Hubs!$C$2:$C$5, "Missing") safer than VLOOKUP(B2, Hubs!A2:C5, 3)?',
        options: [
          'XLOOKUP automatically sorts the lookup table alphabetically',
          'XLOOKUP defaults to exact match, locks ranges, tolerates column insertions, and handles missing keys cleanly',
          'VLOOKUP only works on numeric IDs',
          'XLOOKUP returns multiple rows stacked vertically by default',
        ],
        correctIndex: 1,
        explanation:
          'Omitting the 4th argument in VLOOKUP defaults to approximate match, unlocked ranges shift when dragged, and hardcoding column index 3 breaks if columns are inserted.',
      },
      {
        id: 'q2-2',
        topicTag: 'SUMIFS',
        prompt: 'Which formula correctly sums freight ($H$2:$H$21) for Delayed orders ($I$2:$I$21) in HUB-W ($B$2:$B$21)?',
        options: [
          '=SUMIFS($B$2:$B$21, "HUB-W", $I$2:$I$21, "Delayed", $H$2:$H$21)',
          '=SUMIFS($H$2:$H$21, $B$2:$B$21, "HUB-W", $I$2:$I$21, "Delayed")',
          '=SUMIF($H$2:$H$21, "HUB-W", "Delayed")',
          '=SUMIFS($H$2:$H$21, $B$2:$B$20, "HUB-W", $I$2:$I$21, "Delayed")',
        ],
        correctIndex: 1,
        explanation:
          'In SUMIFS, sum_range is always the FIRST argument, followed by matching-length (criteria_range, criteria) pairs.',
      },
      {
        id: 'q2-3',
        topicTag: 'Date Cleaning',
        prompt:
          'You want to bucket daily dates in A2 into true chronological month-start dates for PivotTable sorting. Which formula works best?',
        options: [
          '=TEXT(A2, "mmm-yyyy")',
          '=EOMONTH(A2, -1) + 1',
          '=MONTH(A2) & "-" & YEAR(A2)',
          '=LEFT(A2, 7)',
        ],
        correctIndex: 1,
        explanation:
          'TEXT() and concatenation produce text strings that sort alphabetically (Apr before Feb). EOMONTH(A2, -1) + 1 returns a genuine numeric date for the 1st of the month.',
      },
      {
        id: 'q2-4',
        topicTag: 'Unit Economics',
        prompt:
          'A product sells for $200 list price with a 15% discount and $110 unit COGS. What is the Gross Margin %?',
        options: ['35.3%', '45.0%', '54.5%', '30.0%'],
        correctIndex: 0,
        explanation:
          'Net price = $200 * (1 - 0.15) = $170. Gross profit = $170 - $110 = $60. Gross Margin % = $60 / $170 = 35.29% (~35.3%).',
      },
      {
        id: 'q2-5',
        topicTag: 'Financial Modeling',
        prompt:
          'When computing Net Present Value in Excel with an upfront Year 0 outflow in B2 (-$50,000) and Year 1–3 cash inflows in C2:E2, which formula is right?',
        options: [
          '=NPV(0.10, B2:E2)',
          '=NPV(0.10, C2:E2) + B2',
          '=NPV(0.10, C2:E2) - B2',
          '=IRR(C2:E2) + B2',
        ],
        correctIndex: 1,
        explanation:
          'Excel’s NPV() assumes the first range argument occurs at period t=1. Add the already-negative Year 0 cash flow outside NPV().',
      },
    ],
  },
  {
    id: 'quiz-mod-3',
    moduleId: 'mod-3',
    title: 'Module 3 Quiz: SQL for Data Analysis',
    subtitle: 'Execution order, JOIN semantics, NULL traps, CTEs, and window functions.',
    passingPercent: 80,
    questions: [
      {
        id: 'q3-1',
        topicTag: 'Execution Order',
        prompt: 'Why does the query below fail in standard SQL?',
        codeSnippet:
          'SELECT quantity * unit_price AS gross_val\nFROM retail_orders o JOIN retail_products p ON o.product_id = p.product_id\nWHERE gross_val > 300;',
        options: [
          'JOIN cannot be used with WHERE',
          'WHERE executes before SELECT, so the alias gross_val does not exist yet during WHERE evaluation',
          'Multiplication is not allowed in SELECT',
          'HAVING must replace WHERE even without GROUP BY',
        ],
        correctIndex: 1,
        explanation:
          'SQL processes FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT. Repeat the expression in WHERE or compute gross_val inside a CTE first.',
      },
      {
        id: 'q3-2',
        topicTag: 'LEFT JOIN Trap',
        prompt:
          'You LEFT JOIN retail_orders (o) onto retail_customers (c) to count completed orders for EVERY customer, including those with 0 orders. Where must o.status = "Completed" go?',
        options: [
          'In the WHERE clause: WHERE o.status = "Completed"',
          'Inside the JOIN ON clause: ON c.customer_id = o.customer_id AND o.status = "Completed"',
          'Inside GROUP BY o.status',
          'In ORDER BY o.status',
        ],
        correctIndex: 1,
        explanation:
          'Putting o.status = "Completed" in WHERE discards rows where o.status is NULL (customers with zero orders), silently converting the LEFT JOIN into an INNER JOIN.',
      },
      {
        id: 'q3-3',
        topicTag: 'NULL Logic',
        prompt:
          'Which predicate safely keeps rows where delivery_days is NOT 5, including rows where delivery_days IS NULL?',
        options: [
          'WHERE delivery_days != 5',
          'WHERE delivery_days <> 5 OR delivery_days = NULL',
          'WHERE delivery_days != 5 OR delivery_days IS NULL',
          'WHERE NOT (delivery_days = 5)',
        ],
        correctIndex: 2,
        explanation:
          'In three-valued SQL logic, NULL != 5 and NOT (NULL = 5) both evaluate to UNKNOWN. You must explicitly check IS NULL (or use COALESCE).',
      },
      {
        id: 'q3-4',
        topicTag: 'Window Functions',
        prompt:
          'Given salaries [120k, 120k, 100k] inside a department, what ranks do ROW_NUMBER(), RANK(), and DENSE_RANK() assign to 100k?',
        options: [
          'ROW_NUMBER = 3, RANK = 3, DENSE_RANK = 2',
          'ROW_NUMBER = 2, RANK = 2, DENSE_RANK = 2',
          'ROW_NUMBER = 3, RANK = 2, DENSE_RANK = 3',
          'All three assign rank 3',
        ],
        correctIndex: 0,
        explanation:
          'ROW_NUMBER assigns 1, 2, 3; RANK skips rank 2 on ties (1, 1, 3); DENSE_RANK leaves no gaps (1, 1, 2).',
      },
      {
        id: 'q3-5',
        topicTag: 'CTEs & Filtering',
        prompt: 'How do you filter a query to keep only the top 1 ranked row from ROW_NUMBER() OVER (...)?',
        options: [
          'Put WHERE ROW_NUMBER() OVER (...) = 1 in the same query',
          'Put HAVING ROW_NUMBER() OVER (...) = 1',
          'Compute ROW_NUMBER() inside a CTE and filter WHERE rn = 1 in the outer query',
          'Use LIMIT 1 inside OVER()',
        ],
        correctIndex: 2,
        explanation:
          'Window functions are evaluated after WHERE, GROUP BY, and HAVING. Wrapping the window calculation in a CTE lets the outer WHERE filter on the generated rank.',
      },
    ],
  },
  {
    id: 'quiz-mod-4',
    moduleId: 'mod-4',
    title: 'Module 4 Quiz: Data Visualization, Star Schemas & DAX',
    subtitle: 'Chart selection, star-schema modeling, SUMX iterators, and CALCULATE.',
    passingPercent: 80,
    questions: [
      {
        id: 'q4-1',
        topicTag: 'Chart Selection',
        prompt:
          'You need to compare freight cost across 9 shipping lanes with descriptive names. Which chart provides the clearest perceptual accuracy?',
        options: [
          'Sorted Horizontal Bar Chart starting at $0',
          '9-slice 3D Pie Chart',
          'Stacked Area Chart across lane names',
          'Radar / Spider Chart',
        ],
        correctIndex: 0,
        explanation:
          'Sorted horizontal bars align values on a shared 0-baseline and keep long category names easy to read horizontally.',
      },
      {
        id: 'q4-2',
        topicTag: 'Star Schema',
        prompt:
          'In a healthy Power BI star schema, what relationship cardinality and cross-filter direction should connect Dim_Customers to Fact_Orders?',
        options: [
          'Many-to-Many with Both directions',
          'One-to-Many (1:*) single-direction flowing from Dim_Customers to Fact_Orders',
          'One-to-Many flowing from Fact_Orders to Dim_Customers',
          'No relationship; merge every column into one flat table',
        ],
        correctIndex: 1,
        explanation:
          'Dimensions sit on the "1" side and propagate filters cleanly downward to the "*" Fact table, avoiding circular ambiguity.',
      },
      {
        id: 'q4-3',
        topicTag: 'DAX Iterators',
        prompt:
          'Why is SUM(Orders[qty]) * SUM(Products[unit_price]) wrong for computing total gross sales across an order table?',
        options: [
          'DAX does not allow the * operator on measures',
          'It multiplies total units by the sum of all product prices instead of multiplying qty * unit_price row by row',
          'SUM() ignores decimal prices',
          'RELATED() is required before SUM()',
        ],
        correctIndex: 1,
        explanation:
          'You must iterate row-by-row using SUMX(Orders, Orders[qty] * RELATED(Products[unit_price])) so each order line multiplies by its own SKU price.',
      },
      {
        id: 'q4-4',
        topicTag: 'DAX Context',
        prompt:
          'Which DAX expression calculates a segment’s share of total revenue across ALL customer segments?',
        options: [
          '[Net Revenue] / [Net Revenue]',
          'DIVIDE([Net Revenue], CALCULATE([Net Revenue], ALL(retail_customers[segment])), 0)',
          'SUMX(retail_customers, [Net Revenue])',
          'CALCULATE([Net Revenue], retail_customers[segment] = BLANK())',
        ],
        correctIndex: 1,
        explanation:
          'CALCULATE(..., ALL(retail_customers[segment])) clears the current segment filter in the denominator while preserving other page filters like Region or Date.',
      },
      {
        id: 'q4-5',
        topicTag: 'Visual Hygiene',
        prompt: 'Why should bar charts almost never start their value axis above zero (e.g., starting at $900 when values are $940 and $980)?',
        options: [
          'It breaks CSV exports',
          'Bar length visually encodes magnitude from 0; truncating makes a 4% gap look like a 2x jump',
          'Power BI prohibits non-zero axes on all charts',
          'It causes integer overflow in DAX',
        ],
        correctIndex: 1,
        explanation:
          'Readers compare bar lengths proportionally. Truncating the baseline distorts proportions visually and erodes stakeholder trust.',
      },
    ],
  },
  {
    id: 'quiz-mod-5',
    moduleId: 'mod-5',
    title: 'Module 5 Quiz: Applied Business Case Studies',
    subtitle: 'Cross-domain synthesis across Operations, Retail, Banking, and HR cases.',
    passingPercent: 80,
    questions: [
      {
        id: 'q5-1',
        topicTag: 'Retail Case',
        prompt:
          'In the embedded Retail Sales dataset, Completed Net Revenue is $5,340 and COGS is $3,058. What is the Gross Margin %?',
        options: ['38.5%', '42.7%', '57.3%', '49.8%'],
        correctIndex: 1,
        explanation:
          'Gross Profit = $5,340 - $3,058 = $2,282. Gross Margin % = $2,282 / $5,340 = 42.73% (~42.7%).',
      },
      {
        id: 'q5-2',
        topicTag: 'Operations Case',
        prompt:
          'In operations_shipments, why did ApexFreight and SwiftHaul appear twice when running GROUP BY carrier without LOWER()?',
        options: [
          'Each carrier had two warehouse hubs',
          'Casing drift ("ApexFreight" vs "apexfreight" and "SwiftHaul" vs "swifthaul") created separate groups in case-sensitive SQL',
          'GROUP BY splits NULL delivery_days automatically',
          'freight_cost had mixed currencies',
        ],
        correctIndex: 1,
        explanation:
          'Case-sensitive SQL engines treat "ApexFreight" and "apexfreight" as distinct strings unless normalized with LOWER(TRIM(carrier)).',
      },
      {
        id: 'q5-3',
        topicTag: 'Banking Case',
        prompt:
          'Looking at credit_card_transactions, why would summing `amount` across ALL rows misrepresent bank settled revenue volume?',
        options: [
          'International transactions are stored in Euros',
          'Declined ($2,160) and Flagged ($2,990) transactions never settled and earned $0 interchange fee',
          'Dining fees are negative',
          'Only Platinum cards generate interchange',
        ],
        correctIndex: 1,
        explanation:
          'Only Approved transactions ($4,665) represent settled spend and generated the $105.15 in interchange fees.',
      },
      {
        id: 'q5-4',
        topicTag: 'Banking Risk',
        prompt:
          'In cardholder_accounts, which accounts sit at >= 80% credit utilization AND already show 30+ days delinquency?',
        options: [
          'ACC-101 and ACC-102',
          'ACC-103 (80%, 35 DPD) and ACC-105 (90%, 62 DPD)',
          'ACC-106 and ACC-108',
          'ACC-104 only',
        ],
        correctIndex: 1,
        explanation:
          'ACC-103 ($3,200/$4,000 = 80%, 35 DPD) and ACC-105 ($2,700/$3,000 = 90%, 62 DPD) carry both extreme utilization and 30+ DPD delinquency.',
      },
      {
        id: 'q5-5',
        topicTag: 'HR Case',
        prompt:
          'In hr_employees, why is filtering attrition = "No" critical before comparing payroll against hr_department_budgets?',
        options: [
          'Departed employees do not have an annual_salary column',
          'Including departed ("Yes") employees inflates current active payroll and understates real budget headroom',
          'SQL cannot JOIN without a WHERE clause',
          'Overtime doubles annual_salary automatically',
        ],
        correctIndex: 1,
        explanation:
          'Active run-rate payroll only includes active staff (attrition = "No"). Including already-departed employees overstates current spend.',
      },
    ],
  },
  {
    id: 'quiz-mod-6',
    moduleId: 'mod-6',
    title: 'Module 6 Quiz: Interview Prep & Scenario Diagnostics',
    subtitle: 'SQL traps, case sizing, root-cause trees, and stakeholder management.',
    passingPercent: 80,
    questions: [
      {
        id: 'q6-1',
        topicTag: 'SQL Anti-Join',
        prompt:
          'Why can `WHERE customer_id NOT IN (SELECT customer_id FROM orders)` unexpectedly return ZERO rows?',
        options: [
          'NOT IN only works on integer columns',
          'If any row in orders has customer_id IS NULL, NOT IN evaluates to UNKNOWN for every single row',
          'Subqueries cannot appear inside WHERE',
          'NOT IN ignores primary keys',
        ],
        correctIndex: 1,
        explanation:
          'x NOT IN (1, NULL) expands to x != 1 AND x != NULL -> UNKNOWN. Use NOT EXISTS or LEFT JOIN ... WHERE right_key IS NULL instead.',
      },
      {
        id: 'q6-2',
        topicTag: 'Funnel Sizing',
        prompt:
          'A site receives 50,000 sessions/month, $100 AOV, and 50% gross margin. How much monthly gross profit does a +1.0 percentage point conversion lift create?',
        options: ['$25,000', '$50,000', '$5,000', '$2,500'],
        correctIndex: 0,
        explanation:
          '50,000 × 0.01 = 500 incremental orders/month × $100 AOV = $50,000 revenue × 50% gross margin = $25,000/month gross profit.',
      },
      {
        id: 'q6-3',
        topicTag: 'Root-Cause Analysis',
        prompt:
          'Conversion rate stayed flat on Desktop (4.0%) and flat on Mobile (1.5%), yet overall site conversion dropped from 3.2% to 2.5%. What happened?',
        options: [
          'A database index corruption broke SQL AVG()',
          'Simpson’s Paradox via traffic mix shift: a larger share of traffic shifted toward lower-converting Mobile sessions',
          'Desktop conversion actually fell secretly',
          'AOV dropped below COGS',
        ],
        correctIndex: 1,
        explanation:
          'When segment rates remain flat but traffic shifts heavily toward the lower-converting segment, the blended overall average drops (mix shift / Simpson’s Paradox).',
      },
      {
        id: 'q6-4',
        topicTag: 'SQL Division',
        prompt:
          'In PostgreSQL, what does `SELECT 3 / 4 AS ratio;` return, and how do you fix it?',
        options: [
          'Returns 0.75 automatically; no fix needed',
          'Returns 0 due to integer division; fix with 3 * 1.0 / 4 or CAST(3 AS FLOAT) / 4',
          'Throws a syntax error',
          'Returns 1 rounded up',
        ],
        correctIndex: 1,
        explanation:
          'Dividing two integers truncates toward zero in many SQL dialects. Multiply by 1.0 or cast one operand to FLOAT/NUMERIC.',
      },
      {
        id: 'q6-5',
        topicTag: 'Stakeholder Pushback',
        prompt:
          'An executive asks for an immediate raw data pull 15 minutes before a board meeting, and your number differs slightly from their rough spreadsheet. What is the best response?',
        options: [
          'Refuse to share anything until a 3-day ETL audit finishes',
          'Deliver a clear Gross-to-Net reconciliation bridge showing exact scope differences (e.g., returns/nulls) alongside validated directional figures',
          'Quietly edit your SQL filter to match their rough spreadsheet without noting why',
          'Send the raw uncleaned CSV with no commentary',
        ],
        correctIndex: 1,
        explanation:
          'Great analysts align on definitions transparently—building a quick Gross-to-Net bridge resolves discrepancies fast and preserves trust.',
      },
    ],
  },
  {
    id: 'quiz-capstone',
    title: 'Final Job-Readiness Capstone Assessment',
    subtitle:
      'Comprehensive 12-question exam covering Business Thinking, Excel, SQL, BI/DAX, Case Diagnostics, and Interview Scenarios. Score 80%+ to pass.',
    passingPercent: 80,
    isCapstone: true,
    questions: [
      {
        id: 'cap-1',
        topicTag: 'Business KPIs',
        prompt:
          'Which metric pairing best prevents "growth at any cost" when scaling a subscription or e-commerce promotion?',
        options: [
          'Page Views + Total Signups',
          'Net Revenue / Active Customers + Gross Margin % & 60-Day Retention Guardrail',
          'Gross Demand + Total Email Sends',
          'Discount Rate + Click-Through Rate',
        ],
        correctIndex: 1,
        explanation:
          'Normalized unit revenue paired with Gross Margin % and Retention ensures promotions create durable, profitable customers.',
      },
      {
        id: 'cap-2',
        topicTag: 'Excel Modeling',
        prompt:
          'In Excel, you want to sum Net Revenue in D2:D500 only where Status (B2:B500) = "Completed" AND Discount (C2:C500) <= cell G1. Which syntax works?',
        options: [
          '=SUMIFS(D2:D500, B2:B500, "Completed", C2:C500, "<="&G1)',
          '=SUMIFS(B2:B500, "Completed", C2:C500, "<=G1", D2:D500)',
          '=SUMIF(D2:D500, B2:B500="Completed", C2:C500<=G1)',
          '=SUMIFS(D2:D500, B2:B500, "Completed", C2:C500, "<=G1")',
        ],
        correctIndex: 0,
        explanation:
          'sum_range goes first, and dynamic inequality comparisons must concatenate the operator string with &: "<="&G1.',
      },
      {
        id: 'cap-3',
        topicTag: 'Excel Lookups',
        prompt:
          'Why do analysts nest TRIM() around lookup keys or normalize data in staging columns before XLOOKUP / PivotTables?',
        options: [
          'TRIM() converts numbers into currency format',
          'Trailing spaces and casing drift cause exact-match lookups to return #N/A and split Pivot rows',
          'XLOOKUP cannot read text longer than 8 characters without TRIM()',
          'TRIM() replaces NULLs with 0',
        ],
        correctIndex: 1,
        explanation:
          'Hidden trailing spaces make visually identical strings fail exact matching and fragment grouped categories.',
      },
      {
        id: 'cap-4',
        topicTag: 'SQL Filtering & NULLs',
        prompt:
          'In operations_shipments (20 rows total, 2 rows In Transit with delivery_days IS NULL, 6 Delayed, 12 Delivered), what does `SELECT COUNT(*) FROM operations_shipments WHERE delivery_days <> 3;` return?',
        options: ['14', '12', '2', '6'],
        correctIndex: 1,
        explanation:
          'In SQL, NULL <> 3 evaluates to UNKNOWN (excluded). Out of the 18 non-null rows, 6 have delivery_days = 3, leaving 12 rows where delivery_days <> 3.',
      },
      {
        id: 'cap-5',
        topicTag: 'SQL Joins',
        prompt:
          'Joining Fact_Orders (1,000 rows) to Dim_Order_Items (3,000 rows, ~3 items per order) and summing `Fact_Orders.shipping_fee` directly produces what bug?',
        options: [
          'Syntax error on GROUP BY',
          'Join fan-out triples shipping_fee across every item row',
          'LEFT JOIN drops all orders',
          'shipping_fee becomes NULL',
        ],
        correctIndex: 1,
        explanation:
          'One-to-many joins duplicate parent-grain attributes (like order-level shipping_fee). Pre-aggregate order items in a CTE before joining to order-level fees.',
      },
      {
        id: 'cap-6',
        topicTag: 'SQL Window Functions',
        prompt:
          'You want to compute each SKU’s share (%) of its own category’s revenue while keeping one row per SKU. Which expression works?',
        options: [
          'sku_rev * 100.0 / SUM(sku_rev) GROUP BY category',
          'sku_rev * 100.0 / SUM(sku_rev) OVER (PARTITION BY category)',
          'ROW_NUMBER() OVER (PARTITION BY category ORDER BY sku_rev)',
          'HAVING SUM(sku_rev) > 0',
        ],
        correctIndex: 1,
        explanation:
          'SUM(sku_rev) OVER (PARTITION BY category) computes the category total alongside each individual SKU row without collapsing rows.',
      },
      {
        id: 'cap-7',
        topicTag: 'BI Modeling',
        prompt:
          'Why should a BI model include a dedicated continuous Calendar/Date table instead of relying on raw order_date strings?',
        options: [
          'SQL cannot filter DATE columns',
          'Continuous Date dimensions prevent missing-day gaps that break MoM, YTD, and YoY time-intelligence calculations',
          'Calendar tables automatically reduce CSV file size by 90%',
          'Date tables allow Many-to-Many relationships',
        ],
        correctIndex: 1,
        explanation:
          'Time-intelligence functions require contiguous calendar dates and a clean 1:* relationship to fact dates.',
      },
      {
        id: 'cap-8',
        topicTag: 'DAX Measures',
        prompt:
          'Which DAX measure safely calculates Approved Transaction Share % without failing on zero-volume segments?',
        options: [
          '[Approved Spend] / [Total Spend]',
          'DIVIDE([Approved Spend], CALCULATE([Approved Spend], ALL(cardholder_accounts)), 0)',
          'SUMX(cardholder_accounts, [Approved Spend])',
          'IFERROR(COUNTROWS(), 0)',
        ],
        correctIndex: 1,
        explanation:
          'DIVIDE() guards against zero denominators and CALCULATE(..., ALL(...)) clears dimension filters for the share denominator.',
      },
      {
        id: 'cap-9',
        topicTag: 'Case: Retail Economics',
        prompt:
          'A product has $120 list price and $60 unit cost (50% margin). Offering a 25% discount reduces selling price to $90. What is the new Gross Margin %?',
        options: ['25.0%', '33.3%', '37.5%', '40.0%'],
        correctIndex: 1,
        explanation:
          'Gross profit drops from $60 to $90 - $60 = $30. New Margin % = $30 / $90 = 33.3% (a 16.7 pp drop).',
      },
      {
        id: 'cap-10',
        topicTag: 'Case: Banking Risk',
        prompt:
          'In the Banking lab, 100% of Flagged transactions occurred on `is_international = 1` and totaled $2,990. What is the analyst’s next best diagnostic step before recommending blocking all international spend?',
        options: [
          'Block all international cards immediately',
          'Measure false-positive risk by comparing Approved international travel spend ($2,230) vs. Flagged spend so legitimate Platinum travel isn’t disrupted',
          'Delete Declined rows from the table',
          'Raise credit limits on 62-DPD accounts',
        ],
        correctIndex: 1,
        explanation:
          'Always check the trade-off: Platinum cardholders generated $2,230 in legitimate approved international travel spend (TXN-902 + TXN-914). Blanket blocks hurt high-value customers.',
      },
      {
        id: 'cap-11',
        topicTag: 'Case: HR Attrition',
        prompt:
          'In the HR dataset, 5 of 6 overtime workers departed (83.3%) vs. 0 of 10 non-overtime workers. Which caveat should you include in your executive brief?',
        options: [
          'State that overtime is guaranteed 100% causal with zero other variables involved',
          'Note the small sample size (n=16) and check confounding factors like role level, tenure, and pay bands in Sales & Operations',
          'Exclude departed staff from the denominator',
          'Report only headcount without rates',
        ],
        correctIndex: 1,
        explanation:
          'Honest analysts quantify the strong signal while flagging small sample size and potential confounders (tenure, junior/mid pay, department workload).',
      },
      {
        id: 'cap-12',
        topicTag: 'Data Storytelling',
        prompt:
          'When presenting a KPI drop in an executive review, which sequence communicates most effectively?',
        options: [
          '15 minutes of SQL schema walkthrough -> 3 charts -> final conclusion on last slide',
          'Answer first (what dropped + dollar impact) -> Root driver breakdown (mix vs rate) -> Quantified recommendation & next step',
          'Alphabetical list of every column audited',
          'Dual-axis chart with truncated bar baseline',
        ],
        correctIndex: 1,
        explanation:
          'Answer-first Pyramid structure gives decision makers the headline, causal driver, and action plan immediately.',
      },
    ],
  },
];

export function getQuizById(id: string): LmsQuiz | undefined {
  return LMS_QUIZZES.find((q) => q.id === id);
}

export function getQuizForModule(moduleId: string): LmsQuiz | undefined {
  return LMS_QUIZZES.find((q) => q.moduleId === moduleId);
}
