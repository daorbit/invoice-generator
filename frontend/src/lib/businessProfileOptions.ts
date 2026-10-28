import { TEMPLATE_OPTIONS } from './designOptions';

export const MAX_PAYMENT_TERMS_DAYS = 365;

export const MAX_LOGO_BYTES = 300 * 1024;

export const LOGO_ACCEPT = 'image/png,image/jpeg,image/svg+xml';

export const TEMPLATE_SELECT = TEMPLATE_OPTIONS.map((option) => ({ value: option.id, label: option.label }));

export function sampleNumber(prefix: string, fallback: string): string {
  return `${prefix.trim() || fallback}-0001`;
}
