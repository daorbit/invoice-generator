import { Customer, type CustomerDocument } from '../models/customer.model.js';
import { Invoice } from '../models/invoice.model.js';
import { Quotation } from '../models/quotation.model.js';
import type { Party } from '../models/document-parts.js';
import { nameKeyOf, type CustomerInput } from '../lib/customer-input.js';
import { escapeRegex, type PageQuery } from '../lib/list-query.js';
import { HttpError, notFoundError } from '../lib/http-error.js';
import { round2 } from '../lib/totals.js';
import { pastDueCutoff } from '../lib/due-status.js';
import { toInvoiceResponse, toQuotationResponse } from '../lib/serialize.js';
import { ownedFilter, paginate } from './owned-document.js';
import { seedCustomersOnce } from './customer-seed.service.js';

const LABEL = 'Customer';
const UNPAID = ['sent', 'overdue'];
const DOCUMENTS_LIMIT = 50;
const DOCUMENT_LIST_FIELDS = '-logo -workspaceId -createdBy';
const DUPLICATE_KEY = 11000;

type LeanCustomer = Partial<CustomerDocument> & { _id: unknown };

function toCustomer(doc: LeanCustomer, outstanding = 0) {
  return {
    id: String(doc._id),
    name: doc.name ?? '',
    contactName: doc.contactName ?? '',
    email: doc.email ?? '',
    phone: doc.phone ?? '',
    website: doc.website ?? '',
    gstin: doc.gstin ?? '',
    address: doc.address ?? '',
    shippingAddress: doc.shippingAddress ?? '',
    stateCode: doc.stateCode ?? '',
    notes: doc.notes ?? '',
    outstanding: round2(outstanding),
    updatedAt: doc.updatedAt?.toISOString() ?? '',
  };
}

function duplicateName(error: unknown): never {
  if ((error as { code?: number })?.code === DUPLICATE_KEY) {
    throw new HttpError(409, 'duplicate', 'A customer with this name already exists');
  }
  throw error;
}

async function outstandingByCustomer(workspaceId: string, ids: string[]): Promise<Map<string, number>> {
  if (!ids.length) return new Map();
  const rows = await Invoice.aggregate<{ _id: string; outstanding: number }>([
    { $match: { workspaceId, customerId: { $in: ids }, status: { $in: UNPAID } } },
    { $group: { _id: '$customerId', outstanding: { $sum: '$balanceDue' } } },
  ]);
  return new Map(rows.map((row) => [row._id, row.outstanding]));
}

function customerFilter(workspaceId: string, search?: string) {
  if (!search) return { workspaceId };
  const pattern = new RegExp(escapeRegex(search), 'i');
  return { workspaceId, $or: [{ name: pattern }, { email: pattern }, { gstin: pattern }, { phone: pattern }] };
}

