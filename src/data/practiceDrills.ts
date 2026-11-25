import {
  AcademyLocalState,
  CourseStatus,
  PracticeLabPreview,
  PracticePrompt,
  PracticeTopic,
} from '../types/academy';
import { PRACTICE_VALIDATIONS_BY_ID } from './practiceValidationRules';

type RawPracticePrompt = Omit<PracticePrompt, 'referenceAnswer' | 'validation'>;

interface RawPracticeTopic extends Omit<PracticeTopic, 'prompts'> {
  prompts: RawPracticePrompt[];
}

const RAW_PRACTICE_TOPICS_BY_COURSE: Record<string, RawPracticeTopic[]> = {
  excel: [
    {
      moduleId: 'excel-m1',
      indexLabel: '01',
      title: 'Data Hygiene & Cell Referencing',
      summary:
        'Absolute vs. relative references, named ranges, and data validation rules.',
      prompts: [
        {
          id: 'ex-m1-p1',
          kind: 'Scenario',
          title: 'Standardize region & sku + Locked Margin Reference',
          prompt:
            'Open sales_operations_sample.csv. Clean region (" west ", "NORTHEAST") and sku ("SKU-A10 ") into helper columns, then calculate each row’s Commission using a single locked rate cell ($K$2 = 0.08) across all 26 rows.',
          expectedCheck:
            'Verify clean region collapses to exactly 4 unique values (West, Northeast, Midwest, South), LEN(clean_sku) equals 7 on all 26 rows, and every row formula still points to $K$2.',
        },
        {
          id: 'ex-m1-p2',
          kind: 'Edge Case',
          title: 'Audit Duplicate order_id & Trailing Spaces',
          prompt:
            'Add a Duplicate Flag column using COUNTIF($A$2:$A$27, A2) > 1 and compare LEN(D2) vs. LEN(TRIM(D2)) on sku.',
          expectedCheck:
            'Expect exactly 2 flagged rows for duplicate order_id ORD-1012 (rows 13–14 in sheet) and 1 length mismatch on ORD-1008 ("SKU-A10 ", 8 chars raw vs. 7 trimmed).',
        },
        {
          id: 'ex-m1-p3',
          kind: 'Formula / Query',
          title: 'Region Data Validation & Blank Cell Audit',
          prompt:
            'Apply Data Validation (List: West, Northeast, Midwest, South) to the raw region column, run Circle Invalid Data, and count blanks in units, discount_pct, and rep_name.',
          expectedCheck:
            'Circle Invalid Data should highlight ORD-1004 (" west ") and ORD-1010 ("NORTHEAST"); COUNTBLANK should report 1 blank in units (ORD-1014), 2 in discount_pct (ORD-1007, ORD-1023), and 1 in rep_name (ORD-1016).',
        },
      ],
    },
    {
      moduleId: 'excel-m2',
      indexLabel: '02',
      title: 'Logical, Text & Date Functions',
      summary:
        'Nested conditionals, IFS, TRIM/CLEAN, and calendar aggregation formulas.',
      prompts: [
        {
          id: 'ex-m2-p1',
          kind: 'Scenario',
          title: 'Clean unit_price & Classify Order Tiers with IFS()',
          prompt:
            'Compute clean_price from unit_price (handling "$240.00" on ORD-1005 and "$1,150.00" on ORD-1019), calculate gross_sales = units * clean_price, and label rows >= $1,000 as "High Value", >= $300 as "Standard", else "Small".',
          expectedCheck:
            'Verify NUMBERVALUE(SUBSTITUTE(SUBSTITUTE(F2,"$",""),",","")) converts ORD-1019 to 1150 (gross_sales = 2,300) and ORD-1014 (blank units) is handled via IF(ISBLANK(E2), "Missing Qty", ...).',
        },
        {
          id: 'ex-m2-p2',
          kind: 'Edge Case',
          title: 'Normalize Mixed order_date Strings Without #VALUE!',
          prompt:
            'Standardize order_date so EOMONTH(clean_date, 0) returns the month-end date for every row—specifically fixing "2025/10/14" (ORD-1006) and "15-Nov-2025" (ORD-1018).',
          expectedCheck:
            'Expect 13 rows in October 2025 (2025-10-31, including duplicate ORD-1012) and 13 rows in November 2025 (2025-11-30) with zero #VALUE! errors.',
        },
        {
          id: 'ex-m2-p3',
          kind: 'Formula / Query',
          title: 'Null-Safe Net Revenue Calculation',
          prompt:
            'Write a net_revenue formula multiplying units * clean_price * (1 - COALESCE_discount) where blank discount_pct cells (ORD-1007, ORD-1023) default to 0% rather than producing errors.',
          expectedCheck:
            'Use IF(N(G2)=0, 0, G2) or IF(ISBLANK(G2), 0, G2); ORD-1007 (3 * 240) should evaluate to $720.00 and ORD-1023 (3 * 240) to $720.00.',
        },
      ],
    },
    {
      moduleId: 'excel-m3',
      indexLabel: '03',
      title: 'XLOOKUP, INDEX-MATCH & Dynamic Arrays',
      summary:
        'Multi-criteria table joins, FILTER, UNIQUE, and SORTBY workflows.',
      prompts: [
        {
          id: 'ex-m3-p1',
          kind: 'Scenario',
          title: 'SKU Category Lookup with Missing Key Fallback',
          prompt:
            'Create a 4-row reference table mapping SKU-A10 (Monitors), SKU-B22 (Docks), SKU-C05 (Cables), and SKU-D18 (Workstations). Use XLOOKUP against trimmed sku to pull Category, defaulting missing keys to "Unmapped SKU".',
          expectedCheck:
            'Expect 25 matched rows (including ORD-1008 once trimmed) and exactly 1 row returning "Unmapped SKU" (ORD-1021 with SKU-Z99).',
        },
        {
          id: 'ex-m3-p2',
          kind: 'Edge Case',
          title: 'Diagnose Exact-Match Failures & #SPILL! on UNIQUE()',
          prompt:
            'Run =XLOOKUP(D2, Ref[SKU], Ref[Category]) on raw sku first to observe the mismatch on ORD-1008, then place =UNIQUE(TRIM(PROPER(C2:C27))) above an occupied cell to inspect #SPILL!.',
          expectedCheck:
            'Raw lookup returns #N/A on ORD-1008 ("SKU-A10 ") and ORD-1021 ("SKU-Z99"); clearing the blocking cells lets UNIQUE() spill the 4 clean regions.',
        },
        {
          id: 'ex-m3-p3',
          kind: 'Formula / Query',
          title: 'Dynamic FILTER() + SORTBY() for High-Volume West Orders',
          prompt:
            'Write a single dynamic array formula returning order_id, sku, and units for all cleaned West orders where units >= 5, sorted descending by units.',
          expectedCheck:
            'Expect exactly 4 rows returned: ORD-1006 (10 units), ORD-1024 (8 units), ORD-1004 (6 units, cleaned from " west "), and ORD-1011 (5 units); ORD-1014 (blank units) must be excluded.',
        },
      ],
    },
    {
      moduleId: 'excel-m4',
      indexLabel: '04',
      title: 'PivotTables & Calculated Fields',
      summary:
        'Multi-dimensional summarization, slicers, grouping, and KPI rollups.',
      prompts: [
        {
          id: 'ex-m4-p1',
          kind: 'Scenario',
          title: 'Regional & SKU Net Revenue Matrix',
          prompt:
            'Build a PivotTable from your cleaned table with clean_region on Rows, clean_sku on Columns, and Sum of net_revenue in Values, after removing the duplicate ORD-1012 row.',
          expectedCheck:
            'Verify clean_region shows 4 rows (not 6!) and Grand Total row count is 25 distinct orders (24 non-null units).',
        },
        {
          id: 'ex-m4-p2',
          kind: 'Edge Case',
          title: 'Calculated Field Effective Discount % vs. Simple Average',
          prompt:
            'Add a PivotTable Calculated Field for Effective Discount % (= Discount_Dollars / Gross_Revenue) and compare its Grand Total against Average of discount_pct.',
          expectedCheck:
            'Simple Average ignores the 2 blank discount_pct rows and weights small $65 orders equally with $2,300 ORD-1019, whereas the Calculated Field weights discounts accurately by revenue.',
        },
        {
          id: 'ex-m4-p3',
          kind: 'Formula / Query',
          title: 'rep_name Slicer & GETPIVOTDATA KPI Card',
          prompt:
            'Insert a slicer on rep_name (notice the "(blank)" bucket from ORD-1016) and pull Maya Lin’s total units with GETPIVOTDATA.',
          expectedCheck:
            'Selecting Maya Lin should show 8 orders (7 with non-null units) summing to exactly 40 units (4+6+10+5+3+4+8).',
        },
      ],
    },
    {
      moduleId: 'excel-m5',
      indexLabel: '05',
      title: 'Power Query ETL Foundations',
      summary:
        'Repeatable CSV imports, unpivoting columns, and automated refresh steps.',
      prompts: [
        {
          id: 'ex-m5-p1',
          kind: 'Scenario',
          title: 'Repeatable Power Query Cleaning Pipeline',
          prompt:
            'Load sales_operations_sample.csv via From Text/CSV. Apply Trim + Capitalize Each Word on region, Trim + Uppercase on sku, and Replace Values (null -> 0) on discount_pct.',
          expectedCheck:
            'Confirm Applied Steps fold cleanly and column profiling reports 0 whitespace errors on region and sku and 0 nulls in discount_pct.',
        },
        {
          id: 'ex-m5-p2',
          kind: 'Edge Case',
          title: 'Currency Locale Parsing & Deterministic Deduplication',
          prompt:
            'Convert unit_price ("$240.00", "$1,150.00") to Decimal Number using Change Type > Using Locale (English - United States) and remove duplicate order_id rows.',
          expectedCheck:
            'Preview should load 25 rows (dropping the duplicate ORD-1012) with zero Error cells in unit_price and units (ORD-1014 stays null integer).',
        },
        {
          id: 'ex-m5-p3',
          kind: 'Formula / Query',
          title: 'Date Normalization with Using Locale / Date.FromText',
          prompt:
            'Parse mixed order_date strings ("2025/10/14", "15-Nov-2025") into a true Date type inside Power Query and add a Month Name column.',
          expectedCheck:
            'All 25 deduplicated rows parse cleanly to Date type with 12 October rows and 13 November rows.',
        },
      ],
    },
  ],
  sql: [
    {
      moduleId: 'sql-m1',
      indexLabel: '01',
      title: 'SELECT, Filtering & Sorting',
      summary:
        'Predicate logic, NULL semantics, pattern matching, and query execution order.',
      prompts: [
        {
          id: 'sql-m1-p1',
          kind: 'Scenario',
          title: 'High-Value Shipped & Completed Orders Queue',
          prompt:
            'Query ecommerce_orders_and_customers.csv (table: orders) for all orders placed in October 2025 with order_total >= 1000 that are not cancelled, ordered oldest first.',
          expectedCheck:
            'Expect exactly 3 rows: order_id 5009 ($1,450), 5016 ($1,620), and 5017 ($1,120). Order 5012 ($980) falls just under $1,000.',
        },
        {
          id: 'sql-m1-p2',
          kind: 'Edge Case',
          title: 'NULL Filtering Trap with != "VIP20"',
          prompt:
            'Compare row counts between WHERE discount_code != \'VIP20\' vs. WHERE discount_code IS DISTINCT FROM \'VIP20\' (or COALESCE(discount_code, \'\') != \'VIP20\').',
          expectedCheck:
            '!= \'VIP20\' silently drops all 13 NULL rows and returns only 9 rows (WELCOME10 & BF25), whereas IS DISTINCT FROM \'VIP20\' correctly returns 22 rows (9 non-VIP codes + 13 NULLs).',
        },
        {
          id: 'sql-m1-p3',
          kind: 'Formula / Query',
          title: 'Case-Insensitive Segment Filter & Alias Execution Order',
          prompt:
            'Return all Enterprise orders regardless of casing (catching order_id 5017 with "enterprise") and filter on a computed column high_ticket_flag without referencing a SELECT alias inside WHERE.',
          expectedCheck:
            'WHERE LOWER(customer_segment) = \'enterprise\' returns 9 rows (5001, 5005, 5009, 5012, 5016, 5017, 5021, 5024, 5027), catching the lowercase "enterprise" on 5017.',
        },
      ],
    },
    {
      moduleId: 'sql-m2',
      indexLabel: '02',
      title: 'Aggregations & GROUP BY',
      summary:
        'COUNT, SUM, CASE WHEN pivots, and HAVING vs. WHERE filtering.',
      prompts: [
        {
          id: 'sql-m2-p1',
          kind: 'Scenario',
          title: 'Order Status & Discount Usage Pivot by Segment',
          prompt:
            'Group by normalized UPPER/INITCAP(customer_segment) to show total rows, completed_orders, cancelled_or_refunded_orders, and % of orders using a discount_code.',
          expectedCheck:
            'Raw counts total 28 rows across 3 normalized segments: Enterprise (9), SMB (9 including dup 5014), Consumer (10); discount_code IS NOT NULL on 15 of 28 raw rows.',
        },
        {
          id: 'sql-m2-p2',
          kind: 'Edge Case',
          title: 'COUNT(*) vs. COUNT(discount_code) & Duplicate 5014 Inflation',
          prompt:
            'Check the difference between COUNT(*), COUNT(DISTINCT order_id), and COUNT(discount_code), and see how duplicate order_id 5014 ($690) inflates SMB SUM(order_total).',
          expectedCheck:
            'COUNT(*) = 28, COUNT(DISTINCT order_id) = 27, COUNT(discount_code) = 15. Un-deduplicated SMB revenue is inflated by an extra $690.00 from duplicate order_id 5014.',
        },
        {
          id: 'sql-m2-p3',
          kind: 'Formula / Query',
          title: 'HAVING Filter for Repeat Active Customers',
          prompt:
            'After deduplicating order_id, find customer_id values with >= 3 orders in status IN (\'completed\', \'shipped\') and total spend > $2,500.',
          expectedCheck:
            'Expect 3 qualifying customers: customer_id 101 (4 orders, $5,650), customer_id 107 (3 orders, $4,380), and customer_id 103 (4 distinct orders, $2,690).',
        },
      ],
    },
    {
      moduleId: 'sql-m3',
      indexLabel: '03',
      title: 'Relational Joins & Set Operations',
      summary:
        'INNER, LEFT, FULL OUTER joins, self-joins, and preventing row fan-out.',
      prompts: [
        {
          id: 'sql-m3-p1',
          kind: 'Scenario',
          title: 'Self-Join Referrer Attribution Breakdown',
          prompt:
            'Build a distinct customer dimension CTE (customer_id, segment) from the file, then LEFT JOIN orders back to referrer_customer_id to summarize how many referred orders each referrer generated.',
          expectedCheck:
            'Customer 101 referred 5 orders (5002, 5007, 5010, 5019, 5020); customer 102 referred 3; customer 103 referred 3; customer 106 referred 2; customer 107 referred 2 (15 referred rows total).',
        },
        {
          id: 'sql-m3-p2',
          kind: 'Edge Case',
          title: 'Why NOT IN (referrer_customer_id) Returns 0 Rows',
          prompt:
            'Test finding customers who never referred anyone using WHERE customer_id NOT IN (SELECT referrer_customer_id FROM orders) vs. NOT EXISTS.',
          expectedCheck:
            'NOT IN returns 0 rows because referrer_customer_id contains 13 NULLs; switching to WHERE referrer_customer_id IS NOT NULL inside NOT IN—or using NOT EXISTS—returns the 7 non-referring customers (104, 105, 108, 109, 110, 111, 112).',
        },
        {
          id: 'sql-m3-p3',
          kind: 'Formula / Query',
          title: 'Preventing Fan-Out When Joining Customer Totals',
          prompt:
            'Show what happens if you join raw orders to itself on customer_id without pre-aggregating, then fix it using a per-customer summary CTE.',
          expectedCheck:
            'Direct customer_id self-join squares order rows (e.g., customer 101 jumps from 4 rows to 16 rows); pre-aggregating first preserves 27 distinct order rows.',
        },
      ],
    },
    {
      moduleId: 'sql-m4',
      indexLabel: '04',
      title: 'Subqueries & Common Table Expressions',
      summary:
        'Modular multi-step queries using WITH clauses for readable analytics.',
      prompts: [
        {
          id: 'sql-m4-p1',
          kind: 'Scenario',
          title: 'Modular Deduplication & Clean Net Revenue CTE Pipeline',
          prompt:
            'Write a 3-CTE pipeline: (1) deduped_orders removing duplicate order_id 5014, (2) valid_orders excluding cancelled/refunded, and (3) monthly_segment_summary.',
          expectedCheck:
            'CTE 1 outputs 27 rows; CTE 2 outputs 22 valid orders (excluding 3 cancelled and 2 refunded); CTE 3 shows clean monthly totals for Sep, Oct, and Nov 2025.',
        },
        {
          id: 'sql-m4-p2',
          kind: 'Edge Case',
          title: 'Churned September Buyers via Anti-Join CTE',
          prompt:
            'Using deduped_orders, find customers who placed a valid order in September 2025 (2025-09) but placed zero orders in October or November 2025.',
          expectedCheck:
            'Inspect customers 101–107 from September: 104 cancelled in Sep, 105 ordered again in Oct (5018), and 101, 102, 103, 106, 107 all reordered—confirming 0 valid Sep-only churners (or 104 if including cancelled).',
        },
        {
          id: 'sql-m4-p3',
          kind: 'Formula / Query',
          title: 'Orders Above Their Own Segment Average',
          prompt:
            'In a CTE, compute average valid order_total per normalized customer_segment, join back to deduped valid orders, and return orders exceeding their segment average by >= 25%.',
          expectedCheck:
            'Enterprise avg ($1,432.22 -> +25% = $1,790.28) catches 5005 ($1,890); SMB avg ($646.67 -> +25% = $808.33) catches 5025 ($840); Consumer avg ($195.71 -> +25% = $244.64) catches 5011 ($320) and 5020 ($260).',
        },
      ],
    },
    {
      moduleId: 'sql-m5',
      indexLabel: '05',
      title: 'Window Functions & Cohort Retention',
      summary:
        'ROW_NUMBER, RANK, LAG/LEAD, rolling averages, and partition frames.',
      prompts: [
        {
          id: 'sql-m5-p1',
          kind: 'Scenario',
          title: 'Deduplicate 5014 with ROW_NUMBER() + Customer Order Sequence',
          prompt:
            'Use ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY order_date) = 1 to remove duplicate 5014, then compute order_seq and days_since_prev_order with LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date).',
          expectedCheck:
            'Verify customer 101 shows 4 sequential orders (Sep 2 -> Sep 15: 13d -> Oct 10: 25d -> Nov 6: 27d) with NULL on order_seq = 1.',
        },
        {
          id: 'sql-m5-p2',
          kind: 'Edge Case',
          title: 'Calendar Spine Check Before 7-Day Rolling Revenue',
          prompt:
            'Check why ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW differs from RANGE BETWEEN INTERVAL \'6 days\' PRECEDING AND CURRENT ROW on ecommerce_orders_and_customers.csv.',
          expectedCheck:
            'Because orders skip calendar days (e.g., Sep 2 -> Sep 4 -> Sep 7), ROWS BETWEEN 6 PRECEDING reaches back ~2–3 weeks, whereas a calendar spine + RANGE INTERVAL \'6 days\' captures true 7-day windows.',
        },
        {
          id: 'sql-m5-p3',
          kind: 'Formula / Query',
          title: 'Top-2 Highest Orders per Segment with DENSE_RANK()',
          prompt:
            'Rank valid deduped orders within each normalized customer_segment by order_total DESC and filter rank <= 2.',
          expectedCheck:
            'Top 2 per segment: Enterprise = 5005 ($1,890) & 5027 ($1,740); SMB = 5025 ($840) & 5022 ($710); Consumer = 5011 ($320) & 5020 ($260).',
        },
      ],
    },
  ],
  python: [
    {
      moduleId: 'py-m1',
      indexLabel: '01',
      title: 'Python Foundations for Analysts',
      summary:
        'Data structures, list comprehensions, functions, and virtual environments.',
      prompts: [
        {
          id: 'py-m1-p1',
          kind: 'Scenario',
          title: 'Parse customer_churn_raw.csv with csv.DictReader',
          prompt:
            'Load customer_churn_raw.csv using Python’s built-in csv.DictReader and write a reusable helper function parse_money(val) that strips "$" and returns float or None for "", "N/A", and "-".',
          expectedCheck:
            'Verify parse_money("$199.00") == 199.0 on CUST-007 and parse_money returns None for exactly 3 rows: CUST-011 ("N/A"), CUST-019 ("-"), and CUST-024 ("").',
        },
        {
          id: 'py-m1-p2',
          kind: 'Edge Case',
          title: 'Normalize Mixed churned Strings Without Mutating Defaults',
          prompt:
            'Write a pure function normalize_churn(raw) mapping True/False/"yes"/"no"/"0" to Python bool, and inspect why default list/dict arguments leak across rows.',
          expectedCheck:
            'Confirm CUST-006 ("yes") -> True, CUST-014 ("0") -> False, and CUST-023 ("no") -> False with zero exceptions.',
        },
        {
          id: 'py-m1-p3',
          kind: 'Formula / Query',
          title: 'Country Spend Summary via Dictionary Comprehension',
          prompt:
            'Using clean records (deduped on customer_id keeping last), build a dictionary mapping normalized country.strip().upper() to customer count.',
          expectedCheck:
            'Expect 4 keys totaling 25 unique customers: {"US": 11, "CA": 5, "UK": 5, "DE": 4} once "us" (CUST-010) and " us " (CUST-022) are normalized.',
        },
      ],
    },
    {
      moduleId: 'py-m2',
      indexLabel: '02',
      title: 'NumPy Arrays & Vectorized Math',
      summary:
        'Broadcasting, boolean indexing, and fast numerical summaries.',
      prompts: [
        {
          id: 'py-m2-p1',
          kind: 'Scenario',
          title: 'Vectorized Engagement Tiering with np.select()',
          prompt:
            'Convert cleaned sessions_30d into a NumPy array and classify customers into "Power" (>= 40), "Active" (10–39), and "At Risk" (< 10) using np.select() instead of Python loops.',
          expectedCheck:
            'Ensure missing sessions_30d (CUST-008, CUST-021) are flagged "Unknown" first before numeric comparisons so NaN does not silently fall into the default bucket.',
        },
        {
          id: 'py-m2-p2',
          kind: 'Edge Case',
          title: 'NaN Poisoning & Outlier Distortion on sessions_30d',
          prompt:
            'Compare np.mean(sessions) vs. np.nanmean(sessions) and np.nanmedian(sessions) on the 25 unique customers, checking the impact of CUST-015 (sessions_30d = 420).',
          expectedCheck:
            'np.mean() returns nan due to CUST-008 & CUST-021; np.nanmean() is pulled up to ~44.0 by outlier 420 (CUST-015), while np.nanmedian() remains ~29.0.',
        },
        {
          id: 'py-m2-p3',
          kind: 'Formula / Query',
          title: 'IQR / Percentile Outlier Detection & Clipping',
          prompt:
            'Use np.nanpercentile(sessions, [25, 75]) to compute the Tukey upper fence (Q3 + 1.5 * IQR) and flag extreme sessions_30d values.',
          expectedCheck:
            'Confirm CUST-015 (420 sessions) is the sole extreme outlier flagged above the upper fence, and verify np.clip() caps it without dropping the row.',
        },
      ],
    },
    {
      moduleId: 'py-m3',
      indexLabel: '03',
      title: 'pandas Indexing, Merging & Grouping',
      summary:
        'DataFrame filtering, multi-table merges, groupby aggregations, and reshape.',
      prompts: [
        {
          id: 'py-m3-p1',
          kind: 'Scenario',
          title: 'Deduplicate CUST-009 & GroupBy Plan Tier Churn Rate',
          prompt:
            'Deduplicate df on customer_id (keep="last"), normalize plan_tier (.str.strip().str.title()), and aggregate customer count, churn rate, and mean support_tickets by plan_tier.',
          expectedCheck:
            'After deduping CUST-009 (keeping sessions_30d = 27), Free = 6/6 churned (100%), Pro = 3/11 churned (27.3%), Team = 0/7 churned (0%), plus 1 missing plan_tier (CUST-018, not churned).',
        },
        {
          id: 'py-m3-p2',
          kind: 'Edge Case',
          title: 'Prevent Silent Row Drop in groupby(dropna=False) & SettingWithCopy',
          prompt:
            'Run .groupby("plan_tier")["customer_id"].count() with default dropna=True vs. dropna=False, and normalize plan_tier cleanly using .loc without SettingWithCopyWarning.',
          expectedCheck:
            'Default dropna=True sums to 24 rows (silently hiding CUST-018!), whereas dropna=False reveals all 25 unique customers.',
        },
        {
          id: 'py-m3-p3',
          kind: 'Formula / Query',
          title: 'Within-Plan Ticket Intensity via transform()',
          prompt:
            'Add a column plan_avg_tickets using df.groupby("plan_tier", dropna=False)["support_tickets"].transform("mean") and filter customers above their tier average.',
          expectedCheck:
            'Confirm Team tier avg is ~0.29 tickets (making CUST-011 & CUST-020 with 1 ticket each stand out) while Free tier avg is ~4.17 tickets.',
        },
      ],
    },
    {
      moduleId: 'py-m4',
      indexLabel: '04',
      title: 'Handling Missing & Messy Data',
      summary:
        'Datetime parsing, outlier inspection, type coercion, and deduplication.',
      prompts: [
        {
          id: 'py-m4-p1',
          kind: 'Scenario',
          title: 'Full Cleaning Pipeline for monthly_spend & signup_date',
          prompt:
            'Load customer_churn_raw.csv specifying na_values=["N/A", "-", ""], strip "$" from monthly_spend before pd.to_numeric(..., errors="coerce"), and parse mixed signup_date ("04/18/2024", "18-Jul-2024", "2024/10/04") using format="mixed".',
          expectedCheck:
            'Confirm df["monthly_spend"].dtype is float64 (with 3 NaNs) and df["signup_date"].dtype is datetime64[ns] with 0 NaT values across all 26 rows.',
        },
        {
          id: 'py-m4-p2',
          kind: 'Edge Case',
          title: 'Spot Silent Object Dtype & Missingness Report',
          prompt:
            'Before cleaning, inspect df.dtypes and df.isna().sum() on raw read_csv() to see why monthly_spend became object dtype and why CUST-011 ("N/A") vs CUST-019 ("-") behaved differently.',
          expectedCheck:
            'Standard read_csv() treats "N/A" as NaN automatically, but "-" and "$199.00" force object dtype until explicitly cleaned.',
        },
        {
          id: 'py-m4-p3',
          kind: 'Formula / Query',
          title: 'Group-Median Imputation vs. Missingness Indicator',
          prompt:
            'Impute the 2 missing sessions_30d values (CUST-008, CUST-021) using the median of each plan_tier (not global median) after flagging sessions_was_missing.',
          expectedCheck:
            'Both CUST-008 and CUST-021 are on Pro tier; their imputed sessions_30d should reflect the Pro-tier median (~29) rather than being inflated by Team users.',
        },
      ],
    },
    {
      moduleId: 'py-m5',
      indexLabel: '05',
      title: 'Exploratory Visualization',
      summary:
        'Distribution plots, trend comparisons, and readable multi-panel charts.',
      prompts: [
        {
          id: 'py-m5-p1',
          kind: 'Scenario',
          title: 'Compare sessions_30d & support_tickets by Churned Status',
          prompt:
            'Plot side-by-side boxplots (1x2 subplots) of cleaned sessions_30d (left) and support_tickets (right) split by churned == True vs. False.',
          expectedCheck:
            'Churned customers cluster at low sessions (1–18) and high support tickets (3–6), whereas retained customers cluster at 25–84 sessions and 0–2 tickets.',
        },
        {
          id: 'py-m5-p2',
          kind: 'Edge Case',
          title: 'Prevent Outlier 420 from Crushing the Sessions Axis',
          prompt:
            'Observe how CUST-015 (sessions_30d = 420) compresses the 0–85 range in a linear histogram/boxplot, then re-plot with a clipped/symlog axis or annotated outlier callout.',
          expectedCheck:
            'After capping or annotating CUST-015 = 420 separately, the separation between churned median (~5 sessions) and retained median (~36 sessions) becomes visually clear.',
        },
        {
          id: 'py-m5-p3',
          kind: 'Formula / Query',
          title: 'Normalized Churn Rate Bar Chart by Plan Tier',
          prompt:
            'Plot a horizontal bar chart showing churn rate (%) per plan_tier with sample size annotations (n=6, n=11, n=7) directly on each bar.',
          expectedCheck:
            'Showing both % and (n) prevents stakeholders from over-interpreting small sample buckets like the single missing-tier customer.',
        },
      ],
    },
  ],
  statistics: [
    {
      moduleId: 'stat-m1',
      indexLabel: '01',
      title: 'Descriptive Metrics & Spread',
      summary:
        'Mean vs. median, quantiles, IQR, variance, and skewed business data.',
      prompts: [
        {
          id: 'st-m1-p1',
          kind: 'Scenario',
          title: 'Clean Conversion Revenue Mean vs. Median Skew',
          prompt:
            'Load ab_test_experiment_log.csv. Filter out bot rows (is_bot_flag = true) and duplicate user_id 9011. For converted = 1 users with non-null order_revenue, compare mean vs. median order_revenue.',
          expectedCheck:
            'Across the 10 converted rows with non-null order_revenue (remember 9018 is null!), 2 large orders ($420 and $480) pull the mean (~$156.25) well above the median (~$90.25).',
        },
        {
          id: 'st-m1-p2',
          kind: 'Edge Case',
          title: 'Simpson’s Mix Check Across mobile vs. desktop',
          prompt:
            'Compute clean conversion rates separately for desktop vs. mobile inside control and treatment, then compare the segment lifts against the overall blended lift.',
          expectedCheck:
            'Desktop: treatment 75.0% (3/4) vs control 57.1% (4/7) [+17.9pp]. Mobile: treatment 33.3% (3/9) vs control 20.0% (1/5) [+13.3pp]. Blended: 46.2% vs 41.7% [+4.5pp] because treatment had 69% mobile traffic vs control 42%.',
        },
        {
          id: 'st-m1-p3',
          kind: 'Formula / Query',
          title: 'Outlier Inspection on time_on_page_sec',
          prompt:
            'Compute mean, median, and IQR of time_on_page_sec across the 25 clean users, noting how user 9020 (3600s) and bots 9005/9024 (4s, 3s) shift dispersion.',
          expectedCheck:
            'User 9020 (3600s) inflates clean sample mean to ~220s while clean median stays near ~78s; excluding 9020 drops clean mean below ~80s.',
        },
      ],
    },
    {
      moduleId: 'stat-m2',
      indexLabel: '02',
      title: 'Probability & Sampling Distributions',
      summary:
        'Conditional probability, Bayes rule intuition, and the Central Limit Theorem.',
      prompts: [
        {
          id: 'st-m2-p1',
          kind: 'Scenario',
          title: 'Conditional Probability of Conversion Given Device & Variant',
          prompt:
            'Using clean users (n = 25), compute P(converted = 1 | desktop) vs. P(converted = 1 | mobile) and compare P(mobile | treatment) vs. P(mobile | control).',
          expectedCheck:
            'P(converted | desktop) = 7/11 (63.6%) vs P(converted | mobile) = 4/14 (28.6%); P(mobile | treatment) = 9/13 (69.2%) vs P(mobile | control) = 5/12 (41.7%).',
        },
        {
          id: 'st-m2-p2',
          kind: 'Edge Case',
          title: 'Bot & Duplicate Contamination Audit Before Sampling Inference',
          prompt:
            'Explain what happens to P(converted = 1 | control) if you forget to remove bot 9005 and duplicate user 9011.',
          expectedCheck:
            'Raw control denominator inflates from 12 to 14 non-converting rows, artificially dragging control conversion down from 41.7% (5/12) to 35.7% (5/14).',
        },
        {
          id: 'st-m2-p3',
          kind: 'Formula / Query',
          title: 'Standard Error of Conversion Proportion in Each Arm',
          prompt:
            'Calculate SE = sqrt(p * (1 - p) / n) for clean control (5/12) and clean treatment (6/13) and estimate how large n would need to be to halve SE.',
          expectedCheck:
            'Control SE ≈ 0.142 and Treatment SE ≈ 0.138—showing wide uncertainty at n ≈ 12–13; halving SE requires 4x the sample (~50 per arm).',
        },
      ],
    },
    {
      moduleId: 'stat-m3',
      indexLabel: '03',
      title: 'Confidence Intervals & Estimation',
      summary:
        'Standard error, margin of error, and communicating uncertainty clearly.',
      prompts: [
        {
          id: 'st-m3-p1',
          kind: 'Scenario',
          title: '95% Confidence Interval for the Conversion Difference (B - A)',
          prompt:
            'Compute the two-proportion 95% CI for (p_treat - p_ctrl) = (6/13 - 5/12) = +0.0449 using SE_diff = sqrt(SE_ctrl² + SE_treat²).',
          expectedCheck:
            'SE_diff ≈ 0.198, giving a 95% MoE of ±0.388 and CI ≈ [-34.4%, +43.3%]—clearly demonstrating why n = 25 is far too underpowered to draw a launch decision.',
        },
        {
          id: 'st-m3-p2',
          kind: 'Edge Case',
          title: 'Missing order_revenue on Converted User 9018',
          prompt:
            'Check how Revenue-per-User (RPU) in treatment changes if user 9018 (converted = 1, order_revenue = null) is treated as $0 vs. excluded vs. imputed with mobile median revenue.',
          expectedCheck:
            'Treating null as $0 lowers treatment RPU ($839 / 13 = $64.54), excluding drops n to 12 ($69.92), and mobile median imputation (~$58) avoids downward bias—always audit logging bugs on null conversions.',
        },
        {
          id: 'st-m3-p3',
          kind: 'Formula / Query',
          title: 'Wilson Score vs. Wald Interval Check at Small n',
          prompt:
            'Explain why a Wald interval for desktop treatment (3/4 = 0.75) clips above 1.0 (+117%) and why Wilson score or exact intervals are safer at small sample sizes.',
          expectedCheck:
            'Wald gives 0.75 ± 1.96 * 0.217 = [32.5%, 117.5%] (impossible >100% bound!), whereas Wilson keeps bounds strictly inside [0%, 100%].',
        },
      ],
    },
    {
      moduleId: 'stat-m4',
      indexLabel: '04',
      title: 'Hypothesis Testing & A/B Experiments',
      summary:
        'Null frameworks, p-values, statistical power, and sample size planning.',
      prompts: [
        {
          id: 'st-m4-p1',
          kind: 'Scenario',
          title: 'Two-Proportion Z-Test & Sample Ratio Mismatch (SRM) Check',
          prompt:
            'Run a 50/50 chi-square SRM check on clean counts (12 control vs. 13 treatment) and compute the two-proportion z-statistic for 6/13 vs. 5/12.',
          expectedCheck:
            'SRM chi-square = (12-12.5)²/12.5 + (13-12.5)²/12.5 = 0.04 (p ≈ 0.84, healthy split). Two-proportion z ≈ 0.23 (p ≈ 0.82)—fail to reject H0.',
        },
        {
          id: 'st-m4-p2',
          kind: 'Edge Case',
          title: 'Why Treatment Device Skew Warrants Stratified / Covariate Check',
          prompt:
            'Test whether device_type (mobile vs. desktop) is balanced between clean control (5 mobile / 7 desktop) and treatment (9 mobile / 4 desktop), and note why imbalanced segments matter.',
          expectedCheck:
            'Treatment received 69.2% mobile vs 41.7% in control; in real experiments, use stratified randomization or CUPED/regression adjustment so device mix does not mask true lift.',
        },
        {
          id: 'st-m4-p3',
          kind: 'Formula / Query',
          title: 'Minimum Sample Size Needed for a +5pp Lift',
          prompt:
            'Using clean control baseline conversion (~41.7%), calculate approximate users per arm needed for 80% power at alpha = 0.05 to detect a +5 percentage point lift (to 46.7%).',
          expectedCheck:
            'Rule-of-thumb 16 * p*(1-p) / delta² ≈ 16 * (0.417 * 0.583) / 0.05² ≈ ~1,556 users per arm (~3,112 total)—over 100x larger than the 25-user sample log.',
        },
      ],
    },
    {
      moduleId: 'stat-m5',
      indexLabel: '05',
      title: 'Correlation & Linear Regression',
      summary:
        'R-squared interpretation, residuals, and correlation vs. causation checks.',
      prompts: [
        {
          id: 'st-m5-p1',
          kind: 'Scenario',
          title: 'Time on Page vs. Order Revenue Among Clean Converters',
          prompt:
            'Subset clean converted users with non-null order_revenue (10 rows) and inspect the correlation between time_on_page_sec (78s–210s) and order_revenue ($39–$480).',
          expectedCheck:
            'Higher-ticket orders ($420 at 210s, $480 at 175s) drive strong positive correlation among converters, while checking that non-converters include idle outlier 9020 (3600s, $0).',
        },
        {
          id: 'st-m5-p2',
          kind: 'Edge Case',
          title: 'How One Idle Outlier (9020 = 3600s) Flips Regression Slope',
          prompt:
            'Compare Pearson r between time_on_page_sec and converted across all 25 clean users WITH vs. WITHOUT user 9020 (3600s, converted = 0).',
          expectedCheck:
            'Including 9020 (3600s, $0) pulls the slope flat or negative, whereas excluding the idle 1-hour session restores the true positive pattern (converters spend ~80–210s vs ~30–60s for bounces).',
        },
        {
          id: 'st-m5-p3',
          kind: 'Formula / Query',
          title: 'Regression-Adjusted Lift Controlling for device_type',
          prompt:
            'Write out the linear probability / logistic specification: converted ~ variant + is_mobile, and interpret why the variant coefficient (~+15pp) exceeds the raw unadjusted difference (+4.5pp).',
          expectedCheck:
            'Controlling for is_mobile removes the treatment group’s heavier mobile traffic penalty, aligning the adjusted effect with the true within-segment lifts (+17.9pp desktop, +13.3pp mobile).',
        },
      ],
    },
  ],
  'power-bi': [
    {
      moduleId: 'pbi-m1',
      indexLabel: '01',
      title: 'Power Query Shaping & Connections',
      summary:
        'Connecting flat files and databases, query folding basics, and clean staging.',
      prompts: [
        {
          id: 'pbi-m1-p1',
          kind: 'Scenario',
          title: 'Clean store_region & Deduplicate P-103 in Power Query',
          prompt:
            'Load both star_schema_sales_fact.csv and star_schema_product_lookup.csv. Trim store_region in FactSales (fixing "West " on sale_id 7008) and remove duplicate product_key rows in DimProduct.',
          expectedCheck:
            'Trimming collapses store_region to 4 distinct values (North, East, South, West); deduplicating product_key reduces DimProduct from 8 rows down to 7 unique keys (P-101..P-107).',
        },
        {
          id: 'pbi-m1-p2',
          kind: 'Edge Case',
          title: 'Orphan Foreign Key Audit (P-999) in Power Query',
          prompt:
            'Perform a Left Anti Join from FactSales[product_key] to DimProduct[product_key] inside a QA query to surface unmatched fact keys before modeling.',
          expectedCheck:
            'The Left Anti Join should isolate exactly 1 orphan row: sale_id = 7019 (product_key = "P-999", net_sales = $180.00).',
        },
        {
          id: 'pbi-m1-p3',
          kind: 'Formula / Query',
          title: 'Type Enforcement & Query Folding Order Check',
          prompt:
            'Set explicit column types on both tables (order_date & ship_date as Date, net_sales & unit_cost as Fixed Decimal) and verify null ship_date rows (7025, 7026) load without errors.',
          expectedCheck:
            '26 FactSales rows load cleanly with 2 null ship_date values (sale_id 7025, 7026) and 1 negative return row (sale_id 7015, quantity = -1, net_sales = -120).',
        },
      ],
    },
    {
      moduleId: 'pbi-m2',
      indexLabel: '02',
      title: 'Dimensional Star-Schema Modeling',
      summary:
        'Fact vs. dimension tables, cardinality, and avoiding bi-directional traps.',
      prompts: [
        {
          id: 'pbi-m2-p1',
          kind: 'Scenario',
          title: 'Fix 1:* Cardinality & Build DimDate Star Schema',
          prompt:
            'Connect DimProduct[product_key] -> FactSales[product_key] as One-to-Many (1:*) single direction, and generate a contiguous 2025 DimDate table linked to FactSales[order_date].',
          expectedCheck:
            'Verify 1:* succeeds only after removing the duplicate P-103 row in DimProduct; notice inactive P-107 (Legacy Tape Adapter) has 0 fact rows.',
        },
        {
          id: 'pbi-m2-p2',
          kind: 'Edge Case',
          title: 'Why Orphan P-999 Creates a (Blank) Category Row',
          prompt:
            'Place DimProduct[category] and [Total Net Sales] in a Matrix visual to observe how sale_id 7019 (product_key = "P-999") behaves under referential integrity violation.',
          expectedCheck:
            'The Matrix displays a "(Blank)" category row with $180.00 from sale_id 7019 unless P-999 is added to DimProduct as an "Unknown" member.',
        },
        {
          id: 'pbi-m2-p3',
          kind: 'Formula / Query',
          title: 'Role-Playing Dates with USERELATIONSHIP()',
          prompt:
            'Add an inactive relationship DimDate[Date] -> FactSales[ship_date] alongside the active order_date link, then write [Shipped Sales] using USERELATIONSHIP().',
          expectedCheck:
            'Use CALCULATE([Total Net Sales], USERELATIONSHIP(DimDate[Date], FactSales[ship_date])) and verify total shipped sales excludes unshipped 7025 ($340) & 7026 ($320), landing $660 lower than total order sales.',
        },
      ],
    },
    {
      moduleId: 'pbi-m3',
      indexLabel: '03',
      title: 'DAX Fundamentals & Filter Context',
      summary:
        'Calculated columns vs. measures, CALCULATE, and row/filter propagation.',
      prompts: [
        {
          id: 'pbi-m3-p1',
          kind: 'Scenario',
          title: 'Total Net Sales, Cost & Gross Margin % Using RELATED()',
          prompt:
            'Write [Total Net Sales] = SUM(FactSales[net_sales]), [Total Cost] = SUMX(FactSales, FactSales[quantity] * RELATED(DimProduct[unit_cost])), and [Gross Margin %] using VAR/RETURN + DIVIDE.',
          expectedCheck:
            'Check how sale_id 7015 (quantity = -1, net_sales = -120) reverses -$35 cost accurately inside SUMX, and check how P-999 returns BLANK unit_cost via RELATED().',
        },
        {
          id: 'pbi-m3-p2',
          kind: 'Edge Case',
          title: 'Category Share % Preserving Region Slicers',
          prompt:
            'Write [% of All Categories] using REMOVEFILTERS(DimProduct[category]) so selecting West on a store_region slicer recalculates category shares strictly within West.',
          expectedCheck:
            'Use DIVIDE([Total Net Sales], CALCULATE([Total Net Sales], REMOVEFILTERS(DimProduct[category]))); percentages across Hardware, Software, Accessories, and (Blank) must sum to 100.0% for any selected region.',
        },
        {
          id: 'pbi-m3-p3',
          kind: 'Formula / Query',
          title: 'Zero-Sales Product Visibility (P-107)',
          prompt:
            'Inspect why DimProduct[product_name] drops P-107 (Legacy Tape Adapter) in a table with [Total Net Sales], and write a measure [Sales Incl Zero] = COALESCE([Total Net Sales], 0) when filtering active vs. inactive SKUs.',
          expectedCheck:
            'Standard [Total Net Sales] hides P-107 because it returns BLANK(); COALESCE(..., 0) surfaces P-107 with $0.00 so inactive catalog items can be audited.',
        },
      ],
    },
    {
      moduleId: 'pbi-m4',
      indexLabel: '04',
      title: 'Time Intelligence Patterns',
      summary:
        'Dedicated date tables, YoY variance, MTD/YTD totals, and moving windows.',
      prompts: [
        {
          id: 'pbi-m4-p1',
          kind: 'Scenario',
          title: 'Quarterly YTD Sales & Q4 vs. Q3 Variance',
          prompt:
            'Write [Sales YTD] = TOTALYTD([Total Net Sales], DimDate[Date]) and [Sales QoQ %] using PREVIOUSQUARTER(DimDate[Date]).',
          expectedCheck:
            'Verify Q3 2025 (Jul–Sep, 7 rows: 7013–7019 including -$120 return 7015 & $180 P-999) totals $3,143.00 and Q4 2025 (Oct–Nov, 7 rows: 7020–7026) totals $3,890.00.',
        },
        {
          id: 'pbi-m4-p2',
          kind: 'Edge Case',
          title: 'Partial-Month November 2025 Bias (Max Date = Nov 18)',
          prompt:
            'Note that FactSales ends on 2025-11-18. Write a [Last Fact Date] check and explain why comparing full October ($1,965) against partial November ($1,925) misleads without MTD capping.',
          expectedCheck:
            'Use CALCULATE(MAX(FactSales[order_date]), REMOVEFILTERS()) = 2025-11-18, and cap comparison periods using DAY(DimDate[Date]) <= 18 for apples-to-apples pacing.',
        },
        {
          id: 'pbi-m4-p3',
          kind: 'Formula / Query',
          title: 'Trailing 90-Day Rolling Sales Measure',
          prompt:
            'Create [Rolling 90D Sales] using DATESINPERIOD(DimDate[Date], MAX(DimDate[Date]), -90, DAY) and plot it by Month.',
          expectedCheck:
            'Verify November 2025’s 90-day window sums roughly late-Aug through Nov 18 without dropping the -$120 return if within window.',
        },
      ],
    },
    {
      moduleId: 'pbi-m5',
      indexLabel: '05',
      title: 'Visual Hierarchy & Drill-Through UX',
      summary:
        'KPI cards, clean chart selection, bookmarks, and tooltip pages.',
      prompts: [
        {
          id: 'pbi-m5-p1',
          kind: 'Scenario',
          title: 'Executive Overview Page & Return Impact Card',
          prompt:
            'Design a 1-page layout with 3 KPI cards ([Total Net Sales], [Gross Margin %], [Unshipped Orders = 2]), a Monthly Trend chart, and a Region x Category matrix with Drill-Through to a Line Detail page.',
          expectedCheck:
            'Verify [Total Net Sales] across all 26 rows sums to $13,538.00 and [Unshipped Orders] = CALCULATE(COUNTROWS(FactSales), ISBLANK(FactSales[ship_date])) equals 2.',
        },
        {
          id: 'pbi-m5-p2',
          kind: 'Edge Case',
          title: 'Highlight Negative Return (7015) & Orphan P-999 in Tooltip',
          prompt:
            'Create a custom Tooltip Page showing SKU Quantity & Net Sales so hovering over Software in North reveals the -$120.00 return (sale_id 7015) immediately.',
          expectedCheck:
            'Confirm conditional formatting flags negative net_sales (< 0) in muted red on the drill-through detail table.',
        },
        {
          id: 'pbi-m5-p3',
          kind: 'Formula / Query',
          title: 'Dynamic Region Selection Subtitle & Reset Filters Bookmark',
          prompt:
            'Add a DAX subtitle measure displaying selected store_region values (or "All Regions") and bind a Reset Filters button to a Data-only Bookmark.',
          expectedCheck:
            'Test clicking "West" in the slicer (updates subtitle to "Region: West" without split "West " bars), then click Reset Filters to restore all 4 regions.',
        },
      ],
    },
  ],
};

