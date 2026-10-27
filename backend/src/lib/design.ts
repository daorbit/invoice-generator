export const TEMPLATES = ['classic', 'modern', 'minimal', 'bold'] as const;
export type TemplateId = (typeof TEMPLATES)[number];

export const ACCENTS = ['blue', 'indigo', 'teal', 'emerald', 'amber', 'crimson', 'slate'] as const;
export type AccentId = (typeof ACCENTS)[number];

export function readTemplate(value: unknown, fallback: TemplateId = 'classic'): TemplateId {
  return (TEMPLATES as readonly string[]).includes(value as string) ? (value as TemplateId) : fallback;
}

export function readAccent(value: unknown, fallback: AccentId = 'blue'): AccentId {
  return (ACCENTS as readonly string[]).includes(value as string) ? (value as AccentId) : fallback;
}
