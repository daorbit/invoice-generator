import { Counter, type CounterKind } from '../models/counter.model.js';
import { getNumberPrefixes } from './business-profile.service.js';

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
