const moneyFormats = new Map<string, Intl.NumberFormat>();

export function formatMoney(value: number, currency: string): string {
  let format = moneyFormats.get(currency);
  if (!format) {
    try {
      format = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency });
    } catch {
      format = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    }
    moneyFormats.set(currency, format);
  }
  return format.format(value);
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

export function formatDate(value: Date | null | undefined): string {
  return value ? dateFormat.format(value) : '';
}
