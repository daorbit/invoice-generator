import { text } from './document-input.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export type SortField = 'date' | 'number' | 'total' | 'status';

export interface PageQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface ListQuery extends PageQuery {
  status?: string;
  sortBy: SortField;
  sortOrder: 1 | -1;
}

function positiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function readPageQuery(query: Record<string, unknown>): PageQuery {
  return {
    page: positiveInt(query.page, 1),
    limit: Math.min(positiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT),
    search: text(query.search, 100) || undefined,
  };
}

export function readListQuery(query: Record<string, unknown>, statuses: readonly string[]): ListQuery {
  const status = text(query.status, 20);
  const sortBy = text(query.sortBy, 10) as SortField;
  return {
    ...readPageQuery(query),
    status: statuses.includes(status) ? status : undefined,
    sortBy: ['date', 'number', 'total', 'status'].includes(sortBy) ? sortBy : 'date',
    sortOrder: query.sortOrder === 'asc' ? 1 : -1,
  };
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function readLimit(value: unknown, fallback: number, max: number): number {
  return Math.min(positiveInt(value, fallback), max);
}
