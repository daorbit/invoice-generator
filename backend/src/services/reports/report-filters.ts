import type { ReportPeriod } from '../../lib/report-period.js';

export const ISSUED = ['sent', 'paid', 'overdue'];
export const UNPAID = ['sent', 'overdue'];
export const ROW_LIMIT = 200;
export const DAY_MS = 24 * 60 * 60 * 1000;

export function issuedInvoices(workspaceId: string, period: ReportPeriod) {
  return {
    workspaceId,
    currency: period.currency,
    status: { $in: ISSUED },
    invoiceDate: { $gte: period.from, $lte: period.to },
  };
}

export function paidInvoices(workspaceId: string, period: ReportPeriod) {
  const range = { $gte: period.from, $lte: period.to };
  return {
    workspaceId,
    currency: period.currency,
    status: 'paid',
    $or: [{ paidAt: range }, { paidAt: { $exists: false }, updatedAt: range }],
  };
}

export const PAID_ON = { $ifNull: ['$paidAt', '$updatedAt'] };

export function monthOf(field: unknown, timezone: string) {
  return { $dateToString: { format: '%Y-%m', date: field, timezone } };
}

export function customerKey(nameField: string) {
  return { $ifNull: ['$customerId', { $toLower: { $trim: { input: nameField } } }] };
}
