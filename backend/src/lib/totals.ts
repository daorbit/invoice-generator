import type { DiscountType, LineItem, Totals } from '../models/document-parts.js';

export interface PricingInput {
  items: LineItem[];
  tax: number;
  discount: number;
  discountType: DiscountType;
  shipping: number;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeTotals(input: PricingInput): Totals {
  const subtotal = input.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * input.tax) / 100;
  const discountAmount =
    input.discountType === 'percentage' ? (subtotal * input.discount) / 100 : input.discount;
  const total = subtotal + taxAmount - discountAmount + input.shipping;

  return {
    subtotal: round2(subtotal),
    taxAmount: round2(taxAmount),
    discountAmount: round2(discountAmount),
    total: round2(total),
  };
}
