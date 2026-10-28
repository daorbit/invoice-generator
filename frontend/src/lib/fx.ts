import { formatMoney } from '@/lib/format';

export function rateLine(from: string, to: string, rate: number): string {
  return rate >= 1 ? `1 ${from} = ${formatMoney(rate, to)}` : `1 ${to} = ${formatMoney(1 / rate, from)}`;
}
