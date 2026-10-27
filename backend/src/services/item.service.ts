import { Item, type ItemDocument } from '../models/item.model.js';
import type { ItemInput } from '../lib/item-input.js';
import { escapeRegex, type PageQuery } from '../lib/list-query.js';
import { HttpError, notFoundError } from '../lib/http-error.js';
import { ownedFilter, paginate } from './owned-document.js';

const LABEL = 'Item';
const FIELDS = '-workspaceId -createdBy -nameKey';
const DUPLICATE_KEY = 11000;

type LeanItem = Partial<ItemDocument> & { _id: unknown };

function toItem(doc: LeanItem) {
  return {
    id: String(doc._id),
    name: doc.name ?? '',
    description: doc.description ?? '',
    kind: doc.kind ?? 'service',
    unit: doc.unit ?? '',
    rate: doc.rate ?? 0,
    hsn: doc.hsn ?? '',
    taxRate: doc.taxRate ?? 0,
    updatedAt: doc.updatedAt?.toISOString() ?? '',
  };
}

function duplicateName(error: unknown): never {
  if ((error as { code?: number })?.code === DUPLICATE_KEY) {
    throw new HttpError(409, 'duplicate', 'An item with this name already exists');
  }
  throw error;
}

export async function listItems(workspaceId: string, query: PageQuery) {
  const filter: Record<string, unknown> = { workspaceId };
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: pattern }, { hsn: pattern }, { description: pattern }];
  }
  const [docs, total] = await Promise.all([
    Item.find(filter)
      .select(FIELDS)
      .sort({ nameKey: 1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Item.countDocuments(filter),
  ]);
  return { items: docs.map(toItem), ...paginate(total, query.page, query.limit) };
}

export async function createItem(workspaceId: string, actorId: string | undefined, input: ItemInput) {
  const doc = await Item.create({ ...input, workspaceId, createdBy: actorId }).catch(duplicateName);
  return toItem(doc.toObject());
}

export async function updateItem(workspaceId: string, id: string, input: ItemInput) {
  const doc = await Item.findOneAndUpdate(ownedFilter(workspaceId, id, LABEL), { $set: input }, { new: true })
    .select(FIELDS)
    .lean()
    .catch(duplicateName);
  if (!doc) throw notFoundError(LABEL);
  return toItem(doc);
}

export async function deleteItem(workspaceId: string, id: string) {
  const result = await Item.deleteOne(ownedFilter(workspaceId, id, LABEL));
  if (result.deletedCount === 0) throw notFoundError(LABEL);
}
