import type { GstReport, OverviewReport, PaymentsReport, ReceivablesReport, SalesReport } from '@/types/report';
import type { InvoiceRecord } from '@/types/document';
import { demoInvoices, demoQuotations } from './demoDocuments';

const issued = demoInvoices.filter((r) => ['sent', 'paid', 'overdue'].includes(r.status));
const total = (r: InvoiceRecord) => r.invoice.total ?? 0;
const taxable = (r: InvoiceRecord) => r.invoice.taxableAmount ?? 0;
const tax = (r: InvoiceRecord) => r.invoice.taxAmount ?? 0;
const sumOf = (rows: InvoiceRecord[], pick: (r: InvoiceRecord) => number) => rows.reduce((a, r) => a + pick(r), 0);
const countAmount = (rows: InvoiceRecord[]) => ({ count: rows.length, amount: sumOf(rows, total) });

function monthKey(iso: string | null): string {
  return (iso ?? '').slice(0, 7);
}

export function demoOverview(): OverviewReport {
  const paid = issued.filter((r) => r.status === 'paid');
  const open = issued.filter((r) => r.status !== 'paid');
  const accepted = demoQuotations.filter((q) => q.quotation.status === 'accepted');
  const months = new Map<string, { invoiced: number; collected: number }>();
  for (const r of issued) {
    const key = monthKey(r.invoice.invoiceDate);
    const row = months.get(key) ?? { invoiced: 0, collected: 0 };
    row.invoiced += total(r);
    if (r.status === 'paid') row.collected += total(r);
    months.set(key, row);
  }
  return {
    invoiced: countAmount(issued),
    collected: countAmount(paid),
    outstanding: countAmount(open),
    overdue: countAmount(open.filter((r) => r.status === 'overdue')),
    quotations: {
      count: demoQuotations.length,
      amount: demoQuotations.reduce((a, q) => a + (q.quotation.total ?? 0), 0),
      accepted: accepted.length,
      acceptedAmount: accepted.reduce((a, q) => a + (q.quotation.total ?? 0), 0),
      conversion: Math.round((accepted.length / demoQuotations.length) * 100),
    },
    monthly: [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, ...v })),
  };
}

const EMPTY_AGING = { current: 0, days1to15: 0, days16to30: 0, days31to45: 0, over45: 0 };

export function demoReceivables(): ReceivablesReport {
  const open = issued.filter((r) => r.status !== 'paid');
  const customers = open.map((r) => {
    const overdue = r.status === 'overdue';
    return {
      ...EMPTY_AGING,
      current: overdue ? 0 : total(r),
      days16to30: overdue ? total(r) : 0,
      key: r.invoice.customerId ?? r.id,
      name: r.invoice.billTo.name,
      customerId: r.invoice.customerId ?? null,
      invoices: 1,
      total: total(r),
    };
  });
  const totals = customers.reduce(
    (acc, row) => ({
      current: acc.current + row.current,
      days1to15: 0,
      days16to30: acc.days16to30 + row.days16to30,
      days31to45: 0,
      over45: 0,
      total: acc.total + row.total,
    }),
    { ...EMPTY_AGING, total: 0 },
  );
  return { customers, totals, truncated: false };
}

export function demoSales(by: string): SalesReport {
  if (by === 'item') {
    const items = new Map<string, { key: string; name: string; hsn: string; unit: string; quantity: number; amount: number; lines: number }>();
    for (const r of issued) {
      for (const line of r.invoice.items) {
        const key = line.itemId ?? line.description;
        const row = items.get(key) ?? { key, name: line.description, hsn: line.hsn ?? '', unit: line.unit ?? '', quantity: 0, amount: 0, lines: 0 };
        row.quantity += line.quantity;
        row.amount += line.amount;
        row.lines += 1;
        items.set(key, row);
      }
    }
    return { by: 'item', items: [...items.values()].sort((a, b) => b.amount - a.amount), truncated: false };
  }
  const customers = new Map<string, { key: string; name: string; customerId: string | null; invoices: number; taxable: number; amount: number; paid: number; outstanding: number }>();
  for (const r of issued) {
    const key = r.invoice.customerId ?? r.id;
    const row = customers.get(key) ?? { key, name: r.invoice.billTo.name, customerId: r.invoice.customerId ?? null, invoices: 0, taxable: 0, amount: 0, paid: 0, outstanding: 0 };
    row.invoices += 1;
    row.taxable += taxable(r);
    row.amount += total(r);
    if (r.status === 'paid') row.paid += total(r);
    else row.outstanding += total(r);
    customers.set(key, row);
  }
  return { by: 'customer', customers: [...customers.values()].sort((a, b) => b.amount - a.amount), truncated: false };
}

export function demoPayments(): PaymentsReport {
  const payments = issued
    .filter((r) => r.status === 'paid' && r.invoice.paidAt)
    .map((r) => ({
      id: r.id,
      number: r.invoice.invoiceNumber,
      client: r.invoice.billTo.name,
      customerId: r.invoice.customerId ?? null,
      invoiceDate: r.invoice.invoiceDate,
      paidAt: r.invoice.paidAt as string,
      amount: total(r),
      daysToPay: 9,
    }));
  return { payments, total: payments.reduce((a, p) => a + p.amount, 0), averageDaysToPay: 9, truncated: false };
}

function split(rows: InvoiceRecord[]) {
  const inter = rows.filter((r) => r.invoice.interState);
  const intra = rows.filter((r) => !r.invoice.interState);
  const intraTax = sumOf(intra, tax);
  return {
    taxable: sumOf(rows, taxable),
    igst: sumOf(inter, tax),
    cgst: intraTax / 2,
    sgst: intraTax / 2,
    tax: sumOf(rows, tax),
  };
}

export function demoGst(): GstReport {
  const b2b = issued.filter((r) => r.invoice.billTo.gstin);
  const b2c = issued.filter((r) => !r.invoice.billTo.gstin);
  return {
    summary: { ...split(issued), invoices: issued.length },
    byRate: [{ ...split(issued), rate: 18 }],
    b2b: { ...split(b2b), count: b2b.length },
    b2c: { ...split(b2c), count: b2c.length },
    invoices: issued.map((r) => ({
      ...split([r]),
      id: r.id,
      number: r.invoice.invoiceNumber,
      date: r.invoice.invoiceDate,
      client: r.invoice.billTo.name,
      gstin: r.invoice.billTo.gstin ?? '',
      placeOfSupply: r.invoice.placeOfSupply ?? '',
      interState: r.invoice.interState ?? false,
      reverseCharge: false,
      exportUnderLut: false,
      total: total(r),
    })),
    truncated: false,
  };
}
