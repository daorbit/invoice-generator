export const DOCS_BASE = 'https://quantalog.daorbit.in/docs';

export const DOCS = {
  invoicing: '/quantalog-invoicing',
} as const;

export function docsUrl(path: string): string {
  return `${DOCS_BASE}${path}`;
}
