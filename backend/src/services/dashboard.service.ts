import { Invoice } from '../models/invoice.model.js';
import { Quotation } from '../models/quotation.model.js';
import { round2 } from '../lib/totals.js';
import { UNPAID } from './reports/report-filters.js';
import { convertStats } from './dashboard-conversion.js';
import type { FxRates } from './fx.service.js';

const RECENT_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

interface StatusTotals {
  _id: { status: string; currency: string };
  count: number;
  total: number;
  recent: number;
  overdue: number;
  overdueCount: number;
}

type SummedKey = 'count' | 'total' | 'recent' | 'overdue' | 'overdueCount';

function groupByStatusAndCurrency(workspaceId: string, since: Date, now: Date) {
  const pastDue = {
    $or: [{ $eq: ['$status', 'overdue'] }, { $and: [{ $ne: ['$dueDate', null] }, { $lt: ['$dueDate', now] }] }],
  };
  return [
    { $match: { workspaceId } },
    {
      $group: {
        _id: { status: '$status', currency: '$currency' },
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
    .filter((row) => !statuses || statuses.includes(row._id.status))
    .reduce((sum, row) => sum + (row[key] ?? 0), 0);
}

function countsByStatus(rows: StatusTotals[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row._id.status] = (counts[row._id.status] ?? 0) + row.count;
  return counts;
}

function currenciesOf(rows: StatusTotals[]): string[] {
  return [...new Set(rows.map((row) => row._id.currency))];
}

export type CurrencyStats = ReturnType<typeof statsForCurrency>;

function statsForCurrency(invoiceRows: StatusTotals[], quotationRows: StatusTotals[], currency: string) {
  const invoices = invoiceRows.filter((row) => row._id.currency === currency);
  const quotations = quotationRows.filter((row) => row._id.currency === currency);
  const billable = invoices.filter((row) => row._id.status !== 'cancelled');
  const paidRevenue = sumWhere(invoices, 'total', ['paid']);
  const totalRevenue = sumWhere(billable, 'total');
  const receivable = sumWhere(invoices, 'total', UNPAID);
  const overdue = sumWhere(invoices, 'overdue', UNPAID);

  return {
    currency,
    invoices: {
      total: sumWhere(invoices, 'count'),
      paid: sumWhere(invoices, 'count', ['paid']),
      unpaid: sumWhere(invoices, 'count', ['draft', 'sent', 'overdue']),
      recent: sumWhere(invoices, 'recent'),
      byStatus: countsByStatus(invoices),
    },
    quotations: {
      total: sumWhere(quotations, 'count'),
      pending: sumWhere(quotations, 'count', ['draft', 'sent']),
      accepted: sumWhere(quotations, 'count', ['accepted']),
      rejected: sumWhere(quotations, 'count', ['rejected']),
      recent: sumWhere(quotations, 'recent'),
      byStatus: countsByStatus(quotations),
    },
    revenue: {
      total: round2(totalRevenue),
      paid: round2(paidRevenue),
      pending: round2(totalRevenue - paidRevenue),
    },
    receivables: {
      current: round2(receivable - overdue),
      overdue: round2(overdue),
      openCount: sumWhere(invoices, 'count', UNPAID),
      overdueCount: sumWhere(invoices, 'overdueCount', UNPAID),
    },
  };
}

export async function getDashboardStats(workspaceId: string, homeCurrency: string, fx: FxRates | null) {
  const now = new Date();
  const since = new Date(now.getTime() - RECENT_DAYS * DAY_MS);
  const [invoiceRows, quotationRows] = await Promise.all([
    Invoice.aggregate<StatusTotals>(groupByStatusAndCurrency(workspaceId, since, now)),
    Quotation.aggregate<StatusTotals>(groupByStatusAndCurrency(workspaceId, since, now)),
  ]);

  const currencies = currenciesOf([...invoiceRows, ...quotationRows]);
  const byCurrency = Object.fromEntries(
    currencies.map((currency) => [currency, statsForCurrency(invoiceRows, quotationRows, currency)]),
  );

  const primaryCurrency = byCurrency[homeCurrency] ? homeCurrency : (currencies[0] ?? homeCurrency);
  const primary =
    byCurrency[primaryCurrency] ?? statsForCurrency(invoiceRows, quotationRows, primaryCurrency);

  const entries = Object.values(byCurrency);
  const converted = Object.fromEntries(
    [...new Set([primaryCurrency, ...currencies])].map((target) => [target, convertStats(entries, target, fx)]),
  );

  return {
    ...primary,
    currencies,
    byCurrency,
    converted,
    statusCounts: { invoice: countsByStatus(invoiceRows), quotation: countsByStatus(quotationRows) },
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
