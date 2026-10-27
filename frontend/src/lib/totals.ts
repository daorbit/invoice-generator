import type { DocumentDraft, LineItem } from '@/types/document';

export interface DraftTotals {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  balanceDue: number;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineAmount(item: Pick<LineItem, 'quantity' | 'rate'>): number {
  return round2(item.quantity * item.rate);
}

export function computeTotals(draft: DocumentDraft): DraftTotals {
  const subtotal = draft.items.reduce((sum, item) => sum + lineAmount(item), 0);
  const taxAmount = (subtotal * draft.tax) / 100;
  const discountAmount = draft.discountType === 'percentage' ? (subtotal * draft.discount) / 100 : draft.discount;
  const total = subtotal + taxAmount - discountAmount + draft.shipping;
  return {
    subtotal: round2(subtotal),
    taxAmount: round2(taxAmount),
    discountAmount: round2(discountAmount),
    total: round2(total),
    balanceDue: round2(total - (draft.kind === 'invoice' ? draft.amountPaid : 0)),
  };
}
