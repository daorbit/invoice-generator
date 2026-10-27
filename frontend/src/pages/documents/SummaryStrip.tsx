import { StatStrip, type StatCell } from '@/components/ui/StatStrip';
import { formatMoney } from '@/lib/format';
import type { DashboardStats } from '@/types/document';

function cells(stats: DashboardStats, currency: string): StatCell[] {
  return [
    { label: 'Paid', value: formatMoney(stats.revenue.paid, currency), hint: `${stats.invoices.paid} invoices`, tone: 'money' },
    { label: 'Outstanding', value: formatMoney(stats.revenue.pending, currency), hint: `${stats.invoices.unpaid} unpaid` },
    { label: 'Invoices', value: String(stats.invoices.total), hint: `${stats.invoices.recent} in the last 30 days` },
    { label: 'Open quotations', value: String(stats.quotations.pending), hint: `${stats.quotations.accepted} accepted` },
  ];
}

export function SummaryStrip({ stats, currency }: { stats: DashboardStats | null; currency: string }) {
  return <StatStrip cells={stats ? cells(stats, currency) : null} />;
}
