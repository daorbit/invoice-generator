import type { DocumentKind } from '@/types/document';

const DRAFT_PROMPTS: Record<DocumentKind, string[]> = {
  invoice: [
    'Invoice Acme Pvt Ltd for 3 days of consulting at 8,000 a day, due in 15 days',
    'Website design 45,000 and hosting 6,000 for a year, 18% GST',
    'Monthly retainer of 25,000, due on receipt',
  ],
  quotation: [
    'Quote for a 5-page website at 60,000, valid for 30 days',
    '200 printed brochures at 18 each plus 1,500 delivery',
    'Social media management for 3 months at 20,000 a month',
  ],
};

const EDIT_PROMPTS = ['Give 10% off', 'Make it due in 15 days', 'Write payment terms for a 50% advance'];

export function draftPrompts(kind: DocumentKind): string[] {
  return DRAFT_PROMPTS[kind];
}

export function editPrompts(): string[] {
  return EDIT_PROMPTS;
}
