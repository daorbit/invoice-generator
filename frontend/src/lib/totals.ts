import type { DocumentDraft, LineItem, TaxLine } from '@/types/document';

export interface DraftTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  roundOffAmount: number;
  total: number;
  balanceDue: number;
  taxLines: TaxLine[];
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineAmount(item: Pick<LineItem, 'quantity' | 'rate'>): number {
  return round2(item.quantity * item.rate);
}

export function computeTotals(draft: DocumentDraft): DraftTotals {
  const subtotal = draft.items.reduce((sum, item) => sum + lineAmount(item), 0);
  const requested = draft.discountType === 'percentage' ? (subtotal * draft.discount) / 100 : draft.discount;
  const discountAmount = Math.min(Math.max(requested, 0), subtotal);
  const byRate = new Map<number, { taxable: number; tax: number }>();
  let taxable = 0;
  let tax = 0;

  for (const item of draft.items) {
    const amount = lineAmount(item);
    const share = subtotal > 0 ? amount / subtotal : 0;
    const net = amount - discountAmount * share;
    const rate = draft.exportUnderLut ? 0 : item.taxRate ?? 0;
    const lineTaxable = draft.pricesIncludeTax ? net / (1 + rate / 100) : net;
    const lineTax = draft.pricesIncludeTax ? net - lineTaxable : (lineTaxable * rate) / 100;
    const bucket = byRate.get(rate) ?? { taxable: 0, tax: 0 };
    bucket.taxable += lineTaxable;
    bucket.tax += lineTax;
    byRate.set(rate, bucket);
    taxable += lineTaxable;
    tax += lineTax;
  }

  const taxableAmount = round2(taxable);
  const taxAmount = round2(tax);
  const beforeRounding = taxableAmount + taxAmount + draft.shipping;
  const roundOffAmount = draft.roundOff ? round2(Math.round(beforeRounding) - beforeRounding) : 0;
  const total = round2(beforeRounding + roundOffAmount);

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    taxableAmount,
    taxAmount,
    roundOffAmount,
    total,
    balanceDue: round2(total - (draft.kind === 'invoice' ? draft.amountPaid : 0)),
    taxLines: [...byRate.entries()]
      .filter(([, bucket]) => bucket.taxable !== 0 || bucket.tax !== 0)
      .sort(([a], [b]) => a - b)
      .map(([rate, bucket]) => ({ rate, taxable: round2(bucket.taxable), tax: round2(bucket.tax) })),
  };
}
