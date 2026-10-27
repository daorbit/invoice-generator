import { Invoice } from '../models/invoice.model.js';
import { Quotation } from '../models/quotation.model.js';
import { round2 } from '../lib/totals.js';

const RECENT_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

interface StatusTotals {
  _id: string;
  count: number;
  total: number;
  recent: number;
}

function groupByStatus(workspaceId: string, since: Date) {
  return [
    { $match: { workspaceId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$total' },
        recent: { $sum: { $cond: [{ $gte: ['$createdAt', since] }, 1, 0] } },
      },
    },
  ];
}

function sumWhere(rows: StatusTotals[], key: 'count' | 'total' | 'recent', statuses?: string[]) {
  return rows
    .filter((row) => !statuses || statuses.includes(row._id))
    .reduce((sum, row) => sum + row[key], 0);
}

export async function getDashboardStats(workspaceId: string) {
  const since = new Date(Date.now() - RECENT_DAYS * DAY_MS);
  const [invoiceRows, quotationRows] = await Promise.all([
    Invoice.aggregate<StatusTotals>(groupByStatus(workspaceId, since)),
    Quotation.aggregate<StatusTotals>(groupByStatus(workspaceId, since)),
  ]);

  const billable = invoiceRows.filter((row) => row._id !== 'cancelled');
  const paidRevenue = sumWhere(invoiceRows, 'total', ['paid']);
  const totalRevenue = sumWhere(billable, 'total');

  return {
    invoices: {
      total: sumWhere(invoiceRows, 'count'),
      paid: sumWhere(invoiceRows, 'count', ['paid']),
      unpaid: sumWhere(invoiceRows, 'count', ['draft', 'sent', 'overdue']),
      recent: sumWhere(invoiceRows, 'recent'),
    },
    quotations: {
      total: sumWhere(quotationRows, 'count'),
      pending: sumWhere(quotationRows, 'count', ['draft', 'sent']),
      accepted: sumWhere(quotationRows, 'count', ['accepted']),
      rejected: sumWhere(quotationRows, 'count', ['rejected']),
      recent: sumWhere(quotationRows, 'recent'),
    },
    revenue: {
      total: round2(totalRevenue),
      paid: round2(paidRevenue),
      pending: round2(totalRevenue - paidRevenue),
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