export const PRACTICE_TOPICS_BY_COURSE: Record<string, PracticeTopic[]> =
  Object.fromEntries(
    Object.entries(RAW_PRACTICE_TOPICS_BY_COURSE).map(([courseId, topics]) => [
      courseId,
      topics.map((topic) => ({
        ...topic,
        prompts: topic.prompts.map((prompt) => {
          const spec = PRACTICE_VALIDATIONS_BY_ID[prompt.id];
          return {
            ...prompt,
            referenceAnswer: spec?.referenceAnswer ?? prompt.expectedCheck,
            validation: spec?.validation ?? {
              nudge: prompt.expectedCheck,
              inputPlaceholder: 'Enter your answer from the sample dataset...',
              inputMode: 'line',
            },
          };
        }),
      })),
    ])
  );

export interface LabDrillStats {
  completedPrompts: number;
  totalPrompts: number;
  completedTopics: number;
  totalTopics: number;
  status: CourseStatus;
}

export interface OverallPracticeStats {
  completedPrompts: number;
  totalPrompts: number;
  completedTopics: number;
  totalTopics: number;
  completedDrills: number;
  inProgressDrills: number;
  totalDrills: number;
}

export function getLabDrillStats(
  lab: PracticeLabPreview,
  state: AcademyLocalState
): LabDrillStats {
  const checkedSet = new Set(state.practicedPromptIds);
  let totalPrompts = 0;
  let completedPrompts = 0;
  let completedTopics = 0;

  for (const topic of lab.topics) {
    totalPrompts += topic.prompts.length;
    let topicDone = 0;
    for (const prompt of topic.prompts) {
      if (checkedSet.has(prompt.id)) {
        completedPrompts += 1;
        topicDone += 1;
      }
    }
    if (topic.prompts.length > 0 && topicDone === topic.prompts.length) {
      completedTopics += 1;
    }
  }

  let status: CourseStatus = 'not_started';
  if (totalPrompts > 0 && completedPrompts === totalPrompts) {
    status = 'completed';
  } else if (completedPrompts > 0) {
    status = 'in_progress';
  }

  return {
    completedPrompts,
    totalPrompts,
    completedTopics,
    totalTopics: lab.topics.length,
    status,
  };
}

export function getOverallPracticeStats(
  labs: PracticeLabPreview[],
  state: AcademyLocalState
): OverallPracticeStats {
  let completedPrompts = 0;
  let totalPrompts = 0;
  let completedTopics = 0;
  let totalTopics = 0;
  let completedDrills = 0;
  let inProgressDrills = 0;

  for (const lab of labs) {
    const stats = getLabDrillStats(lab, state);
    completedPrompts += stats.completedPrompts;
    totalPrompts += stats.totalPrompts;
    completedTopics += stats.completedTopics;
    totalTopics += stats.totalTopics;
    if (stats.status === 'completed') completedDrills += 1;
    else if (stats.status === 'in_progress') inProgressDrills += 1;
  }

  return {
    completedPrompts,
    totalPrompts,
    completedTopics,
    totalTopics,
    completedDrills,
    inProgressDrills,
    totalDrills: labs.length,
  };
}
