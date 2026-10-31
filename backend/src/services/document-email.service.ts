import { BusinessProfile } from '../models/business-profile.model.js';
import { EmailOutbox } from '../models/email-outbox.model.js';
import type { EmailInput } from '../lib/email-input.js';
import { formatDate, formatMoney } from '../lib/format.js';
import { notFoundError } from '../lib/http-error.js';
import { sendDocumentEmail, type DocumentEmail } from '../lib/quantalog.js';
import { shareUrlFor } from '../lib/serialize.js';
import { ownedFilter } from './owned-document.js';
import { ensureShareToken } from './share.service.js';
import {
  DOCUMENT_LABEL,
  documentModel,
  numberOf,
  toDocumentResponse,
  type AnyDocument,
  type DocumentKind,
} from './document-models.js';

export const EMAIL_FIELDS =
  'workspaceId status from invoiceNumber quotationNumber total balanceDue currency dueDate validUntil shareToken';

export interface SenderProfile {
  businessName?: string | null;
  email?: string | null;
}

interface Message {
  to: string[];
  cc: string[];
  subject: string;
  message: string;
  pdf?: string | null;
}

export function dropScheduledEmails(workspaceId: string, documentId: string) {
  return EmailOutbox.deleteMany({ workspaceId, documentId, status: 'scheduled' });
}

export function profileOf(workspaceId: string) {
  return BusinessProfile.findOne({ workspaceId }).select('businessName email').lean();
}

export function composeEmail(
  kind: DocumentKind,
  doc: Partial<AnyDocument>,
  profile: SenderProfile | null,
  token: string,
  message: Message
): DocumentEmail {
  const isInvoice = kind === 'invoice';
  const settled = isInvoice && doc.status === 'paid';
  const due = isInvoice ? (doc as { dueDate?: Date | null }).dueDate : (doc as { validUntil?: Date | null }).validUntil;
  const value = isInvoice && !settled ? (doc as { balanceDue?: number }).balanceDue ?? doc.total : doc.total;
  const number = numberOf(doc) || DOCUMENT_LABEL[kind];

  return {
    to: message.to,
    cc: message.cc,
    subject: message.subject,
    message: message.message,
    replyTo: profile?.email || doc.from?.email || '',
    senderName: profile?.businessName || doc.from?.name || 'Your supplier',
    document: {
      label: DOCUMENT_LABEL[kind],
      number,
      amount: formatMoney(value ?? 0, doc.currency ?? 'INR'),
      amountLabel: settled ? 'Amount paid' : isInvoice ? 'Amount due' : 'Quote total',
      dueText: due && !settled ? `${isInvoice ? 'Due' : 'Valid until'} ${formatDate(due)}` : '',
      link: shareUrlFor(token),
    },
    pdf: message.pdf ? { filename: `${number}.pdf`, content: message.pdf } : undefined,
  };
}

export function sentUpdate(status: string | null | undefined, to: string[]) {
  return {
    $set: { lastEmail: { to, at: new Date() }, ...(status === 'draft' ? { status: 'sent' } : {}) },
    $unset: { scheduledEmail: '' },
  };
}

async function scheduleEmail(workspaceId: string, kind: DocumentKind, id: string, input: EmailInput) {
  const sendAt = input.sendAt as Date;
  await dropScheduledEmails(workspaceId, id);
  await EmailOutbox.create({
    workspaceId,
    kind,
    documentId: id,
    to: input.to,
    cc: input.cc,
    subject: input.subject,
    message: input.message,
    pdf: input.pdf,
    sendAt,
  });
  const updated = await documentModel(kind)
    .findOneAndUpdate(
      ownedFilter(workspaceId, id, DOCUMENT_LABEL[kind]),
      { $set: { scheduledEmail: { to: input.to, at: sendAt } } },
      { new: true }
    )
    .lean();
  if (!updated) throw notFoundError(DOCUMENT_LABEL[kind]);
  return toDocumentResponse(kind, updated);
}

export async function emailDocument(workspaceId: string, kind: DocumentKind, id: string, input: EmailInput) {
  const token = await ensureShareToken(workspaceId, kind, id);
  if (input.sendAt) return scheduleEmail(workspaceId, kind, id, input);

  const model = documentModel(kind);
  const filter = ownedFilter(workspaceId, id, DOCUMENT_LABEL[kind]);
  const [doc, profile] = await Promise.all([model.findOne(filter).select(EMAIL_FIELDS).lean(), profileOf(workspaceId)]);
  if (!doc) throw notFoundError(DOCUMENT_LABEL[kind]);

  await sendDocumentEmail(workspaceId, composeEmail(kind, doc, profile, token, input));
  await dropScheduledEmails(workspaceId, id);

  const updated = await model.findOneAndUpdate(filter, sentUpdate(doc.status, input.to), { new: true }).lean();
  if (!updated) throw notFoundError(DOCUMENT_LABEL[kind]);
  return toDocumentResponse(kind, updated);
}

export async function cancelScheduledEmail(workspaceId: string, kind: DocumentKind, id: string) {
  const [, updated] = await Promise.all([
    dropScheduledEmails(workspaceId, id),
    documentModel(kind)
      .findOneAndUpdate(ownedFilter(workspaceId, id, DOCUMENT_LABEL[kind]), { $unset: { scheduledEmail: '' } }, { new: true })
      .lean(),
  ]);
  if (!updated) throw notFoundError(DOCUMENT_LABEL[kind]);
  return toDocumentResponse(kind, updated);
}
