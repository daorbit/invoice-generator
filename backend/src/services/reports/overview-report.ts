import { Invoice } from '../../models/invoice.model.js';
import { Quotation } from '../../models/quotation.model.js';
import type { ReportPeriod } from '../../lib/report-period.js';
import { round2 } from '../../lib/totals.js';
import { pastDueCutoff } from '../../lib/due-status.js';
import { issuedInvoices, monthOf, PAID_ON, paidInvoices, UNPAID } from './report-filters.js';

interface MonthRow {
  _id: string;
  count: number;
  amount: number;
}

interface OutstandingRow {
  count: number;
  amount: number;
  overdueCount: number;
  overdueAmount: number;
}

interface StatusRow {
  _id: string;
  count: number;
  amount: number;
}

function sum(rows: { count: number; amount: number }[]) {
  return {
    count: rows.reduce((total, row) => total + row.count, 0),
    amount: round2(rows.reduce((total, row) => total + row.amount, 0)),
  };
}

function monthly(issued: MonthRow[], collected: MonthRow[]) {
  const months = new Map<string, { month: string; invoiced: number; collected: number }>();
  const slot = (month: string) => months.get(month) ?? { month, invoiced: 0, collected: 0 };
  for (const row of issued) months.set(row._id, { ...slot(row._id), invoiced: round2(row.amount) });
  for (const row of collected) months.set(row._id, { ...slot(row._id), collected: round2(row.amount) });
  return [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export async function overviewReport(workspaceId: string, period: ReportPeriod) {
  const cutoff = pastDueCutoff();
  const overdue = { $and: [{ $ne: ['$dueDate', null] }, { $lt: ['$dueDate', cutoff] }] };

  const [issued, collected, outstanding, quotations] = await Promise.all([
    Invoice.aggregate<MonthRow>([
      { $match: issuedInvoices(workspaceId, period) },
      { $group: { _id: monthOf('$invoiceDate', period.timezone), count: { $sum: 1 }, amount: { $sum: '$total' } } },
    ]),
    Invoice.aggregate<MonthRow>([
      { $match: paidInvoices(workspaceId, period) },
      { $group: { _id: monthOf(PAID_ON, period.timezone), count: { $sum: 1 }, amount: { $sum: '$total' } } },
    ]),
    Invoice.aggregate<OutstandingRow>([
      { $match: { workspaceId, currency: period.currency, status: { $in: UNPAID } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$balanceDue' },
          overdueCount: { $sum: { $cond: [overdue, 1, 0] } },
          overdueAmount: { $sum: { $cond: [overdue, '$balanceDue', 0] } },
        },
      },
    ]),
    Quotation.aggregate<StatusRow>([
      {
        $match: {
          workspaceId,
          currency: period.currency,
          status: { $ne: 'draft' },
          quotationDate: { $gte: period.from, $lte: period.to },
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$total' } } },
    ]),
  ]);

  const open = outstanding[0];
  const quoted = sum(quotations);
  const accepted = sum(quotations.filter((row) => row._id === 'accepted'));

  return {
    invoiced: sum(issued),
    collected: sum(collected),
    outstanding: { count: open?.count ?? 0, amount: round2(open?.amount ?? 0) },
    overdue: { count: open?.overdueCount ?? 0, amount: round2(open?.overdueAmount ?? 0) },
    quotations: {
      ...quoted,
      accepted: accepted.count,
      acceptedAmount: accepted.amount,
      conversion: quoted.count ? Math.round((accepted.count / quoted.count) * 100) : 0,
    },
    monthly: monthly(issued, collected),
  };
}
