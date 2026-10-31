import { DAY_MS } from './dates.js';

export type DueField = 'dueDate' | 'validUntil';

export interface LapseRule {
  field: DueField;
  lapsed: string;
}

export const INVOICE_LAPSE: LapseRule = { field: 'dueDate', lapsed: 'overdue' };
export const QUOTATION_LAPSE: LapseRule = { field: 'validUntil', lapsed: 'expired' };

export function pastDueCutoff(now = new Date()): Date {
  return new Date(now.getTime() - DAY_MS);
}

export function isLapsed(date: Date | null | undefined, cutoff = pastDueCutoff()): boolean {
  return Boolean(date && date < cutoff);
}

export function effectiveStatus(
  status: string | null | undefined,
  date: Date | null | undefined,
  rule: LapseRule,
  cutoff = pastDueCutoff()
): string {
  const current = status ?? 'draft';
  return current === 'sent' && isLapsed(date, cutoff) ? rule.lapsed : current;
}

export function stillOpenMatch(rule: LapseRule, cutoff: Date): Record<string, unknown> {
  return { $or: [{ [rule.field]: null }, { [rule.field]: { $gte: cutoff } }] };
}

export function statusMatch(status: string, rule: LapseRule, cutoff: Date): Record<string, unknown> {
  if (status === rule.lapsed) {
    return { $or: [{ status: rule.lapsed }, { status: 'sent', [rule.field]: { $lt: cutoff } }] };
  }
  if (status === 'sent') return { status: 'sent', ...stillOpenMatch(rule, cutoff) };
  return { status };
}

export function effectiveStatusExpr(rule: LapseRule, cutoff: Date) {
  const date = { $ifNull: [`$${rule.field}`, null] };
  return {
    $cond: [
      { $and: [{ $eq: ['$status', 'sent'] }, { $ne: [date, null] }, { $lt: [date, cutoff] }] },
      rule.lapsed,
      '$status',
    ],
  };
}
