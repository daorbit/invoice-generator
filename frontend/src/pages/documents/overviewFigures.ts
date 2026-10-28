import type { MeterSegment } from '@/components/ui/SplitMeter';
import { formatCompactMoney, formatMoney, plural } from '@/lib/format';
import type { CurrencyDashboardStats, DocumentKind } from '@/types/document';

export interface OverviewFigure {
  label: string;
  value: string;
  hint: string;
  tone?: 'money';
}

export interface OverviewModel {
  eyebrow: string;
  headline: string;
  headlineFull?: string;
  caption: string;
  segments: MeterSegment[];
  meterLabel: string;
  figures: OverviewFigure[];
}

function invoiceOverview(stats: CurrencyDashboardStats): OverviewModel {
  const money = (value: number) => formatCompactMoney(value, stats.currency);
  const receivables = stats.receivables;
  const owed = receivables.current + receivables.overdue;
  const drafts = stats.invoices.byStatus?.draft ?? 0;

  return {
    eyebrow: 'Total receivables',
    headline: money(owed),
    headlineFull: formatMoney(owed, stats.currency),
    caption: receivables.openCount
      ? `${plural(receivables.openCount, 'unpaid invoice')}${receivables.overdueCount ? `, ${receivables.overdueCount} past due` : ''}`
      : 'Nothing waiting to be paid',
    meterLabel: 'Current and overdue receivables',
    segments: [
      { key: 'current', label: 'Current', value: receivables.current, display: money(receivables.current), tone: 'accent' },
      { key: 'overdue', label: 'Overdue', value: receivables.overdue, display: money(receivables.overdue), tone: 'bad' },
    ],
    figures: [
      { label: 'Collected', value: money(stats.revenue.paid), hint: plural(stats.invoices.paid, 'paid invoice'), tone: 'money' },
      { label: 'Drafts', value: String(drafts), hint: drafts ? 'Not sent yet' : 'All invoices are sent' },
    ],
  };
}

function quotationOverview(stats: CurrencyDashboardStats): OverviewModel {
  const { pending, accepted, rejected, total } = stats.quotations;
  const expired = stats.quotations.byStatus?.expired ?? 0;
  const decided = accepted + rejected;
  const winRate = decided ? Math.round((accepted / decided) * 100) : 0;

  return {
    eyebrow: 'Open quotations',
    headline: String(pending),
    caption: total ? `${plural(total, 'quotation')} in total` : 'No quotations yet',
    meterLabel: 'Quotation outcomes',
    segments: [
      { key: 'accepted', label: 'Accepted', value: accepted, display: String(accepted), tone: 'good' },
      { key: 'open', label: 'Open', value: pending, display: String(pending), tone: 'accent' },
      { key: 'declined', label: 'Declined', value: rejected, display: String(rejected), tone: 'bad' },
    ],
    figures: [
      { label: 'Win rate', value: decided ? `${winRate}%` : '—', hint: decided ? `${accepted} of ${decided} decided` : 'No answers yet' },
      { label: 'Expired', value: String(expired), hint: 'Past their valid date' },
    ],
  };
}

export function overviewFor(kind: DocumentKind, stats: CurrencyDashboardStats): OverviewModel {
  return kind === 'invoice' ? invoiceOverview(stats) : quotationOverview(stats);
}
