import { round2 } from '../lib/totals.js';
import type { FxRates } from './fx.service.js';
import type { CurrencyStats } from './dashboard.service.js';

type Counts = Record<string, number>;

export interface ConvertedStats {
  stats: CurrencyStats;
  rates: { currency: string; rate: number }[];
  missing: string[];
}

function perBase(currency: string, fx: FxRates): number | null {
  if (currency === fx.base) return 1;
  const rate = fx.rates[currency];
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

function conversionFactor(from: string, to: string, fx: FxRates | null): number | null {
  if (from === to) return 1;
  if (!fx) return null;
  const fromRate = perBase(from, fx);
  const toRate = perBase(to, fx);
  return fromRate === null || toRate === null ? null : toRate / fromRate;
}

function addCounts(into: Counts, from: Counts): Counts {
  const next = { ...into };
  for (const [status, count] of Object.entries(from)) next[status] = (next[status] ?? 0) + count;
  return next;
}

function emptyStats(currency: string): CurrencyStats {
  return {
    currency,
    invoices: { total: 0, paid: 0, unpaid: 0, recent: 0, byStatus: {} },
    quotations: { total: 0, pending: 0, accepted: 0, rejected: 0, recent: 0, byStatus: {} },
    revenue: { total: 0, paid: 0, pending: 0 },
    receivables: { current: 0, overdue: 0, openCount: 0, overdueCount: 0 },
  };
}

function merge(sum: CurrencyStats, entry: CurrencyStats, factor: number): CurrencyStats {
  const money = (value: number) => value * factor;
  return {
    currency: sum.currency,
    invoices: {
      total: sum.invoices.total + entry.invoices.total,
      paid: sum.invoices.paid + entry.invoices.paid,
      unpaid: sum.invoices.unpaid + entry.invoices.unpaid,
      recent: sum.invoices.recent + entry.invoices.recent,
      byStatus: addCounts(sum.invoices.byStatus, entry.invoices.byStatus),
    },
    quotations: {
      total: sum.quotations.total + entry.quotations.total,
      pending: sum.quotations.pending + entry.quotations.pending,
      accepted: sum.quotations.accepted + entry.quotations.accepted,
      rejected: sum.quotations.rejected + entry.quotations.rejected,
      recent: sum.quotations.recent + entry.quotations.recent,
      byStatus: addCounts(sum.quotations.byStatus, entry.quotations.byStatus),
    },
    revenue: {
      total: sum.revenue.total + money(entry.revenue.total),
      paid: sum.revenue.paid + money(entry.revenue.paid),
      pending: sum.revenue.pending + money(entry.revenue.pending),
    },
    receivables: {
      current: sum.receivables.current + money(entry.receivables.current),
      overdue: sum.receivables.overdue + money(entry.receivables.overdue),
      openCount: sum.receivables.openCount + entry.receivables.openCount,
      overdueCount: sum.receivables.overdueCount + entry.receivables.overdueCount,
    },
  };
}

function rounded(stats: CurrencyStats): CurrencyStats {
  return {
    ...stats,
    revenue: { total: round2(stats.revenue.total), paid: round2(stats.revenue.paid), pending: round2(stats.revenue.pending) },
    receivables: { ...stats.receivables, current: round2(stats.receivables.current), overdue: round2(stats.receivables.overdue) },
  };
}

export function convertStats(entries: CurrencyStats[], target: string, fx: FxRates | null): ConvertedStats {
  let sum = emptyStats(target);
  const rates: ConvertedStats['rates'] = [];
  const missing: string[] = [];

  for (const entry of entries) {
    const factor = conversionFactor(entry.currency, target, fx);
    if (factor === null) {
      missing.push(entry.currency);
      continue;
    }
    if (entry.currency !== target) rates.push({ currency: entry.currency, rate: factor });
    sum = merge(sum, entry, factor);
  }

  return { stats: rounded(sum), rates, missing };
}
