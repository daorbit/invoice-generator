import { Invoice } from '../models/invoice.model.js';
import { Quotation } from '../models/quotation.model.js';
import type { Party } from '../models/document-parts.js';

const SCAN_LIMIT = 200;
const MAX_CLIENTS = 50;

function key(party: Party): string {
  return party.name.trim().toLowerCase();
}

export async function listRecentClients(workspaceId: string): Promise<Party[]> {
  const [invoices, quotations] = await Promise.all([
    Invoice.find({ workspaceId }).select('billTo createdAt').sort({ createdAt: -1 }).limit(SCAN_LIMIT).lean(),
    Quotation.find({ workspaceId }).select('quoteTo createdAt').sort({ createdAt: -1 }).limit(SCAN_LIMIT).lean(),
  ]);

  const recent = [
    ...invoices.map((doc) => ({ party: doc.billTo as Party | undefined, at: new Date(doc.createdAt).getTime() })),
    ...quotations.map((doc) => ({ party: doc.quoteTo as Party | undefined, at: new Date(doc.createdAt).getTime() })),
  ]
    .filter((entry): entry is { party: Party; at: number } => Boolean(entry.party?.name?.trim()))
    .sort((a, b) => b.at - a.at);

  const seen = new Map<string, Party>();
  for (const { party } of recent) {
    if (seen.size >= MAX_CLIENTS) break;
    if (!seen.has(key(party))) {
      seen.set(key(party), {
        name: party.name,
        email: party.email ?? '',
        phone: party.phone ?? '',
        address: party.address ?? '',
        gstin: party.gstin ?? undefined,
      });
    }
  }
  return [...seen.values()];
}
