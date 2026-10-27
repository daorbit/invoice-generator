import { Invoice } from '../../models/invoice.model.js';
import type { ReportPeriod } from '../../lib/report-period.js';
import { round2 } from '../../lib/totals.js';
import { DAY_MS, paidInvoices } from './report-filters.js';

const PAYMENT_LIMIT = 500;

export async function paymentsReport(workspaceId: string, period: ReportPeriod) {
  const docs = await Invoice.find(paidInvoices(workspaceId, period))
    .select('invoiceNumber billTo.name customerId invoiceDate paidAt updatedAt total')
    .sort({ paidAt: -1, updatedAt: -1 })
    .limit(PAYMENT_LIMIT)
    .lean();

  const payments = docs.map((doc) => {
    const paidOn = doc.paidAt ?? doc.updatedAt;
    const issued = doc.invoiceDate;
    return {
      id: String(doc._id),
      number: doc.invoiceNumber,
      client: doc.billTo?.name ?? '',
      customerId: doc.customerId ?? null,
      invoiceDate: issued?.toISOString() ?? null,
      paidAt: paidOn.toISOString(),
      amount: round2(doc.total ?? 0),
      daysToPay: issued ? Math.max(0, Math.round((paidOn.getTime() - issued.getTime()) / DAY_MS)) : null,
    };
  });

  const timed = payments.filter((payment) => payment.daysToPay !== null);
  return {
    payments,
    total: round2(payments.reduce((sum, payment) => sum + payment.amount, 0)),
    averageDaysToPay: timed.length
      ? Math.round(timed.reduce((sum, payment) => sum + (payment.daysToPay ?? 0), 0) / timed.length)
      : null,
    truncated: docs.length === PAYMENT_LIMIT,
  };
}
