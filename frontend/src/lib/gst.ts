import type { DocumentDraft } from '@/types/document';

export const GST_STATES: { value: string; label: string }[] = [
  ['01', 'Jammu and Kashmir'],
  ['02', 'Himachal Pradesh'],
  ['03', 'Punjab'],
  ['04', 'Chandigarh'],
  ['05', 'Uttarakhand'],
  ['06', 'Haryana'],
  ['07', 'Delhi'],
  ['08', 'Rajasthan'],
  ['09', 'Uttar Pradesh'],
  ['10', 'Bihar'],
  ['11', 'Sikkim'],
  ['12', 'Arunachal Pradesh'],
  ['13', 'Nagaland'],
  ['14', 'Manipur'],
  ['15', 'Mizoram'],
  ['16', 'Tripura'],
  ['17', 'Meghalaya'],
  ['18', 'Assam'],
  ['19', 'West Bengal'],
  ['20', 'Jharkhand'],
  ['21', 'Odisha'],
  ['22', 'Chhattisgarh'],
  ['23', 'Madhya Pradesh'],
  ['24', 'Gujarat'],
  ['26', 'Dadra and Nagar Haveli and Daman and Diu'],
  ['27', 'Maharashtra'],
  ['29', 'Karnataka'],
  ['30', 'Goa'],
  ['31', 'Lakshadweep'],
  ['32', 'Kerala'],
  ['33', 'Tamil Nadu'],
  ['34', 'Puducherry'],
  ['35', 'Andaman and Nicobar Islands'],
  ['36', 'Telangana'],
  ['37', 'Andhra Pradesh'],
  ['38', 'Ladakh'],
  ['96', 'Outside India'],
  ['97', 'Other Territory'],
].map(([value, label]) => ({ value, label: `${label} (${value})` }));

const STATE_NAMES = new Map(GST_STATES.map((state) => [state.value, state.label]));

export const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28];
export const COMMON_TAX_RATES = [0, 5, 10, 15, 20];

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

export function stateLabel(code: string | undefined): string {
  return code ? STATE_NAMES.get(code) ?? '' : '';
}

export function stateOfGstin(gstin: string | undefined): string {
  const code = gstin?.slice(0, 2) ?? '';
  return STATE_NAMES.has(code) ? code : '';
}

export function isGstDocument(draft: Pick<DocumentDraft, 'currency' | 'from'>): boolean {
  return draft.currency === 'INR' && Boolean(draft.from.gstin);
}

export function placeOfSupply(draft: DocumentDraft): string {
  if (draft.exportUnderLut) return '96';
  return draft.placeOfSupply || stateOfGstin(draft.client.gstin) || stateOfGstin(draft.from.gstin);
}

export function isInterState(draft: DocumentDraft): boolean {
  if (draft.exportUnderLut) return true;
  const seller = stateOfGstin(draft.from.gstin);
  const supply = placeOfSupply(draft);
  return Boolean(seller && supply && seller !== supply);
}

export function taxRatesFor(draft: Pick<DocumentDraft, 'currency' | 'from'>): number[] {
  return isGstDocument(draft) ? GST_RATES : COMMON_TAX_RATES;
}

export function rateLabel(rate: number): string {
  return `${Number(rate.toFixed(2))}%`;
}
