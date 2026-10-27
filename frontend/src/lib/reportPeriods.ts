import dayjs, { type Dayjs } from 'dayjs';
import type { ReportRange } from '@/types/report';

export type PeriodId = 'this-month' | 'last-month' | 'this-quarter' | 'this-fy' | 'last-fy' | 'last-12' | 'custom';

const FY_START_MONTH = 3;

function fiscalYearStart(at: Dayjs): Dayjs {
  const year = at.month() >= FY_START_MONTH ? at.year() : at.year() - 1;
  return dayjs(new Date(year, FY_START_MONTH, 1));
}

function quarterStart(at: Dayjs): Dayjs {
  return at.startOf('month').month(Math.floor(at.month() / 3) * 3);
}

export const PERIOD_OPTIONS: { id: Exclude<PeriodId, 'custom'>; label: string }[] = [
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'this-quarter', label: 'This quarter' },
  { id: 'this-fy', label: 'This financial year' },
  { id: 'last-fy', label: 'Last financial year' },
  { id: 'last-12', label: 'Last 12 months' },
];

export function rangeFor(id: Exclude<PeriodId, 'custom'>, now: Dayjs = dayjs()): [Dayjs, Dayjs] {
  switch (id) {
    case 'last-month': {
      const start = now.subtract(1, 'month').startOf('month');
      return [start, start.endOf('month')];
    }
    case 'this-quarter':
      return [quarterStart(now), quarterStart(now).add(2, 'month').endOf('month')];
    case 'this-fy':
      return [fiscalYearStart(now), fiscalYearStart(now).add(1, 'year').subtract(1, 'day').endOf('day')];
    case 'last-fy': {
      const start = fiscalYearStart(now).subtract(1, 'year');
      return [start, start.add(1, 'year').subtract(1, 'day').endOf('day')];
    }
    case 'last-12':
      return [now.subtract(11, 'month').startOf('month'), now.endOf('month')];
    default:
      return [now.startOf('month'), now.endOf('month')];
  }
}

export function toRange(start: Dayjs, end: Dayjs): ReportRange {
  return { from: start.startOf('day').toISOString(), to: end.endOf('day').toISOString() };
}

export function rangeLabel(range: ReportRange): string {
  const from = dayjs(range.from);
  const to = dayjs(range.to);
  const sameYear = from.year() === to.year();
  return `${from.format(sameYear ? 'D MMM' : 'D MMM YYYY')} – ${to.format('D MMM YYYY')}`;
}

export function monthsBetween(range: ReportRange): string[] {
  const months: string[] = [];
  let cursor = dayjs(range.from).startOf('month');
  const end = dayjs(range.to);
  while (!cursor.isAfter(end) && months.length < 60) {
    months.push(cursor.format('YYYY-MM'));
    cursor = cursor.add(1, 'month');
  }
  return months;
}

export function timezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
}

export function fileStamp(range: ReportRange): string {
  return `${dayjs(range.from).format('YYYY-MM-DD')}_to_${dayjs(range.to).format('YYYY-MM-DD')}`;
}
