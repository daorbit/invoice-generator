import { Quotation, type QuotationStatus } from '../models/quotation.model.js';
import { Invoice } from '../models/invoice.model.js';
import type { QuotationInput } from '../lib/document-input.js';
import type { ListQuery } from '../lib/list-query.js';
import { escapeRegex } from '../lib/list-query.js';
import { notFoundError } from '../lib/http-error.js';
import { toUpdate } from '../lib/update.js';
import { toQuotationResponse } from '../lib/serialize.js';
import { nextDocumentNumber } from './numbering.service.js';
import { ownedFilter, paginate } from './owned-document.js';
import { priceDocument } from './document-pricing.js';
import { ensureCustomer } from './customer.service.js';
import { COPY_EXCLUDED } from './invoice.service.js';

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

async function prepare(workspaceId: string, actorId: string | undefined, input: Omit<QuotationInput, 'quotationNumber'>) {
  const customerId = await ensureCustomer(workspaceId, actorId, input.quoteTo, input.customerId);
  return { ...input, ...priceDocument(input, input.quoteTo), customerId };
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
  const prepared = await prepare(workspaceId, actorId, rest);
  const number = quotationNumber || (await nextDocumentNumber(workspaceId, 'quotation'));
  const doc = await Quotation.create({
    workspaceId,
    createdBy: actorId,
    quotationNumber: number,
    ...prepared,
  });
  return toQuotationResponse(doc.toObject());
}

export async function updateQuotation(
  workspaceId: string,
  actorId: string | undefined,
  id: string,
  input: QuotationInput
) {
  const filter = ownedFilter(workspaceId, id, LABEL);
  const { quotationNumber, ...rest } = input;
  const update = { ...(await prepare(workspaceId, actorId, rest)), ...(quotationNumber ? { quotationNumber } : {}) };
  const doc = await Quotation.findOneAndUpdate(filter, toUpdate(update), { new: true }).lean();
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
    .select(`${COPY_EXCLUDED} -clientResponse`)
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
  const quotation = await Quotation.findOne(filter).select(COPY_EXCLUDED).lean();
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
    customerId: quotation.customerId,
    items: quotation.items,
    tax: quotation.tax,
    discount: quotation.discount,
    discountType: quotation.discountType,
    shipping: quotation.shipping,
    currency: quotation.currency,
    taxMode: quotation.taxMode,
    pricesIncludeTax: quotation.pricesIncludeTax,
    roundOff: quotation.roundOff,
    placeOfSupply: quotation.placeOfSupply,
    supplyState: quotation.supplyState,
    interState: quotation.interState,
    reverseCharge: quotation.reverseCharge,
    exportUnderLut: quotation.exportUnderLut,
    template: quotation.template,
    accent: quotation.accent,
    payment: quotation.payment,
    subtotal: quotation.subtotal,
    taxableAmount: quotation.taxableAmount,
    taxAmount: quotation.taxAmount,
    taxLines: quotation.taxLines,
    discountAmount: quotation.discountAmount,
    roundOffAmount: quotation.roundOffAmount,
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
