import { rateLine } from '@/lib/fx';
import type { ConvertedStats } from '@/types/document';

export function conversionNote({ stats, rates, missing }: ConvertedStats): string {
  const parts = [
    rates.length ? `Converted at ${rates.map(({ currency, rate }) => rateLine(currency, stats.currency, rate)).join(', ')}` : '',
    missing.length ? `${missing.join(', ')} not included, no exchange rate yet` : '',
  ];
  return parts.filter(Boolean).join(' · ');
}
