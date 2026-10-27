import { randomUUID } from 'node:crypto';
import { EmailOutbox, type EmailOutboxDocument } from '../models/email-outbox.model.js';
import { BusinessProfile } from '../models/business-profile.model.js';
import { sendDocumentEmail } from '../lib/quantalog.js';
import { composeEmail, EMAIL_FIELDS, sentUpdate, type SenderProfile } from './document-email.service.js';
import { ensureShareToken } from './share.service.js';
import { documentModel, type AnyDocument, type DocumentKind } from './document-models.js';

const BATCH = 10;
const STALE_MS = 10 * 60 * 1000;
const KEEP_MS = 30 * 24 * 60 * 60 * 1000;

type Entry = EmailOutboxDocument;
type LoadedDocument = Partial<AnyDocument> & { _id: unknown };

function dueFilter(now: Date) {
  return {
    $or: [
      { status: 'scheduled', sendAt: { $lte: now } },
      { status: 'sending', updatedAt: { $lt: new Date(now.getTime() - STALE_MS) } },
    ],
  };
}

async function claimDue(now: Date): Promise<Entry[]> {
  const due = dueFilter(now);
  const ids = (await EmailOutbox.find(due).select('_id').sort({ sendAt: 1 }).limit(BATCH).lean()).map((row) => row._id);
  if (!ids.length) return [];
  const claimId = randomUUID();
  await EmailOutbox.updateMany({ _id: { $in: ids }, ...due }, { $set: { status: 'sending', claimId } });
  return EmailOutbox.find({ claimId }).lean<Entry[]>();
}

async function loadDocuments(entries: Entry[]): Promise<Map<string, LoadedDocument>> {
  const idsOf = (kind: DocumentKind) => entries.filter((e) => e.kind === kind).map((e) => e.documentId);
  const [invoices, quotations] = await Promise.all(
    (['invoice', 'quotation'] as const).map((kind) =>
      documentModel(kind)
        .find({ _id: { $in: idsOf(kind) } })
        .select(EMAIL_FIELDS)
        .lean<LoadedDocument[]>()
    )
  );
  return new Map([
    ...invoices.map((doc) => [`invoice:${String(doc._id)}`, doc] as const),
    ...quotations.map((doc) => [`quotation:${String(doc._id)}`, doc] as const),
  ]);
}

async function loadProfiles(entries: Entry[]): Promise<Map<string, SenderProfile>> {
  const profiles = await BusinessProfile.find({ workspaceId: { $in: [...new Set(entries.map((e) => e.workspaceId))] } })
    .select('workspaceId businessName email')
    .lean();
  return new Map(profiles.map((profile) => [profile.workspaceId, profile]));
}

async function deliver(entry: Entry, doc: LoadedDocument | undefined, profile: SenderProfile | null) {
  if (!doc) throw new Error('The document was deleted');
  const kind = entry.kind as DocumentKind;
  const token = doc.shareToken ?? (await ensureShareToken(entry.workspaceId, kind, entry.documentId));
  await sendDocumentEmail(entry.workspaceId, composeEmail(kind, doc, profile, token, entry));
}

export async function sendDueEmails() {
  const entries = await claimDue(new Date());
  if (!entries.length) return { sent: 0, failed: 0 };

  const [documents, profiles] = await Promise.all([loadDocuments(entries), loadProfiles(entries)]);
  const results = await Promise.allSettled(
    entries.map((entry) =>
      deliver(entry, documents.get(`${entry.kind}:${entry.documentId}`), profiles.get(entry.workspaceId) ?? null)
    )
  );

  const expireAt = new Date(Date.now() + KEEP_MS);
  const outboxOps = entries.map((entry, index) => {
    const result = results[index];
    return {
      updateOne: {
        filter: { _id: entry._id },
        update:
          result.status === 'fulfilled'
            ? { $set: { status: 'sent', expireAt }, $unset: { pdf: '', claimId: '' } }
            : { $set: { status: 'failed', expireAt, error: String((result.reason as Error)?.message ?? result.reason).slice(0, 500) }, $unset: { pdf: '', claimId: '' } },
      },
    };
  });

  const documentOps = (kind: DocumentKind) =>
    entries.flatMap((entry, index) => {
      if (entry.kind !== kind) return [];
      const doc = documents.get(`${kind}:${entry.documentId}`);
      if (!doc) return [];
      const update = results[index].status === 'fulfilled' ? sentUpdate(doc.status, entry.to) : { $unset: { scheduledEmail: '' } };
      return [{ updateOne: { filter: { _id: doc._id }, update } }];
    });

  const invoiceOps = documentOps('invoice');
  const quotationOps = documentOps('quotation');
  await Promise.all([
    EmailOutbox.bulkWrite(outboxOps),
    invoiceOps.length ? documentModel('invoice').bulkWrite(invoiceOps as never) : null,
    quotationOps.length ? documentModel('quotation').bulkWrite(quotationOps as never) : null,
  ]);

  const failed = results.filter((result) => result.status === 'rejected').length;
  return { sent: entries.length - failed, failed };
}
