import { text } from './document-input.js';
import { badRequestError } from './http-error.js';

const MAX_SPAN_MS = 5 * 366 * 24 * 60 * 60 * 1000;
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export interface ReportScope {
  currency: string;
  timezone: string;
}

export interface ReportPeriod extends ReportScope {
  from: Date;
  to: Date;
}

function instant(value: unknown, label: string): Date {
  const parsed = new Date(text(value, 40));
  if (Number.isNaN(parsed.getTime())) throw badRequestError(`Pick a valid ${label} date`);
  return parsed;
}

function timezone(value: unknown): string {
  const zone = text(value, 64);
  if (!zone) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return zone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

export function readReportScope(query: Record<string, unknown>): ReportScope {
  const currency = text(query.currency, 3).toUpperCase();
  return {
    currency: /^[A-Z]{3}$/.test(currency) ? currency : 'INR',
    timezone: timezone(query.timezone),
  };
}

export function readReportPeriod(query: Record<string, unknown>): ReportPeriod {
  const from = instant(query.from, 'start');
  const to = instant(query.to, 'end');
  if (from >= to) throw badRequestError('The start date must be before the end date');
  if (to.getTime() - from.getTime() > MAX_SPAN_MS) throw badRequestError('Pick a range of five years or less');
  return { ...readReportScope(query), from, to };
}
