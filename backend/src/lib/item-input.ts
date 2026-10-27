import { ITEM_KINDS, type ItemKind } from '../models/item.model.js';
import { amount, asObject, hsnCode, text } from './document-input.js';
import { nameKeyOf } from './customer-input.js';
import { badRequestError } from './http-error.js';

function kind(value: unknown): ItemKind {
  return (ITEM_KINDS as readonly unknown[]).includes(value) ? (value as ItemKind) : 'service';
}

export function readItemInput(body: unknown) {
  const raw = asObject(body);

  const name = text(raw.name, 200);
  if (!name) throw badRequestError('Item name is required');

  return {
    name,
    nameKey: nameKeyOf(name),
    description: text(raw.description, 1000),
    kind: kind(raw.kind),
    unit: text(raw.unit, 16),
    rate: amount(raw.rate),
    hsn: hsnCode(raw.hsn) ?? '',
    taxRate: amount(raw.taxRate, 0, 100),
  };
}

export type ItemInput = ReturnType<typeof readItemInput>;
