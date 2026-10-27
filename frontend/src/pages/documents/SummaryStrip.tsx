import { Skeleton } from '@mantine/core';
import { formatMoney } from '@/lib/format';
import type { DashboardStats } from '@/types/document';
import classes from './SummaryStrip.module.css';

interface Cell {
  label: string;
  value: string;
  hint: string;
  money?: boolean;
}

function cells(stats: DashboardStats, currency: string): Cell[] {
  return [
    { label: 'Paid', value: formatMoney(stats.revenue.paid, currency), hint: `${stats.invoices.paid} invoices`, money: true },
    { label: 'Outstanding', value: formatMoney(stats.revenue.pending, currency), hint: `${stats.invoices.unpaid} unpaid` },
    { label: 'Invoices', value: String(stats.invoices.total), hint: `${stats.invoices.recent} in the last 30 days` },
    {
      label: 'Open quotations',
      value: String(stats.quotations.pending),
      hint: `${stats.quotations.accepted} accepted`,
    },
  ];
}

export function SummaryStrip({ stats, currency }: { stats: DashboardStats | null; currency: string }) {
  return (
    <div className={classes.strip}>
      {stats
        ? cells(stats, currency).map((cell) => (
            <div key={cell.label} className={classes.cell}>
              <span className={classes.label}>{cell.label}</span>
              <span className={classes.value} data-tone={cell.money ? 'money' : undefined}>
                {cell.value}
              </span>
              <span className={classes.hint}>{cell.hint}</span>
            </div>
          ))
        : Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={classes.cell}>
              <Skeleton height={12} width={80} radius="sm" />
              <Skeleton height={22} width={120} radius="sm" mt={6} />
            </div>
          ))}
    </div>
  );
}
