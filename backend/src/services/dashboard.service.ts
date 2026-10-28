import { Invoice } from '../models/invoice.model.js';
import { Quotation } from '../models/quotation.model.js';
import { round2 } from '../lib/totals.js';
import { UNPAID } from './reports/report-filters.js';

const RECENT_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

interface StatusTotals {
  _id: string;
  count: number;
  total: number;
  recent: number;
  overdue: number;
  overdueCount: number;
}

type SummedKey = 'count' | 'total' | 'recent' | 'overdue' | 'overdueCount';

function groupByStatus(workspaceId: string, since: Date, now: Date) {
  const pastDue = {
    $or: [{ $eq: ['$status', 'overdue'] }, { $and: [{ $ne: ['$dueDate', null] }, { $lt: ['$dueDate', now] }] }],
  };
  return [
    { $match: { workspaceId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$total' },
        recent: { $sum: { $cond: [{ $gte: ['$createdAt', since] }, 1, 0] } },
        overdue: { $sum: { $cond: [pastDue, '$total', 0] } },
        overdueCount: { $sum: { $cond: [pastDue, 1, 0] } },
      },
    },
  ];
}

function sumWhere(rows: StatusTotals[], key: SummedKey, statuses?: string[]) {
  return rows
    .filter((row) => !statuses || statuses.includes(row._id))
    .reduce((sum, row) => sum + (row[key] ?? 0), 0);
}

function countsByStatus(rows: StatusTotals[]): Record<string, number> {
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}

export async function getDashboardStats(workspaceId: string) {
  const now = new Date();
  const since = new Date(now.getTime() - RECENT_DAYS * DAY_MS);
  const [invoiceRows, quotationRows] = await Promise.all([
    Invoice.aggregate<StatusTotals>(groupByStatus(workspaceId, since, now)),
    Quotation.aggregate<StatusTotals>(groupByStatus(workspaceId, since, now)),
  ]);

  const billable = invoiceRows.filter((row) => row._id !== 'cancelled');
  const paidRevenue = sumWhere(invoiceRows, 'total', ['paid']);
  const totalRevenue = sumWhere(billable, 'total');
  const receivable = sumWhere(invoiceRows, 'total', UNPAID);
  const overdue = sumWhere(invoiceRows, 'overdue', UNPAID);

  return {
    invoices: {
      total: sumWhere(invoiceRows, 'count'),
      paid: sumWhere(invoiceRows, 'count', ['paid']),
      unpaid: sumWhere(invoiceRows, 'count', ['draft', 'sent', 'overdue']),
      recent: sumWhere(invoiceRows, 'recent'),
      byStatus: countsByStatus(invoiceRows),
    },
    quotations: {
      total: sumWhere(quotationRows, 'count'),
      pending: sumWhere(quotationRows, 'count', ['draft', 'sent']),
      accepted: sumWhere(quotationRows, 'count', ['accepted']),
      rejected: sumWhere(quotationRows, 'count', ['rejected']),
      recent: sumWhere(quotationRows, 'recent'),
      byStatus: countsByStatus(quotationRows),
    },
    revenue: {
      total: round2(totalRevenue),
      paid: round2(paidRevenue),
      pending: round2(totalRevenue - paidRevenue),
    },
    receivables: {
      current: round2(receivable - overdue),
      overdue: round2(overdue),
      openCount: sumWhere(invoiceRows, 'count', UNPAID),
      overdueCount: sumWhere(invoiceRows, 'overdueCount', UNPAID),
    },
  };
}

const RECENT_FIELDS = 'items tax discount discountType shipping status createdAt subtotal total currency';

export async function getRecentDocuments(workspaceId: string, limit: number) {
  const [invoices, quotations] = await Promise.all([
    Invoice.find({ workspaceId })
      .select(`${RECENT_FIELDS} invoiceNumber invoiceDate dueDate billTo.name`)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Quotation.find({ workspaceId })
      .select(`${RECENT_FIELDS} quotationNumber quotationDate validUntil quoteTo.name`)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
  ]);

  const rows = [
    ...invoices.map(({ billTo, ...doc }) => ({
      ...doc,
      id: String(doc._id),
      type: 'invoice' as const,
      billToName: billTo?.name ?? '',
    })),
    ...quotations.map(({ quoteTo, ...doc }) => ({
      ...doc,
      id: String(doc._id),
      type: 'quotation' as const,
      quoteToName: quoteTo?.name ?? '',
    })),
  ];

  return rows
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
