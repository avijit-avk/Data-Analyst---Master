import { LmsLesson } from '../types/academy';

export const PYTHON_LESSONS: LmsLesson[] = [
  {
    id: 'py-l1',
    moduleId: 'mod-python',
    order: 1,
    title: 'Python Syntax, Variables, Strings, Numbers & Booleans',
    summary:
      'Use clean Python variables, numeric arithmetic, string normalization, and boolean flags to prepare business metrics.',
    durationMinutes: 20,
    learningObjective:
      'Clean string identifiers, compute unit margins safely, and construct boolean validation checks without type errors.',
    coreConcepts: [
      {
        heading: 'Variables & Analyst Data Types',
        explanation:
          'Analysts work primarily with four primitive types: int (units, days), float (unit_price, discount_pct), str (carrier, order_id), and bool (True/False SLA flags). Unlike Excel cells, Python strings never auto-convert to numbers during arithmetic—mixing "150" + 10 raises TypeError.',
        keyTakeaway: 'Explicitly cast dirty text inputs with float() or int() before calculating KPIs.',
      },
      {
        heading: 'String Cleaning Methods (.strip, .lower, .replace)',
        explanation:
          'Just like Excel TRIM() and LOWER(), Python strings expose .strip(), .lower(), .upper(), and .replace(). Chaining raw_carrier.strip().lower() collapses " ApexFreight " and "apexfreight" into one canonical key.',
        keyTakeaway: 'Normalize raw text fields with .strip().lower() before grouping or matching.',
      },
    ],
    syntaxReference: [
      {
        label: 'Variables & Net Line Math',
        syntax: "qty = 3\nunit_price = 150.0\ndiscount_pct = 0.10\nnet_revenue = round(qty * unit_price * (1 - discount_pct), 2)",
        usage: 'Computes net revenue cleanly with explicit float precision.',
      },
      {
        label: 'String & Boolean Normalization',
        syntax: "carrier = '  ApexFreight '.strip().lower()\nis_delayed = (delivery_days > sla_target_days)",
        usage: 'Produces canonical lowercase strings and boolean SLA flags.',
      },
    ],
    workedExample: {
      scenario: 'Compute net revenue and margin flag for an Ergonomic Dock order (qty=3, list=$150, cost=$90, discount=10%).',
      steps: [
        {
          stepTitle: '1. Assign clean typed inputs',
          detail: 'Store numeric quantities and string SKU code.',
          codeOrFormula: "sku = 'PRD-A'.strip().upper()\nqty = 3\nprice = 150.0\ncost = 90.0\ndisc = 0.10",
        },
        {
          stepTitle: '2. Compute net revenue and gross profit',
          detail: 'Subtract COGS from net discounted sales.',
          codeOrFormula: "net_rev = round(qty * price * (1 - disc), 2)\ngross_profit = round(net_rev - (qty * cost), 2)\nmargin_pct = round(gross_profit / net_rev * 100, 1)\nprint(sku, net_rev, gross_profit, margin_pct)",
        },
      ],
      expectedOutput: 'PRD-A 405.0 135.0 33.3',
      outcome: 'A 10% discount reduces margin on PRD-A from 40.0% down to 33.3%.',
    },
    commonPitfalls: [
      {
        mistake: 'Using "=" instead of "==" in boolean checks',
        whyItBreaks: '"=" assigns a value and throws a SyntaxError inside an expression or if-check.',
        fix: 'Use "==" for equality comparison and "=" strictly for variable assignment.',
      },
      {
        mistake: 'Leaving currency symbols inside strings before float()',
        whyItBreaks: 'float("$420.00") raises ValueError.',
        fix: 'Strip symbols first: float(raw_val.replace("$", "").replace(",", "").strip()).',
      },
    ],
    guidedExercise: {
      prompt:
        'Using Python arithmetic in the simulator or scratchpad, calculate net revenue for 5 units of PRD-B (unit_price = 80, discount_pct = 0.10).',
      hint: 'Multiply 5 * 80 * (1 - 0.10).',
      solution: "qty = 5\nprice = 80\ndisc = 0.10\nnet_rev = qty * price * (1 - disc)\nprint(net_rev)  # 360",
    },
    businessInterpretation:
      'Consistent data typing prevents silent string-concatenation bugs when combining exports from ERP and billing spreadsheets.',
    cheatSheet: [
      'Types: int, float, str, bool.',
      'Text normalization: text.strip().lower().',
      'Clean currency string: float(s.replace("$","").replace(",",""))',
    ],
  },
  {
    id: 'py-l2',
    moduleId: 'mod-python',
    order: 2,
    title: 'Lists, Dictionaries, Loops, Comprehensions & Conditions',
    summary:
      'Iterate over business records, map lookup dictionaries, and filter lists concisely with Python comprehensions.',
    durationMinutes: 22,
    learningObjective:
      'Store ordered metrics in lists, build key-value lookup tables with dicts, and filter records cleanly.',
    coreConcepts: [
      {
        heading: 'Lists vs. Dictionaries for Analysts',
        explanation:
          'A list holds ordered observations (e.g., [420.0, 360.0, 510.0] freight costs). A dictionary maps unique keys to values (e.g., {"HUB-NE": "Northeast", "HUB-W": "West"}), serving as Python’s lightning-fast equivalent of XLOOKUP.',
        keyTakeaway: 'Use lists for ordered sequences and dicts for O(1) key-value dimension lookups.',
      },
      {
        heading: 'List Comprehensions for Filtering & Transforming',
        explanation:
          'Instead of writing 5-line loops with .append(), analysts filter or transform lists in one readable line: [x for x in costs if x > 500].',
        keyTakeaway: '[output_expr for item in items if condition] keeps code compact and expressive.',
      },
    ],
    syntaxReference: [
      {
        label: 'Dictionary Safe Lookup (.get)',
        syntax: "hub_region = {'HUB-NE': 'Northeast', 'HUB-W': 'West'}\nregion = hub_region.get('HUB-X', 'Unknown')",
        usage: 'Avoids KeyError crashes when an unexpected hub code appears.',
      },
      {
        label: 'Filtered List Comprehension',
        syntax: 'high_freight = [c for c in freight_costs if c >= 500]',
        usage: 'Extracts high-cost consignments in one readable expression.',
      },
    ],
    workedExample: {
      scenario: 'Inspect six freight costs [420, 360, 510, 390, 600, 680] and isolate high-cost consignments >= $500.',
      steps: [
        {
          stepTitle: '1. Store list and filter with comprehension',
          detail: 'Create freight_costs and filter values >= 500.',
          codeOrFormula: "freight_costs = [420, 360, 510, 390, 600, 680]\nhigh_cost = [c for c in freight_costs if c >= 500]\nprint(high_cost)\nprint(len(high_cost))",
        },
      ],
      expectedOutput: '[510, 600, 680] and count = 3',
      outcome: 'Quickly isolates the 3 high-freight shipments accounting for $1,790.',
    },
    commonPitfalls: [
      {
        mistake: 'Accessing dict[key] directly without .get()',
        whyItBreaks: 'A single unseen key halts the entire script with KeyError.',
        fix: 'Always use mapping.get(key, "Unknown") on unvalidated production keys.',
      },
    ],
    guidedExercise: {
      prompt:
        'Given salaries = [138000, 82000, 108000, 74000, 116000], how many salaries are >= 100000?',
      hint: 'Filter [s for s in salaries if s >= 100000] and check len(...).',
      solution: '3 salaries (138000, 108000, 116000).',
    },
    businessInterpretation:
      'Dictionary lookups mirror dimension-table joins in SQL/BI and safeguard data pipelines against unmapped category keys.',
    cheatSheet: [
      'Dict safe lookup: d.get(key, default).',
      'Comprehension: [expr for x in seq if cond].',
      'Always handle unknown category keys cleanly.',
    ],
  },
  {
    id: 'py-l3',
    moduleId: 'mod-python',
    order: 3,
    title: 'Functions, Parameters, Return Values & Reusable Logic',
    summary:
      'Package repeated KPI, margin, and SLA calculations into tested, reusable Python functions.',
    durationMinutes: 20,
    learningObjective:
      'Write pure analytical functions with clear parameters, zero-division guards, and explicit return values.',
    coreConcepts: [
      {
        heading: 'Why Functions Beat Copy-Pasted Formulas',
        explanation:
          'When you repeat gross margin logic across 4 scripts and finance changes discount rules, copy-pasted code drifts silently. Encapsulating business logic inside def calc_margin(net_rev, cogs): ensures one source of truth.',
        keyTakeaway: 'Return values (return ...) instead of only calling print() so results can feed downstream pipelines.',
      },
    ],
    syntaxReference: [
      {
        label: 'Safe KPI Function',
        syntax: "def safe_margin_pct(net_rev, cogs):\n    if net_rev <= 0:\n        return 0.0\n    return round((net_rev - cogs) / net_rev * 100, 1)",
        usage: 'Mirrors DAX DIVIDE() safety inside Python.',
      },
    ],
    workedExample: {
      scenario: 'Evaluate Retail Completed segment totals: Enterprise ($2,430 rev, $1,458 COGS) vs. SMB ($1,332 rev, $696 COGS).',
      steps: [
        {
          stepTitle: '1. Compute Enterprise and SMB margin % using the same rule',
          detail: 'Enterprise = (2430 - 1458) / 2430 * 100 = 40.0%. SMB = (1332 - 696) / 1332 * 100 = 47.7%.',
        },
      ],
      expectedOutput: 'Enterprise: 40.0% | SMB: 47.7%',
      outcome: 'SMB generates higher percentage margin (47.7%) even though Enterprise leads in total dollars.',
    },
    commonPitfalls: [
      {
        mistake: 'Forgetting return and returning None implicitly',
        whyItBreaks: 'Assigning result = my_func(...) produces None, crashing later math.',
        fix: 'Always end computation functions with an explicit return statement.',
      },
    ],
    guidedExercise: {
      prompt:
        'Using the safe_margin_pct logic on Consumer Retail ($1,578 net_rev, $904 cogs), what is Consumer Gross Margin % rounded to 1 decimal place?',
      hint: 'Compute round((1578 - 904) / 1578 * 100, 1).',
      solution: '42.7% (674 / 1578 = 0.4271).',
    },
    businessInterpretation:
      'Centralized KPI functions eliminate metric drift across weekly reports and automated notebooks.',
    cheatSheet: [
      'Guard denominators: if denom == 0: return 0.0.',
      'Use return instead of print() inside reusable helpers.',
    ],
  },
  {
    id: 'py-l4',
    moduleId: 'mod-python',
    order: 4,
    title: 'NumPy Arrays & Vectorized Operations',
    summary:
      'Perform fast element-wise arithmetic, boolean masking, and descriptive aggregations over numeric arrays.',
    durationMinutes: 22,
    learningObjective:
      'Replace slow Python loops with vectorized NumPy arrays and compute mean, median, std, and percentiles.',
    coreConcepts: [
      {
        heading: 'Vectorization Over Loops',
        explanation:
          'In standard Python, multiplying two lists [10, 20] * [2, 3] fails. NumPy arrays apply arithmetic element-by-element across millions of rows in C speed (quantities * prices * (1 - discounts)).',
        keyTakeaway: 'Think in whole columns/arrays rather than row-by-row for-loops.',
      },
      {
        heading: 'Summary Statistics in NumPy',
        explanation:
          'np.mean(), np.median(), np.std(), and np.percentile(arr, [25, 50, 75, 95]) let analysts inspect spread and skewness in one pass.',
        keyTakeaway: 'Compare np.mean() vs np.median() to detect skew immediately.',
      },
    ],
    syntaxReference: [
      {
        label: 'NumPy Vectorized Stats',
        syntax: "import numpy as np\nnp.mean(txns['amount'])\nnp.median(txns['amount'])\nnp.percentile(txns['amount'], 75)",
        usage: 'Computes central tendency and quartiles across numeric Series or arrays.',
      },
    ],
    workedExample: {
      scenario: 'Compare mean vs. median transaction amount on credit_card_transactions using the Python simulator.',
      steps: [
        {
          stepTitle: '1. Load credit_card_transactions and compute mean & median',
          detail: 'Large travel transactions ($1,250, $2,100) pull the mean far above the median.',
          codeOrFormula: "import pandas as pd\nimport numpy as np\ntxns = pd.read_csv('credit_card_transactions.csv')\nprint(np.mean(txns['amount']))\nprint(np.median(txns['amount']))",
        },
      ],
      expectedOutput: 'mean = 613.44, median = 420.0',
      outcome: 'Mean ($613.44) is nearly 1.5x the median ($420.00), revealing strong right-skew from travel and electronics spikes.',
    },
    commonPitfalls: [
      {
        mistake: 'Using np.mean() directly on an array containing NaN/NULL values',
        whyItBreaks: 'np.mean([2, 4, None]) propagates NaN in NumPy unless nanmean is used.',
        fix: 'Prefer pandas Series .mean() (skips NaN automatically) or np.nanmean().',
      },
    ],
    guidedExercise: {
      prompt:
        'In the Python simulator against operations_shipments.csv, run np.percentile(df["freight_cost"], 75) to find the 75th percentile freight cost ($).',
      hint: 'Load operations_shipments.csv and pass df["freight_cost"] to np.percentile(..., 75).',
      starterCode: "import pandas as pd\nimport numpy as np\ndf = pd.read_csv('operations_shipments.csv')\nnp.percentile(df['freight_cost'], 75)",
      solution: '517.5 (75% of shipments cost <= $517.50).',
    },
    businessInterpretation:
      'Reporting mean transaction size ($613.44) without median ($420.00) misleads product teams about what a typical cardholder swipe looks like.',
    cheatSheet: [
      'Vectorized arithmetic applies across entire arrays without loops.',
      'np.mean(), np.median(), np.std(), np.percentile(arr, q).',
      'Large gap between mean and median signals skewed outliers.',
    ],
  },
  {
    id: 'py-l5',
    moduleId: 'mod-python',
    order: 5,
    title: 'pandas DataFrames & Series Fundamentals',
    summary:
      'Navigate DataFrame rows, columns, dtypes, summary statistics, and calculated columns.',
    durationMinutes: 24,
    learningObjective:
      'Distinguish a 2D DataFrame from a 1D Series and derive clean business metrics across columns.',
    coreConcepts: [
      {
        heading: 'DataFrame vs. Series',
        explanation:
          'A DataFrame is a full table with named columns and row index; selecting one column df["amount"] yields a 1D Series, whereas df[["order_id", "status"]] yields a 2D DataFrame.',
        keyTakeaway: 'Single brackets df["col"] -> Series; double brackets df[["a","b"]] -> DataFrame.',
      },
      {
        heading: 'Vectorized Derived Columns',
        explanation:
          'Create business KPIs directly on the DataFrame: accounts["util_pct"] = (accounts["current_balance"] / accounts["credit_limit"] * 100).round(1).',
        keyTakeaway: 'Derived columns work identically to SQL computed expressions and Excel helper columns.',
      },
    ],
    syntaxReference: [
      {
        label: 'Series Inspection & Derived Column',
        syntax: "accounts = pd.read_csv('cardholder_accounts.csv')\naccounts['util_pct'] = (accounts['current_balance'] / accounts['credit_limit'] * 100).round(1)\naccounts['util_pct'].describe()",
        usage: 'Computes utilization % and outputs count, mean, std, quartiles, min, and max.',
      },
    ],
    workedExample: {
      scenario: 'Derive credit utilization % on cardholder_accounts and inspect summary percentiles.',
      steps: [
        {
          stepTitle: '1. Compute util_pct and call .describe()',
          detail: 'Inspect distribution across the 8 accounts.',
          codeOrFormula: "import pandas as pd\naccounts = pd.read_csv('cardholder_accounts.csv')\naccounts['util_pct'] = (accounts['current_balance'] / accounts['credit_limit'] * 100).round(1)\naccounts.sort_values('util_pct', ascending=False)",
        },
      ],
      expectedOutput: 'Top utilization: ACC-105 (90.0%), ACC-103 (80.0%), ACC-107 (55.0%)',
      outcome: 'Surfaces high-risk accounts immediately using 3 lines of pandas.',
    },
    commonPitfalls: [
      {
        mistake: 'Chained indexing assignment df[df["x"] > 0]["y"] = 1',
        whyItBreaks: 'Triggers SettingWithCopyWarning and may silently fail to update df.',
        fix: 'Copy filtered DataFrames explicitly (.copy()) before adding new columns.',
      },
    ],
    guidedExercise: {
      prompt:
        'Load hr_employees.csv in the simulator and call df["annual_salary"].describe() to inspect the median (50%) annual salary ($).',
      hint: 'Use pd.read_csv("hr_employees.csv") and .describe().',
      starterCode: "import pandas as pd\ndf = pd.read_csv('hr_employees.csv')\ndf['annual_salary'].describe()",
      solution: '87000 (50% / median salary across all 16 HR records).',
    },
    businessInterpretation:
      'pandas .describe() lets analysts spot scale errors, outliers, and skew within 10 seconds of loading any CSV.',
    cheatSheet: [
      'df["col"] = Series | df[["a", "b"]] = DataFrame.',
      'df.shape returns (rows, cols); df["col"].describe() summarizes quartiles.',
    ],
  },
  {
    id: 'py-l6',
    moduleId: 'mod-python',
    order: 6,
    title: 'Loading, Inspecting, Filtering & Sorting CSV Data',
    summary:
      'Filter multi-condition rows with boolean masks, inspect category counts, and sort top risks.',
    durationMinutes: 24,
    learningObjective:
      'Filter DataFrames cleanly using compound & / | masks, .isin(), and .sort_values().',
    coreConcepts: [
      {
        heading: 'Boolean Mask Filtering (& and | with Parentheses)',
        explanation:
          'Unlike Python if statements that use "and" / "or", pandas row masks require bitwise "&" and "|" with parentheses around EVERY condition: df[(df["status"] == "Delayed") & (df["hub_id"] == "HUB-W")].',
        keyTakeaway: 'Always wrap each mask condition in parentheses () before combining with & or |.',
      },
      {
        heading: 'Frequency Counts with .value_counts()',
        explanation:
          'Before grouping metrics, inspect categorical balance using df["status"].value_counts() to spot unexpected labels or small sample groups.',
        keyTakeaway: '.value_counts() is the fastest pandas check for categorical distribution.',
      },
    ],
    syntaxReference: [
      {
        label: 'Compound Filter & Sort',
        syntax: "delayed_west = df[(df['hub_id'] == 'HUB-W') & (df['status'] == 'Delayed')]\ndelayed_west.sort_values('freight_cost', ascending=False)",
        usage: 'Isolates West Hub delays sorted by highest freight cost.',
      },
    ],
    workedExample: {
      scenario: 'Find all Flagged or Declined transactions in credit_card_transactions sorted by amount descending.',
      steps: [
        {
          stepTitle: '1. Filter with .isin() and sort descending',
          detail: 'Spot largest blocked authorizations.',
          codeOrFormula: "import pandas as pd\ntxns = pd.read_csv('credit_card_transactions.csv')\nrisk = txns[txns['status'].isin(['Flagged', 'Declined'])].sort_values('amount', ascending=False)\nrisk",
        },
      ],
      expectedOutput: '4 rows led by TXN-909 ($2,100 Flagged) and TXN-906 ($1,420 Declined)',
      outcome: 'Puts the top blocked transactions straight at the top of the fraud queue.',
    },
    commonPitfalls: [
      {
        mistake: 'Using Python "and" instead of "&" inside df[...]',
        whyItBreaks: 'Raises ValueError: The truth value of a Series is ambiguous.',
        fix: 'Use & (and), | (or), ~ (not) with parentheses around each comparison.',
      },
    ],
    guidedExercise: {
      prompt:
        'Filter hr_employees.csv where overtime == "Yes" AND attrition == "Yes". How many rows match?',
      hint: 'Use len(df[(df["overtime"] == "Yes") & (df["attrition"] == "Yes")]).',
      starterCode: "import pandas as pd\ndf = pd.read_csv('hr_employees.csv')\nleft_ot = df[(df['overtime'] == 'Yes') & (df['attrition'] == 'Yes')]\nlen(left_ot)",
      solution: '5 employees (all 5 departures in the HR dataset worked overtime).',
    },
    businessInterpretation:
      'Targeted boolean masks turn 100,000-row logs into clean exception lists for operations and risk reviewers.',
    cheatSheet: [
      'Compound filter: df[(cond1) & (cond2)].',
      'Multi-value check: df[df["col"].isin(["A", "B"])].',
      'Sort: df.sort_values("col", ascending=False).head(5).',
    ],
  },
  {
    id: 'py-l7',
    moduleId: 'mod-python',
    order: 7,
    title: 'Missing Values, Duplicates & Text/Date Cleaning',
    summary:
      'Audit nulls with .isna().sum(), standardize string casing, and remove duplicates safely.',
    durationMinutes: 25,
    learningObjective:
      'Quantify null rates, distinguish structural NULLs from errors, and clean casing/whitespace before aggregation.',
    coreConcepts: [
      {
        heading: 'Null Auditing & Selective Dropping',
        explanation:
          'Call df.isna().sum() immediately after read_csv(). Never run df.dropna() blindly across the whole table—use subset=["delivery_days"] or boolean filtering .notna() only on columns required for a specific metric.',
        keyTakeaway: 'Audit nulls with .isna().sum() and preserve rows unless a column is essential.',
      },
      {
        heading: 'String & Duplicate Hygiene',
        explanation:
          'Normalize messy strings with df["carrier"].str.strip().str.lower() and eliminate duplicate IDs with df.drop_duplicates(subset=["shipment_id"]).',
        keyTakeaway: 'Always specify subset=[primary_key] in drop_duplicates() intentionally.',
      },
    ],
    syntaxReference: [
      {
        label: 'Null Audit & Text Normalization',
        syntax: "df.isna().sum()\ndf['carrier_clean'] = df['carrier'].str.strip().str.lower()\ncompleted = df.dropna(subset=['delivery_days'])",
        usage: 'Counts nulls per column, cleans carrier casing, and subsets completed shipments.',
      },
    ],
    workedExample: {
      scenario: 'Clean operations_shipments.csv before computing carrier SLA metrics.',
      steps: [
        {
          stepTitle: '1. Audit missing values and normalize carrier',
          detail: 'delivery_days has 2 NULLs (In Transit); carrier has casing drift ("apexfreight", "swifthaul").',
          codeOrFormula: "import pandas as pd\ndf = pd.read_csv('operations_shipments.csv')\ndf['carrier_clean'] = df['carrier'].str.strip().str.lower()\ndf['carrier_clean'].value_counts()",
        },
      ],
      expectedOutput: 'apexfreight: 8, northstar: 6, swifthaul: 6 (sum = 20 rows)',
      outcome: 'Eliminates fragmented carrier counts prior to executive reporting.',
    },
    commonPitfalls: [
      {
        mistake: 'Running df.fillna(0) across an entire DataFrame',
        whyItBreaks: 'Turns missing delivery_days into 0-day instant deliveries, corrupting SLA averages.',
        fix: 'Handle missingness column-by-column based on business meaning.',
      },
    ],
    guidedExercise: {
      prompt:
        'Using operations_shipments.csv, run df.isna().sum(). How many total NULL values exist in delivery_days?',
      hint: 'Run pd.read_csv("operations_shipments.csv") then df.isna().sum().',
      starterCode: "import pandas as pd\ndf = pd.read_csv('operations_shipments.csv')\ndf.isna().sum()",
      solution: '2 NULL values in delivery_days (all other columns have 0 nulls).',
    },
    businessInterpretation:
      'Data cleaning is 60% of real analytics work—skipping casing and null checks guarantees wrong stakeholder totals.',
    cheatSheet: [
      'df.isna().sum() -> null count per column.',
      'df["col"].str.strip().str.lower() -> fix casing drift.',
      'df.dropna(subset=["col"]) -> filter missing required values.',
    ],
  },
  {
    id: 'py-l8',
    moduleId: 'mod-python',
    order: 8,
    title: 'GroupBy, Merge/Join & End-to-End Retail Mini-Project',
    summary:
      'Combine multi-table CSVs with .merge(), compute grouped revenue and profit KPIs, and deliver a complete analytical summary.',
    durationMinutes: 28,
    learningObjective:
      'Execute a reproducible pandas analysis pipeline: load -> merge -> filter -> derive KPIs -> groupby summary.',
    coreConcepts: [
      {
        heading: 'Joining Tables in pandas (.merge)',
        explanation:
          'df1.merge(df2, on="key", how="inner"|"left") mirrors SQL JOINs. Always compare len(merged) against len(df1) afterward to verify zero unexpected fan-out.',
        keyTakeaway: 'Check row counts before and after .merge() to catch duplicate dimension keys.',
      },
      {
        heading: 'Split-Apply-Combine (.groupby + .agg)',
        explanation:
          'Group by business dimensions and apply multiple aggregations simultaneously: df.groupby("segment").agg({"net_rev": "sum", "gross_profit": "sum"}).reset_index().',
        keyTakeaway: 'Chain .reset_index() after .groupby().agg() to keep your result as a flat, exportable DataFrame.',
      },
    ],
    syntaxReference: [
      {
        label: 'Complete Retail Margin Pipeline',
        syntax:
          "orders = pd.read_csv('retail_orders.csv')\nproducts = pd.read_csv('retail_products.csv')\ncustomers = pd.read_csv('retail_customers.csv')\nm = orders.merge(products, on='product_id', how='inner').merge(customers, on='customer_id', how='inner')\ncomp = m[m['status'] == 'Completed'].copy()\ncomp['net_rev'] = comp['quantity'] * comp['unit_price'] * (1 - comp['discount_pct'])\ncomp.groupby('segment')['net_rev'].sum().reset_index()",
        usage: 'Joins 3 tables, filters Completed orders, computes net revenue, and summarizes by segment.',
      },
    ],
    workedExample: {
      scenario: 'Run the complete Retail Segment Net Revenue pipeline in the simulator.',
      steps: [
        {
          stepTitle: '1. Merge orders, products, and customers',
          detail: 'Verify 18 order rows remain 18 rows after dimension merges.',
        },
        {
          stepTitle: '2. Filter Completed and compute net_rev',
          detail: 'Sum net_rev grouped by customer segment.',
          codeOrFormula:
            "import pandas as pd\norders = pd.read_csv('retail_orders.csv')\nproducts = pd.read_csv('retail_products.csv')\ncustomers = pd.read_csv('retail_customers.csv')\nm = orders.merge(products, on='product_id', how='inner').merge(customers, on='customer_id', how='inner')\ncomp = m[m['status'] == 'Completed'].copy()\ncomp['net_rev'] = comp['quantity'] * comp['unit_price'] * (1 - comp['discount_pct'])\ncomp.groupby('segment')['net_rev'].sum().reset_index()",
        },
      ],
      expectedOutput: 'Enterprise: $2,430 | Consumer: $1,578 | SMB: $1,332 (Total = $5,340)',
      outcome: 'Matches the SQL Retail Lab output 100%, proving cross-tool reproducibility.',
    },
    commonPitfalls: [
      {
        mistake: 'Merging on columns with duplicate keys on both sides (many-to-many)',
        whyItBreaks: 'Silently multiplies row counts and overstates revenue.',
        fix: 'Check df["key"].nunique() == len(df) on dimension tables before merging.',
      },
    ],
    guidedExercise: {
      prompt:
        'Extend the Retail pipeline to compute net_rev grouped by `channel` (Web, In-Store, Mobile App). Which channel drives the largest Completed Net Revenue ($)?',
      hint: 'Replace groupby("segment") with groupby("channel") and sort descending.',
      starterCode:
        "import pandas as pd\norders = pd.read_csv('retail_orders.csv')\nproducts = pd.read_csv('retail_products.csv')\nm = orders.merge(products, on='product_id', how='inner')\ncomp = m[m['status'] == 'Completed'].copy()\ncomp['net_rev'] = comp['quantity'] * comp['unit_price'] * (1 - comp['discount_pct'])\ncomp.groupby('channel')['net_rev'].sum().reset_index()",
      solution: 'Web leads with $2,172 Completed Net Revenue (In-Store $1,830, Mobile App $1,338).',
    },
    businessInterpretation:
      'When your pandas notebook and SQL query reconcile to the penny ($5,340), stakeholders trust your engineering rigor.',
    cheatSheet: [
      'df1.merge(df2, on="id", how="left") -> SQL LEFT JOIN.',
      'df.groupby("dim").agg({"col": "sum"}).reset_index().',
      'Always reconcile total rows and revenue against source tables.',
    ],
  },
];

