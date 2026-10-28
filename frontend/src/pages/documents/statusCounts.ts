import type { DashboardStats, DocumentKind, DocumentStatus } from '@/types/document';

export type StatusCounts = Partial<Record<DocumentStatus, number>>;

export function statusCounts(stats: DashboardStats | null, kind: DocumentKind): StatusCounts | null {
  if (!stats) return null;
  return stats.statusCounts?.[kind] ?? (kind === 'invoice' ? stats.invoices.byStatus : stats.quotations.byStatus) ?? null;
}