async function findPage(workspaceId: string, query: PageQuery) {
  const filter = customerFilter(workspaceId, query.search);
  return Promise.all([
    Customer.find(filter)
      .select('-workspaceId -createdBy -nameKey')
      .sort({ nameKey: 1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Customer.countDocuments(filter),
  ]);
}

export async function listCustomers(workspaceId: string, query: PageQuery) {
  let [docs, total] = await findPage(workspaceId, query);
  if (total === 0 && !query.search && (await seedCustomersOnce(workspaceId))) {
    [docs, total] = await findPage(workspaceId, query);
  }
  const balances = await outstandingByCustomer(workspaceId, docs.map((doc) => String(doc._id)));
  return {
    customers: docs.map((doc) => toCustomer(doc, balances.get(String(doc._id)))),
    ...paginate(total, query.page, query.limit),
  };
}

interface StatusRow {
  _id: string;
  count: number;
  total: number;
  balance: number;
  overdue: number;
}

function customerStats(rows: StatusRow[]) {
  const pick = (statuses: string[], key: keyof Omit<StatusRow, '_id'>) =>
    round2(rows.filter((row) => statuses.includes(row._id)).reduce((sum, row) => sum + row[key], 0));
  return {
    invoiced: pick(['sent', 'paid', 'overdue'], 'total'),
    paid: pick(['paid'], 'total'),
    outstanding: pick(UNPAID, 'balance'),
    overdue: pick(UNPAID, 'overdue'),
    invoices: pick(['draft', 'sent', 'paid', 'overdue', 'cancelled'], 'count'),
  };
}

export async function getCustomer(workspaceId: string, id: string) {
  const filter = ownedFilter(workspaceId, id, LABEL);
  const cutoff = pastDueCutoff();
  const [doc, rows, invoices, quotations] = await Promise.all([
    Customer.findOne(filter).select('-workspaceId -createdBy -nameKey').lean(),
    Invoice.aggregate<StatusRow>([
      { $match: { workspaceId, customerId: id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' },
          balance: { $sum: '$balanceDue' },
          overdue: { $sum: { $cond: [{ $lt: [{ $ifNull: ['$dueDate', cutoff] }, cutoff] }, '$balanceDue', 0] } },
        },
      },
    ]),
    Invoice.find({ workspaceId, customerId: id })
      .select(DOCUMENT_LIST_FIELDS)
      .sort({ createdAt: -1 })
      .limit(DOCUMENTS_LIMIT)
      .lean(),
    Quotation.find({ workspaceId, customerId: id })
      .select(DOCUMENT_LIST_FIELDS)
      .sort({ createdAt: -1 })
      .limit(DOCUMENTS_LIMIT)
      .lean(),
  ]);
  if (!doc) throw notFoundError(LABEL);

  return {
    customer: toCustomer(doc, customerStats(rows).outstanding),
    stats: customerStats(rows),
    invoices: invoices.map(toInvoiceResponse),
    quotations: quotations.map(toQuotationResponse),
  };
}

export async function createCustomer(workspaceId: string, actorId: string | undefined, input: CustomerInput) {
  const doc = await Customer.create({ ...input, workspaceId, createdBy: actorId }).catch(duplicateName);
  return toCustomer(doc.toObject());
}

export async function updateCustomer(workspaceId: string, id: string, input: CustomerInput) {
  const doc = await Customer.findOneAndUpdate(ownedFilter(workspaceId, id, LABEL), { $set: input }, { new: true })
    .select('-workspaceId -createdBy -nameKey')
    .lean()
    .catch(duplicateName);
  if (!doc) throw notFoundError(LABEL);
  return toCustomer(doc);
}

export async function deleteCustomer(workspaceId: string, id: string) {
  const result = await Customer.deleteOne(ownedFilter(workspaceId, id, LABEL));
  if (result.deletedCount === 0) throw notFoundError(LABEL);
}

async function upsertByName(workspaceId: string, actorId: string | undefined, party: Party): Promise<string> {
  const nameKey = nameKeyOf(party.name);
  const doc = await Customer.findOneAndUpdate(
    { workspaceId, nameKey },
    {
      $setOnInsert: {
        workspaceId,
        nameKey,
        createdBy: actorId,
        name: party.name.trim(),
        email: party.email ?? '',
        phone: party.phone ?? '',
        website: party.website ?? '',
        gstin: party.gstin ?? '',
        address: party.address ?? '',
        stateCode: party.gstin?.slice(0, 2) ?? '',
      },
    },
    { upsert: true, new: true }
  )
    .select('_id')
    .lean();
  return String(doc?._id);
}

export async function ensureCustomer(
  workspaceId: string,
  actorId: string | undefined,
  party: Party,
  customerId?: string
): Promise<string | undefined> {
  if (customerId && (await Customer.exists({ _id: customerId, workspaceId }))) return customerId;
  if (!party.name.trim()) return undefined;
  try {
    return await upsertByName(workspaceId, actorId, party);
  } catch (error) {
    if ((error as { code?: number })?.code !== DUPLICATE_KEY) throw error;
    return upsertByName(workspaceId, actorId, party);
  }
}
