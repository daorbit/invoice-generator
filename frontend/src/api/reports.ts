import { apiClient, call } from './client';
import type {
  GstReport,
  OverviewReport,
  PaymentsReport,
  ReceivablesReport,
  ReportRange,
  SalesGrouping,
  SalesReport,
} from '@/types/report';
import { timezone } from '@/lib/reportPeriods';

interface Scope {
  currency: string;
}

function params(scope: Scope, range?: ReportRange, extra: Record<string, string> = {}) {
  return { currency: scope.currency, timezone: timezone(), ...range, ...extra };
}

export function getOverview(scope: Scope, range: ReportRange): Promise<OverviewReport> {
  return call(() => apiClient.get<OverviewReport>('/reports/overview', { params: params(scope, range) }));
}

export function getReceivables(scope: Scope): Promise<ReceivablesReport> {
  return call(() => apiClient.get<ReceivablesReport>('/reports/receivables', { params: params(scope) }));
}

export function getSales(scope: Scope, range: ReportRange, by: SalesGrouping): Promise<SalesReport> {
  return call(() => apiClient.get<SalesReport>('/reports/sales', { params: params(scope, range, { by }) }));
}

export function getPayments(scope: Scope, range: ReportRange): Promise<PaymentsReport> {
  return call(() => apiClient.get<PaymentsReport>('/reports/payments', { params: params(scope, range) }));
}

export function getGst(scope: Scope, range: ReportRange): Promise<GstReport> {
  return call(() => apiClient.get<GstReport>('/reports/gst', { params: params(scope, range) }));
}
