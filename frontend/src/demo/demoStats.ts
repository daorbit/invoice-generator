import type { CurrencyDashboardStats, DashboardStats, DocumentStatus } from '@/types/document';
import { demoInvoices, demoQuotations } from './demoDocuments';
import { demoProfile } from './demoProfile';

function countBy<T>(rows: T[], key: (row: T) => DocumentStatus): Partial<Record<DocumentStatus, number>> {
  const counts: Partial<Record<DocumentStatus, number>> = {};
  for (const row of rows) counts[key(row)] = (counts[key(row)] ?? 0) + 1;
  return counts;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export function demoDashboardStats(): DashboardStats {
  const issued = demoInvoices.filter((r) => ['sent', 'paid', 'overdue'].includes(r.status));
  const paid = issued.filter((r) => r.status === 'paid');
  const open = issued.filter((r) => r.status !== 'paid');
  const overdue = open.filter((r) => r.status === 'overdue');
  const invoiceCounts = countBy(demoInvoices, (r) => r.status);
  const quotationCounts = countBy(demoQuotations, (r) => r.quotation.status);
  const totalOf = (rows: typeof demoInvoices) => sum(rows.map((r) => r.invoice.total ?? 0));

  const stats: CurrencyDashboardStats = {
    currency: demoProfile.currency,
    invoices: { total: demoInvoices.length, paid: paid.length, unpaid: open.length, recent: 3, byStatus: invoiceCounts },
    quotations: {
      total: demoQuotations.length,
      pending: quotationCounts.sent ?? 0,
      accepted: quotationCounts.accepted ?? 0,
      rejected: quotationCounts.rejected ?? 0,
      recent: 2,
      byStatus: quotationCounts,
    },
    revenue: { total: totalOf(issued), paid: totalOf(paid), pending: totalOf(open) },
    receivables: {
      current: totalOf(open) - totalOf(overdue),
      overdue: totalOf(overdue),
      openCount: open.length,
      overdueCount: overdue.length,
    },
  };

  return {
    ...stats,
    currencies: [demoProfile.currency],
    byCurrency: { [demoProfile.currency]: stats },
    converted: { [demoProfile.currency]: { stats, rates: [], missing: [] } },
    statusCounts: { invoice: invoiceCounts, quotation: quotationCounts },
  };
}
