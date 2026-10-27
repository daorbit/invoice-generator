import { Quotation, type QuotationStatus } from '../models/quotation.model.js';
import { Invoice } from '../models/invoice.model.js';
import type { QuotationInput } from '../lib/document-input.js';
import type { ListQuery } from '../lib/list-query.js';
import { escapeRegex } from '../lib/list-query.js';
import { computeTotals } from '../lib/totals.js';
import { notFoundError } from '../lib/http-error.js';
import { toQuotationResponse } from '../lib/serialize.js';
import { nextDocumentNumber } from './numbering.service.js';
import { ownedFilter, paginate } from './owned-document.js';

const LABEL = 'Quotation';
const LIST_FIELDS = '-logo -workspaceId -createdBy';
const DEFAULT_DUE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const SORT_FIELD = {
  date: 'createdAt',
  number: 'quotationNumber',
  total: 'total',
  status: 'status',
} as const;

function withTotals(input: Omit<QuotationInput, 'quotationNumber'>) {
  return { ...input, ...computeTotals(input) };
}

export async function listQuotations(workspaceId: string, query: ListQuery) {
  const filter: Record<string, unknown> = { workspaceId };
  if (query.status) filter.status = query.status;
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ quotationNumber: pattern }, { 'quoteTo.name': pattern }];
  }

  const [docs, total] = await Promise.all([
    Quotation.find(filter)
      .select(LIST_FIELDS)
      .sort({ [SORT_FIELD[query.sortBy]]: query.sortOrder, _id: query.sortOrder })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Quotation.countDocuments(filter),
  ]);

  return { quotations: docs.map(toQuotationResponse), ...paginate(total, query.page, query.limit) };
}

export async function getQuotation(workspaceId: string, id: string) {
  const doc = await Quotation.findOne(ownedFilter(workspaceId, id, LABEL)).lean();
  if (!doc) throw notFoundError(LABEL);
  return toQuotationResponse(doc);
}

export async function createQuotation(workspaceId: string, actorId: string | undefined, input: QuotationInput) {
  const { quotationNumber, ...rest } = input;
  const number = quotationNumber || (await nextDocumentNumber(workspaceId, 'quotation'));
  const doc = await Quotation.create({
    workspaceId,
    createdBy: actorId,
    quotationNumber: number,
    ...withTotals(rest),
  });
  return toQuotationResponse(doc.toObject());
}

export async function updateQuotation(workspaceId: string, id: string, input: QuotationInput) {
  const { quotationNumber, ...rest } = input;
  const update = { ...withTotals(rest), ...(quotationNumber ? { quotationNumber } : {}) };
  const doc = await Quotation.findOneAndUpdate(
    ownedFilter(workspaceId, id, LABEL),
    { $set: update },
    { new: true }
  ).lean();
  if (!doc) throw notFoundError(LABEL);
  return toQuotationResponse(doc);
}

export async function deleteQuotation(workspaceId: string, id: string) {
  const result = await Quotation.deleteOne(ownedFilter(workspaceId, id, LABEL));
  if (result.deletedCount === 0) throw notFoundError(LABEL);
}

export async function setQuotationStatus(workspaceId: string, id: string, status: QuotationStatus) {
  const doc = await Quotation.findOneAndUpdate(
    ownedFilter(workspaceId, id, LABEL),
    { $set: { status } },
    { new: true }
  ).lean();
  if (!doc) throw notFoundError(LABEL);
  return toQuotationResponse(doc);
}

export async function duplicateQuotation(workspaceId: string, actorId: string | undefined, id: string) {
  const source = await Quotation.findOne(ownedFilter(workspaceId, id, LABEL))
    .select('-_id -createdAt -updatedAt -__v')
    .lean();
  if (!source) throw notFoundError(LABEL);
  const quotationNumber = await nextDocumentNumber(workspaceId, 'quotation');
  const doc = await Quotation.create({
    ...source,
    createdBy: actorId,
    quotationNumber,
    status: 'draft',
    convertedInvoiceId: undefined,
  });
  return toQuotationResponse(doc.toObject());
}

export interface ConvertResult {
  invoiceId: string;
  invoiceNumber: string;
}

export async function convertQuotation(
  workspaceId: string,
  actorId: string | undefined,
  id: string
): Promise<ConvertResult> {
  const filter = ownedFilter(workspaceId, id, LABEL);
  const quotation = await Quotation.findOne(filter).select('-_id -createdAt -updatedAt -__v').lean();
  if (!quotation) throw notFoundError(LABEL);

  const seenInvoiceId = quotation.convertedInvoiceId ?? undefined;
  if (seenInvoiceId) {
    const existing = await Invoice.findOne({ _id: seenInvoiceId, workspaceId })
      .select('invoiceNumber')
      .lean();
    if (existing) return { invoiceId: String(existing._id), invoiceNumber: String(existing.invoiceNumber) };
  }

  const invoiceNumber = await nextDocumentNumber(workspaceId, 'invoice');
  const now = new Date();
  const invoice = await Invoice.create({
    workspaceId,
    createdBy: actorId,
    invoiceNumber,
    invoiceDate: now,
    dueDate: new Date(now.getTime() + DEFAULT_DUE_DAYS * DAY_MS),
    logo: quotation.logo,
    from: quotation.from,
    billTo: quotation.quoteTo,
    items: quotation.items,
    tax: quotation.tax,
    discount: quotation.discount,
    discountType: quotation.discountType,
    shipping: quotation.shipping,
    currency: quotation.currency,
    subtotal: quotation.subtotal,
    taxAmount: quotation.taxAmount,
    discountAmount: quotation.discountAmount,
    total: quotation.total,
    balanceDue: quotation.total,
    notes: quotation.notes,
    terms: quotation.paymentTerms ?? quotation.terms,
    sourceQuotationId: id,
  });

  const claimed = await Quotation.updateOne(
    { ...filter, convertedInvoiceId: seenInvoiceId ?? { $exists: false } },
    { $set: { status: 'accepted', convertedInvoiceId: String(invoice._id) } }
  );
  if (claimed.modifiedCount === 0) {
    await Invoice.deleteOne({ _id: invoice._id, workspaceId });
    return convertQuotation(workspaceId, actorId, id);
  }

  return { invoiceId: String(invoice._id), invoiceNumber };
}
