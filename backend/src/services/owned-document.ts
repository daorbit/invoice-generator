import { isValidObjectId } from 'mongoose';
import { notFoundError } from '../lib/http-error.js';

export function ownedFilter(workspaceId: string, id: string, label: string) {
  if (!isValidObjectId(id)) throw notFoundError(label);
  return { _id: id, workspaceId };
}

export function paginate(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
