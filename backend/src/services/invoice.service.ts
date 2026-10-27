import { Invoice, type InvoiceStatus } from '../models/invoice.model.js';
import type { InvoiceInput } from '../lib/document-input.js';
import type { ListQuery } from '../lib/list-query.js';
import { escapeRegex } from '../lib/list-query.js';
import { computeTotals, round2 } from '../lib/totals.js';
import { notFoundError } from '../lib/http-error.js';
import { toUpdate } from '../lib/update.js';
import { toInvoiceResponse } from '../lib/serialize.js';
import { nextDocumentNumber } from './numbering.service.js';
import { ownedFilter, paginate } from './owned-document.js';

const LABEL = 'Invoice';
const LIST_FIELDS = '-logo -workspaceId -createdBy';

const SORT_FIELD = {
  date: 'createdAt',
  number: 'invoiceNumber',
  total: 'total',
  status: 'status',
} as const;

function withTotals(input: Omit<InvoiceInput, 'invoiceNumber'>) {
  const totals = computeTotals(input);
  return { ...input, ...totals, balanceDue: round2(totals.total - input.amountPaid) };
}

export async function listInvoices(workspaceId: string, query: ListQuery) {
  const filter: Record<string, unknown> = { workspaceId };
  if (query.status) filter.status = query.status;
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ invoiceNumber: pattern }, { 'billTo.name': pattern }];
  }

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

export async function createInvoice(workspaceId: string, actorId: string | undefined, input: InvoiceInput) {
  const { invoiceNumber, ...rest } = input;
  const number = invoiceNumber || (await nextDocumentNumber(workspaceId, 'invoice'));
  const doc = await Invoice.create({
    workspaceId,
    createdBy: actorId,
    invoiceNumber: number,
    ...withTotals(rest),
  });
  return toInvoiceResponse(doc.toObject());
}

export async function updateInvoice(workspaceId: string, id: string, input: InvoiceInput) {
  const { invoiceNumber, ...rest } = input;
  const update = { ...withTotals(rest), ...(invoiceNumber ? { invoiceNumber } : {}) };
  const doc = await Invoice.findOneAndUpdate(ownedFilter(workspaceId, id, LABEL), toUpdate(update), { new: true }).lean();
  if (!doc) throw notFoundError(LABEL);
  return toInvoiceResponse(doc);
}

export async function deleteInvoice(workspaceId: string, id: string) {
  const result = await Invoice.deleteOne(ownedFilter(workspaceId, id, LABEL));
  if (result.deletedCount === 0) throw notFoundError(LABEL);
}

export async function setInvoiceStatus(workspaceId: string, id: string, status: InvoiceStatus) {
  const doc = await Invoice.findOneAndUpdate(
    ownedFilter(workspaceId, id, LABEL),
    { $set: { status } },
    { new: true }
  ).lean();
  if (!doc) throw notFoundError(LABEL);
  return toInvoiceResponse(doc);
}

export async function duplicateInvoice(workspaceId: string, actorId: string | undefined, id: string) {
  const source = await Invoice.findOne(ownedFilter(workspaceId, id, LABEL))
    .select('-_id -createdAt -updatedAt -__v')
    .lean();
  if (!source) throw notFoundError(LABEL);
  const invoiceNumber = await nextDocumentNumber(workspaceId, 'invoice');
  const doc = await Invoice.create({
    ...source,
    createdBy: actorId,
    invoiceNumber,
    status: 'draft',
    amountPaid: 0,
    balanceDue: source.total,
    sourceQuotationId: undefined,
  });
  return toInvoiceResponse(doc.toObject());
}
