import { SampleDatasetFile } from '../types/academy';

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function serializeDatasetToCsv(file: SampleDatasetFile): string {
  const headers = file.columns.map((col) => escapeCsvCell(col.name)).join(',');
  const body = file.rows
    .map((row) =>
      file.columns.map((col) => escapeCsvCell(row[col.name])).join(',')
    )
    .join('\r\n');
  return `${headers}\r\n${body}\r\n`;
}

export function downloadSampleCsv(file: SampleDatasetFile): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const csv = serializeDatasetToCsv(file);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const SAMPLE_FILES_BY_COURSE: Record<string, SampleDatasetFile[]> = {
  excel: [
    {
      id: 'ds-excel-sales-ops',
      filename: 'sales_operations_sample.csv',
      roleLabel: 'Primary Workbook CSV',
      description:
        '26-row regional order export containing 1 duplicate order_id (ORD-1012), mixed date strings, whitespace/casing drift on region & sku, an unmapped SKU (SKU-Z99), currency-formatted prices, and blank units/discounts.',
      columns: [
        { name: 'order_id', type: 'TEXT', description: 'Order identifier (contains duplicate ORD-1012)' },
        { name: 'order_date', type: 'TEXT', description: 'Order date (ISO plus mixed slash/text formats)' },
        { name: 'region', type: 'TEXT', description: 'Sales region (includes " west " and "NORTHEAST")' },
        { name: 'sku', type: 'TEXT', description: 'Product SKU (includes trailing space and SKU-Z99)' },
        { name: 'units', type: 'INTEGER', description: 'Quantity ordered (1 blank cell)' },
        { name: 'unit_price', type: 'TEXT', description: 'Unit price (2 currency-formatted strings)' },
        { name: 'discount_pct', type: 'DECIMAL', description: 'Decimal discount rate (2 blank cells)' },
        { name: 'rep_name', type: 'TEXT', description: 'Assigned account representative (1 blank)' },
      ],
      rows: [
        { order_id: 'ORD-1001', order_date: '2025-10-02', region: 'West', sku: 'SKU-A10', units: 4, unit_price: '120.00', discount_pct: 0.05, rep_name: 'Maya Lin' },
        { order_id: 'ORD-1002', order_date: '2025-10-04', region: 'Northeast', sku: 'SKU-B22', units: 2, unit_price: '240.00', discount_pct: 0.00, rep_name: 'Jordan Lee' },
        { order_id: 'ORD-1003', order_date: '2025-10-07', region: 'Midwest', sku: 'SKU-C05', units: 8, unit_price: '65.00', discount_pct: 0.10, rep_name: 'Priya Nair' },
        { order_id: 'ORD-1004', order_date: '2025-10-09', region: ' west ', sku: 'SKU-D18', units: 6, unit_price: '310.00', discount_pct: 0.15, rep_name: 'Maya Lin' },
        { order_id: 'ORD-1005', order_date: '2025-10-11', region: 'South', sku: 'SKU-B22', units: 5, unit_price: '$240.00', discount_pct: 0.05, rep_name: 'Carlos Diaz' },
        { order_id: 'ORD-1006', order_date: '2025/10/14', region: 'West', sku: 'SKU-A10', units: 10, unit_price: '120.00', discount_pct: 0.10, rep_name: 'Maya Lin' },
        { order_id: 'ORD-1007', order_date: '2025-10-16', region: 'Midwest', sku: 'SKU-B22', units: 3, unit_price: '240.00', discount_pct: null, rep_name: 'Priya Nair' },
        { order_id: 'ORD-1008', order_date: '2025-10-19', region: 'South', sku: 'SKU-A10 ', units: 7, unit_price: '120.00', discount_pct: 0.00, rep_name: 'Carlos Diaz' },
        { order_id: 'ORD-1009', order_date: '2025-10-21', region: 'Northeast', sku: 'SKU-D18', units: 1, unit_price: '310.00', discount_pct: 0.00, rep_name: 'Jordan Lee' },
        { order_id: 'ORD-1010', order_date: '2025-10-24', region: 'NORTHEAST', sku: 'SKU-C05', units: 12, unit_price: '65.00', discount_pct: 0.10, rep_name: 'Jordan Lee' },
        { order_id: 'ORD-1011', order_date: '2025-10-27', region: 'West', sku: 'SKU-B22', units: 5, unit_price: '240.00', discount_pct: 0.05, rep_name: 'Maya Lin' },
        { order_id: 'ORD-1012', order_date: '2025-10-29', region: 'South', sku: 'SKU-C05', units: 9, unit_price: '65.00', discount_pct: 0.00, rep_name: 'Carlos Diaz' },
        { order_id: 'ORD-1012', order_date: '2025-10-29', region: 'South', sku: 'SKU-C05', units: 9, unit_price: '65.00', discount_pct: 0.00, rep_name: 'Carlos Diaz' },
        { order_id: 'ORD-1013', order_date: '2025-11-01', region: 'Midwest', sku: 'SKU-A10', units: 6, unit_price: '120.00', discount_pct: 0.05, rep_name: 'Priya Nair' },
        { order_id: 'ORD-1014', order_date: '2025-11-03', region: 'West', sku: 'SKU-C05', units: null, unit_price: '65.00', discount_pct: 0.00, rep_name: 'Maya Lin' },
        { order_id: 'ORD-1015', order_date: '2025-11-05', region: 'Northeast', sku: 'SKU-A10', units: 4, unit_price: '120.00', discount_pct: 0.15, rep_name: 'Jordan Lee' },
        { order_id: 'ORD-1016', order_date: '2025-11-07', region: 'South', sku: 'SKU-D18', units: 2, unit_price: '310.00', discount_pct: 0.00, rep_name: null },
        { order_id: 'ORD-1017', order_date: '2025-11-09', region: 'West', sku: 'SKU-D18', units: 3, unit_price: '310.00', discount_pct: 0.10, rep_name: 'Maya Lin' },
        { order_id: 'ORD-1018', order_date: '15-Nov-2025', region: 'Midwest', sku: 'SKU-B22', units: 6, unit_price: '240.00', discount_pct: 0.05, rep_name: 'Priya Nair' },
        { order_id: 'ORD-1019', order_date: '2025-11-16', region: 'Northeast', sku: 'SKU-D18', units: 2, unit_price: '$1,150.00', discount_pct: 0.20, rep_name: 'Jordan Lee' },
        { order_id: 'ORD-1020', order_date: '2025-11-17', region: 'South', sku: 'SKU-A10', units: 11, unit_price: '120.00', discount_pct: 0.10, rep_name: 'Carlos Diaz' },
        { order_id: 'ORD-1021', order_date: '2025-11-18', region: 'West', sku: 'SKU-Z99', units: 4, unit_price: '95.00', discount_pct: 0.00, rep_name: 'Maya Lin' },
        { order_id: 'ORD-1022', order_date: '2025-11-19', region: 'Midwest', sku: 'SKU-C05', units: 15, unit_price: '65.00', discount_pct: 0.15, rep_name: 'Priya Nair' },
        { order_id: 'ORD-1023', order_date: '2025-11-20', region: 'South', sku: 'SKU-B22', units: 3, unit_price: '240.00', discount_pct: null, rep_name: 'Carlos Diaz' },
        { order_id: 'ORD-1024', order_date: '2025-11-21', region: 'West', sku: 'SKU-A10', units: 8, unit_price: '120.00', discount_pct: 0.05, rep_name: 'Maya Lin' },
        { order_id: 'ORD-1025', order_date: '2025-11-22', region: 'Northeast', sku: 'SKU-C05', units: 5, unit_price: '65.00', discount_pct: 0.00, rep_name: 'Jordan Lee' },
      ],
    },
  ],
  sql: [
    {
      id: 'ds-sql-ecommerce',
      filename: 'ecommerce_orders_and_customers.csv',
      roleLabel: 'Orders & Customer Table CSV',
      description:
        '28-row transactional table across 12 customers (IDs 101–112) with 1 duplicate order_id (5014), NULL discount_code and referrer_customer_id values, 1 lowercase segment ("enterprise"), and cancelled/refunded statuses.',
      columns: [
        { name: 'order_id', type: 'INTEGER', description: 'Order primary key (contains duplicate 5014)' },
        { name: 'customer_id', type: 'INTEGER', description: 'Customer ID (101–112, repeat buyers included)' },
        { name: 'customer_segment', type: 'TEXT', description: 'Consumer, SMB, or Enterprise (1 lowercase row)' },
        { name: 'order_date', type: 'DATE', description: 'ISO order date (2025-09-02 to 2025-11-20)' },
        { name: 'status', type: 'TEXT', description: 'completed, shipped, cancelled, or refunded' },
        { name: 'order_total', type: 'DECIMAL', description: 'Gross order amount in USD' },
        { name: 'discount_code', type: 'TEXT', description: 'Promo code or NULL (blank in 14 rows)' },
        { name: 'referrer_customer_id', type: 'INTEGER', description: 'Referring customer_id or NULL' },
      ],
      rows: [
        { order_id: 5001, customer_id: 101, customer_segment: 'Enterprise', order_date: '2025-09-02', status: 'completed', order_total: 1240.00, discount_code: 'VIP20', referrer_customer_id: null },
        { order_id: 5002, customer_id: 102, customer_segment: 'Consumer', order_date: '2025-09-04', status: 'completed', order_total: 145.00, discount_code: 'WELCOME10', referrer_customer_id: 101 },
        { order_id: 5003, customer_id: 103, customer_segment: 'SMB', order_date: '2025-09-07', status: 'completed', order_total: 620.00, discount_code: null, referrer_customer_id: null },
        { order_id: 5004, customer_id: 104, customer_segment: 'Consumer', order_date: '2025-09-10', status: 'cancelled', order_total: 89.50, discount_code: null, referrer_customer_id: 102 },
        { order_id: 5005, customer_id: 101, customer_segment: 'Enterprise', order_date: '2025-09-15', status: 'completed', order_total: 1890.00, discount_code: 'VIP20', referrer_customer_id: null },
        { order_id: 5006, customer_id: 105, customer_segment: 'SMB', order_date: '2025-09-19', status: 'refunded', order_total: 410.00, discount_code: 'WELCOME10', referrer_customer_id: 103 },
        { order_id: 5007, customer_id: 106, customer_segment: 'Consumer', order_date: '2025-09-22', status: 'completed', order_total: 210.00, discount_code: null, referrer_customer_id: 101 },
        { order_id: 5008, customer_id: 103, customer_segment: 'SMB', order_date: '2025-09-28', status: 'completed', order_total: 540.00, discount_code: 'VIP20', referrer_customer_id: null },
        { order_id: 5009, customer_id: 107, customer_segment: 'Enterprise', order_date: '2025-10-01', status: 'completed', order_total: 1450.00, discount_code: null, referrer_customer_id: null },
        { order_id: 5010, customer_id: 102, customer_segment: 'Consumer', order_date: '2025-10-03', status: 'completed', order_total: 175.00, discount_code: null, referrer_customer_id: 101 },
        { order_id: 5011, customer_id: 108, customer_segment: 'Consumer', order_date: '2025-10-06', status: 'shipped', order_total: 320.00, discount_code: 'WELCOME10', referrer_customer_id: 106 },
        { order_id: 5012, customer_id: 101, customer_segment: 'Enterprise', order_date: '2025-10-10', status: 'completed', order_total: 980.00, discount_code: null, referrer_customer_id: null },
        { order_id: 5013, customer_id: 109, customer_segment: 'SMB', order_date: '2025-10-12', status: 'cancelled', order_total: 760.00, discount_code: 'BF25', referrer_customer_id: null },
        { order_id: 5014, customer_id: 103, customer_segment: 'SMB', order_date: '2025-10-15', status: 'completed', order_total: 690.00, discount_code: 'VIP20', referrer_customer_id: null },
        { order_id: 5014, customer_id: 103, customer_segment: 'SMB', order_date: '2025-10-15', status: 'completed', order_total: 690.00, discount_code: 'VIP20', referrer_customer_id: null },
        { order_id: 5015, customer_id: 110, customer_segment: 'Consumer', order_date: '2025-10-18', status: 'completed', order_total: 95.00, discount_code: null, referrer_customer_id: 102 },
        { order_id: 5016, customer_id: 107, customer_segment: 'Enterprise', order_date: '2025-10-21', status: 'shipped', order_total: 1620.00, discount_code: 'VIP20', referrer_customer_id: null },
        { order_id: 5017, customer_id: 111, customer_segment: 'enterprise', order_date: '2025-10-24', status: 'completed', order_total: 1120.00, discount_code: null, referrer_customer_id: 107 },
        { order_id: 5018, customer_id: 105, customer_segment: 'SMB', order_date: '2025-10-27', status: 'completed', order_total: 480.00, discount_code: null, referrer_customer_id: 103 },
        { order_id: 5019, customer_id: 102, customer_segment: 'Consumer', order_date: '2025-11-01', status: 'refunded', order_total: 190.00, discount_code: 'BF25', referrer_customer_id: 101 },
        { order_id: 5020, customer_id: 106, customer_segment: 'Consumer', order_date: '2025-11-03', status: 'completed', order_total: 260.00, discount_code: 'BF25', referrer_customer_id: 101 },
        { order_id: 5021, customer_id: 101, customer_segment: 'Enterprise', order_date: '2025-11-06', status: 'shipped', order_total: 1540.00, discount_code: null, referrer_customer_id: null },
        { order_id: 5022, customer_id: 112, customer_segment: 'SMB', order_date: '2025-11-09', status: 'completed', order_total: 710.00, discount_code: 'BF25', referrer_customer_id: 103 },
        { order_id: 5023, customer_id: 108, customer_segment: 'Consumer', order_date: '2025-11-11', status: 'cancelled', order_total: 130.00, discount_code: null, referrer_customer_id: 106 },
        { order_id: 5024, customer_id: 107, customer_segment: 'Enterprise', order_date: '2025-11-14', status: 'completed', order_total: 1310.00, discount_code: 'VIP20', referrer_customer_id: null },
        { order_id: 5025, customer_id: 103, customer_segment: 'SMB', order_date: '2025-11-16', status: 'shipped', order_total: 840.00, discount_code: null, referrer_customer_id: null },
        { order_id: 5026, customer_id: 110, customer_segment: 'Consumer', order_date: '2025-11-18', status: 'completed', order_total: 165.00, discount_code: 'BF25', referrer_customer_id: 102 },
        { order_id: 5027, customer_id: 111, customer_segment: 'Enterprise', order_date: '2025-11-20', status: 'shipped', order_total: 1740.00, discount_code: null, referrer_customer_id: 107 },
      ],
    },
  ],
  python: [
    {
      id: 'ds-python-churn',
      filename: 'customer_churn_raw.csv',
      roleLabel: 'Messy CRM Export CSV',
      description:
        '26-row customer retention extract with 1 duplicate customer_id (CUST-009), mixed signup_date strings, whitespace/missing plan_tier, dirty monthly_spend ("$199.00", "N/A", "-"), an outlier sessions_30d (420), and inconsistent churned flags.',
      columns: [
        { name: 'customer_id', type: 'TEXT', description: 'Customer ID (contains duplicate CUST-009)' },
        { name: 'signup_date', type: 'TEXT', description: 'Mixed ISO, US slash, and month-name date strings' },
        { name: 'plan_tier', type: 'TEXT', description: 'Free, Pro, Team (includes " pro " and 1 missing)' },
        { name: 'monthly_spend', type: 'TEXT', description: 'String MRR values including "$199.00", "N/A", "-", blank' },
        { name: 'sessions_30d', type: 'INTEGER', description: '30-day sessions (2 nulls, 1 outlier = 420)' },
        { name: 'support_tickets', type: 'INTEGER', description: 'Support ticket count in past 30 days' },
        { name: 'country', type: 'TEXT', description: 'US, CA, UK, DE (includes "us" and " us ")' },
        { name: 'churned', type: 'TEXT', description: 'Mixed churn indicator: True, False, yes, no, 0' },
      ],
      rows: [
        { customer_id: 'CUST-001', signup_date: '2024-01-12', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: 34, support_tickets: 1, country: 'US', churned: 'False' },
        { customer_id: 'CUST-002', signup_date: '2024-02-04', plan_tier: 'Free', monthly_spend: '0.00', sessions_30d: 4, support_tickets: 3, country: 'CA', churned: 'True' },
        { customer_id: 'CUST-003', signup_date: '2024-02-19', plan_tier: 'Team', monthly_spend: '199.00', sessions_30d: 72, support_tickets: 0, country: 'UK', churned: 'False' },
        { customer_id: 'CUST-004', signup_date: '04/18/2024', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: 11, support_tickets: 4, country: 'US', churned: 'True' },
        { customer_id: 'CUST-005', signup_date: '2024-04-25', plan_tier: ' pro ', monthly_spend: '49.00', sessions_30d: 29, support_tickets: 1, country: 'DE', churned: 'False' },
        { customer_id: 'CUST-006', signup_date: '2024-05-03', plan_tier: 'Free', monthly_spend: '0.00', sessions_30d: 2, support_tickets: 5, country: 'US', churned: 'yes' },
        { customer_id: 'CUST-007', signup_date: '2024-05-14', plan_tier: 'Team', monthly_spend: '$199.00', sessions_30d: 64, support_tickets: 0, country: 'US', churned: 'False' },
        { customer_id: 'CUST-008', signup_date: '2024-06-02', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: null, support_tickets: 2, country: 'CA', churned: 'False' },
        { customer_id: 'CUST-009', signup_date: '2024-06-11', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: 21, support_tickets: 2, country: 'UK', churned: 'False' },
        { customer_id: 'CUST-009', signup_date: '2024-06-11', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: 27, support_tickets: 2, country: 'UK', churned: 'False' },
        { customer_id: 'CUST-010', signup_date: '2024-06-28', plan_tier: 'Free', monthly_spend: '0.00', sessions_30d: 6, support_tickets: 4, country: 'us', churned: 'True' },
        { customer_id: 'CUST-011', signup_date: '2024-07-05', plan_tier: 'Team', monthly_spend: 'N/A', sessions_30d: 58, support_tickets: 1, country: 'DE', churned: 'False' },
        { customer_id: 'CUST-012', signup_date: '2024-07-15', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: 18, support_tickets: 3, country: 'US', churned: 'True' },
        { customer_id: 'CUST-013', signup_date: '18-Jul-2024', plan_tier: 'Team', monthly_spend: '199.00', sessions_30d: 84, support_tickets: 0, country: 'CA', churned: 'False' },
        { customer_id: 'CUST-014', signup_date: '2024-08-01', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: 31, support_tickets: 1, country: 'UK', churned: '0' },
        { customer_id: 'CUST-015', signup_date: '2024-08-12', plan_tier: 'Team', monthly_spend: '199.00', sessions_30d: 420, support_tickets: 0, country: 'US', churned: 'False' },
        { customer_id: 'CUST-016', signup_date: '2024-08-22', plan_tier: 'Free', monthly_spend: '0.00', sessions_30d: 1, support_tickets: 6, country: 'DE', churned: 'True' },
        { customer_id: 'CUST-017', signup_date: '2024-09-03', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: 42, support_tickets: 0, country: 'US', churned: 'False' },
        { customer_id: 'CUST-018', signup_date: '2024-09-14', plan_tier: null, monthly_spend: '49.00', sessions_30d: 15, support_tickets: 2, country: 'CA', churned: 'False' },
        { customer_id: 'CUST-019', signup_date: '2024-09-25', plan_tier: 'Free', monthly_spend: '-', sessions_30d: 3, support_tickets: 4, country: 'UK', churned: 'True' },
        { customer_id: 'CUST-020', signup_date: '2024/10/04', plan_tier: 'Team', monthly_spend: '199.00', sessions_30d: 61, support_tickets: 1, country: 'US', churned: 'False' },
        { customer_id: 'CUST-021', signup_date: '2024-10-12', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: null, support_tickets: 5, country: 'DE', churned: 'True' },
        { customer_id: 'CUST-022', signup_date: '2024-10-20', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: 25, support_tickets: 1, country: ' us ', churned: 'False' },
        { customer_id: 'CUST-023', signup_date: '2024-11-01', plan_tier: 'Team', monthly_spend: '199.00', sessions_30d: 53, support_tickets: 0, country: 'CA', churned: 'no' },
        { customer_id: 'CUST-024', signup_date: '2024-11-09', plan_tier: 'Free', monthly_spend: null, sessions_30d: 5, support_tickets: 3, country: 'UK', churned: 'True' },
        { customer_id: 'CUST-025', signup_date: '2024-11-16', plan_tier: 'Pro', monthly_spend: '49.00', sessions_30d: 38, support_tickets: 1, country: 'US', churned: 'False' },
      ],
    },
  ],
  statistics: [
    {
      id: 'ds-stats-abtest',
      filename: 'ab_test_experiment_log.csv',
      roleLabel: 'Experiment Log CSV',
      description:
        '28-row checkout A/B test log across control and treatment with 1 duplicate user_id (9011), 2 bot-flagged sessions (is_bot_flag = true), 1 null order_revenue on a conversion, 1 extreme time_on_page_sec outlier (3600s), and mobile/desktop mix differences.',
      columns: [
        { name: 'user_id', type: 'INTEGER', description: 'Randomized user ID (contains duplicate 9011)' },
        { name: 'variant', type: 'TEXT', description: 'Experiment arm: control or treatment' },
        { name: 'device_type', type: 'TEXT', description: 'Device segment: mobile or desktop' },
        { name: 'session_date', type: 'DATE', description: 'Experiment session date (2025-11-01 to 2025-11-14)' },
        { name: 'converted', type: 'INTEGER', description: 'Binary conversion flag (0 or 1)' },
        { name: 'order_revenue', type: 'DECIMAL', description: 'Order value in USD (1 null on converted row 9018)' },
        { name: 'time_on_page_sec', type: 'INTEGER', description: 'Checkout seconds (1 outlier = 3600)' },
        { name: 'is_bot_flag', type: 'BOOLEAN', description: 'Automated bot filter flag (2 true rows)' },
      ],
      rows: [
        { user_id: 9001, variant: 'control', device_type: 'desktop', session_date: '2025-11-01', converted: 1, order_revenue: 64.00, time_on_page_sec: 95, is_bot_flag: 'false' },
        { user_id: 9002, variant: 'control', device_type: 'desktop', session_date: '2025-11-01', converted: 0, order_revenue: 0.00, time_on_page_sec: 42, is_bot_flag: 'false' },
        { user_id: 9003, variant: 'control', device_type: 'desktop', session_date: '2025-11-02', converted: 1, order_revenue: 112.00, time_on_page_sec: 118, is_bot_flag: 'false' },
        { user_id: 9004, variant: 'control', device_type: 'desktop', session_date: '2025-11-02', converted: 0, order_revenue: 0.00, time_on_page_sec: 55, is_bot_flag: 'false' },
        { user_id: 9005, variant: 'control', device_type: 'desktop', session_date: '2025-11-03', converted: 0, order_revenue: 0.00, time_on_page_sec: 4, is_bot_flag: 'true' },
        { user_id: 9006, variant: 'control', device_type: 'desktop', session_date: '2025-11-04', converted: 1, order_revenue: 88.50, time_on_page_sec: 105, is_bot_flag: 'false' },
        { user_id: 9007, variant: 'control', device_type: 'desktop', session_date: '2025-11-05', converted: 0, order_revenue: 0.00, time_on_page_sec: 61, is_bot_flag: 'false' },
        { user_id: 9008, variant: 'control', device_type: 'desktop', session_date: '2025-11-06', converted: 1, order_revenue: 420.00, time_on_page_sec: 210, is_bot_flag: 'false' },
        { user_id: 9009, variant: 'control', device_type: 'mobile', session_date: '2025-11-07', converted: 0, order_revenue: 0.00, time_on_page_sec: 34, is_bot_flag: 'false' },
        { user_id: 9010, variant: 'control', device_type: 'mobile', session_date: '2025-11-08', converted: 0, order_revenue: 0.00, time_on_page_sec: 48, is_bot_flag: 'false' },
        { user_id: 9011, variant: 'control', device_type: 'mobile', session_date: '2025-11-09', converted: 0, order_revenue: 0.00, time_on_page_sec: 39, is_bot_flag: 'false' },
        { user_id: 9011, variant: 'control', device_type: 'mobile', session_date: '2025-11-09', converted: 0, order_revenue: 0.00, time_on_page_sec: 39, is_bot_flag: 'false' },
        { user_id: 9012, variant: 'control', device_type: 'mobile', session_date: '2025-11-10', converted: 1, order_revenue: 39.00, time_on_page_sec: 88, is_bot_flag: 'false' },
        { user_id: 9013, variant: 'control', device_type: 'mobile', session_date: '2025-11-11', converted: 0, order_revenue: 0.00, time_on_page_sec: 29, is_bot_flag: 'false' },
        { user_id: 9014, variant: 'treatment', device_type: 'desktop', session_date: '2025-11-01', converted: 1, order_revenue: 74.00, time_on_page_sec: 90, is_bot_flag: 'false' },
        { user_id: 9015, variant: 'treatment', device_type: 'desktop', session_date: '2025-11-02', converted: 1, order_revenue: 135.00, time_on_page_sec: 112, is_bot_flag: 'false' },
        { user_id: 9016, variant: 'treatment', device_type: 'desktop', session_date: '2025-11-03', converted: 1, order_revenue: 92.00, time_on_page_sec: 84, is_bot_flag: 'false' },
        { user_id: 9017, variant: 'treatment', device_type: 'desktop', session_date: '2025-11-04', converted: 0, order_revenue: 0.00, time_on_page_sec: 46, is_bot_flag: 'false' },
        { user_id: 9018, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-05', converted: 1, order_revenue: null, time_on_page_sec: 78, is_bot_flag: 'false' },
        { user_id: 9019, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-06', converted: 0, order_revenue: 0.00, time_on_page_sec: 31, is_bot_flag: 'false' },
        { user_id: 9020, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-07', converted: 0, order_revenue: 0.00, time_on_page_sec: 3600, is_bot_flag: 'false' },
        { user_id: 9021, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-08', converted: 1, order_revenue: 58.00, time_on_page_sec: 102, is_bot_flag: 'false' },
        { user_id: 9022, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-09', converted: 0, order_revenue: 0.00, time_on_page_sec: 27, is_bot_flag: 'false' },
        { user_id: 9023, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-10', converted: 0, order_revenue: 0.00, time_on_page_sec: 40, is_bot_flag: 'false' },
        { user_id: 9024, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-11', converted: 0, order_revenue: 0.00, time_on_page_sec: 3, is_bot_flag: 'true' },
        { user_id: 9025, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-12', converted: 1, order_revenue: 480.00, time_on_page_sec: 175, is_bot_flag: 'false' },
        { user_id: 9026, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-13', converted: 0, order_revenue: 0.00, time_on_page_sec: 52, is_bot_flag: 'false' },
        { user_id: 9027, variant: 'treatment', device_type: 'mobile', session_date: '2025-11-14', converted: 0, order_revenue: 0.00, time_on_page_sec: 44, is_bot_flag: 'false' },
      ],
    },
  ],
  'power-bi': [
    {
      id: 'ds-pbi-fact',
      filename: 'star_schema_sales_fact.csv',
      roleLabel: 'Fact Table CSV',
      description:
        '26-row sales fact table with dual dates (order_date & ship_date, 2 null ship_dates), 1 orphan product_key ("P-999"), 1 trailing space ("West "), and 1 negative return (-120.00).',
      columns: [
        { name: 'sale_id', type: 'INTEGER', description: 'Unique sales line identifier (7001–7026)' },
        { name: 'order_date', type: 'DATE', description: 'Order date across 2025-01 to 2025-11' },
        { name: 'ship_date', type: 'DATE', description: 'Shipment date (blank on 7025 and 7026)' },
        { name: 'product_key', type: 'TEXT', description: 'Foreign key to product lookup (includes orphan P-999)' },
        { name: 'store_region', type: 'TEXT', description: 'North, East, South, West (1 trailing space "West ")' },
        { name: 'quantity', type: 'INTEGER', description: 'Units sold (or returned)' },
        { name: 'net_sales', type: 'DECIMAL', description: 'Net line revenue in USD (1 negative return = -120.00)' },
      ],
      rows: [
        { sale_id: 7001, order_date: '2025-01-12', ship_date: '2025-01-14', product_key: 'P-101', store_region: 'North', quantity: 4, net_sales: 480.00 },
        { sale_id: 7002, order_date: '2025-01-24', ship_date: '2025-01-27', product_key: 'P-102', store_region: 'West', quantity: 2, net_sales: 640.00 },
        { sale_id: 7003, order_date: '2025-02-08', ship_date: '2025-02-10', product_key: 'P-103', store_region: 'East', quantity: 6, net_sales: 270.00 },
        { sale_id: 7004, order_date: '2025-02-19', ship_date: '2025-02-22', product_key: 'P-104', store_region: 'South', quantity: 1, net_sales: 520.00 },
        { sale_id: 7005, order_date: '2025-03-05', ship_date: '2025-03-07', product_key: 'P-101', store_region: 'North', quantity: 5, net_sales: 600.00 },
        { sale_id: 7006, order_date: '2025-03-18', ship_date: '2025-03-21', product_key: 'P-105', store_region: 'West', quantity: 3, net_sales: 255.00 },
        { sale_id: 7007, order_date: '2025-04-04', ship_date: '2025-04-06', product_key: 'P-102', store_region: 'East', quantity: 4, net_sales: 1280.00 },
        { sale_id: 7008, order_date: '2025-04-16', ship_date: '2025-04-19', product_key: 'P-106', store_region: 'West ', quantity: 10, net_sales: 190.00 },
        { sale_id: 7009, order_date: '2025-05-02', ship_date: '2025-05-05', product_key: 'P-103', store_region: 'South', quantity: 8, net_sales: 360.00 },
        { sale_id: 7010, order_date: '2025-05-21', ship_date: '2025-05-24', product_key: 'P-104', store_region: 'North', quantity: 2, net_sales: 1040.00 },
        { sale_id: 7011, order_date: '2025-06-09', ship_date: '2025-06-11', product_key: 'P-101', store_region: 'East', quantity: 3, net_sales: 360.00 },
        { sale_id: 7012, order_date: '2025-06-24', ship_date: '2025-06-27', product_key: 'P-105', store_region: 'West', quantity: 6, net_sales: 510.00 },
        { sale_id: 7013, order_date: '2025-07-07', ship_date: '2025-07-10', product_key: 'P-102', store_region: 'South', quantity: 2, net_sales: 640.00 },
        { sale_id: 7014, order_date: '2025-07-19', ship_date: '2025-07-22', product_key: 'P-106', store_region: 'North', quantity: 12, net_sales: 228.00 },
        { sale_id: 7015, order_date: '2025-08-03', ship_date: '2025-08-06', product_key: 'P-101', store_region: 'North', quantity: -1, net_sales: -120.00 },
        { sale_id: 7016, order_date: '2025-08-18', ship_date: '2025-08-21', product_key: 'P-103', store_region: 'West', quantity: 7, net_sales: 315.00 },
        { sale_id: 7017, order_date: '2025-09-02', ship_date: '2025-09-04', product_key: 'P-104', store_region: 'East', quantity: 3, net_sales: 1560.00 },
        { sale_id: 7018, order_date: '2025-09-14', ship_date: '2025-09-17', product_key: 'P-105', store_region: 'South', quantity: 4, net_sales: 340.00 },
        { sale_id: 7019, order_date: '2025-09-28', ship_date: '2025-10-01', product_key: 'P-999', store_region: 'West', quantity: 2, net_sales: 180.00 },
        { sale_id: 7020, order_date: '2025-10-06', ship_date: '2025-10-09', product_key: 'P-101', store_region: 'North', quantity: 6, net_sales: 720.00 },
        { sale_id: 7021, order_date: '2025-10-15', ship_date: '2025-10-18', product_key: 'P-102', store_region: 'West', quantity: 3, net_sales: 960.00 },
        { sale_id: 7022, order_date: '2025-10-25', ship_date: '2025-10-28', product_key: 'P-106', store_region: 'East', quantity: 15, net_sales: 285.00 },
        { sale_id: 7023, order_date: '2025-11-04', ship_date: '2025-11-06', product_key: 'P-103', store_region: 'South', quantity: 5, net_sales: 225.00 },
        { sale_id: 7024, order_date: '2025-11-11', ship_date: '2025-11-14', product_key: 'P-104', store_region: 'North', quantity: 2, net_sales: 1040.00 },
        { sale_id: 7025, order_date: '2025-11-16', ship_date: null, product_key: 'P-105', store_region: 'East', quantity: 4, net_sales: 340.00 },
        { sale_id: 7026, order_date: '2025-11-18', ship_date: null, product_key: 'P-102', store_region: 'West', quantity: 1, net_sales: 320.00 },
      ],
    },
    {
      id: 'ds-pbi-dim-product',
      filename: 'star_schema_product_lookup.csv',
      roleLabel: 'Dimension Lookup CSV',
      description:
        '8-row product dimension table containing 1 duplicate key (P-103) that breaks 1:* cardinality until deduplicated, plus 1 zero-sales catalog item (P-107).',
      columns: [
        { name: 'product_key', type: 'TEXT', description: 'Product key (contains duplicate P-103)' },
        { name: 'product_name', type: 'TEXT', description: 'Display name of product' },
        { name: 'category', type: 'TEXT', description: 'Hardware, Software, or Accessories' },
        { name: 'unit_cost', type: 'DECIMAL', description: 'Standard unit cost in USD' },
        { name: 'is_active', type: 'BOOLEAN', description: 'Whether SKU is currently active' },
      ],
      rows: [
        { product_key: 'P-101', product_name: 'Analytics Core Seat', category: 'Software', unit_cost: 35.00, is_active: 'true' },
        { product_key: 'P-102', product_name: 'Pro Workstation Dock', category: 'Hardware', unit_cost: 185.00, is_active: 'true' },
        { product_key: 'P-103', product_name: 'USB-C Monitor Hub', category: 'Accessories', unit_cost: 19.00, is_active: 'true' },
        { product_key: 'P-103', product_name: 'USB-C Monitor Hub (Rev B)', category: 'Accessories', unit_cost: 19.00, is_active: 'true' },
        { product_key: 'P-104', product_name: 'Enterprise BI Gateway', category: 'Software', unit_cost: 140.00, is_active: 'true' },
        { product_key: 'P-105', product_name: 'Ergonomic Trackball', category: 'Accessories', unit_cost: 42.00, is_active: 'true' },
        { product_key: 'P-106', product_name: 'Braided Display Cable', category: 'Accessories', unit_cost: 6.50, is_active: 'true' },
        { product_key: 'P-107', product_name: 'Legacy Tape Adapter', category: 'Hardware', unit_cost: 75.00, is_active: 'false' },
      ],
    },
  ],
};
