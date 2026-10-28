import type { MeterSegment } from '@/components/ui/SplitMeter';
import { formatMoney, plural } from '@/lib/format';
import type { DashboardStats, DocumentKind } from '@/types/document';

export interface OverviewFigure {
  label: string;
  value: string;
  hint: string;
  tone?: 'money';
}

export interface OverviewModel {
  eyebrow: string;
  headline: string;
  caption: string;
  segments: MeterSegment[];
  meterLabel: string;
  figures: OverviewFigure[];
}

function invoiceOverview(stats: DashboardStats, currency: string): OverviewModel {
  const money = (value: number) => formatMoney(value, currency);
  const receivables = stats.receivables ?? {
    current: stats.revenue.pending,
    overdue: 0,
    openCount: stats.invoices.unpaid,
    overdueCount: 0,
  };
  const drafts = stats.invoices.byStatus?.draft ?? 0;

  return {
    eyebrow: 'Total receivables',
    headline: money(receivables.current + receivables.overdue),
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

function quotationOverview(stats: DashboardStats): OverviewModel {
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

export function overviewFor(kind: DocumentKind, stats: DashboardStats, currency: string): OverviewModel {
  return kind === 'invoice' ? invoiceOverview(stats, currency) : quotationOverview(stats);
}
