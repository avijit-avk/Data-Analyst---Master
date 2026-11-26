import { EmbeddedDataset, EmbeddedTable } from '../types/academy';

export const EMBEDDED_DATASETS: EmbeddedDataset[] = [
  {
    id: 'ds-operations',
    domain: 'Operations',
    title: 'Logistics & Fulfillment Operations',
    description:
      'Shipment dispatch logs and regional warehouse hub benchmarks with real-world casing inconsistencies, missing delivery timestamps, and SLA flags.',
    tables: [
      {
        name: 'operations_shipments',
        csvFilename: 'operations_shipments.csv',
        columns: [
          { name: 'shipment_id', type: 'TEXT', description: 'Unique dispatch identifier' },
          { name: 'hub_id', type: 'TEXT', description: 'Origin hub foreign key' },
          { name: 'carrier', type: 'TEXT', description: 'Carrier name (contains casing drift)' },
          { name: 'ship_date', type: 'DATE', description: 'Dispatch date (YYYY-MM-DD)' },
          { name: 'delivery_days', type: 'INT', description: 'Actual transit days (NULL if in transit)' },
          { name: 'sla_target_days', type: 'INT', description: 'Contracted SLA threshold in days' },
          { name: 'units', type: 'INT', description: 'Units shipped in consignment' },
          { name: 'freight_cost', type: 'FLOAT', description: 'Total shipping cost in USD' },
          { name: 'status', type: 'TEXT', description: 'Delivered, Delayed, or In Transit' },
        ],
        rows: [
          { shipment_id: 'SHP-1001', hub_id: 'HUB-NE', carrier: 'ApexFreight', ship_date: '2025-01-03', delivery_days: 2, sla_target_days: 3, units: 120, freight_cost: 420.0, status: 'Delivered' },
          { shipment_id: 'SHP-1002', hub_id: 'HUB-MW', carrier: 'apexfreight', ship_date: '2025-01-04', delivery_days: 4, sla_target_days: 3, units: 80, freight_cost: 360.0, status: 'Delayed' },
          { shipment_id: 'SHP-1003', hub_id: 'HUB-W', carrier: 'SwiftHaul', ship_date: '2025-01-05', delivery_days: 3, sla_target_days: 3, units: 150, freight_cost: 510.0, status: 'Delivered' },
          { shipment_id: 'SHP-1004', hub_id: 'HUB-S', carrier: 'NorthStar', ship_date: '2025-01-06', delivery_days: 5, sla_target_days: 4, units: 95, freight_cost: 390.0, status: 'Delayed' },
          { shipment_id: 'SHP-1005', hub_id: 'HUB-NE', carrier: 'SwiftHaul', ship_date: '2025-01-07', delivery_days: 2, sla_target_days: 3, units: 200, freight_cost: 600.0, status: 'Delivered' },
          { shipment_id: 'SHP-1006', hub_id: 'HUB-MW', carrier: 'NorthStar', ship_date: '2025-01-08', delivery_days: 3, sla_target_days: 3, units: 110, freight_cost: 385.0, status: 'Delivered' },
          { shipment_id: 'SHP-1007', hub_id: 'HUB-W', carrier: 'ApexFreight', ship_date: '2025-01-09', delivery_days: 6, sla_target_days: 4, units: 140, freight_cost: 680.0, status: 'Delayed' },
          { shipment_id: 'SHP-1008', hub_id: 'HUB-S', carrier: 'swifthaul', ship_date: '2025-01-10', delivery_days: 2, sla_target_days: 3, units: 75, freight_cost: 290.0, status: 'Delivered' },
          { shipment_id: 'SHP-1009', hub_id: 'HUB-NE', carrier: 'ApexFreight', ship_date: '2025-01-11', delivery_days: 3, sla_target_days: 3, units: 130, freight_cost: 455.0, status: 'Delivered' },
          { shipment_id: 'SHP-1010', hub_id: 'HUB-MW', carrier: 'SwiftHaul', ship_date: '2025-01-12', delivery_days: 5, sla_target_days: 3, units: 90, freight_cost: 410.0, status: 'Delayed' },
          { shipment_id: 'SHP-1011', hub_id: 'HUB-W', carrier: 'NorthStar', ship_date: '2025-01-13', delivery_days: 4, sla_target_days: 4, units: 160, freight_cost: 540.0, status: 'Delivered' },
          { shipment_id: 'SHP-1012', hub_id: 'HUB-S', carrier: 'ApexFreight', ship_date: '2025-01-14', delivery_days: 2, sla_target_days: 3, units: 105, freight_cost: 375.0, status: 'Delivered' },
          { shipment_id: 'SHP-1013', hub_id: 'HUB-NE', carrier: 'NorthStar', ship_date: '2025-01-15', delivery_days: null, sla_target_days: 3, units: 115, freight_cost: 430.0, status: 'In Transit' },
          { shipment_id: 'SHP-1014', hub_id: 'HUB-MW', carrier: 'ApexFreight', ship_date: '2025-01-16', delivery_days: 3, sla_target_days: 3, units: 145, freight_cost: 495.0, status: 'Delivered' },
          { shipment_id: 'SHP-1015', hub_id: 'HUB-W', carrier: 'SwiftHaul', ship_date: '2025-01-17', delivery_days: 5, sla_target_days: 4, units: 180, freight_cost: 720.0, status: 'Delayed' },
          { shipment_id: 'SHP-1016', hub_id: 'HUB-S', carrier: 'NorthStar', ship_date: '2025-01-18', delivery_days: 3, sla_target_days: 3, units: 60, freight_cost: 240.0, status: 'Delivered' },
          { shipment_id: 'SHP-1017', hub_id: 'HUB-NE', carrier: 'ApexFreight', ship_date: '2025-01-19', delivery_days: 2, sla_target_days: 3, units: 210, freight_cost: 630.0, status: 'Delivered' },
          { shipment_id: 'SHP-1018', hub_id: 'HUB-MW', carrier: 'SwiftHaul', ship_date: '2025-01-20', delivery_days: null, sla_target_days: 3, units: 100, freight_cost: 350.0, status: 'In Transit' },
          { shipment_id: 'SHP-1019', hub_id: 'HUB-W', carrier: 'NorthStar', ship_date: '2025-01-21', delivery_days: 4, sla_target_days: 4, units: 125, freight_cost: 460.0, status: 'Delivered' },
          { shipment_id: 'SHP-1020', hub_id: 'HUB-S', carrier: 'ApexFreight', ship_date: '2025-01-22', delivery_days: 4, sla_target_days: 3, units: 85, freight_cost: 340.0, status: 'Delayed' },
        ],
      },
      {
        name: 'warehouse_hubs',
        csvFilename: 'warehouse_hubs.csv',
        columns: [
          { name: 'hub_id', type: 'TEXT', description: 'Primary key for hub' },
          { name: 'hub_city', type: 'TEXT', description: 'City and state' },
          { name: 'region', type: 'TEXT', description: 'Operating region' },
          { name: 'monthly_overhead', type: 'FLOAT', description: 'Fixed hub monthly operating cost (USD)' },
        ],
        rows: [
          { hub_id: 'HUB-NE', hub_city: 'Newark, NJ', region: 'Northeast', monthly_overhead: 48000 },
          { hub_id: 'HUB-MW', hub_city: 'Chicago, IL', region: 'Midwest', monthly_overhead: 42000 },
          { hub_id: 'HUB-W', hub_city: 'Reno, NV', region: 'West', monthly_overhead: 45000 },
          { hub_id: 'HUB-S', hub_city: 'Dallas, TX', region: 'South', monthly_overhead: 39000 },
        ],
      },
    ],
  },
  {
    id: 'ds-retail',
    domain: 'Retail Sales',
    title: 'Omnichannel Retail Orders & Margins',
    description:
      'Star-schema retail transactions joined to customer segments and product unit costs for revenue, return-rate, and gross margin analysis.',
    tables: [
      {
        name: 'retail_orders',
        csvFilename: 'retail_orders.csv',
        columns: [
          { name: 'order_id', type: 'TEXT', description: 'Order primary key' },
          { name: 'order_date', type: 'DATE', description: 'Transaction date' },
          { name: 'customer_id', type: 'TEXT', description: 'Foreign key to retail_customers' },
          { name: 'product_id', type: 'TEXT', description: 'Foreign key to retail_products' },
          { name: 'quantity', type: 'INT', description: 'Units ordered' },
          { name: 'discount_pct', type: 'FLOAT', description: 'Discount ratio (0.10 = 10%)' },
          { name: 'status', type: 'TEXT', description: 'Completed, Returned, or Cancelled' },
          { name: 'channel', type: 'TEXT', description: 'Web, Mobile App, or In-Store' },
        ],
        rows: [
          { order_id: 'ORD-501', order_date: '2025-02-01', customer_id: 'CUST-01', product_id: 'PRD-A', quantity: 2, discount_pct: 0.0, status: 'Completed', channel: 'Web' },
          { order_id: 'ORD-502', order_date: '2025-02-02', customer_id: 'CUST-02', product_id: 'PRD-B', quantity: 5, discount_pct: 0.1, status: 'Completed', channel: 'Web' },
          { order_id: 'ORD-503', order_date: '2025-02-03', customer_id: 'CUST-03', product_id: 'PRD-C', quantity: 1, discount_pct: 0.0, status: 'Returned', channel: 'Mobile App' },
          { order_id: 'ORD-504', order_date: '2025-02-04', customer_id: 'CUST-01', product_id: 'PRD-D', quantity: 3, discount_pct: 0.15, status: 'Completed', channel: 'Web' },
          { order_id: 'ORD-505', order_date: '2025-02-05', customer_id: 'CUST-04', product_id: 'PRD-A', quantity: 4, discount_pct: 0.05, status: 'Completed', channel: 'In-Store' },
          { order_id: 'ORD-506', order_date: '2025-02-06', customer_id: 'CUST-05', product_id: 'PRD-E', quantity: 2, discount_pct: 0.0, status: 'Cancelled', channel: 'Mobile App' },
          { order_id: 'ORD-507', order_date: '2025-02-07', customer_id: 'CUST-06', product_id: 'PRD-B', quantity: 6, discount_pct: 0.1, status: 'Completed', channel: 'Web' },
          { order_id: 'ORD-508', order_date: '2025-02-08', customer_id: 'CUST-02', product_id: 'PRD-C', quantity: 2, discount_pct: 0.0, status: 'Completed', channel: 'In-Store' },
          { order_id: 'ORD-509', order_date: '2025-02-09', customer_id: 'CUST-07', product_id: 'PRD-F', quantity: 1, discount_pct: 0.2, status: 'Completed', channel: 'Web' },
          { order_id: 'ORD-510', order_date: '2025-02-10', customer_id: 'CUST-03', product_id: 'PRD-A', quantity: 3, discount_pct: 0.0, status: 'Completed', channel: 'Mobile App' },
          { order_id: 'ORD-511', order_date: '2025-02-11', customer_id: 'CUST-08', product_id: 'PRD-D', quantity: 2, discount_pct: 0.0, status: 'Returned', channel: 'Web' },
          { order_id: 'ORD-512', order_date: '2025-02-12', customer_id: 'CUST-04', product_id: 'PRD-E', quantity: 5, discount_pct: 0.1, status: 'Completed', channel: 'In-Store' },
          { order_id: 'ORD-513', order_date: '2025-02-13', customer_id: 'CUST-09', product_id: 'PRD-B', quantity: 3, discount_pct: 0.0, status: 'Completed', channel: 'Web' },
          { order_id: 'ORD-514', order_date: '2025-02-14', customer_id: 'CUST-01', product_id: 'PRD-F', quantity: 2, discount_pct: 0.1, status: 'Completed', channel: 'Web' },
          { order_id: 'ORD-515', order_date: '2025-02-15', customer_id: 'CUST-10', product_id: 'PRD-C', quantity: 4, discount_pct: 0.05, status: 'Completed', channel: 'Mobile App' },
          { order_id: 'ORD-516', order_date: '2025-02-16', customer_id: 'CUST-06', product_id: 'PRD-A', quantity: 2, discount_pct: 0.0, status: 'Completed', channel: 'In-Store' },
          { order_id: 'ORD-517', order_date: '2025-02-17', customer_id: 'CUST-05', product_id: 'PRD-D', quantity: 1, discount_pct: 0.0, status: 'Completed', channel: 'Web' },
          { order_id: 'ORD-518', order_date: '2025-02-18', customer_id: 'CUST-07', product_id: 'PRD-E', quantity: 3, discount_pct: 0.1, status: 'Completed', channel: 'Mobile App' },
        ],
      },
      {
        name: 'retail_customers',
        csvFilename: 'retail_customers.csv',
        columns: [
          { name: 'customer_id', type: 'TEXT', description: 'Customer primary key' },
          { name: 'customer_name', type: 'TEXT', description: 'Account or buyer name' },
          { name: 'segment', type: 'TEXT', description: 'Enterprise, SMB, or Consumer' },
          { name: 'region', type: 'TEXT', description: 'Sales territory' },
        ],
        rows: [
          { customer_id: 'CUST-01', customer_name: 'Northbridge Co', segment: 'Enterprise', region: 'East' },
          { customer_id: 'CUST-02', customer_name: 'Harbor Studio', segment: 'SMB', region: 'West' },
          { customer_id: 'CUST-03', customer_name: 'Maya Lin', segment: 'Consumer', region: 'West' },
          { customer_id: 'CUST-04', customer_name: 'Summit Retail', segment: 'Enterprise', region: 'Central' },
          { customer_id: 'CUST-05', customer_name: 'Devon Brooks', segment: 'Consumer', region: 'South' },
          { customer_id: 'CUST-06', customer_name: 'Crestwood Labs', segment: 'SMB', region: 'East' },
          { customer_id: 'CUST-07', customer_name: 'Priya Patel', segment: 'Consumer', region: 'Central' },
          { customer_id: 'CUST-08', customer_name: 'Oakline Goods', segment: 'SMB', region: 'South' },
          { customer_id: 'CUST-09', customer_name: 'Beacon Health', segment: 'Enterprise', region: 'East' },
          { customer_id: 'CUST-10', customer_name: 'Liam Carter', segment: 'Consumer', region: 'West' },
        ],
      },
      {
        name: 'retail_products',
        csvFilename: 'retail_products.csv',
        columns: [
          { name: 'product_id', type: 'TEXT', description: 'Product SKU primary key' },
          { name: 'product_name', type: 'TEXT', description: 'Product display name' },
          { name: 'category', type: 'TEXT', description: 'Product line' },
          { name: 'unit_price', type: 'FLOAT', description: 'List selling price per unit (USD)' },
          { name: 'unit_cost', type: 'FLOAT', description: 'Landed COGS per unit (USD)' },
        ],
        rows: [
          { product_id: 'PRD-A', product_name: 'Ergonomic Dock', category: 'Hardware', unit_price: 150, unit_cost: 90 },
          { product_id: 'PRD-B', product_name: 'USB-C Hub Pro', category: 'Accessories', unit_price: 80, unit_cost: 36 },
          { product_id: 'PRD-C', product_name: 'Mechanical Keyset', category: 'Accessories', unit_price: 120, unit_cost: 60 },
          { product_id: 'PRD-D', product_name: '4K Display Arm', category: 'Hardware', unit_price: 200, unit_cost: 110 },
          { product_id: 'PRD-E', product_name: 'Noise-Cancel Headset', category: 'Audio', unit_price: 160, unit_cost: 88 },
          { product_id: 'PRD-F', product_name: 'Studio Desk Mat', category: 'Workspace', unit_price: 50, unit_cost: 20 },
        ],
      },
    ],
  },
  {
    id: 'ds-banking',
    domain: 'Banking & Credit Cards',
    title: 'Credit Card Portfolio & Fraud Risk',
    description:
      'Cardholder account limits, balances, delinquency days, and transaction-level spend with international and flagged authorization events.',
    tables: [
      {
        name: 'credit_card_transactions',
        csvFilename: 'credit_card_transactions.csv',
        columns: [
          { name: 'txn_id', type: 'TEXT', description: 'Transaction ID' },
          { name: 'account_id', type: 'TEXT', description: 'Foreign key to cardholder_accounts' },
          { name: 'txn_date', type: 'DATE', description: 'Authorization date' },
          { name: 'merchant_category', type: 'TEXT', description: 'Merchant category group' },
          { name: 'amount', type: 'FLOAT', description: 'Transaction amount in USD' },
          { name: 'interchange_fee', type: 'FLOAT', description: 'Bank interchange revenue in USD' },
          { name: 'is_international', type: 'INT', description: '1 if cross-border, 0 if domestic' },
          { name: 'status', type: 'TEXT', description: 'Approved, Declined, or Flagged' },
        ],
        rows: [
          { txn_id: 'TXN-901', account_id: 'ACC-101', txn_date: '2025-03-01', merchant_category: 'Groceries', amount: 145.0, interchange_fee: 2.9, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-902', account_id: 'ACC-102', txn_date: '2025-03-01', merchant_category: 'Travel', amount: 1250.0, interchange_fee: 31.25, is_international: 1, status: 'Approved' },
          { txn_id: 'TXN-903', account_id: 'ACC-103', txn_date: '2025-03-02', merchant_category: 'Electronics', amount: 890.0, interchange_fee: 0.0, is_international: 1, status: 'Flagged' },
          { txn_id: 'TXN-904', account_id: 'ACC-101', txn_date: '2025-03-03', merchant_category: 'Dining', amount: 85.0, interchange_fee: 1.7, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-905', account_id: 'ACC-104', txn_date: '2025-03-04', merchant_category: 'Travel', amount: 640.0, interchange_fee: 16.0, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-906', account_id: 'ACC-105', txn_date: '2025-03-05', merchant_category: 'Electronics', amount: 1420.0, interchange_fee: 0.0, is_international: 0, status: 'Declined' },
          { txn_id: 'TXN-907', account_id: 'ACC-102', txn_date: '2025-03-06', merchant_category: 'Dining', amount: 210.0, interchange_fee: 4.2, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-908', account_id: 'ACC-106', txn_date: '2025-03-07', merchant_category: 'Groceries', amount: 175.0, interchange_fee: 3.5, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-909', account_id: 'ACC-107', txn_date: '2025-03-08', merchant_category: 'Travel', amount: 2100.0, interchange_fee: 0.0, is_international: 1, status: 'Flagged' },
          { txn_id: 'TXN-910', account_id: 'ACC-108', txn_date: '2025-03-09', merchant_category: 'Utilities', amount: 320.0, interchange_fee: 4.8, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-911', account_id: 'ACC-103', txn_date: '2025-03-10', merchant_category: 'Groceries', amount: 95.0, interchange_fee: 1.9, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-912', account_id: 'ACC-104', txn_date: '2025-03-11', merchant_category: 'Electronics', amount: 520.0, interchange_fee: 10.4, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-913', account_id: 'ACC-105', txn_date: '2025-03-12', merchant_category: 'Dining', amount: 65.0, interchange_fee: 1.3, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-914', account_id: 'ACC-106', txn_date: '2025-03-13', merchant_category: 'Travel', amount: 980.0, interchange_fee: 24.5, is_international: 1, status: 'Approved' },
          { txn_id: 'TXN-915', account_id: 'ACC-107', txn_date: '2025-03-14', merchant_category: 'Utilities', amount: 180.0, interchange_fee: 2.7, is_international: 0, status: 'Approved' },
          { txn_id: 'TXN-916', account_id: 'ACC-108', txn_date: '2025-03-15', merchant_category: 'Electronics', amount: 740.0, interchange_fee: 0.0, is_international: 1, status: 'Declined' },
        ],
      },
      {
        name: 'cardholder_accounts',
        csvFilename: 'cardholder_accounts.csv',
        columns: [
          { name: 'account_id', type: 'TEXT', description: 'Card account primary key' },
          { name: 'card_tier', type: 'TEXT', description: 'Platinum, Gold, or Standard' },
          { name: 'credit_limit', type: 'FLOAT', description: 'Total credit line (USD)' },
          { name: 'current_balance', type: 'FLOAT', description: 'Revolving balance (USD)' },
          { name: 'delinquency_days', type: 'INT', description: 'Days past due (0 if current)' },
        ],
        rows: [
          { account_id: 'ACC-101', card_tier: 'Gold', credit_limit: 8000, current_balance: 1600, delinquency_days: 0 },
          { account_id: 'ACC-102', card_tier: 'Platinum', credit_limit: 20000, current_balance: 5000, delinquency_days: 0 },
          { account_id: 'ACC-103', card_tier: 'Standard', credit_limit: 4000, current_balance: 3200, delinquency_days: 35 },
          { account_id: 'ACC-104', card_tier: 'Gold', credit_limit: 10000, current_balance: 2500, delinquency_days: 0 },
          { account_id: 'ACC-105', card_tier: 'Standard', credit_limit: 3000, current_balance: 2700, delinquency_days: 62 },
          { account_id: 'ACC-106', card_tier: 'Platinum', credit_limit: 25000, current_balance: 4000, delinquency_days: 0 },
          { account_id: 'ACC-107', card_tier: 'Gold', credit_limit: 12000, current_balance: 6600, delinquency_days: 15 },
          { account_id: 'ACC-108', card_tier: 'Standard', credit_limit: 5000, current_balance: 1250, delinquency_days: 0 },
        ],
      },
    ],
  },
  {
    id: 'ds-hr',
    domain: 'Human Resources',
    title: 'Workforce Compensation & Attrition',
    description:
      'Employee roster with department payroll, overtime indicators, tenure, performance scores, and voluntary attrition flags.',
    tables: [
      {
        name: 'hr_employees',
        csvFilename: 'hr_employees.csv',
        columns: [
          { name: 'emp_id', type: 'TEXT', description: 'Employee identifier' },
          { name: 'full_name', type: 'TEXT', description: 'Employee name' },
          { name: 'department', type: 'TEXT', description: 'Sales, Engineering, Operations, or Finance' },
          { name: 'role_level', type: 'TEXT', description: 'Junior, Mid, or Senior' },
          { name: 'annual_salary', type: 'INT', description: 'Base annual compensation (USD)' },
          { name: 'tenure_months', type: 'INT', description: 'Months employed' },
          { name: 'performance_score', type: 'INT', description: 'Annual review score (1 to 5)' },
          { name: 'overtime', type: 'TEXT', description: 'Yes or No' },
          { name: 'attrition', type: 'TEXT', description: 'Yes if departed, No if active' },
        ],
        rows: [
          { emp_id: 'EMP-01', full_name: 'Elena Rostova', department: 'Engineering', role_level: 'Senior', annual_salary: 138000, tenure_months: 42, performance_score: 5, overtime: 'No', attrition: 'No' },
          { emp_id: 'EMP-02', full_name: 'Marcus Vance', department: 'Sales', role_level: 'Mid', annual_salary: 82000, tenure_months: 14, performance_score: 3, overtime: 'Yes', attrition: 'Yes' },
          { emp_id: 'EMP-03', full_name: 'Sora Takahashi', department: 'Engineering', role_level: 'Mid', annual_salary: 108000, tenure_months: 26, performance_score: 4, overtime: 'No', attrition: 'No' },
          { emp_id: 'EMP-04', full_name: 'Hannah Okafor', department: 'Operations', role_level: 'Mid', annual_salary: 74000, tenure_months: 11, performance_score: 4, overtime: 'Yes', attrition: 'Yes' },
          { emp_id: 'EMP-05', full_name: 'Noah Alvarez', department: 'Finance', role_level: 'Senior', annual_salary: 116000, tenure_months: 54, performance_score: 5, overtime: 'No', attrition: 'No' },
          { emp_id: 'EMP-06', full_name: 'Chloe Bennett', department: 'Sales', role_level: 'Junior', annual_salary: 60000, tenure_months: 8, performance_score: 3, overtime: 'Yes', attrition: 'Yes' },
          { emp_id: 'EMP-07', full_name: 'Arjun Mehta', department: 'Engineering', role_level: 'Junior', annual_salary: 88000, tenure_months: 16, performance_score: 4, overtime: 'No', attrition: 'No' },
          { emp_id: 'EMP-08', full_name: 'Grace Kim', department: 'Operations', role_level: 'Senior', annual_salary: 96000, tenure_months: 39, performance_score: 4, overtime: 'No', attrition: 'No' },
          { emp_id: 'EMP-09', full_name: 'Lucas Weber', department: 'Sales', role_level: 'Senior', annual_salary: 104000, tenure_months: 33, performance_score: 5, overtime: 'No', attrition: 'No' },
          { emp_id: 'EMP-10', full_name: 'Nadia Farah', department: 'Operations', role_level: 'Junior', annual_salary: 58000, tenure_months: 9, performance_score: 2, overtime: 'Yes', attrition: 'Yes' },
          { emp_id: 'EMP-11', full_name: 'Owen Gallagher', department: 'Finance', role_level: 'Mid', annual_salary: 86000, tenure_months: 22, performance_score: 4, overtime: 'No', attrition: 'No' },
          { emp_id: 'EMP-12', full_name: 'Tessa Morales', department: 'Engineering', role_level: 'Senior', annual_salary: 142000, tenure_months: 48, performance_score: 5, overtime: 'No', attrition: 'No' },
          { emp_id: 'EMP-13', full_name: 'Victor Sterling', department: 'Sales', role_level: 'Mid', annual_salary: 78000, tenure_months: 15, performance_score: 3, overtime: 'Yes', attrition: 'No' },
          { emp_id: 'EMP-14', full_name: 'Amara Diallo', department: 'Finance', role_level: 'Junior', annual_salary: 64000, tenure_months: 12, performance_score: 3, overtime: 'No', attrition: 'No' },
          { emp_id: 'EMP-15', full_name: 'Caleb Foster', department: 'Operations', role_level: 'Mid', annual_salary: 72000, tenure_months: 19, performance_score: 3, overtime: 'Yes', attrition: 'Yes' },
          { emp_id: 'EMP-16', full_name: 'Iris Novak', department: 'Engineering', role_level: 'Mid', annual_salary: 112000, tenure_months: 29, performance_score: 4, overtime: 'No', attrition: 'No' },
        ],
      },
      {
        name: 'hr_department_budgets',
        csvFilename: 'hr_department_budgets.csv',
        columns: [
          { name: 'department', type: 'TEXT', description: 'Department primary key' },
          { name: 'annual_payroll_budget', type: 'INT', description: 'Approved salary cap (USD)' },
          { name: 'target_headcount', type: 'INT', description: 'Planned active seats' },
        ],
        rows: [
          { department: 'Engineering', annual_payroll_budget: 650000, target_headcount: 6 },
          { department: 'Sales', annual_payroll_budget: 360000, target_headcount: 4 },
          { department: 'Operations', annual_payroll_budget: 320000, target_headcount: 4 },
          { department: 'Finance', annual_payroll_budget: 290000, target_headcount: 3 },
        ],
      },
    ],
  },
];

export function getDatasetById(datasetId: string): EmbeddedDataset | undefined {
  return EMBEDDED_DATASETS.find((ds) => ds.id === datasetId);
}

export function getAllEmbeddedTables(): EmbeddedTable[] {
  return EMBEDDED_DATASETS.flatMap((ds) => ds.tables);
}

export function serializeTableToCsv(table: EmbeddedTable): string {
  const headers = table.columns.map((c) => c.name);
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [
    headers.join(','),
    ...table.rows.map((row) => headers.map((h) => escapeCell(row[h])).join(',')),
  ];
  return lines.join('\n');
}

export function triggerCsvDownload(table: EmbeddedTable): void {
  const csv = serializeTableToCsv(table);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = table.csvFilename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
