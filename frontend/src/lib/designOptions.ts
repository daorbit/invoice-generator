import type { AccentId, TemplateId } from '@/types/document';

export const TEMPLATE_OPTIONS: { id: TemplateId; label: string; description: string }[] = [
  { id: 'classic', label: 'Standard', description: 'Big title and balance due, coloured table header' },
  { id: 'modern', label: 'Spreadsheet', description: 'Everything in a crisp grid, great for long item lists' },
  { id: 'minimal', label: 'Minimalist', description: 'Large light type and plenty of white space' },
  { id: 'bold', label: 'Grand', description: 'A bold colour header with the amount due up front' },
];

export const ACCENT_OPTIONS: { id: AccentId; label: string }[] = [
  { id: 'blue', label: 'Blue' },
  { id: 'indigo', label: 'Indigo' },
  { id: 'teal', label: 'Teal' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'amber', label: 'Amber' },
  { id: 'crimson', label: 'Crimson' },
  { id: 'slate', label: 'Slate' },
];
