import { PracticeAnswerValidationRule } from '../types/academy';

export interface PracticePromptValidationSpec {
  referenceAnswer: string;
  validation: PracticeAnswerValidationRule;
}

export const PRACTICE_VALIDATIONS_BY_ID: Record<
  string,
  PracticePromptValidationSpec
> = {
  // ── EXCEL (sales_operations_sample.csv) ─────────────────────────────────────
  'ex-m1-p1': {
    referenceAnswer:
      '=PROPER(TRIM(C2)) for clean_region (4 unique values: West, Northeast, Midwest, South), =UPPER(TRIM(D2)) for clean_sku (length 7), and =E2*clean_price*$K$2 for locked 8% commission.',
    validation: {
      expectedNumbers: [{ value: 4, tolerance: 0 }],
      requiredKeywordGroups: [
        ['trim'],
        ['$k$2', '$', 'proper', 'upper', 'clean'],
      ],
      nudge:
        'Include the number of clean unique regions (4) and the functions/locking syntax used (TRIM, PROPER/UPPER, and $ absolute reference).',
      inputPlaceholder:
        'e.g. 4 unique regions; =PROPER(TRIM(C2)), =UPPER(TRIM(D2)), and =units*price*$K$2',
      inputMode: 'line',
    },
  },
  'ex-m1-p2': {
    referenceAnswer:
      '2 rows flagged as duplicate order_id (ORD-1012) and 1 length mismatch on ORD-1008 ("SKU-A10 ", raw LEN = 8 vs. TRIM = 7).',
    validation: {
      expectedNumbers: [
        { value: 2, tolerance: 0 },
        { value: 1, tolerance: 0 },
      ],
      requiredKeywordGroups: [['1012', 'ord-1012'], ['1008', 'ord-1008', 'sku-a10']],
      nudge:
        'Report both counts (2 duplicate rows and 1 length mismatch) along with the affected order_ids (ORD-1012 and ORD-1008).',
      inputPlaceholder:
        'e.g. 2 duplicate rows (ORD-1012); 1 SKU space mismatch (ORD-1008)',
      inputMode: 'line',
    },
  },
  'ex-m1-p3': {
    referenceAnswer:
      'Invalid regions: ORD-1004 (" west ") and ORD-1010 ("NORTHEAST"). Blank counts: 1 in units (ORD-1014), 2 in discount_pct (ORD-1007, ORD-1023), 1 in rep_name (ORD-1016).',
    validation: {
      expectedNumbers: [
        { value: 1, tolerance: 0 },
        { value: 2, tolerance: 0 },
      ],
      requiredKeywordGroups: [
        ['1004', 'west'],
        ['1010', 'northeast'],
        ['countblank', '1014', '1007', '1016', 'blank'],
      ],
      nudge:
        'Check both invalid region rows (ORD-1004 and ORD-1010) and the blank counts across units (1), discount_pct (2), and rep_name (1).',
      inputPlaceholder:
        'e.g. Invalid: ORD-1004, ORD-1010; Blanks: units=1 (ORD-1014), discount_pct=2, rep_name=1',
      inputMode: 'line',
    },
  },
  'ex-m2-p1': {
    referenceAnswer:
      '=NUMBERVALUE(SUBSTITUTE(SUBSTITUTE(F2,"$",""),",","")) converts ORD-1019 to 1150 (gross_sales = 2300, High Value); wrap units check with IF(ISBLANK(E2),"Missing Qty", IFS(...)).',
    validation: {
      expectedNumbers: [{ value: 2300, tolerance: 1 }],
      requiredKeywordGroups: [
        ['ifs', 'if('],
        ['substitute', 'numbervalue', 'value(', 'isblank'],
      ],
      nudge:
        'Include ORD-1019 gross_sales ($2,300) and the Excel functions used (SUBSTITUTE/NUMBERVALUE + IFS/ISBLANK).',
      inputPlaceholder:
        'e.g. ORD-1019 gross = 2300 (High Value) via NUMBERVALUE/SUBSTITUTE + IFS()',
      inputMode: 'multiline',
    },
  },
  'ex-m2-p2': {
    referenceAnswer:
      '13 rows in October 2025 (2025-10-31) and 13 rows in November 2025 (2025-11-30) after normalizing "2025/10/14" (ORD-1006) and "15-Nov-2025" (ORD-1018) with DATEVALUE/DATE.',
    validation: {
      expectedNumbers: [{ value: 13, tolerance: 0 }],
      requiredKeywordGroups: [['eomonth', 'datevalue', 'date(', 'october', 'oct', 'nov']],
      nudge:
        'Verify how many rows fall in October vs. November (13 each across all 26 raw rows) and note EOMONTH/DATEVALUE.',
      inputPlaceholder:
        'e.g. 13 October rows (2025-10-31) and 13 November rows (2025-11-30) using EOMONTH',
      inputMode: 'line',
    },
  },
  'ex-m2-p3': {
    referenceAnswer:
      '=E2*clean_price*(1-IF(ISBLANK(G2),0,G2)) — evaluates ORD-1007 and ORD-1023 to $720.00 each without errors.',
    validation: {
      expectedNumbers: [{ value: 720, tolerance: 0.5 }],
      requiredKeywordGroups: [['if(', 'n(', 'isblank', 'coalesce', 'iferror']],
      nudge:
        'Check the net revenue for ORD-1007 / ORD-1023 (3 * $240 = $720) and include the blank-handling Excel function (IF/ISBLANK or N()).',
      inputPlaceholder:
        'e.g. =E2*price*(1-IF(ISBLANK(G2),0,G2)) -> ORD-1007 & ORD-1023 = 720',
      inputMode: 'line',
    },
  },
  'ex-m3-p1': {
    referenceAnswer:
      '=XLOOKUP(TRIM(D2), Ref[SKU], Ref[Category], "Unmapped SKU") matches 25 rows and flags 1 unmapped row: ORD-1021 (SKU-Z99).',
    validation: {
      expectedNumbers: [
        { value: 25, tolerance: 0 },
        { value: 1, tolerance: 0 },
      ],
      requiredKeywordGroups: [
        ['xlookup', 'index'],
        ['z99', 'sku-z99', '1021', 'unmapped'],
      ],
      nudge:
        'State how many rows match (25) vs. unmapped (1: ORD-1021 / SKU-Z99) and reference XLOOKUP (or INDEX/MATCH).',
      inputPlaceholder:
        'e.g. 25 matched, 1 Unmapped SKU (ORD-1021 / SKU-Z99) via =XLOOKUP(TRIM(D2),...)',
      inputMode: 'line',
    },
  },
  'ex-m3-p2': {
    referenceAnswer:
      'Raw XLOOKUP returns #N/A on ORD-1008 ("SKU-A10 ") and ORD-1021 ("SKU-Z99"); clearing occupied cells resolves #SPILL! so UNIQUE spills 4 clean regions.',
    validation: {
      expectedNumbers: [{ value: 4, tolerance: 0 }],
      requiredKeywordGroups: [
        ['1008', 'sku-a10'],
        ['1021', 'z99', '#n/a', '#spill'],
      ],
      nudge:
        'Name both failing rows on raw lookup (ORD-1008 and ORD-1021) and confirm 4 clean regions spill once #SPILL! is cleared.',
      inputPlaceholder:
        'e.g. #N/A on ORD-1008 and ORD-1021; clearing cells lets UNIQUE spill 4 regions',
      inputMode: 'line',
    },
  },
  'ex-m3-p3': {
    referenceAnswer:
      '=SORTBY(FILTER(A2:E27, (clean_region="West")*(E2:E27>=5)), FILTER(E2:E27, (clean_region="West")*(E2:E27>=5)), -1) returns 4 rows: ORD-1006 (10), ORD-1024 (8), ORD-1004 (6), ORD-1011 (5).',
    validation: {
      expectedNumbers: [{ value: 4, tolerance: 0 }],
      requiredKeywordGroups: [
        ['filter', '1006'],
        ['sort', '1024'],
        ['1004', '1011', 'west'],
      ],
      nudge:
        'Check the exact West count with units >= 5 (4 rows: ORD-1006, ORD-1024, ORD-1004, ORD-1011) and use FILTER + SORT/SORTBY.',
      inputPlaceholder:
        'e.g. 4 rows (ORD-1006, ORD-1024, ORD-1004, ORD-1011) via FILTER + SORTBY',
      inputMode: 'multiline',
    },
  },
  'ex-m4-p1': {
    referenceAnswer:
      '4 clean_region rows (West, Northeast, Midwest, South) across 25 distinct orders (24 orders with non-null units after deduplicating ORD-1012).',
    validation: {
      expectedNumbers: [
        { value: 4, tolerance: 0 },
        { value: 25, tolerance: 0 },
      ],
      requiredKeywordGroups: [['1012', 'region', 'distinct', 'dedup', 'pivot']],
      nudge:
        'Confirm your cleaned PivotTable has 4 region rows (not 6) and 25 distinct orders after removing duplicate ORD-1012.',
      inputPlaceholder:
        'e.g. 4 regions, 25 distinct orders (24 non-null units) after removing duplicate ORD-1012',
      inputMode: 'line',
    },
  },
  'ex-m4-p2': {
    referenceAnswer:
      'Simple Average of discount_pct ignores the 2 blank cells and weights $65 orders equally with $2,300 ORD-1019; a Calculated Field (= Discount_Dollars / Gross_Revenue) weights discounts accurately by revenue.',
    validation: {
      requiredKeywordGroups: [
        ['calculated field', 'ratio', 'weighted', 'sum'],
        ['average', 'mean', 'blank', '2', '1019', 'equal'],
      ],
      nudge:
        'Explain why averaging row-level discount_pct distorts totals (ignores blanks & equal-weights small vs. large orders) vs. summing Discount_Dollars / Gross_Revenue in a Calculated Field.',
      inputPlaceholder:
        'e.g. Average ignores 2 blanks and unweighted small orders; Calculated Field sums Discount_Dollars / Gross_Revenue',
      inputMode: 'multiline',
    },
  },
  'ex-m4-p3': {
    referenceAnswer:
      'Maya Lin has 8 orders (7 with non-null units) summing to 40 total units; ORD-1016 appears under "(blank)" on the rep_name slicer.',
    validation: {
      expectedNumbers: [{ value: 40, tolerance: 0 }],
      requiredKeywordGroups: [['getpivotdata', 'maya', '40']],
      nudge:
        'Sum Maya Lin’s non-null units in sales_operations_sample.csv (4+6+10+5+3+4+8 = 40) and mention GETPIVOTDATA.',
      inputPlaceholder:
        'e.g. 40 units across 8 orders (7 non-null) via GETPIVOTDATA; ORD-1016 is (blank)',
      inputMode: 'line',
    },
  },
  'ex-m5-p1': {
    referenceAnswer:
      'Text.Trim + Text.Proper on region, Text.Trim + Text.Upper on sku, and Table.ReplaceValue(null -> 0) on discount_pct yield 0 whitespace errors and 0 discount nulls.',
    validation: {
      requiredKeywordGroups: [
        ['trim'],
        ['proper', 'capitalize'],
        ['upper', 'replace'],
      ],
      nudge:
        'List the core Power Query steps: Trim + Capitalize Each Word (region), Trim + Uppercase (sku), and Replace Values null -> 0 (discount_pct).',
      inputPlaceholder:
        'e.g. Trim + Capitalize Each Word on region; Trim + Upper on sku; Replace null->0 on discount_pct',
      inputMode: 'multiline',
    },
  },
  'ex-m5-p2': {
    referenceAnswer:
      'Use Change Type > Using Locale (English - United States) on unit_price and Table.Distinct on order_id, loading 25 clean rows with 0 errors.',
    validation: {
      expectedNumbers: [{ value: 25, tolerance: 0 }],
      requiredKeywordGroups: [['locale', 'currency', 'decimal', 'distinct', 'duplicate']],
      nudge:
        'Specify Using Locale (English - US) for currency parsing and deduplicating order_id down to 25 rows.',
      inputPlaceholder:
        'e.g. 25 rows loaded using Change Type > Using Locale (en-US) + Remove Duplicates on order_id',
      inputMode: 'line',
    },
  },
  'ex-m5-p3': {
    referenceAnswer:
      '25 deduplicated rows parse cleanly to Date type: 12 October 2025 rows and 13 November 2025 rows.',
    validation: {
      expectedNumbers: [
        { value: 12, tolerance: 0 },
        { value: 13, tolerance: 0 },
      ],
      requiredKeywordGroups: [['date', 'oct', 'nov', 'locale']],
      nudge:
        'After deduplicating ORD-1012, count how many rows fall in October (12) vs. November (13).',
      inputPlaceholder:
        'e.g. 25 clean Date rows: 12 in October and 13 in November',
      inputMode: 'line',
    },
  },

  // ── SQL (ecommerce_orders_and_customers.csv) ────────────────────────────────
  'sql-m1-p1': {
    referenceAnswer:
      'SELECT * FROM orders WHERE order_date >= \'2025-10-01\' AND order_date < \'2025-11-01\' AND order_total >= 1000 AND status <> \'cancelled\' ORDER BY order_date ASC; -- Returns 3 rows: 5009, 5016, 5017.',
    validation: {
      expectedNumbers: [{ value: 3, tolerance: 0 }],
      requiredKeywordGroups: [
        ['5009'],
        ['5016'],
        ['5017'],
      ],
      nudge:
        'Count October 2025 orders >= $1,000 (not cancelled): verify the 3 exact order_ids (5009, 5016, 5017; note 5012 is $980).',
      inputPlaceholder:
        'e.g. 3 rows: order_id 5009, 5016, 5017 (5012 is $980)',
      inputMode: 'multiline',
    },
  },
  'sql-m1-p2': {
    referenceAnswer:
      '!= \'VIP20\' returns 9 rows (dropping 13 NULLs), whereas IS DISTINCT FROM \'VIP20\' (or COALESCE(discount_code, \'\') != \'VIP20\') returns 22 rows.',
    validation: {
      expectedNumbers: [
        { value: 9, tolerance: 0 },
        { value: 22, tolerance: 0 },
      ],
      requiredKeywordGroups: [['distinct from', 'coalesce', 'is null', 'null']],
      nudge:
        'Include both counts: 9 rows from != \'VIP20\' vs. 22 rows when NULLs are preserved with IS DISTINCT FROM or COALESCE.',
      inputPlaceholder:
        'e.g. != returns 9 rows (drops 13 NULLs); IS DISTINCT FROM returns 22 rows',
      inputMode: 'line',
    },
  },
  'sql-m1-p3': {
    referenceAnswer:
      'SELECT order_id, order_total, (order_total >= 1000) AS high_ticket_flag FROM orders WHERE LOWER(customer_segment) = \'enterprise\'; -- Returns 9 rows including order_id 5017.',
    validation: {
      expectedNumbers: [{ value: 9, tolerance: 0 }],
      requiredKeywordGroups: [
        ['lower(', 'ilike', 'upper('],
        ['5017', 'enterprise'],
      ],
      nudge:
        'Check the Enterprise row count (9 rows including lowercase 5017) and use LOWER()/UPPER()/ILIKE instead of a SELECT alias in WHERE.',
      inputPlaceholder:
        'e.g. 9 rows using WHERE LOWER(customer_segment) = \'enterprise\' (catches 5017)',
      inputMode: 'multiline',
    },
  },
  'sql-m2-p1': {
    referenceAnswer:
      '28 raw rows across 3 segments: Enterprise (9), SMB (9 raw / 8 deduped), Consumer (10); 15 of 28 rows have a non-null discount_code (53.6%).',
    validation: {
      expectedNumbers: [
        { value: 9, tolerance: 0 },
        { value: 10, tolerance: 0 },
        { value: 15, tolerance: 0 },
      ],
      requiredKeywordGroups: [['group by', 'case when', 'enterprise', 'consumer', 'smb']],
      nudge:
        'Check segment counts (Enterprise 9, SMB 9 raw, Consumer 10) and non-null discount_code rows (15 of 28) using GROUP BY + CASE WHEN.',
      inputPlaceholder:
        'e.g. Enterprise=9, SMB=9, Consumer=10; 15/28 rows use discount_code via CASE WHEN + GROUP BY',
      inputMode: 'multiline',
    },
  },
  'sql-m2-p2': {
    referenceAnswer:
      'COUNT(*) = 28, COUNT(DISTINCT order_id) = 27, COUNT(discount_code) = 15; duplicate order_id 5014 inflates SMB revenue by $690.',
    validation: {
      expectedNumbers: [
        { value: 28, tolerance: 0 },
        { value: 27, tolerance: 0 },
        { value: 15, tolerance: 0 },
        { value: 690, tolerance: 0.5 },
      ],
      nudge:
        'Include all 4 figures: COUNT(*) = 28, COUNT(DISTINCT order_id) = 27, COUNT(discount_code) = 15, and $690 inflation from 5014.',
      inputPlaceholder:
        'e.g. COUNT(*)=28, DISTINCT=27, discount_code=15; duplicate 5014 inflates by $690',
      inputMode: 'line',
    },
  },
  'sql-m2-p3': {
    referenceAnswer:
      'Qualifying customers: 101 ($5,650), 107 ($4,380), and 103 ($2,690 after deduplicating 5014) — filtered with HAVING COUNT(*) >= 3 AND SUM(order_total) > 2500.',
    validation: {
      requiredKeywordGroups: [
        ['101'],
        ['107'],
        ['103'],
        ['having'],
      ],
      nudge:
        'List all 3 qualifying customer_ids (101, 107, 103) and reference HAVING.',
      inputPlaceholder:
        'e.g. customer_id 101, 107, 103 using HAVING COUNT(*) >= 3 AND SUM(order_total) > 2500',
      inputMode: 'multiline',
    },
  },
  'sql-m3-p1': {
    referenceAnswer:
      'Customer 101 referred 5 orders; 102 referred 3; 103 referred 3; 106 referred 2; 107 referred 2 (15 referred rows total) via LEFT JOIN on referrer_customer_id.',
    validation: {
      expectedNumbers: [{ value: 5, tolerance: 0 }],
      requiredKeywordGroups: [
        ['left join'],
        ['101'],
        ['15', '102', '103'],
      ],
      nudge:
        'Use LEFT JOIN on referrer_customer_id and report customer 101’s referred count (5) along with the other referrers (102, 103, 106, 107).',
      inputPlaceholder:
        'e.g. LEFT JOIN: 101->5, 102->3, 103->3, 106->2, 107->2 (15 total)',
      inputMode: 'multiline',
    },
  },
  'sql-m3-p2': {
    referenceAnswer:
      'NOT IN returns 0 rows because referrer_customer_id contains NULLs; NOT EXISTS (or filtering IS NOT NULL) returns 7 non-referring customers: 104, 105, 108, 109, 110, 111, 112.',
    validation: {
      expectedNumbers: [
        { value: 0, tolerance: 0 },
        { value: 7, tolerance: 0 },
      ],
      requiredKeywordGroups: [
        ['null'],
        ['not exists', 'is not null'],
      ],
      nudge:
        'Note both counts (0 rows from NOT IN due to NULLs vs. 7 customers via NOT EXISTS or IS NOT NULL).',
      inputPlaceholder:
        'e.g. NOT IN gives 0 rows due to NULLs; NOT EXISTS returns 7 customers (104, 105, 108..112)',
      inputMode: 'line',
    },
  },
  'sql-m3-p3': {
    referenceAnswer:
      'Joining raw orders to itself on customer_id squares rows (e.g. customer 101 jumps from 4 rows to 16); pre-aggregating inside a CTE keeps 27 distinct order rows.',
    validation: {
      expectedNumbers: [{ value: 27, tolerance: 0 }],
      requiredKeywordGroups: [
        ['16', 'square', 'fan-out', 'fanout', 'multiplicat'],
        ['cte', 'with ', 'pre-aggregat', 'group by'],
      ],
      nudge:
        'Note the row multiplication (4 -> 16 for customer 101) and pre-aggregate inside a CTE so 27 order rows are preserved.',
      inputPlaceholder:
        'e.g. Self-join squares customer 101 (4->16); pre-aggregating in a CTE keeps 27 rows',
      inputMode: 'multiline',
    },
  },
  'sql-m4-p1': {
    referenceAnswer:
      'WITH deduped_orders AS (...), valid_orders AS (SELECT * FROM deduped_orders WHERE status IN (\'completed\',\'shipped\')), monthly_segment_summary AS (...) — 27 deduped rows and 22 valid orders.',
    validation: {
      expectedNumbers: [
        { value: 27, tolerance: 0 },
        { value: 22, tolerance: 0 },
      ],
      requiredKeywordGroups: [['with ', 'cte'], ['completed', 'cancelled', 'refunded']],
      nudge:
        'Verify your CTE counts (27 deduped rows and 22 valid orders after excluding 3 cancelled + 2 refunded) and include WITH.',
      inputPlaceholder:
        'e.g. WITH deduped (27 rows) -> valid_orders (22 rows) -> monthly_segment_summary',
      inputMode: 'multiline',
    },
  },
  'sql-m4-p2': {
    referenceAnswer:
      '0 valid September-only churned customers (customers 101, 102, 103, 105, 106, 107 all reordered in Oct/Nov; only 104 cancelled in Sep).',
    validation: {
      expectedNumbers: [{ value: 0, tolerance: 0 }],
      requiredKeywordGroups: [['104', 'not exists', 'anti', 'left join', 'reordered']],
      nudge:
        'Check September buyers (101–107): all valid buyers reordered in Oct/Nov (0 valid churners; only 104 cancelled in Sep).',
      inputPlaceholder:
        'e.g. 0 valid Sep-only churners (101,102,103,105,106,107 reordered; 104 cancelled in Sep)',
      inputMode: 'line',
    },
  },
  'sql-m4-p3': {
    referenceAnswer:
      'Qualifying orders >= 25% above segment average: 5005 ($1,890, Enterprise), 5025 ($840, SMB), and 5011 ($320) & 5020 ($260) (Consumer).',
    validation: {
      requiredKeywordGroups: [
        ['5005'],
        ['5025'],
        ['5011'],
        ['5020'],
      ],
      nudge:
        'Check which orders exceed their segment average by >= 25%: look for 5005 (Enterprise), 5025 (SMB), and two Consumer orders (5011, 5020).',
      inputPlaceholder:
        'e.g. 5005 ($1,890), 5025 ($840), 5011 ($320), 5020 ($260)',
      inputMode: 'line',
    },
  },
  'sql-m5-p1': {
    referenceAnswer:
      'ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY order_date) = 1 removes 5014; LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) yields gaps of NULL, 13d, 25d, 27d for customer 101.',
    validation: {
      expectedNumbers: [
        { value: 13, tolerance: 0 },
        { value: 25, tolerance: 0 },
        { value: 27, tolerance: 0 },
      ],
      requiredKeywordGroups: [['row_number'], ['lag']],
      nudge:
        'Use ROW_NUMBER() + LAG() and verify customer 101’s exact inter-order day gaps (13, 25, 27 days).',
      inputPlaceholder:
        'e.g. ROW_NUMBER() + LAG(); customer 101 gaps = NULL, 13d, 25d, 27d',
      inputMode: 'multiline',
    },
  },
  'sql-m5-p2': {
    referenceAnswer:
      'Orders skip calendar dates, so ROWS BETWEEN 6 PRECEDING spans ~2–3 weeks of prior rows; join a calendar spine first and use RANGE BETWEEN INTERVAL \'6 days\' PRECEDING AND CURRENT ROW.',
    validation: {
      requiredKeywordGroups: [
        ['spine', 'generate_series', 'calendar', 'missing date', 'skip', 'gap'],
        ['range', 'interval'],
      ],
      nudge:
        'Explain that sparse order dates stretch ROWS BETWEEN 6 PRECEDING beyond 7 days—so a calendar spine + RANGE INTERVAL \'6 days\' is required.',
      inputPlaceholder:
        'e.g. Sparse dates stretch ROWS 6 PRECEDING; build a calendar spine + RANGE INTERVAL \'6 days\'',
      inputMode: 'multiline',
    },
  },
  'sql-m5-p3': {
    referenceAnswer:
      'DENSE_RANK() OVER (PARTITION BY LOWER(customer_segment) ORDER BY order_total DESC) <= 2 -> Enterprise: 5005, 5027; SMB: 5025, 5022; Consumer: 5011, 5020.',
    validation: {
      requiredKeywordGroups: [
        ['dense_rank'],
        ['5005', '5027'],
        ['5025', '5022'],
        ['5011', '5020'],
      ],
      nudge:
        'Include DENSE_RANK() and list the Top-2 order_ids across Enterprise (5005, 5027), SMB (5025, 5022), and Consumer (5011, 5020).',
      inputPlaceholder:
        'e.g. DENSE_RANK() <= 2: Ent (5005, 5027), SMB (5025, 5022), Cons (5011, 5020)',
      inputMode: 'multiline',
    },
  },

  // ── PYTHON (customer_churn_raw.csv) ─────────────────────────────────────────
  'py-m1-p1': {
    referenceAnswer:
      'def parse_money(val): return None if val in (None, "", "N/A", "-") else float(val.replace("$", "").strip()) -> 199.0 on CUST-007 and None on 3 rows (CUST-011, CUST-019, CUST-024).',
    validation: {
      expectedNumbers: [
        { value: 199, tolerance: 0.01 },
        { value: 3, tolerance: 0 },
      ],
      requiredKeywordGroups: [
        ['replace', 'strip', 'float', 'none'],
        ['cust-011', 'cust-019', 'cust-024', 'n/a'],
      ],
      nudge:
        'Confirm parse_money("$199.00") == 199.0 and that 3 rows return None (CUST-011, CUST-019, CUST-024).',
      inputPlaceholder:
        'e.g. 199.0 on CUST-007; 3 None rows (CUST-011, CUST-019, CUST-024) via .replace("$","")',
      inputMode: 'multiline',
    },
  },
  'py-m1-p2': {
    referenceAnswer:
      'raw.strip().lower() in {"true", "yes", "1"} -> CUST-006 ("yes") = True, CUST-014 ("0") = False, CUST-023 ("no") = False; use param=None instead of mutable []/{} defaults.',
    validation: {
      requiredKeywordGroups: [
        ['true'],
        ['false'],
        ['none', 'mutable', 'copy', 'strip', 'lower'],
      ],
      nudge:
        'State the boolean outputs (CUST-006 -> True; CUST-014 & CUST-023 -> False) and note avoiding mutable default arguments with param=None.',
      inputPlaceholder:
        'e.g. CUST-006->True, CUST-014->False, CUST-023->False; avoid mutable []/{} defaults via None',
      inputMode: 'multiline',
    },
  },
  'py-m1-p3': {
    referenceAnswer:
      '{"US": 11, "CA": 5, "UK": 5, "DE": 4} across the 25 unique customers after normalizing country.strip().upper().',
    validation: {
      expectedNumbers: [
        { value: 11, tolerance: 0 },
        { value: 5, tolerance: 0 },
        { value: 4, tolerance: 0 },
      ],
      requiredKeywordGroups: [['us'], ['ca'], ['uk'], ['de']],
      nudge:
        'Verify all 4 normalized country counts summing to 25 unique customers: US=11, CA=5, UK=5, DE=4.',
      inputPlaceholder: 'e.g. {"US": 11, "CA": 5, "UK": 5, "DE": 4}',
      inputMode: 'line',
    },
  },
  'py-m2-p1': {
    referenceAnswer:
      'np.select([np.isnan(s), s >= 40, s >= 10, s < 10], ["Unknown", "Power", "Active", "At Risk"], default="Unknown") — checking np.isnan() first!',
    validation: {
      requiredKeywordGroups: [
        ['np.select', 'select('],
        ['isnan', 'isna', 'unknown', 'nan'],
      ],
      nudge:
        'Use np.select() and explicitly guard missing sessions_30d with np.isnan() first before numeric threshold conditions.',
      inputPlaceholder:
        'e.g. np.select([np.isnan(s), s>=40, s>=10, s<10], ["Unknown","Power","Active","At Risk"])',
      inputMode: 'multiline',
    },
  },
  'py-m2-p2': {
    referenceAnswer:
      'np.mean() returns nan; across 23 non-null unique rows np.nanmean() is ~44.0 (pulled up by CUST-015 = 420) while np.nanmedian() is 29.0.',
    validation: {
      expectedNumbers: [
        { value: 44, tolerance: 1.5 },
        { value: 29, tolerance: 1 },
      ],
      requiredKeywordGroups: [['nanmean'], ['nanmedian'], ['420', 'nan']],
      nudge:
        'Include np.nanmean (~44.0) vs. np.nanmedian (29.0) and note that np.mean() returns nan due to missing values while 420 skews the mean.',
      inputPlaceholder:
        'e.g. np.mean=nan; np.nanmean=44.0 (skewed by 420); np.nanmedian=29.0',
      inputMode: 'line',
    },
  },
  'py-m2-p3': {
    referenceAnswer:
      'Q1=6, Q3=42 -> IQR=36 -> upper fence = 96. Only CUST-015 (sessions_30d = 420) exceeds the fence; np.clip(s, lower, upper) caps it.',
    validation: {
      expectedNumbers: [{ value: 420, tolerance: 0 }],
      requiredKeywordGroups: [
        ['nanpercentile', 'percentile', 'quantile', 'iqr'],
        ['cust-015', 'clip'],
      ],
      nudge:
        'Compute the Tukey fence with np.nanpercentile() (upper fence = 96), identify CUST-015 (420), and reference np.clip().',
      inputPlaceholder:
        'e.g. Upper fence=96 via np.nanpercentile; sole outlier CUST-015 (420) capped with np.clip()',
      inputMode: 'line',
    },
  },
  'py-m3-p1': {
    referenceAnswer:
      'Free: 100% churn (6/6), Pro: 27.3% churn (3/11), Team: 0% churn (0/7), plus 1 missing plan_tier (CUST-018, not churned) across 25 unique customers.',
    validation: {
      expectedNumbers: [
        { value: 100, tolerance: 0.5 },
        { value: 27.3, tolerance: 0.6 },
        { value: 0, tolerance: 0.1 },
      ],
      requiredKeywordGroups: [['free'], ['pro'], ['team']],
      nudge:
        'Verify the exact churn rates after deduping CUST-009 (keep="last"): Free 100% (6/6), Pro 27.3% (3/11), Team 0% (0/7).',
      inputPlaceholder:
        'e.g. Free: 100% (6/6), Pro: 27.3% (3/11), Team: 0% (0/7); 1 missing (CUST-018)',
      inputMode: 'line',
    },
  },
  'py-m3-p2': {
    referenceAnswer:
      'groupby(dropna=True) sums to 24 rows (hiding CUST-018), whereas dropna=False shows all 25 unique rows; assign via df.loc[:, "plan_tier"] = ... to avoid SettingWithCopyWarning.',
    validation: {
      expectedNumbers: [
        { value: 24, tolerance: 0 },
        { value: 25, tolerance: 0 },
      ],
      requiredKeywordGroups: [['dropna=false', 'dropna = false'], ['.loc', 'copy']],
      nudge:
        'Compare both row totals (24 vs. 25), mention dropna=False, and use .loc (or .copy()) to prevent SettingWithCopyWarning.',
      inputPlaceholder:
        'e.g. dropna=True gives 24 rows (hides CUST-018); dropna=False gives 25; use df.loc',
      inputMode: 'line',
    },
  },
  'py-m3-p3': {
    referenceAnswer:
      'Team avg support_tickets = 0.29 (2/7), Free avg = 4.17 (25/6); CUST-011 and CUST-020 (1 ticket each) exceed the Team average via transform("mean").',
    validation: {
      expectedNumbers: [
        { value: 0.29, tolerance: 0.05 },
        { value: 4.17, tolerance: 0.1 },
      ],
      requiredKeywordGroups: [['transform'], ['cust-011', 'cust-020', 'team']],
      nudge:
        'Report Team (~0.29) and Free (~4.17) average support_tickets using .transform("mean").',
      inputPlaceholder:
        'e.g. Team avg=0.29 (CUST-011, CUST-020 exceed), Free avg=4.17 via .transform("mean")',
      inputMode: 'line',
    },
  },
  'py-m4-p1': {
    referenceAnswer:
      'pd.read_csv(..., na_values=["N/A","-",""]), monthly_spend.str.replace("$","",regex=False) -> float64 (3 NaNs), pd.to_datetime(df["signup_date"], format="mixed") -> datetime64[ns] (0 NaT).',
    validation: {
      expectedNumbers: [
        { value: 3, tolerance: 0 },
        { value: 0, tolerance: 0 },
      ],
      requiredKeywordGroups: [
        ['na_values', 'to_numeric'],
        ['to_datetime', 'format="mixed"', "format='mixed'", 'mixed'],
      ],
      nudge:
        'Include float64 (3 NaNs in monthly_spend) and 0 NaTs in signup_date using na_values + pd.to_numeric + pd.to_datetime(..., format="mixed").',
      inputPlaceholder:
        'e.g. float64 (3 NaNs) via na_values + to_numeric; 0 NaT via to_datetime(format="mixed")',
      inputMode: 'multiline',
    },
  },
  'py-m4-p2': {
    referenceAnswer:
      'read_csv() auto-parses "N/A" (CUST-011) as NaN, but "-" (CUST-019) and "$199.00" (CUST-007) force monthly_spend into object dtype until stripped and coerced.',
    validation: {
      requiredKeywordGroups: [
        ['object'],
        ['-', 'cust-019', '$199', 'cust-007'],
        ['n/a', 'nan'],
      ],
      nudge:
        'Explain that "-" and "$199.00" keep monthly_spend as object dtype even though read_csv() recognizes "N/A" as NaN.',
      inputPlaceholder:
        'e.g. "N/A" becomes NaN automatically, but "-" (CUST-019) and "$199.00" force object dtype',
      inputMode: 'multiline',
    },
  },
  'py-m4-p3': {
    referenceAnswer:
      'Both CUST-008 and CUST-021 are Pro tier; Pro-tier median sessions_30d is 29.0 (29), avoiding upward skew from Team users.',
    validation: {
      expectedNumbers: [{ value: 29, tolerance: 0.5 }],
      requiredKeywordGroups: [['pro'], ['cust-008', 'cust-021', 'median', 'groupby']],
      nudge:
        'Confirm both missing rows (CUST-008, CUST-021) belong to Pro tier and compute the Pro-tier median (~29).',
      inputPlaceholder:
        'e.g. Pro median = 29 for both CUST-008 and CUST-021 (avoiding Team upward skew)',
      inputMode: 'line',
    },
  },
  'py-m5-p1': {
    referenceAnswer:
      'fig, axes = plt.subplots(1, 2); sns.boxplot(..., x="churned", y="sessions_30d" / "support_tickets") — churned users cluster at 1–18 sessions & 3–6 tickets vs. 25–84 sessions & 0–2 tickets.',
    validation: {
      requiredKeywordGroups: [
        ['boxplot', 'subplots'],
        ['sessions_30d', 'support_tickets'],
        ['churned', '18', '3', '6', '25'],
      ],
      nudge:
        'Describe the 1x2 boxplot setup (sessions_30d & support_tickets split by churned) and the low-sessions / high-tickets separation.',
      inputPlaceholder:
        'e.g. subplots(1,2) boxplots: churned = 1-18 sessions & 3-6 tickets vs retained 25-84 & 0-2',
      inputMode: 'multiline',
    },
  },
  'py-m5-p2': {
    referenceAnswer:
      'CUST-015 (420) compresses 0–85; using symlog/log or ylim/clip + annotation reveals churned median (~5 sessions) vs. retained median (~36 sessions).',
    validation: {
      expectedNumbers: [
        { value: 5, tolerance: 1 },
        { value: 36, tolerance: 2 },
      ],
      requiredKeywordGroups: [['420', 'cust-015', 'log', 'symlog', 'ylim', 'clip', 'annotat']],
      nudge:
        'Compare churned median (~5) vs. retained median (~36) and mention log/symlog/clip/annotation to handle CUST-015 (420).',
      inputPlaceholder:
        'e.g. Clip/log CUST-015 (420) to reveal churned median ~5 vs retained median ~36',
      inputMode: 'line',
    },
  },
  'py-m5-p3': {
    referenceAnswer:
      'Horizontal bar chart (barh) of churn rate % by plan_tier with n annotations (Free n=6, Pro n=11, Team n=7) so small-sample buckets are not over-interpreted.',
    validation: {
      expectedNumbers: [
        { value: 6, tolerance: 0 },
        { value: 11, tolerance: 0 },
        { value: 7, tolerance: 0 },
      ],
      requiredKeywordGroups: [['bar', 'annotat', 'text', 'sample', 'n=']],
      nudge:
        'Include the sample sizes (n=6, n=11, n=7) and note annotating bars directly so small-n groups are transparent.',
      inputPlaceholder:
        'e.g. Horizontal bar chart with annotations n=6 (Free), n=11 (Pro), n=7 (Team)',
      inputMode: 'line',
    },
  },

  // ── STATISTICS (ab_test_experiment_log.csv) ─────────────────────────────────
  'st-m1-p1': {
    referenceAnswer:
      'Across 10 converted rows with non-null order_revenue (9018 is null), mean = $156.25 vs. median = $90.25 because $420 and $480 skew the mean right.',
    validation: {
      expectedNumbers: [
        { value: 156.25, tolerance: 1.0 },
        { value: 90.25, tolerance: 1.0 },
      ],
      requiredKeywordGroups: [['10', '9018', '420', '480', 'skew']],
      nudge:
        'Check the 10 non-null converted orders (exclude 9018): mean ≈ $156.25 vs. median ≈ $90.25.',
      inputPlaceholder:
        'e.g. 10 rows (9018 is null): mean = $156.25, median = $90.25 (skewed by $420 & $480)',
      inputMode: 'line',
    },
  },
  'st-m1-p2': {
    referenceAnswer:
      'Desktop: 75.0% (3/4) vs. 57.1% (4/7) [+17.9pp]. Mobile: 33.3% (3/9) vs. 20.0% (1/5) [+13.3pp]. Blended: 46.2% vs. 41.7% [+4.5pp] due to 69% mobile skew in treatment.',
    validation: {
      expectedNumbers: [
        { value: 75, tolerance: 0.5, allowPercentRatio: true },
        { value: 57.1, tolerance: 0.5, allowPercentRatio: true },
        { value: 33.3, tolerance: 0.5, allowPercentRatio: true },
        { value: 20, tolerance: 0.5, allowPercentRatio: true },
      ],
      nudge:
        'Calculate all 4 segment conversion rates cleanly: Desktop (75.0% vs 57.1%) and Mobile (33.3% vs 20.0%).',
      inputPlaceholder:
        'e.g. Desktop: 75.0% vs 57.1%; Mobile: 33.3% vs 20.0%; Blended: 46.2% vs 41.7%',
      inputMode: 'line',
    },
  },
  'st-m1-p3': {
    referenceAnswer:
      'Across 25 clean users, user 9020 (3600s) pulls the mean up to ~220s while median stays near 78s (excluding 9020 drops mean below 80s).',
    validation: {
      expectedNumbers: [
        { value: 220, tolerance: 5 },
        { value: 78, tolerance: 2 },
      ],
      requiredKeywordGroups: [['9020', '3600']],
      nudge:
        'Include clean mean (~220s), median (78s), and note user 9020 (3600s).',
      inputPlaceholder:
        'e.g. Mean ~220s (inflated by 9020 = 3600s), median = 78s',
      inputMode: 'line',
    },
  },
  'st-m2-p1': {
    referenceAnswer:
      'P(converted | desktop) = 7/11 = 63.6%; P(converted | mobile) = 4/14 = 28.6%; P(mobile | treatment) = 9/13 = 69.2% vs. P(mobile | control) = 5/12 = 41.7%.',
    validation: {
      expectedNumbers: [
        { value: 63.6, tolerance: 0.5, allowPercentRatio: true },
        { value: 28.6, tolerance: 0.5, allowPercentRatio: true },
        { value: 69.2, tolerance: 0.5, allowPercentRatio: true },
        { value: 41.7, tolerance: 0.5, allowPercentRatio: true },
      ],
      nudge:
        'Check all 4 conditional probabilities on the 25 clean users: 63.6%, 28.6%, 69.2%, and 41.7%.',
      inputPlaceholder:
        'e.g. P(conv|desktop)=63.6%, P(conv|mobile)=28.6%, P(mobile|treat)=69.2%, P(mobile|ctrl)=41.7%',
      inputMode: 'line',
    },
  },
  'st-m2-p2': {
    referenceAnswer:
      'Leaving bot 9005 and duplicate 9011 in control inflates the denominator from 12 to 14, dragging control conversion down from 41.7% (5/12) to 35.7% (5/14).',
    validation: {
      expectedNumbers: [
        { value: 41.7, tolerance: 0.5, allowPercentRatio: true },
        { value: 35.7, tolerance: 0.5, allowPercentRatio: true },
      ],
      requiredKeywordGroups: [['12', '14', '9005', '9011']],
      nudge:
        'Show both clean (41.7% = 5/12) and contaminated (35.7% = 5/14) control conversion rates.',
      inputPlaceholder:
        'e.g. Control drops from 41.7% (5/12) to 35.7% (5/14) when 9005 & dup 9011 stay in',
      inputMode: 'line',
    },
  },
  'st-m2-p3': {
    referenceAnswer:
      'Control SE = 0.142, Treatment SE = 0.138; halving SE requires 4x the sample size (~50 per arm).',
    validation: {
      expectedNumbers: [
        { value: 0.142, tolerance: 0.01 },
        { value: 0.138, tolerance: 0.01 },
        { value: 4, tolerance: 0 },
      ],
      nudge:
        'Compute both standard errors (0.142 and 0.138) and state the sample size multiplier needed to halve SE (4x).',
      inputPlaceholder:
        'e.g. Control SE = 0.142, Treatment SE = 0.138; need 4x sample size to halve SE',
      inputMode: 'line',
    },
  },
  'st-m3-p1': {
    referenceAnswer:
      'Observed diff = +4.5% (+0.0449), SE_diff = 0.198, 95% MoE = ±38.8%, 95% CI ≈ [-34.4%, +43.3%] — far too wide/underpowered to ship.',
    validation: {
      expectedNumbers: [
        { value: -34.4, tolerance: 1.0, allowPercentRatio: true },
        { value: 43.3, tolerance: 1.0, allowPercentRatio: true },
      ],
      requiredKeywordGroups: [['underpowered', 'small', 'inconclusive', 'wide', '0.198', 'zero']],
      nudge:
        'Check the 95% CI bounds for (p_treat - p_ctrl) around [-34.4%, +43.3%] and note that n=25 is underpowered.',
      inputPlaceholder:
        'e.g. SE_diff=0.198, 95% CI = [-34.4%, +43.3%] (underpowered at n=25)',
      inputMode: 'line',
    },
  },
  'st-m3-p2': {
    referenceAnswer:
      'Treating null 9018 as $0 gives RPU = $64.54 ($839/13); excluding 9018 gives $69.92 ($839/12); mobile median (~$58) prevents downward logging bias.',
    validation: {
      expectedNumbers: [
        { value: 64.54, tolerance: 0.5 },
        { value: 69.92, tolerance: 0.5 },
      ],
      requiredKeywordGroups: [['9018', '58', 'bias', 'null', 'log']],
      nudge:
        'Compute both treatment RPUs ($839/13 = $64.54 with $0 vs. $839/12 = $69.92 excluding 9018).',
      inputPlaceholder:
        'e.g. $0 -> $64.54 ($839/13); exclude -> $69.92 ($839/12); mobile median ~$58',
      inputMode: 'line',
    },
  },
  'st-m3-p3': {
    referenceAnswer:
      'Wald interval for 3/4 (0.75) yields [32.5%, 117.5%], exceeding 100%; Wilson score keeps bounds strictly within [0%, 100%].',
    validation: {
      expectedNumbers: [
        { value: 32.5, tolerance: 1.0, allowPercentRatio: true },
        { value: 117.5, tolerance: 1.0, allowPercentRatio: true },
      ],
      requiredKeywordGroups: [['wilson', 'exact'], ['100', '1.0', 'bound', 'exceed', 'clip']],
      nudge:
        'Calculate the Wald bounds for 3/4 (~32.5% to ~117.5% > 100%) and explain why Wilson score stays inside [0%, 100%].',
      inputPlaceholder:
        'e.g. Wald gives [32.5%, 117.5%] (>100%); Wilson keeps bounds inside [0%, 100%]',
      inputMode: 'line',
    },
  },
  'st-m4-p1': {
    referenceAnswer:
      'SRM chi-square = 0.04 (p ≈ 0.84, healthy 12 vs 13 split); two-proportion z ≈ 0.23 (p ≈ 0.82) -> fail to reject H0.',
    validation: {
      expectedNumbers: [
        { value: 0.04, tolerance: 0.02 },
        { value: 0.23, tolerance: 0.05 },
      ],
      requiredKeywordGroups: [['fail to reject', 'not significant', 'no srm', 'healthy', '0.8']],
      nudge:
        'Report SRM chi-square (0.04), z-statistic (~0.23), and decision (fail to reject H0).',
      inputPlaceholder:
        'e.g. SRM chi2 = 0.04 (p=0.84); z = 0.23 (p=0.82) -> fail to reject H0',
      inputMode: 'line',
    },
  },
  'st-m4-p2': {
    referenceAnswer:
      'Treatment has 69.2% mobile (9/13) vs. 41.7% in control (5/12); use stratified randomization or CUPED/regression adjustment to prevent device mix bias.',
    validation: {
      expectedNumbers: [
        { value: 69.2, tolerance: 0.5, allowPercentRatio: true },
        { value: 41.7, tolerance: 0.5, allowPercentRatio: true },
      ],
      requiredKeywordGroups: [['stratif', 'cuped', 'regress', 'covariat', 'adjust']],
      nudge:
        'Include the mobile shares (69.2% vs. 41.7%) and name a mitigation (stratified randomization, CUPED, or regression adjustment).',
      inputPlaceholder:
        'e.g. 69.2% mobile in treatment vs 41.7% control; fix via stratified randomization or CUPED',
      inputMode: 'line',
    },
  },
  'st-m4-p3': {
    referenceAnswer:
      '16 * 0.417 * 0.583 / 0.05² ≈ 1,556 users per arm (~3,112 total).',
    validation: {
      expectedNumbers: [{ value: 1556, tolerance: 80 }],
      nudge:
        'Apply n ≈ 16 * p * (1 - p) / delta² with p = 0.417 and delta = 0.05 (expect ~1,550–1,560 users per arm).',
      inputPlaceholder: 'e.g. ~1,556 users per arm (~3,112 total)',
      inputMode: 'line',
    },
  },
  'st-m5-p1': {
    referenceAnswer:
      'Strong positive correlation among the 10 non-null converters (r ≈ 0.87): $420 at 210s and $480 at 175s vs. $39–$135 at 78–118s.',
    validation: {
      requiredKeywordGroups: [
        ['positive'],
        ['420', '480', '210', '175', '0.8', '0.9'],
      ],
      nudge:
        'Note the positive correlation among the 10 converters driven by the higher-spend, longer-duration sessions ($420 at 210s, $480 at 175s).',
      inputPlaceholder:
        'e.g. Strong positive correlation (r ~0.87): $420 (210s) and $480 (175s) drive upward trend',
      inputMode: 'line',
    },
  },
  'st-m5-p2': {
    referenceAnswer:
      'Including idle outlier 9020 (3600s, converted=0) flips Pearson r negative (~-0.12), whereas excluding 9020 restores a strong positive correlation (r ≈ +0.79) because converters spend 78–210s vs. 27–61s.',
    validation: {
      requiredKeywordGroups: [
        ['negative', 'flat', 'drop', 'flip'],
        ['positive', 'restore', 'higher'],
        ['9020', '3600'],
      ],
      nudge:
        'Explain that including 9020 (3600s) flips/flattens the correlation negative while excluding it restores the positive relationship.',
      inputPlaceholder:
        'e.g. With 9020 (3600s), correlation flips negative (~-0.12); without it, positive (~+0.79)',
      inputMode: 'multiline',
    },
  },
  'st-m5-p3': {
    referenceAnswer:
      'converted ~ variant + is_mobile yields an adjusted variant lift near +15pp (matching +17.9pp desktop & +13.3pp mobile) vs. +4.5pp unadjusted because treatment had more mobile traffic.',
    validation: {
      expectedNumbers: [{ value: 15, tolerance: 3, allowPercentRatio: true }],
      requiredKeywordGroups: [['mobile', 'is_mobile', 'device'], ['4.5', '17.9', '13.3', 'mix', 'skew']],
      nudge:
        'State the adjusted lift (~+15pp) and explain that controlling for mobile traffic removes the device-mix penalty seen in the +4.5pp raw diff.',
      inputPlaceholder:
        'e.g. Adjusted lift ~+15pp vs +4.5pp raw because controlling for is_mobile removes mobile mix bias',
      inputMode: 'multiline',
    },
  },

  // ── POWER BI (star_schema_sales_fact.csv + star_schema_product_lookup.csv) ──
  'pbi-m1-p1': {
    referenceAnswer:
      'Trimming store_region fixes "West " (sale_id 7008) into 4 distinct regions (North, East, South, West); removing duplicate P-103 reduces DimProduct from 8 rows to 7 unique keys.',
    validation: {
      expectedNumbers: [
        { value: 4, tolerance: 0 },
        { value: 7, tolerance: 0 },
      ],
      requiredKeywordGroups: [['7008', 'west'], ['p-103', 'p103']],
      nudge:
        'Report the resulting counts (4 distinct regions, 7 unique product keys) and identify sale_id 7008 ("West ") and duplicate P-103.',
      inputPlaceholder:
        'e.g. 4 regions (trimmed 7008 "West "), 7 unique product keys (deduped P-103)',
      inputMode: 'line',
    },
  },
  'pbi-m1-p2': {
    referenceAnswer:
      'Left Anti Join isolates 1 orphan fact row: sale_id = 7019, product_key = "P-999", net_sales = $180.00.',
    validation: {
      expectedNumbers: [
        { value: 1, tolerance: 0 },
        { value: 180, tolerance: 0.5 },
      ],
      requiredKeywordGroups: [['7019'], ['p-999', 'p999']],
      nudge:
        'Name the exact orphan row from Left Anti Join: 1 row (sale_id 7019, product_key P-999, net_sales $180).',
      inputPlaceholder: 'e.g. 1 orphan row: sale_id 7019 (P-999, $180.00)',
      inputMode: 'line',
    },
  },
  'pbi-m1-p3': {
    referenceAnswer:
      '26 FactSales rows load with 2 null ship_date rows (7025, 7026) and 1 negative return row (sale_id 7015: quantity = -1, net_sales = -120).',
    validation: {
      expectedNumbers: [
        { value: 26, tolerance: 0 },
        { value: 2, tolerance: 0 },
        { value: -120, tolerance: 0.5 },
      ],
      requiredKeywordGroups: [['7025', '7026'], ['7015']],
      nudge:
        'Verify 26 total rows, 2 null ship_dates (7025, 7026), and negative return 7015 (-$120).',
      inputPlaceholder:
        'e.g. 26 rows; 2 null ship_dates (7025, 7026); 1 return 7015 (qty=-1, net_sales=-120)',
      inputMode: 'line',
    },
  },
  'pbi-m2-p1': {
    referenceAnswer:
      '1:* single-direction relationship DimProduct[product_key] -> FactSales[product_key] succeeds once P-103 is deduplicated; P-107 (Legacy Tape Adapter) is inactive with 0 fact rows.',
    validation: {
      requiredKeywordGroups: [
        ['p-103', 'p103', '1:*', 'one-to-many', 'one to many'],
        ['p-107', 'p107', 'legacy tape', '0'],
      ],
      nudge:
        'Reference deduplicating P-103 for 1:* cardinality and identify zero-sales inactive item P-107.',
      inputPlaceholder:
        'e.g. 1:* works after deduping P-103; P-107 (Legacy Tape Adapter) has 0 fact rows',
      inputMode: 'line',
    },
  },
  'pbi-m2-p2': {
    referenceAnswer:
      'Orphan P-999 (sale_id 7019) surfaces as a "(Blank)" category row showing $180.00 until P-999 is added to DimProduct as an "Unknown" member.',
    validation: {
      expectedNumbers: [{ value: 180, tolerance: 0.5 }],
      requiredKeywordGroups: [['blank', '(blank)'], ['p-999', '7019', 'unknown']],
      nudge:
        'Explain that P-999 (7019, $180) creates a "(Blank)" row in visuals unless mapped to an Unknown dimension member.',
      inputPlaceholder:
        'e.g. P-999 (7019) creates a (Blank) category row for $180 unless added as Unknown',
      inputMode: 'line',
    },
  },
  'pbi-m2-p3': {
    referenceAnswer:
      'CALCULATE([Total Net Sales], USERELATIONSHIP(DimDate[Date], FactSales[ship_date])) — excludes unshipped 7025 ($340) + 7026 ($320), totaling $660 less ($12,878 vs. $13,538).',
    validation: {
      expectedNumbers: [{ value: 660, tolerance: 1 }],
      requiredKeywordGroups: [['userelationship'], ['calculate']],
      nudge:
        'Write the CALCULATE(..., USERELATIONSHIP(...)) measure and state the $660 difference from unshipped 7025 + 7026.',
      inputPlaceholder:
        'e.g. CALCULATE([Total Net Sales], USERELATIONSHIP(DimDate[Date], FactSales[ship_date])) -> $660 lower',
      inputMode: 'multiline',
    },
  },
  'pbi-m3-p1': {
    referenceAnswer:
      'VAR Rev = SUM(FactSales[net_sales]) VAR Cost = SUMX(FactSales, FactSales[quantity] * RELATED(DimProduct[unit_cost])) RETURN DIVIDE(Rev - Cost, Rev) — 7015 reverses -$35 cost; P-999 has BLANK unit_cost.',
    validation: {
      requiredKeywordGroups: [
        ['sumx'],
        ['related'],
        ['divide'],
        ['var', 'return'],
      ],
      nudge:
        'Include SUMX, RELATED(DimProduct[unit_cost]), VAR/RETURN, and DIVIDE() in your Gross Margin % pattern.',
      inputPlaceholder:
        'e.g. VAR Rev = [Total Net Sales] VAR Cost = SUMX(FactSales, qty*RELATED(unit_cost)) RETURN DIVIDE(Rev-Cost, Rev)',
      inputMode: 'multiline',
    },
  },
  'pbi-m3-p2': {
    referenceAnswer:
      'DIVIDE([Total Net Sales], CALCULATE([Total Net Sales], REMOVEFILTERS(DimProduct[category]))) — clears only category so region slicers stay active and shares sum to 100%.',
    validation: {
      requiredKeywordGroups: [
        ['removefilters', 'all('],
        ['calculate'],
        ['divide'],
      ],
      nudge:
        'Wrap the denominator in CALCULATE([Total Net Sales], REMOVEFILTERS(DimProduct[category])) inside DIVIDE().',
      inputPlaceholder:
        'e.g. DIVIDE([Total Net Sales], CALCULATE([Total Net Sales], REMOVEFILTERS(DimProduct[category])))',
      inputMode: 'multiline',
    },
  },
  'pbi-m3-p3': {
    referenceAnswer:
      '[Sales Incl Zero] = COALESCE([Total Net Sales], 0) (or + 0) forces P-107 (Legacy Tape Adapter) to display $0.00 instead of being hidden as BLANK.',
    validation: {
      requiredKeywordGroups: [
        ['coalesce', '+ 0', '+0', 'if(isblank'],
        ['p-107', 'p107', '0', 'blank'],
      ],
      nudge:
        'Use COALESCE([Total Net Sales], 0) (or + 0) so inactive P-107 appears with $0.00.',
      inputPlaceholder:
        'e.g. COALESCE([Total Net Sales], 0) surfaces P-107 with $0.00',
      inputMode: 'line',
    },
  },
  'pbi-m4-p1': {
    referenceAnswer:
      'Q3 2025 (7013–7019) = $3,143.00 and Q4 2025 (7020–7026) = $3,890.00 using TOTALYTD([Total Net Sales], DimDate[Date]) and PREVIOUSQUARTER().',
    validation: {
      expectedNumbers: [
        { value: 3143, tolerance: 1 },
        { value: 3890, tolerance: 1 },
      ],
      requiredKeywordGroups: [['totalytd', 'previousquarter', 'calculate']],
      nudge:
        'Check both quarterly totals from star_schema_sales_fact.csv: Q3 = $3,143 and Q4 = $3,890.',
      inputPlaceholder:
        'e.g. Q3 = $3,143, Q4 = $3,890 via TOTALYTD & PREVIOUSQUARTER',
      inputMode: 'line',
    },
  },
  'pbi-m4-p2': {
    referenceAnswer:
      'Last Fact Date = 2025-11-18; full October ($1,965) vs. partial November ($1,925) must be capped at DAY <= 18 for fair MTD pacing.',
    validation: {
      expectedNumbers: [
        { value: 1965, tolerance: 1 },
        { value: 1925, tolerance: 1 },
      ],
      requiredKeywordGroups: [['2025-11-18', 'nov 18', '18', 'removefilters', 'max(']],
      nudge:
        'Include the max fact date (2025-11-18 / day 18) and compare October ($1,965) vs. partial November ($1,925).',
      inputPlaceholder:
        'e.g. Max date = 2025-11-18; Oct=$1,965 vs partial Nov=$1,925 (cap at day <= 18)',
      inputMode: 'line',
    },
  },
  'pbi-m4-p3': {
    referenceAnswer:
      'CALCULATE([Total Net Sales], DATESINPERIOD(DimDate[Date], MAX(DimDate[Date]), -90, DAY))',
    validation: {
      requiredKeywordGroups: [
        ['datesinperiod'],
        ['-90'],
        ['day'],
        ['calculate'],
      ],
      nudge:
        'Write the DAX expression using CALCULATE(..., DATESINPERIOD(DimDate[Date], MAX(DimDate[Date]), -90, DAY)).',
      inputPlaceholder:
        'e.g. CALCULATE([Total Net Sales], DATESINPERIOD(DimDate[Date], MAX(DimDate[Date]), -90, DAY))',
      inputMode: 'multiline',
    },
  },
  'pbi-m5-p1': {
    referenceAnswer:
      '[Total Net Sales] = $13,538.00 across all 26 rows; [Unshipped Orders] = CALCULATE(COUNTROWS(FactSales), ISBLANK(FactSales[ship_date])) = 2.',
    validation: {
      expectedNumbers: [
        { value: 13538, tolerance: 1 },
        { value: 2, tolerance: 0 },
      ],
      requiredKeywordGroups: [['countrows', 'isblank', 'calculate', 'ship_date']],
      nudge:
        'Verify Total Net Sales ($13,538.00) and Unshipped Orders (2) using CALCULATE/COUNTROWS/ISBLANK.',
      inputPlaceholder:
        'e.g. Total Net Sales = $13,538; Unshipped Orders = 2 via CALCULATE(COUNTROWS(...), ISBLANK(ship_date))',
      inputMode: 'line',
    },
  },
  'pbi-m5-p2': {
    referenceAnswer:
      'Custom Tooltip Page bound to category/region shows SKU quantity & net_sales so hovering over North + Software surfaces sale_id 7015 (-$120.00) with conditional formatting (< 0).',
    validation: {
      expectedNumbers: [{ value: -120, tolerance: 0.5 }],
      requiredKeywordGroups: [
        ['7015'],
        ['tooltip', 'conditional'],
      ],
      nudge:
        'Reference the custom Tooltip Page + conditional formatting surfacing sale_id 7015 (-$120.00).',
      inputPlaceholder:
        'e.g. Custom Tooltip Page + conditional formatting flags sale_id 7015 (-$120.00)',
      inputMode: 'line',
    },
  },
  'pbi-m5-p3': {
    referenceAnswer:
      '"Region: " & IF(ISFILTERED(FactSales[store_region]), CONCATENATEX(VALUES(FactSales[store_region]), FactSales[store_region], ", "), "All Regions") + Data-only Bookmark for Reset Filters.',
    validation: {
      requiredKeywordGroups: [
        ['isfiltered', 'selectedvalue', 'hasonevalue'],
        ['concatenatex', 'values', 'all regions'],
        ['bookmark'],
      ],
      nudge:
        'Combine ISFILTERED/SELECTEDVALUE + CONCATENATEX (with "All Regions" fallback) and mention a Data-checked Bookmark.',
      inputPlaceholder:
        'e.g. IF(ISFILTERED(...), CONCATENATEX(VALUES(...), ", "), "All Regions") + Data-only Bookmark',
      inputMode: 'multiline',
    },
  },
};
