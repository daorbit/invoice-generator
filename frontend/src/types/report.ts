export interface CountAmount {
  count: number;
  amount: number;
}

export interface OverviewReport {
  invoiced: CountAmount;
  collected: CountAmount;
  outstanding: CountAmount;
  overdue: CountAmount;
  quotations: CountAmount & { accepted: number; acceptedAmount: number; conversion: number };
  monthly: { month: string; invoiced: number; collected: number }[];
}

export interface AgingBuckets {
  current: number;
  days1to15: number;
  days16to30: number;
  days31to45: number;
  over45: number;
}

export interface ReceivablesReport {
  customers: (AgingBuckets & { key: string; name: string; customerId: string | null; invoices: number; total: number })[];
  totals: AgingBuckets & { total: number };
  truncated: boolean;
}

export interface SalesByCustomerRow {
  key: string;
  name: string;
  customerId: string | null;
  invoices: number;
  taxable: number;
  amount: number;
  paid: number;
  outstanding: number;
}

export interface SalesByItemRow {
  key: string;
  name: string;
  hsn: string;
  unit: string;
  quantity: number;
  amount: number;
  lines: number;
}

export type SalesGrouping = 'customer' | 'item';

export interface SalesReport {
  by: SalesGrouping;
  customers?: SalesByCustomerRow[];
  items?: SalesByItemRow[];
  truncated: boolean;
}

export interface PaymentRow {
  id: string;
  number: string;
  client: string;
  customerId: string | null;
  invoiceDate: string | null;
  paidAt: string;
  amount: number;
  daysToPay: number | null;
}

export interface PaymentsReport {
  payments: PaymentRow[];
  total: number;
  averageDaysToPay: number | null;
  truncated: boolean;
}

export interface GstSplit {
  taxable: number;
  igst: number;
  cgst: number;
  sgst: number;
  tax: number;
}

export interface GstInvoiceRow extends GstSplit {
  id: string;
  number: string;
  date: string | null;
  client: string;
  gstin: string;
  placeOfSupply: string;
  interState: boolean;
  reverseCharge: boolean;
  exportUnderLut: boolean;
  total: number;
}

export interface GstReport {
  summary: GstSplit & { invoices: number };
  byRate: (GstSplit & { rate: number })[];
  b2b: GstSplit & { count: number };
  b2c: GstSplit & { count: number };
  invoices: GstInvoiceRow[];
  truncated: boolean;
}

export interface ReportRange {
  from: string;
  to: string;
}
