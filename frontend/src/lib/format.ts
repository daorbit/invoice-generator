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

export function formatDate(value: string | null | undefined): string {
  return value ? dayjs(value).format('D MMM YYYY') : '';
}

export function todayIso(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function addDaysIso(days: number): string {
  return dayjs().add(days, 'day').format('YYYY-MM-DD');
}
