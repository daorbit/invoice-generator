import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { DocumentStatus, InvoiceRecord, QuotationRecord } from '@/types/document';
import { demoCustomers, demoItems } from './demoCatalog';
import { demoInvoices, demoQuotations } from './demoDocuments';
import { demoProfile } from './demoProfile';
import { demoGst, demoOverview, demoPayments, demoReceivables, demoSales } from './demoReports';
import { demoDashboardStats } from './demoStats';

export const DEMO_READ_ONLY_MESSAGE = 'Changes are turned off in the live demo.';

type Params = Record<string, string | number | undefined>;

function page<T>(rows: T[], params: Params) {
  const limit = Number(params.limit) || 20;
  const current = Number(params.page) || 1;
  const start = (current - 1) * limit;
  return { rows: rows.slice(start, start + limit), total: rows.length, page: current, limit, totalPages: Math.max(1, Math.ceil(rows.length / limit)) };
}

function matches(text: string, search: unknown): boolean {
  return typeof search !== 'string' || !search || text.toLowerCase().includes(search.toLowerCase());
}

function invoiceList(params: Params) {
  const rows = demoInvoices.filter(
    (r) => (!params.status || r.status === params.status) && matches(`${r.invoice.invoiceNumber} ${r.invoice.billTo.name}`, params.search),
  );
  const { rows: invoices, ...rest } = page(rows, params);
  return { invoices, ...rest };
}

function quotationList(params: Params) {
  const rows = demoQuotations.filter(
    (r) =>
      (!params.status || r.quotation.status === (params.status as DocumentStatus)) &&
      matches(`${r.quotation.quotationNumber} ${r.quotation.quoteTo.name}`, params.search),
  );
  const { rows: quotations, ...rest } = page(rows, params);
  return { quotations, ...rest };
}

function customersWithOutstanding() {
  return demoCustomers.map((c) => ({
    ...c,
    outstanding: demoInvoices
      .filter((r) => r.invoice.customerId === c.id)
      .reduce((a, r) => a + (r.invoice.balanceDue ?? 0), 0),
  }));
}

function customerDetail(id: string) {
  const customer = customersWithOutstanding().find((c) => c.id === id);
  if (!customer) return undefined;
  const invoices: InvoiceRecord[] = demoInvoices.filter((r) => r.invoice.customerId === id);
  const quotations: QuotationRecord[] = demoQuotations.filter((r) => r.quotation.customerId === id);
  const paid = invoices.filter((r) => r.status === 'paid').reduce((a, r) => a + (r.invoice.total ?? 0), 0);
  const invoiced = invoices.filter((r) => r.status !== 'draft' && r.status !== 'cancelled').reduce((a, r) => a + (r.invoice.total ?? 0), 0);
  const overdue = invoices.filter((r) => r.status === 'overdue').reduce((a, r) => a + (r.invoice.balanceDue ?? 0), 0);
  return { customer, stats: { invoiced, paid, outstanding: customer.outstanding, overdue, invoices: invoices.length }, invoices, quotations };
}

function catalogPage<T>(key: string, rows: T[], params: Params, text: (row: T) => string) {
  const { rows: list, total, page: current, totalPages } = page(rows.filter((r) => matches(text(r), params.search)), params);
  return { [key]: list, total, page: current, totalPages };
}

function read(path: string, params: Params): unknown {
  if (path === '/settings') return { profile: demoProfile, complete: true };
  if (path === '/dashboard/stats') return { success: true, data: demoDashboardStats() };
  if (path === '/invoices') return invoiceList(params);
  if (path === '/quotations') return quotationList(params);
  if (path.startsWith('/invoices/')) return demoInvoices.find((r) => r.id === path.split('/')[2]);
  if (path.startsWith('/quotations/')) return demoQuotations.find((r) => r.id === path.split('/')[2]);
  if (path === '/customers') return catalogPage('customers', customersWithOutstanding(), params, (c) => `${c.name} ${c.email}`);
  if (path.startsWith('/customers/')) return customerDetail(path.split('/')[2]);
  if (path === '/items') return catalogPage('items', demoItems, params, (i) => `${i.name} ${i.description}`);
  if (path === '/reports/overview') return demoOverview();
  if (path === '/reports/receivables') return demoReceivables();
  if (path === '/reports/sales') return demoSales(String(params.by ?? 'customer'));
  if (path === '/reports/payments') return demoPayments();
  if (path === '/reports/gst') return demoGst();
  return undefined;
}

function respond(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: status === 200 ? 'OK' : 'Error', headers: {}, config };
}

function fail(config: InternalAxiosRequestConfig, status: number, message: string): never {
  throw new AxiosError(message, String(status), config, null, respond(config, { message }, status));
}

export async function demoAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method ?? 'get').toLowerCase();
  if (method !== 'get') fail(config, 403, DEMO_READ_ONLY_MESSAGE);
  const path = (config.url ?? '').split('?')[0];
  const data = read(path, (config.params ?? {}) as Params);
  if (data === undefined) fail(config, 404, 'Not found in the demo.');
  return respond(config, data);
}
