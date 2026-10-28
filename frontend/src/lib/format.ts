import dayjs from 'dayjs';

const moneyFormats = new Map<string, Intl.NumberFormat>();

export function formatMoney(value: number, currency: string): string {
  let format = moneyFormats.get(currency);
  if (!format) {
    try {
      format = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : undefined, { style: 'currency', currency });
    } catch {
      format = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
    }
    moneyFormats.set(currency, format);
  }
  return format.format(value);
}

const compactFormats = new Map<string, Intl.NumberFormat>();

export function formatCompactMoney(value: number, currency: string): string {
  let format = compactFormats.get(currency);
  if (!format) {
    const options: Intl.NumberFormatOptions = { notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 1 };
    try {
      format = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : undefined, { ...options, style: 'currency', currency });
    } catch {
      format = new Intl.NumberFormat(undefined, { ...options, style: 'currency', currency: 'USD' });
    }
    compactFormats.set(currency, format);
  }
  return format.format(value);
}

export function formatDate(value: string | null | undefined): string {
  return value ? dayjs(value).format('D MMM YYYY') : '';
}

export function daysUntil(value: string): number {
  return dayjs(value).startOf('day').diff(dayjs().startOf('day'), 'day');
}

export function plural(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

export function todayIso(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function addDaysIso(days: number): string {
  return dayjs().add(days, 'day').format('YYYY-MM-DD');
}
