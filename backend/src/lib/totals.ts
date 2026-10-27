import type { DiscountType, LineItem, TaxLine, TaxMode, Totals } from '../models/document-parts.js';

export interface PricingInput {
  items: LineItem[];
  tax: number;
  discount: number;
  discountType: DiscountType;
  shipping: number;
  taxMode?: TaxMode;
  pricesIncludeTax?: boolean;
  roundOff?: boolean;
  exportUnderLut?: boolean;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function documentTotals(input: PricingInput, subtotal: number): Totals {
  const taxAmount = (subtotal * input.tax) / 100;
  const discountAmount =
    input.discountType === 'percentage' ? (subtotal * input.discount) / 100 : input.discount;
  const total = subtotal + taxAmount - discountAmount + input.shipping;

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    taxableAmount: round2(subtotal),
    taxAmount: round2(taxAmount),
    roundOffAmount: 0,
    total: round2(total),
    taxLines: taxAmount > 0 ? [{ rate: input.tax, taxable: round2(subtotal), tax: round2(taxAmount) }] : [],
  };
}

function lineTotals(input: PricingInput, subtotal: number): Totals {
  const requested = input.discountType === 'percentage' ? (subtotal * input.discount) / 100 : input.discount;
  const discountAmount = Math.min(Math.max(requested, 0), subtotal);
  const byRate = new Map<number, { taxable: number; tax: number }>();
  let taxable = 0;
  let tax = 0;

  for (const item of input.items) {
    const share = subtotal > 0 ? item.amount / subtotal : 0;
    const net = item.amount - discountAmount * share;
    const rate = input.exportUnderLut ? 0 : item.taxRate ?? 0;
    const lineTaxable = input.pricesIncludeTax ? net / (1 + rate / 100) : net;
    const lineTax = input.pricesIncludeTax ? net - lineTaxable : (lineTaxable * rate) / 100;
    const bucket = byRate.get(rate) ?? { taxable: 0, tax: 0 };
    bucket.taxable += lineTaxable;
    bucket.tax += lineTax;
    byRate.set(rate, bucket);
    taxable += lineTaxable;
    tax += lineTax;
  }

  const taxableAmount = round2(taxable);
  const taxAmount = round2(tax);
  const beforeRounding = taxableAmount + taxAmount + input.shipping;
  const roundOffAmount = input.roundOff ? round2(Math.round(beforeRounding) - beforeRounding) : 0;
  const taxLines: TaxLine[] = [...byRate.entries()]
    .filter(([, bucket]) => bucket.taxable !== 0 || bucket.tax !== 0)
    .sort(([a], [b]) => a - b)
    .map(([rate, bucket]) => ({ rate, taxable: round2(bucket.taxable), tax: round2(bucket.tax) }));

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    taxableAmount,
    taxAmount,
    roundOffAmount,
    total: round2(beforeRounding + roundOffAmount),
    taxLines,
  };
}

export function computeTotals(input: PricingInput): Totals {
  const subtotal = input.items.reduce((sum, item) => sum + item.amount, 0);
  return input.taxMode === 'line' ? lineTotals(input, subtotal) : documentTotals(input, subtotal);
}
