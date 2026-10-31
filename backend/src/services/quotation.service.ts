import { Quotation, type QuotationStatus } from '../models/quotation.model.js';
import { Invoice } from '../models/invoice.model.js';
import type { QuotationInput } from '../lib/document-input.js';
import type { ListQuery } from '../lib/list-query.js';
import { escapeRegex } from '../lib/list-query.js';
import { notFoundError } from '../lib/http-error.js';
import { toUpdate } from '../lib/update.js';
import { toQuotationResponse } from '../lib/serialize.js';
import { addDays, daysBetween, todayUtc } from '../lib/dates.js';
import { QUOTATION_LAPSE, pastDueCutoff, statusMatch } from '../lib/due-status.js';
import { withChosenNumber, withDocumentNumber } from './numbering.service.js';
import { ownedFilter, paginate } from './owned-document.js';
import { priceDocument } from './document-pricing.js';
import { ensureCustomer } from './customer.service.js';
import { dropScheduledEmails } from './document-email.service.js';
import { getPaymentTermsDays } from './business-profile.service.js';
import { COPY_EXCLUDED } from './invoice.service.js';

const LABEL = 'Quotation';
const LIST_FIELDS = '-logo -workspaceId -createdBy';

const SORT_FIELD = {
  date: 'quotationDate',
  number: 'quotationNumber',
  total: 'total',
  status: 'status',
} as const;

async function prepare(workspaceId: string, actorId: string | undefined, input: Omit<QuotationInput, 'quotationNumber'>) {
  const customerId = await ensureCustomer(workspaceId, actorId, input.quoteTo, input.customerId);
  return { ...input, ...priceDocument(input, input.quoteTo), customerId };
}

export async function listQuotations(workspaceId: string, query: ListQuery) {
  const conditions: Record<string, unknown>[] = [{ workspaceId }];
  if (query.status) conditions.push(statusMatch(query.status, QUOTATION_LAPSE, pastDueCutoff()));
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    conditions.push({ $or: [{ quotationNumber: pattern }, { 'quoteTo.name': pattern }] });
  }
  const filter: Record<string, unknown> = conditions.length > 1 ? { $and: conditions } : { workspaceId };

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
  const doc = await withDocumentNumber(workspaceId, 'quotation', quotationNumber, (number) =>
    Quotation.create({ workspaceId, createdBy: actorId, quotationNumber: number, ...prepared })
  );
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
  const doc = await withChosenNumber('quotation', quotationNumber, () =>
    Quotation.findOneAndUpdate(filter, toUpdate(update), { new: true }).lean()
  );
  if (!doc) throw notFoundError(LABEL);
  return toQuotationResponse(doc);
}

export async function deleteQuotation(workspaceId: string, id: string) {
  const [result] = await Promise.all([
    Quotation.deleteOne(ownedFilter(workspaceId, id, LABEL)),
    dropScheduledEmails(workspaceId, id),
  ]);
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
  const [source, termsDays] = await Promise.all([
    Quotation.findOne(ownedFilter(workspaceId, id, LABEL))
      .select(`${COPY_EXCLUDED} -clientResponse`)
      .lean(),
    getPaymentTermsDays(workspaceId),
  ]);
  if (!source) throw notFoundError(LABEL);
  const issued = todayUtc();
  const doc = await withDocumentNumber(workspaceId, 'quotation', '', (quotationNumber) =>
    Quotation.create({
      ...source,
      createdBy: actorId,
      quotationNumber,
      quotationDate: issued,
      validUntil: addDays(issued, daysBetween(source.quotationDate, source.validUntil) ?? termsDays),
      status: 'draft',
      convertedInvoiceId: undefined,
    })
  );
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
  const [quotation, termsDays] = await Promise.all([
    Quotation.findOne(filter).select(COPY_EXCLUDED).lean(),
    getPaymentTermsDays(workspaceId),
  ]);
  if (!quotation) throw notFoundError(LABEL);

  const seenInvoiceId = quotation.convertedInvoiceId ?? undefined;
  if (seenInvoiceId) {
    const existing = await Invoice.findOne({ _id: seenInvoiceId, workspaceId })
      .select('invoiceNumber')
      .lean();
    if (existing) return { invoiceId: String(existing._id), invoiceNumber: String(existing.invoiceNumber) };
  }

  const issued = todayUtc();
  const invoice = await withDocumentNumber(workspaceId, 'invoice', '', (invoiceNumber) =>
    Invoice.create({
      workspaceId,
      createdBy: actorId,
      invoiceNumber,
      invoiceDate: issued,
      dueDate: addDays(issued, termsDays),
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
    })
  );

  const claimed = await Quotation.updateOne(
    { ...filter, convertedInvoiceId: seenInvoiceId ?? { $exists: false } },
    { $set: { status: 'accepted', convertedInvoiceId: String(invoice._id) } }
  );
  if (claimed.modifiedCount === 0) {
    await Invoice.deleteOne({ _id: invoice._id, workspaceId });
    return convertQuotation(workspaceId, actorId, id);
  }

  return { invoiceId: String(invoice._id), invoiceNumber: invoice.invoiceNumber };
}
