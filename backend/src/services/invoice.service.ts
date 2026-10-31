import { Invoice, type InvoiceStatus } from '../models/invoice.model.js';
import type { InvoiceInput } from '../lib/document-input.js';
import type { ListQuery } from '../lib/list-query.js';
import { escapeRegex } from '../lib/list-query.js';
import { round2 } from '../lib/totals.js';
import { notFoundError } from '../lib/http-error.js';
import { toUpdate } from '../lib/update.js';
import { toInvoiceResponse } from '../lib/serialize.js';
import { addDays, daysBetween, todayUtc } from '../lib/dates.js';
import { INVOICE_LAPSE, pastDueCutoff, statusMatch } from '../lib/due-status.js';
import { withChosenNumber, withDocumentNumber } from './numbering.service.js';
import { ownedFilter, paginate } from './owned-document.js';
import { priceDocument } from './document-pricing.js';
import { ensureCustomer } from './customer.service.js';
import { dropScheduledEmails } from './document-email.service.js';
import { getPaymentTermsDays } from './business-profile.service.js';

const LABEL = 'Invoice';
const LIST_FIELDS = '-logo -workspaceId -createdBy';
export const COPY_EXCLUDED = '-_id -createdAt -updatedAt -__v -shareToken -views -lastEmail -scheduledEmail';

const SORT_FIELD = {
  date: 'createdAt',
  number: 'invoiceNumber',
  total: 'total',
  status: 'status',
} as const;

async function prepare(workspaceId: string, actorId: string | undefined, input: Omit<InvoiceInput, 'invoiceNumber'>) {
  const customerId = await ensureCustomer(workspaceId, actorId, input.billTo, input.customerId);
  const priced = priceDocument(input, input.billTo);
  return { ...input, ...priced, customerId, balanceDue: round2(priced.total - input.amountPaid) };
}

export async function listInvoices(workspaceId: string, query: ListQuery) {
  const conditions: Record<string, unknown>[] = [{ workspaceId }];
  if (query.status) conditions.push(statusMatch(query.status, INVOICE_LAPSE, pastDueCutoff()));
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    conditions.push({ $or: [{ invoiceNumber: pattern }, { 'billTo.name': pattern }] });
  }
  const filter: Record<string, unknown> = conditions.length > 1 ? { $and: conditions } : { workspaceId };

  const [docs, total] = await Promise.all([
    Invoice.find(filter)
      .select(LIST_FIELDS)
      .sort({ [SORT_FIELD[query.sortBy]]: query.sortOrder, _id: query.sortOrder })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Invoice.countDocuments(filter),
  ]);

  return { invoices: docs.map(toInvoiceResponse), ...paginate(total, query.page, query.limit) };
}

export async function getInvoice(workspaceId: string, id: string) {
  const doc = await Invoice.findOne(ownedFilter(workspaceId, id, LABEL)).lean();
  if (!doc) throw notFoundError(LABEL);
  return toInvoiceResponse(doc);
}

export async function createInvoice(
  workspaceId: string,
  actorId: string | undefined,
  input: InvoiceInput,
  extra: Record<string, unknown> = {}
) {
  const { invoiceNumber, ...rest } = input;
  const prepared = await prepare(workspaceId, actorId, rest);
  const doc = await withDocumentNumber(workspaceId, 'invoice', invoiceNumber, (number) =>
    Invoice.create({ workspaceId, createdBy: actorId, invoiceNumber: number, ...prepared, ...extra })
  );
  return toInvoiceResponse(doc.toObject());
}

export async function updateInvoice(workspaceId: string, actorId: string | undefined, id: string, input: InvoiceInput) {
  const filter = ownedFilter(workspaceId, id, LABEL);
  const { invoiceNumber, ...rest } = input;
  const update = { ...(await prepare(workspaceId, actorId, rest)), ...(invoiceNumber ? { invoiceNumber } : {}) };
  const doc = await withChosenNumber('invoice', invoiceNumber, () =>
    Invoice.findOneAndUpdate(filter, toUpdate(update), { new: true }).lean()
  );
  if (!doc) throw notFoundError(LABEL);
  return toInvoiceResponse(doc);
}

export async function deleteInvoice(workspaceId: string, id: string) {
  const [result] = await Promise.all([
    Invoice.deleteOne(ownedFilter(workspaceId, id, LABEL)),
    dropScheduledEmails(workspaceId, id),
  ]);
  if (result.deletedCount === 0) throw notFoundError(LABEL);
}

export async function setInvoiceStatus(workspaceId: string, id: string, status: InvoiceStatus) {
  const update = status === 'paid' ? { $set: { status, paidAt: new Date() } } : { $set: { status }, $unset: { paidAt: '' } };
  const doc = await Invoice.findOneAndUpdate(ownedFilter(workspaceId, id, LABEL), update, { new: true }).lean();
  if (!doc) throw notFoundError(LABEL);
  return toInvoiceResponse(doc);
}

export async function duplicateInvoice(workspaceId: string, actorId: string | undefined, id: string) {
  const [source, termsDays] = await Promise.all([
    Invoice.findOne(ownedFilter(workspaceId, id, LABEL))
      .select(`${COPY_EXCLUDED} -paidAt -source`)
      .lean(),
    getPaymentTermsDays(workspaceId),
  ]);
  if (!source) throw notFoundError(LABEL);
  const issued = todayUtc();
  const doc = await withDocumentNumber(workspaceId, 'invoice', '', (invoiceNumber) =>
    Invoice.create({
      ...source,
      createdBy: actorId,
      invoiceNumber,
      invoiceDate: issued,
      dueDate: addDays(issued, daysBetween(source.invoiceDate, source.dueDate) ?? termsDays),
      status: 'draft',
      amountPaid: 0,
      balanceDue: source.total,
      sourceQuotationId: undefined,
    })
  );
  return toInvoiceResponse(doc.toObject());
}
