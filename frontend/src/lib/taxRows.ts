import type { DocumentDraft, LineItem } from '@/types/document';
import { isGstDocument, isInterState, rateLabel } from './gst';
import { round2, type DraftTotals } from './totals';

export type Row = [string, string];

export function taxRows(draft: DocumentDraft, totals: DraftTotals, money: (value: number) => string): Row[] {
  const gst = isGstDocument(draft);
  const inter = isInterState(draft);
  return totals.taxLines
    .filter((line) => line.tax > 0)
    .flatMap((line): Row[] => {
      if (!gst) return [[`Tax ${rateLabel(line.rate)}`, money(line.tax)]];
      if (inter) return [[`IGST ${rateLabel(line.rate)}`, money(line.tax)]];
      const cgst = round2(line.tax / 2);
      return [
        [`CGST ${rateLabel(line.rate / 2)}`, money(cgst)],
        [`SGST ${rateLabel(line.rate / 2)}`, money(round2(line.tax - cgst))],
      ];
    });
}

export function totalRows(draft: DocumentDraft, totals: DraftTotals, money: (value: number) => string): Row[] {
  const rows: Row[] = [[draft.pricesIncludeTax ? 'Sub Total (incl. tax)' : 'Sub Total', money(totals.subtotal)]];
  if (totals.discountAmount > 0) {
    const rate = draft.discountType === 'percentage' ? ` (${draft.discount}%)` : '';
    rows.push([`Discount${rate}`, `−${money(totals.discountAmount)}`]);
  }
  if (totals.taxAmount > 0 && (totals.discountAmount > 0 || draft.pricesIncludeTax)) {
    rows.push(['Taxable Amount', money(totals.taxableAmount)]);
  }
  rows.push(...taxRows(draft, totals, money));
  if (draft.shipping > 0) rows.push(['Shipping', money(draft.shipping)]);
  if (totals.roundOffAmount !== 0) {
    const sign = totals.roundOffAmount > 0 ? '+' : '−';
    rows.push(['Round Off', `${sign}${money(Math.abs(totals.roundOffAmount))}`]);
  }
  return rows;
}

function showsRates(draft: DocumentDraft): boolean {
  if (isGstDocument(draft)) return true;
  return new Set(draft.items.map((item) => item.taxRate)).size > 1;
}

export function lineMeta(draft: DocumentDraft): (item: LineItem) => string {
  const rates = showsRates(draft) && !draft.exportUnderLut;
  const label = isGstDocument(draft) ? 'GST' : 'Tax';
  return (item) =>
    [item.hsn ? `HSN/SAC ${item.hsn}` : '', rates ? `${label} ${rateLabel(item.taxRate ?? 0)}` : '']
      .filter(Boolean)
      .join(' · ');
}
