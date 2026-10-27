import type { AccentId, TemplateId } from '@/types/document';

export const TEMPLATE_OPTIONS: { id: TemplateId; label: string; description: string }[] = [
  { id: 'classic', label: 'Classic', description: 'Clean lines with your colour on the details' },
  { id: 'modern', label: 'Modern', description: 'A colour band across the top' },
  { id: 'minimal', label: 'Minimal', description: 'Light type and plenty of white space' },
  { id: 'bold', label: 'Bold', description: 'A dark header with your colour on the total' },
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
