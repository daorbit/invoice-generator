import { Counter, type CounterKind } from '../models/counter.model.js';
import { HttpError } from '../lib/http-error.js';
import { getNumberPrefixes } from './business-profile.service.js';

const DUPLICATE_KEY = 11000;
const MAX_ATTEMPTS = 5;

const NUMBER_FIELD: Record<CounterKind, string> = {
  invoice: 'invoiceNumber',
  quotation: 'quotationNumber',
};

export async function nextDocumentNumber(workspaceId: string, kind: CounterKind): Promise<string> {
  const [counter, prefixes] = await Promise.all([
    Counter.findOneAndUpdate(
      { workspaceId, kind },
      { $inc: { seq: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .select('seq')
      .lean(),
    getNumberPrefixes(workspaceId),
  ]);
  return `${prefixes[kind]}-${String(counter?.seq ?? 1).padStart(4, '0')}`;
}

function isNumberClash(error: unknown, kind: CounterKind): boolean {
  const known = error as { code?: number; keyPattern?: Record<string, unknown> } | undefined;
  return known?.code === DUPLICATE_KEY && Boolean(known.keyPattern?.[NUMBER_FIELD[kind]]);
}

export async function withChosenNumber<T>(kind: CounterKind, number: string, write: () => Promise<T>): Promise<T> {
  try {
    return await write();
  } catch (error) {
    if (!number || !isNumberClash(error, kind)) throw error;
    throw new HttpError(409, 'number_taken', `${number} is already used. Clear the number to get the next free one.`);
  }
}

export async function withDocumentNumber<T>(
  workspaceId: string,
  kind: CounterKind,
  chosen: string,
  write: (number: string) => Promise<T>
): Promise<T> {
  if (chosen) return withChosenNumber(kind, chosen, () => write(chosen));
  for (let attempt = 1; ; attempt += 1) {
    const number = await nextDocumentNumber(workspaceId, kind);
    try {
      return await write(number);
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || !isNumberClash(error, kind)) throw error;
    }
  }
}