export const STATISTICS_LESSONS: LmsLesson[] = [
  {
    id: 'st-l1',
    moduleId: 'mod-stats',
    order: 1,
    title: 'Population, Sample & Sampling Frames',
    summary:
      'Define the target population vs. observed sample and detect frame exclusions before generalizing findings.',
    durationMinutes: 20,
    learningObjective:
      'Distinguish population parameters from sample estimates and check whether your table covers the full population.',
    coreConcepts: [
      {
        heading: 'Population vs. Sample vs. Sampling Frame',
        explanation:
          'The population is every entity you want to make a decision about (all U.S. shipments or all active cardholders). The sampling frame is the actual table or list you pulled from (e.g., operations_shipments containing 20 January dispatches). Whenever the sampling frame omits a group (such as holiday-peak shipments or declined applicants), your estimates suffer coverage gap.',
        keyTakeaway: 'State clearly which population your dataset actually represents before extrapolating.',
      },
    ],
    syntaxReference: [
      {
        label: 'Sampling Frame Coverage Audit (SQL)',
        syntax: 'SELECT MIN(ship_date) AS start_dt, MAX(ship_date) AS end_dt, COUNT(*) AS n_rows FROM operations_shipments;',
        usage: 'Documents the exact time window and sample size (n) behind any metric.',
      },
    ],
    workedExample: {
      scenario: 'Assessing whether hr_employees (n = 16) proves company-wide attrition trends across a 500-person enterprise.',
      steps: [
        {
          stepTitle: '1. Audit sample size and department coverage',
          detail: 'hr_employees has n = 16 across 4 departments (Finance=3, Engineering=5, Sales=4, Ops=4).',
        },
        {
          stepTitle: '2. Evaluate generalizability',
          detail: 'With n = 16, each individual departure shifts the rate by 6.25 percentage points!',
        },
      ],
      expectedOutput: '16 total records -> 1 departure = 6.25 pp swing',
      outcome: 'Treats HR metrics as directional early signals requiring larger historical cohort checks, not universal laws.',
    },
    commonPitfalls: [
      {
        mistake: 'Generalizing a small 2-week or n=16 sample to full-year company behavior',
        whyItBreaks: 'Small samples carry wide sampling error and seasonal blind spots.',
        fix: 'Always state sample size (n) and date window alongside every percentage.',
      },
    ],
    guidedExercise: {
      prompt:
        'In hr_employees (n=16), if just 1 additional employee left, by how many percentage points would the overall attrition rate increase?',
      hint: 'Compute 1 / 16 * 100.',
      solution: '6.25 percentage points (from 31.25% to 37.50%).',
    },
    statisticalFraming: {
      assumptions: ['Assumes the sampled rows are representative of the target population and period.'],
      justified: 'Describing observed rates strictly within the January–March 2025 sampled records.',
      notJustified: 'Claiming 20 January shipments prove full-year carrier reliability.',
      decision: 'Use small samples to flag high-priority investigation lanes, then validate over 90+ days.',
    },
    cheatSheet: [
      'Population = target group | Frame = list sampled | Sample = observed rows.',
      'Always report n alongside percentages.',
    ],
  },
  {
    id: 'st-l2',
    moduleId: 'mod-stats',
    order: 2,
    title: 'Mean, Median, Mode, Variance & Standard Deviation',
    summary:
      'Choose the right center and spread metric for skewed business data like order values, freight, and card spend.',
    durationMinutes: 24,
    learningObjective:
      'Compute and interpret mean, median, variance, and standard deviation—and know when mean misleads.',
    coreConcepts: [
      {
        heading: 'Center: Mean vs. Median',
        explanation:
          'Mean sums all values and divides by n—sensitive to extreme outliers. Median sorts values and picks the middle 50th percentile—robust to spikes. In credit_card_transactions, mean spend is $613.44 while median spend is $420.00 because large travel and electronics transactions ($1,250, $1,420, and $2,100) pull the mean upward.',
        keyTakeaway: 'Report both mean (for total budget math) and median (for typical customer experience).',
      },
      {
        heading: 'Spread: Standard Deviation',
        explanation:
          'Two carriers can share a 3.4-day average delivery time, yet Carrier A always delivers in 3–4 days (low std) while Carrier B swings between 1 and 8 days (high std, breaking SLAs constantly). Standard deviation measures typical distance from the mean.',
        keyTakeaway: 'Lower standard deviation = more predictable SLA operations.',
      },
    ],
    syntaxReference: [
      {
        label: 'Pandas Center & Spread',
        syntax: "df['delivery_days'].mean()\ndf['delivery_days'].median()\ndf['delivery_days'].std()",
        usage: 'Evaluates central tendency and operational consistency.',
      },
    ],
    workedExample: {
      scenario: 'Measure delivery_days variation across completed rows in operations_shipments (n=18).',
      steps: [
        {
          stepTitle: '1. Inspect mean, median, and std',
          detail: 'Run df[df["delivery_days"].notna()]["delivery_days"].describe() in the Python simulator.',
          codeOrFormula: "import pandas as pd\ndf = pd.read_csv('operations_shipments.csv')\ncomp = df[df['delivery_days'].notna()]\ncomp['delivery_days'].describe()",
        },
      ],
      expectedOutput: 'count=18, mean=3.44 days, std=1.25 days, median=3.0 days, min=2, max=6',
      outcome: 'Typical shipment takes 3.0 days, but a std of 1.25 days pushes tail shipments up to 5–6 days, causing SLA breaches.',
    },
    commonPitfalls: [
      {
        mistake: 'Using only average delivery time to sign off on carrier SLA health',
        whyItBreaks: 'A 3.4-day mean hides the 33% tail breaching the 3-day SLA.',
        fix: 'Pair mean with standard deviation and p90/breach rate.',
      },
    ],
    guidedExercise: {
      prompt:
        'Using the Python simulator on credit_card_transactions.csv, inspect df["amount"].describe(). What is the standard deviation (std) of transaction amounts?',
      hint: 'Load credit_card_transactions.csv and call df["amount"].describe().',
      starterCode: "import pandas as pd\ndf = pd.read_csv('credit_card_transactions.csv')\ndf['amount'].describe()",
      solution: '$588.74 standard deviation (nearly as large as the $613.44 mean—confirming heavy right skew).',
    },
    statisticalFraming: {
      assumptions: ['Sample standard deviation divides by (n - 1) and assumes independent observations.'],
      justified: 'Using median ($420) to describe a typical card swipe and mean × count for total volume.',
      notJustified: 'Assuming 68% of card swipes fall cleanly inside mean ± 1 std when data is heavily right-skewed.',
      decision: 'Set fraud velocity thresholds using percentiles rather than normal-distribution std multipliers on skewed spend.',
    },
    cheatSheet: [
      'Mean = budget/total math | Median = typical observation.',
      'Standard deviation measures consistency; high std -> SLA risk.',
    ],
  },
  {
    id: 'st-l3',
    moduleId: 'mod-stats',
    order: 3,
    title: 'Percentiles, Quartiles & Outlier Detection (IQR)',
    summary:
      'Apply IQR fences and percentile SLAs (p50, p75, p95) to isolate real operational anomalies cleanly.',
    durationMinutes: 22,
    learningObjective:
      'Compute Q1, Q3, IQR, and upper outlier fences (Q3 + 1.5 × IQR) to separate genuine anomalies from normal variance.',
    coreConcepts: [
      {
        heading: 'Quartiles & The IQR Fence',
        explanation:
          'Q1 (25th percentile) and Q3 (75th percentile) bracket the middle 50% of values. IQR = Q3 - Q1. Values above Q3 + 1.5 × IQR are flagged as statistical outliers worth inspecting—either data-entry errors or high-priority business events (like a $2,100 suspicious international charge).',
        keyTakeaway: 'Never delete outliers automatically—inspect whether they are logging bugs or critical high-value events.',
      },
    ],
    syntaxReference: [
      {
        label: 'IQR Outlier Threshold',
        syntax: 'IQR = Q3 - Q1\nUpper_Fence = Q3 + 1.5 * IQR',
        usage: 'Distribution-free rule for flagging unusually large values.',
      },
    ],
    workedExample: {
      scenario: 'Apply IQR outlier detection to credit_card_transactions amount ($).',
      steps: [
        {
          stepTitle: '1. Read Q1 and Q3 from .describe()',
          detail: 'Q1 (25%) = $167.50, Q3 (75%) = $912.50.',
        },
        {
          stepTitle: '2. Compute IQR and Upper Fence',
          detail: 'IQR = 912.50 - 167.50 = $745.00. Upper Fence = 912.50 + 1.5 × 745.00 = $2,030.00.',
        },
      ],
      expectedOutput: 'Upper Fence = $2,030.00 -> flags TXN-909 ($2,100 Flagged Travel)',
      outcome: 'IQR objectively flags TXN-909 ($2,100) for fraud review without hardcoding an arbitrary dollar guess.',
    },
    commonPitfalls: [
      {
        mistake: 'Deleting all statistical outliers without checking business reality',
        whyItBreaks: 'In Retail or Banking, the top 5% "outliers" are often Enterprise accounts or real fraud events!',
        fix: 'Tag and investigate outliers separately; report metrics both with and without extreme whales if needed.',
      },
    ],
    guidedExercise: {
      prompt:
        'If Q1 = $167.50 and Q3 = $912.50 for card transactions, what is the IQR ($)?',
      hint: 'Subtract Q1 from Q3.',
      solution: '$745.00.',
    },
    statisticalFraming: {
      assumptions: ['IQR requires ordinal/numeric data and makes no normality assumption.'],
      justified: 'Using Q3 + 1.5×IQR to prioritize manual transaction audits.',
      notJustified: 'Assuming every point beyond the fence is corrupt data to be deleted.',
      decision: 'Route transactions > $2,030 for step-up authentication when combined with international flags.',
    },
    cheatSheet: [
      'IQR = Q3 - Q1 (middle 50% spread).',
      'Upper Fence = Q3 + 1.5 * IQR.',
      'Inspect outliers—never delete real customers silently.',
    ],
  },
  {
    id: 'st-l4',
    moduleId: 'mod-stats',
    order: 4,
    title: 'Distributions, Skewness & Practical Interpretation',
    summary:
      'Recognize right-skewed business distributions and avoid normality assumptions on order, salary, and spend data.',
    durationMinutes: 20,
    learningObjective:
      'Diagnose right-skew vs. symmetry and select appropriate summary metrics and chart bins.',
    coreConcepts: [
      {
        heading: 'Why Business Metrics Are Rarely Normal Bell Curves',
        explanation:
          'Order sizes, salaries, credit balances, and support resolution times cannot go below zero and have long right tails—producing positive (right) skew where Mean > Median. Applying bell-curve rules (e.g., expecting symmetric ±2 std bounds) produces impossible negative lower bounds.',
        keyTakeaway: 'When Mean > Median noticeably, your distribution is right-skewed—use percentiles.',
      },
    ],
    syntaxReference: [
      {
        label: 'Quick Skewness Check',
        syntax: 'If Mean > Median -> Right-Skewed (long high tail)\nIf Mean < Median -> Left-Skewed',
        usage: 'Instant diagnostic before selecting visual bins or statistical tests.',
      },
    ],
    workedExample: {
      scenario: 'Compare skewness in Retail Completed Order Value vs. Operations Delivery Days.',
      steps: [
        {
          stepTitle: '1. Compare Retail order net values',
          detail: 'Orders range from $40 (ORD-509 Desk Mat) up to $510 (ORD-504 Display Arms) and $600 (ORD-505 Docks), creating right skew.',
        },
        {
          stepTitle: '2. Compare Operations delivery_days',
          detail: 'Mean = 3.44 days vs. Median = 3.0 days—mild positive skew toward 5–6 day delays.',
        },
      ],
      expectedOutput: 'Both datasets exhibit right skew (Mean > Median).',
      outcome: 'Guides dashboard designers to show Median + p90 SLA instead of a lone mean.',
    },
    commonPitfalls: [
      {
        mistake: 'Promising customers "average 3-day shipping" when p90 is 5 days',
        whyItBreaks: 'Right-skewed tail delays hit 1 in 3 customers while the average looks fine.',
        fix: 'Publish p90 transit commitment alongside median transit time.',
      },
    ],
    guidedExercise: {
      prompt:
        'In cardholder_accounts, compare mean utilization % (39.5%) vs. median utilization % (25.0%). Is credit utilization symmetric or right-skewed?',
      hint: 'Check whether Mean is substantially higher than Median.',
      solution: 'Right-skewed (39.5% mean > 25.0% median), pulled up by ACC-103 (80%) and ACC-105 (90%).',
    },
    statisticalFraming: {
      assumptions: ['Comparing mean and median assumes interval/ratio scale measurements.'],
      justified: 'Recognizing right skew and reporting percentiles (p50, p75, p90).',
      notJustified: 'Using symmetric normal Z-score cutoffs on heavily right-skewed account balances.',
      decision: 'Bucket accounts into risk tiers (<30%, 30–75%, >=75%) rather than assuming a bell curve.',
    },
    cheatSheet: [
      'Mean > Median -> right-skewed (common in revenue, spend, transit time).',
      'Right-skewed operations KPIs should pair Median with p90.',
    ],
  },
  {
    id: 'st-l5',
    moduleId: 'mod-stats',
    order: 5,
    title: 'Sampling Bias, Selection Bias & Survivorship Bias',
    summary:
      'Catch hidden selection mechanisms that distort retention, customer feedback, and credit approval metrics.',
    durationMinutes: 22,
    learningObjective:
      'Identify survivorship, selection, and non-response bias in real business tables before presenting findings.',
    coreConcepts: [
      {
        heading: 'Three Biases That Wreck Analyst Decks',
        explanation:
          '1) Survivorship Bias: Analyzing only active employees (attrition="No") to study job satisfaction ignores everyone who already quit. 2) Selection Bias: Evaluating fraud rates only on Approved transactions omits Declined/Flagged attempts. 3) Self-Selection Bias: Surveying only voluntary power users overstates satisfaction.',
        keyTakeaway: 'Always ask: "Who is MISSING from this table because of how the data was collected?"',
      },
    ],
    syntaxReference: [
      {
        label: 'Bias Audit Question',
        syntax: 'Missing Cohort Check = Eligible Population - Observed Table Rows',
        usage: 'Run mentally before drawing conclusions from filtered or active-only tables.',
      },
    ],
    workedExample: {
      scenario: 'An analyst queries ONLY active HR staff (attrition = "No") and reports: "Almost nobody works overtime here—only 1 out of 11 active staff (9.1%) works overtime!"',
      steps: [
        {
          stepTitle: '1. Spot the survivorship bias',
          detail: '5 of the 6 overtime employees already resigned (attrition = "Yes")!',
        },
        {
          stepTitle: '2. Recompute including departed staff',
          detail: 'Out of 16 total staff, 6 worked overtime (37.5%), and 5 of those 6 left (83.3% attrition).',
        },
      ],
      expectedOutput: 'Active-only view = 9.1% overtime | Unbiased view = 83.3% overtime attrition',
      outcome: 'Prevents leadership from falsely dismissing overtime burnout.',
    },
    commonPitfalls: [
      {
        mistake: 'Training churn or satisfaction analyses solely on currently active records',
        whyItBreaks: 'Churned users/employees disappeared from active snapshots.',
        fix: 'Use historical snapshots or include attrition="Yes" / closed accounts.',
      },
    ],
    guidedExercise: {
      prompt:
        'If a risk analyst filters credit_card_transactions to status = "Approved" before measuring international fraud risk, which bias occurs?',
      hint: 'Approved rows exclude Flagged and Declined international attempts.',
      solution: 'Selection / survivorship bias—all Flagged international fraud attempts ($2,990) were filtered out before analysis.',
    },
    statisticalFraming: {
      assumptions: ['Unbiased rate estimation requires full eligibility capture across outcomes.'],
      justified: 'Comparing full cohort rates across active + departed or approved + flagged rows.',
      notJustified: 'Claiming overtime is rare based on surviving active headcount.',
      decision: 'Mandate inclusion of departed/closed records in every retention or risk dashboard.',
    },
    cheatSheet: [
      'Survivorship bias = analyzing only survivors (active users/staff).',
      'Always verify who was filtered out upstream before trusting percentages.',
    ],
  },
  {
    id: 'st-l6',
    moduleId: 'mod-stats',
    order: 6,
    title: 'Correlation vs. Causation & Confounding Variables',
    summary:
      'Interpret correlations accurately and resist making causal claims from observational company tables.',
    durationMinutes: 24,
    learningObjective:
      'Distinguish observational association from proven causality and identify plausible confounding variables.',
    coreConcepts: [
      {
        heading: 'Why Observational Correlation != Causation',
        explanation:
          'In hr_employees, overtime = "Yes" has an 83.3% attrition rate vs. 0% for non-overtime. Does that PROVE overtime alone caused every departure? No! Notice that overtime workers are also concentrated in lower-paid Junior/Mid Sales & Operations roles with shorter tenure. Role level, pay, and manager workload are confounders.',
        keyTakeaway: 'Observational data reveals strong associations and hypotheses—never definitive causal proof.',
      },
    ],
    syntaxReference: [
      {
        label: 'Honest Analytical Phrasing',
        syntax: '"X is strongly associated with Y in our sample (n=16), though role level and tenure may confound the relationship."',
        usage: 'Protects credibility during executive and interview reviews.',
      },
    ],
    workedExample: {
      scenario: 'In credit_card_transactions, all Flagged transactions are international. Should we conclude cross-border travel causes fraud?',
      steps: [
        {
          stepTitle: '1. Check Approved international transactions',
          detail: 'TXN-902 ($1,250) and TXN-914 ($980) are international and Approved.',
        },
        {
          stepTitle: '2. Identify confounders',
          detail: 'Rule-based fraud engines themselves flag international + high-ticket Electronics/Travel spikes—the system rule creates part of the correlation!',
        },
      ],
      expectedOutput: '2 Flagged international txns vs. 2 Approved international txns',
      outcome: 'Avoids blaming geography blindly and suggests tuning rules with account tier and merchant risk.',
    },
    commonPitfalls: [
      {
        mistake: 'Writing "Overtime caused 83% attrition" from a 16-row observational CSV',
        whyItBreaks: 'Small observational tables cannot isolate confounding variables like compensation or role.',
        fix: 'State association honestly, list confounders, and propose a controlled test or deeper cohort check.',
      },
    ],
    guidedExercise: {
      prompt:
        'Look at hr_employees: name two potential confounding variables besides overtime that differ between the 5 departed employees and the 11 retained employees.',
      hint: 'Check annual_salary, role_level, department, and tenure_months.',
      solution: 'Lower annual_salary ($58k–$82k vs mostly $86k–$142k), Junior/Mid role_level (none are Senior), and Sales/Operations department concentration.',
    },
    statisticalFraming: {
      assumptions: ['Causal inference requires either random assignment (A/B test) or strong quasi-experimental controls.'],
      justified: 'Reporting that overtime employees left at much higher rates in this sample and prioritizing Sales/Ops workload review.',
      notJustified: 'Claiming eliminating overtime alone guarantees zero attrition across all roles.',
      decision: 'Pilot shift-cap adjustments in Operations alongside pay-band benchmarking rather than assuming single-factor causation.',
    },
    cheatSheet: [
      'Correlation = co-movement | Causation = proved via experiment/controls.',
      'Small observational datasets (n=16–20) CANNOT prove causation.',
      'Always check confounders: tenure, tier, pay, segment, rule bias.',
    ],
  },
  {
    id: 'st-l7',
    moduleId: 'mod-stats',
    order: 7,
    title: 'Confidence Intervals, Hypothesis Tests, p-Values & Error Types',
    summary:
      'Quantify uncertainty around sample metrics and weigh Type I (false alarm) vs. Type II (missed risk) costs.',
    durationMinutes: 26,
    learningObjective:
      'Interpret confidence intervals and p-values without textbook misconceptions, and map alpha/beta risks to business costs.',
    coreConcepts: [
      {
        heading: 'Confidence Intervals Over Single Point Estimates',
        explanation:
          'Saying "Delay rate is 33.3% (6/18)" sounds exact, yet a 95% confidence interval around 6/18 spans roughly 16% to 56%! Small samples have wide uncertainty bands; larger samples narrow the interval.',
        keyTakeaway: 'Small n means wide confidence intervals—don’t overreact to 1–2 percentage point noise.',
      },
      {
        heading: 'p-Value & Type I vs. Type II Errors',
        explanation:
          'A p-value answers: "Assuming no real difference exists (Null Hypothesis H0), how likely is an observed gap this extreme by random chance alone?" It is NOT the probability that H0 is true! Type I Error (False Positive) = acting on noise (blocking a good card). Type II Error (False Negative) = missing a real effect (approving fraud).',
        keyTakeaway: 'Balance Type I vs. Type II thresholds based on which mistake costs the business more.',
      },
    ],
    syntaxReference: [
      {
        label: 'Standard Error of a Proportion',
        syntax: 'SE = sqrt(p * (1 - p) / n)\n95% CI ≈ p ± 1.96 * SE',
        usage: 'Quick sanity check for margin of error around conversion, delay, or attrition rates.',
      },
    ],
    workedExample: {
      scenario: 'Estimate uncertainty around our Operations SLA Delay Rate (p = 6/18 = 0.333, n = 18).',
      steps: [
        {
          stepTitle: '1. Calculate standard error',
          detail: 'SE = sqrt(0.333 * 0.667 / 18) = sqrt(0.01235) = 0.111 (11.1 percentage points).',
        },
        {
          stepTitle: '2. Compute approximate 95% margin of error',
          detail: '1.96 * 11.1% = ±21.8 pp -> roughly 11.5% to 55.1% (and exact Wilson CI ~ 16.3% to 56.3%).',
        },
      ],
      expectedOutput: 'Point estimate = 33.3%, 95% Margin of Error ≈ ±21.8 pp',
      outcome: 'Demonstrates why n=18 justifies collecting more weeks of data before firing a carrier outright.',
    },
    commonPitfalls: [
      {
        mistake: 'Defining p = 0.03 as "97% chance our hypothesis is true"',
        whyItBreaks: 'p-value is P(Data >= observed | H0 true), not P(H0 | Data).',
        fix: 'Explain p-value plainly: probability of seeing a difference at least this large if no true effect existed.',
      },
    ],
    guidedExercise: {
      prompt:
        'In fraud detection (Banking), is falsely declining a legitimate Platinum customer’s $1,250 travel purchase a Type I error (false positive) or Type II error (false negative)?',
      hint: 'The null hypothesis is "legitimate transaction"; raising a false fraud alarm rejects H0 wrongly.',
      solution: 'Type I error (False Positive)—flagging a legitimate transaction as fraud.',
    },
    statisticalFraming: {
      assumptions: ['Normal CI approximation improves as n*p and n*(1-p) exceed 5–10; use Wilson interval for small n.'],
      justified: 'Reporting margin of error alongside small-sample rates to calibrate decision risk.',
      notJustified: 'Treating p = 0.049 vs 0.051 as a magic cliff between truth and falsehood.',
      decision: 'Require larger sample sizes before irreversible contract or pricing changes.',
    },
    cheatSheet: [
      'SE(proportion) = sqrt(p*(1-p)/n) -> 4x sample size cuts margin of error in half.',
      'Type I = False Alarm | Type II = Missed Signal.',
      'p-value != probability hypothesis is true.',
    ],
  },
  {
    id: 'st-l8',
    moduleId: 'mod-stats',
    order: 8,
    title: 'A/B Testing, Statistical vs. Business Significance & Regression',
    summary:
      'Evaluate experiment results on lift magnitude, sample power, and practical ROI—and read simple regression slopes honestly.',
    durationMinutes: 26,
    learningObjective:
      'Separate statistical significance (p < 0.05) from business significance (ROI) and avoid extrapolation pitfalls in regression.',
    coreConcepts: [
      {
        heading: 'Statistical vs. Practical (Business) Significance',
        explanation:
          'With 5 million users, a +0.02% checkout lift can hit p < 0.001 (statistically significant) yet generate less revenue than the engineering cost to maintain it! Conversely, a small test can miss p < 0.05 solely because it was underpowered.',
        keyTakeaway: 'Never ship on p-value alone—check lift magnitude, confidence interval bounds, and dollar ROI.',
      },
      {
        heading: 'Practical Regression Reading',
        explanation:
          'In linear regression (y = intercept + slope * x), the slope tells expected change in y per 1-unit rise in x within the observed range, and R² shows variance explained—never extrapolate outside observed x bounds or assume causation without controls.',
        keyTakeaway: 'Regression slopes summarize conditional associations within observed data ranges.',
      },
    ],
    syntaxReference: [
      {
        label: 'A/B Ship Decision Checklist',
        syntax: '1) Pre-set sample size & MDE\n2) Verify randomization (SRM check)\n3) Check p-value AND 95% CI vs ROI cost\n4) Inspect guardrails',
        usage: 'Standard product analytics experiment sign-off protocol.',
      },
    ],
    workedExample: {
      scenario: 'An A/B test on Retail checkout simplifies shipping display: Control (n=10,000) converts at 3.00%; Treatment (n=10,000) converts at 3.45% (p = 0.036). AOV = $120, Margin = 42%. Engineering upkeep = $1,000/month.',
      steps: [
        {
          stepTitle: '1. Check statistical significance',
          detail: 'p = 0.036 < 0.05 threshold -> statistically significant lift (+0.45 pp, or +15% relative).',
        },
        {
          stepTitle: '2. Quantify monthly business significance',
          detail: 'On 20,000 monthly sessions: +0.0045 × 20,000 = +90 orders × $120 × 42% = +$4,536/month gross profit vs. $1,000 cost -> net +$3,536/month!',
        },
      ],
      expectedOutput: 'Both statistically significant (p=0.036) AND commercially positive (+$3,536/mo net profit).',
      outcome: 'Clear recommendation to ship while monitoring return-rate guardrails.',
    },
    commonPitfalls: [
      {
        mistake: 'Peeking at p-values daily and stopping the experiment the first morning p < 0.05',
        whyItBreaks: 'Multiple peeking inflates false-positive rates from 5% to 25%+.',
        fix: 'Fix sample size and duration upfront before inspecting final significance.',
      },
    ],
    guidedExercise: {
      prompt:
        'A button-color A/B test across 2,000,000 sessions shows +0.01 pp conversion lift (p = 0.002), generating $150/month gross profit while costing $3,000/month to maintain. Should you ship it?',
      hint: 'Compare statistical significance against practical/business net ROI.',
      solution: 'No—while statistically significant (p = 0.002), it is not business-significant ($150 benefit < $3,000 cost = net loss).',
    },
    statisticalFraming: {
      assumptions: ['Randomization holds (no Sample Ratio Mismatch), independent user units, fixed horizon.'],
      justified: 'Shipping experiments that pass both statistical thresholds and net-ROI guardrails.',
      notJustified: 'Stopping early on a lucky day or shipping negative-ROI micro-lifts.',
      decision: 'Always pair p-values with dollar-impact CIs before launching product changes.',
    },
    cheatSheet: [
      'p < 0.05 does NOT automatically mean profitable or important.',
      'Never peek and stop A/B tests early.',
      'Regression slopes hold only within observed ranges and do not prove causation alone.',
    ],
  },
];
