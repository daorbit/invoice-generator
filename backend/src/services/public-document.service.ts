import { Invoice } from '../models/invoice.model.js';
import { Quotation, type ClientDecision } from '../models/quotation.model.js';
import { BusinessProfile } from '../models/business-profile.model.js';
import { HttpError, notFoundError } from '../lib/http-error.js';
import { toPublicInvoice, toPublicQuotation } from '../lib/serialize.js';
import { QUOTATION_LAPSE, isLapsed, pastDueCutoff, stillOpenMatch } from '../lib/due-status.js';

const LABEL = 'Document';
const TOKEN = /^[A-Za-z0-9_-]{20,64}$/;
const OPEN_QUOTE = ['draft', 'sent'];

export interface ClientReply {
  decision: ClientDecision;
  name: string;
  comment: string;
}

function checkToken(token: string) {
  if (!TOKEN.test(token)) throw notFoundError(LABEL);
}

interface ReplyState {
  status?: string | null;
  validUntil?: Date | null;
  convertedInvoiceId?: string | null;
}

function openForReply(doc: ReplyState): boolean {
  return OPEN_QUOTE.includes(doc.status ?? '') && !doc.convertedInvoiceId && !isLapsed(doc.validUntil);
}

async function brandLogo(workspaceId: string): Promise<string> {
  const profile = await BusinessProfile.findOne({ workspaceId }).select('logo').lean();
  return profile?.logo ?? '';
}

function viewUpdate() {
  const now = new Date();
  return { $inc: { 'views.count': 1 }, $set: { 'views.lastAt': now }, $min: { 'views.firstAt': now } };
}

export async function readPublicDocument(token: string, countView: boolean) {
  checkToken(token);
  const [invoice, quotation] = await Promise.all([
    Invoice.findOne({ shareToken: token }).lean(),
    Quotation.findOne({ shareToken: token }).lean(),
  ]);

  if (invoice) {
    const [logo] = await Promise.all([
      brandLogo(invoice.workspaceId),
      countView ? Invoice.updateOne({ _id: invoice._id }, viewUpdate()) : null,
    ]);
    return { kind: 'invoice' as const, record: toPublicInvoice(invoice), brandLogo: logo, canRespond: false };
  }

  if (quotation) {
    const [logo] = await Promise.all([
      brandLogo(quotation.workspaceId),
      countView ? Quotation.updateOne({ _id: quotation._id }, viewUpdate()) : null,
    ]);
    return {
      kind: 'quotation' as const,
      record: toPublicQuotation(quotation),
      brandLogo: logo,
      canRespond: openForReply(quotation),
    };
  }

  throw notFoundError(LABEL);
}

export async function replyToQuotation(token: string, reply: ClientReply) {
  checkToken(token);
  const updated = await Quotation.findOneAndUpdate(
    {
      shareToken: token,
      status: { $in: OPEN_QUOTE },
      convertedInvoiceId: { $exists: false },
      ...stillOpenMatch(QUOTATION_LAPSE, pastDueCutoff()),
    },
    { $set: { status: reply.decision, clientResponse: { ...reply, at: new Date() } } },
    { new: true }
  ).lean();

  if (!updated) {
    const current = await Quotation.findOne({ shareToken: token }).select('status validUntil convertedInvoiceId').lean();
    if (!current) throw notFoundError(LABEL);
    const message = isLapsed(current.validUntil) ? 'This quotation has expired.' : 'This quotation has already been answered.';
    throw new HttpError(409, 'closed', message);
  }

  return {
    kind: 'quotation' as const,
    record: toPublicQuotation(updated),
    brandLogo: await brandLogo(updated.workspaceId),
    canRespond: false,
  };
}
