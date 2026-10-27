import { Invoice } from '../../models/invoice.model.js';
import type { ReportPeriod } from '../../lib/report-period.js';
import { round2 } from '../../lib/totals.js';
import { customerKey, issuedInvoices, ROW_LIMIT, UNPAID } from './report-filters.js';

export const SALES_GROUPINGS = ['customer', 'item'] as const;
export type SalesGrouping = (typeof SALES_GROUPINGS)[number];

interface CustomerRow {
  _id: string;
  name: string;
  customerId: string | null;
  invoices: number;
  taxable: number;
  amount: number;
  paid: number;
  outstanding: number;
}

interface ItemRow {
  _id: string;
  name: string;
  hsn: string | null;
  unit: string | null;
  quantity: number;
  amount: number;
  lines: number;
}

async function byCustomer(workspaceId: string, period: ReportPeriod) {
  const rows = await Invoice.aggregate<CustomerRow>([
    { $match: issuedInvoices(workspaceId, period) },
    {
      $group: {
        _id: customerKey('$billTo.name'),
        name: { $first: '$billTo.name' },
        customerId: { $first: '$customerId' },
        invoices: { $sum: 1 },
        taxable: { $sum: { $ifNull: ['$taxableAmount', '$subtotal'] } },
        amount: { $sum: '$total' },
        paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$total', 0] } },
        outstanding: { $sum: { $cond: [{ $in: ['$status', UNPAID] }, '$balanceDue', 0] } },
      },
    },
    { $sort: { amount: -1 } },
    { $limit: ROW_LIMIT },
  ]);
  return rows.map((row) => ({
    key: row._id,
    name: row.name || 'Unnamed client',
    customerId: row.customerId ?? null,
    invoices: row.invoices,
    taxable: round2(row.taxable),
    amount: round2(row.amount),
    paid: round2(row.paid),
    outstanding: round2(row.outstanding),
  }));
}

async function byItem(workspaceId: string, period: ReportPeriod) {
  const rows = await Invoice.aggregate<ItemRow>([
    { $match: issuedInvoices(workspaceId, period) },
    { $unwind: '$items' },
    {
      $group: {
        _id: { $ifNull: ['$items.itemId', { $toLower: { $trim: { input: '$items.description' } } }] },
        name: { $first: '$items.description' },
        hsn: { $first: '$items.hsn' },
        unit: { $first: '$items.unit' },
        quantity: { $sum: '$items.quantity' },
        amount: { $sum: '$items.amount' },
        lines: { $sum: 1 },
      },
    },
    { $sort: { amount: -1 } },
    { $limit: ROW_LIMIT },
  ]);
  return rows.map((row) => ({
    key: row._id,
    name: row.name || 'Unnamed item',
    hsn: row.hsn ?? '',
    unit: row.unit ?? '',
    quantity: round2(row.quantity),
    amount: round2(row.amount),
    lines: row.lines,
  }));
}

export async function salesReport(workspaceId: string, period: ReportPeriod, by: SalesGrouping) {
  if (by === 'item') {
    const items = await byItem(workspaceId, period);
    return { by, items, truncated: items.length === ROW_LIMIT };
  }
  const customers = await byCustomer(workspaceId, period);
  return { by, customers, truncated: customers.length === ROW_LIMIT };
}
