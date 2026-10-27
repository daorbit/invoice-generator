import type { InvoiceDocument } from '../models/invoice.model.js';
import type { QuotationDocument } from '../models/quotation.model.js';
import { env } from '../config/env.js';

type Lean<T> = Partial<T> & { _id: unknown; createdAt?: Date; updatedAt?: Date };
type AnyDocument = Lean<InvoiceDocument> | Lean<QuotationDocument>;

interface EmailStamp {
  to?: string[];
  at?: Date | null;
}

function pricingOf(doc: AnyDocument) {
  return {
    items: doc.items ?? [],
    tax: doc.tax ?? 0,
    taxAmount: doc.taxAmount ?? 0,
    taxableAmount: doc.taxableAmount ?? doc.subtotal ?? 0,
    taxLines: doc.taxLines ?? [],
    taxMode: doc.taxMode ?? 'document',
    pricesIncludeTax: doc.pricesIncludeTax ?? false,
    roundOff: doc.roundOff ?? false,
    roundOffAmount: doc.roundOffAmount ?? 0,
    discount: doc.discount ?? 0,
    discountType: doc.discountType ?? 'percentage',
    discountAmount: doc.discountAmount ?? 0,
    shipping: doc.shipping ?? 0,
    currency: doc.currency ?? 'USD',
    subtotal: doc.subtotal ?? 0,
    total: doc.total ?? 0,
    template: doc.template ?? 'classic',
    accent: doc.accent ?? 'blue',
    payment: doc.payment ?? undefined,
    placeOfSupply: doc.placeOfSupply ?? undefined,
    supplyState: doc.supplyState ?? undefined,
    interState: doc.interState ?? false,
    reverseCharge: doc.reverseCharge ?? false,
    exportUnderLut: doc.exportUnderLut ?? false,
    customerId: doc.customerId ?? undefined,
  };
}

function stamps(doc: { createdAt?: Date; updatedAt?: Date }) {
  return {
    createdAt: doc.createdAt?.toISOString() ?? '',
    updatedAt: doc.updatedAt?.toISOString() ?? '',
  };
}

function emailStamp(stamp: EmailStamp | null | undefined) {
  return stamp?.at ? { to: stamp.to ?? [], at: stamp.at.toISOString() } : null;
}

export function shareUrlFor(token: string): string {
  return `${env.publicAppUrl}/p/${token}`;
}

function activityOf(doc: AnyDocument) {
  const views = doc.views;
  return {
    shareUrl: doc.shareToken ? shareUrlFor(doc.shareToken) : null,
    views: {
      count: views?.count ?? 0,
      firstAt: views?.firstAt?.toISOString() ?? null,
      lastAt: views?.lastAt?.toISOString() ?? null,
    },
    lastEmail: emailStamp(doc.lastEmail),
    scheduledEmail: emailStamp(doc.scheduledEmail),
  };
}

export function toInvoiceResponse(doc: Lean<InvoiceDocument>) {
  return {
    id: String(doc._id),
    invoice: {
      logo: doc.logo ?? undefined,
      invoiceNumber: doc.invoiceNumber ?? '',
      invoiceDate: doc.invoiceDate ?? null,
      dueDate: doc.dueDate ?? null,
      poNumber: doc.poNumber ?? undefined,
      from: doc.from,
      billTo: doc.billTo,
      shipTo: doc.shipTo ?? undefined,
      ...pricingOf(doc),
      amountPaid: doc.amountPaid ?? 0,
      balanceDue: doc.balanceDue ?? 0,
      paidAt: doc.paidAt?.toISOString() ?? null,
      notes: doc.notes ?? undefined,
      terms: doc.terms ?? undefined,
    },
    status: doc.status ?? 'draft',
    activity: activityOf(doc),
    ...stamps(doc),
  };
}

export function toQuotationResponse(doc: Lean<QuotationDocument>) {
  const response = doc.clientResponse;
  return {
    id: String(doc._id),
    quotation: {
      logo: doc.logo ?? undefined,
      quotationNumber: doc.quotationNumber ?? '',
      quotationDate: doc.quotationDate ?? null,
      validUntil: doc.validUntil ?? null,
      referenceNumber: doc.referenceNumber ?? undefined,
      from: doc.from,
      quoteTo: doc.quoteTo,
      ...pricingOf(doc),
      status: doc.status ?? 'draft',
      notes: doc.notes ?? undefined,
      terms: doc.terms ?? undefined,
      paymentTerms: doc.paymentTerms ?? undefined,
    },
    convertedInvoiceId: doc.convertedInvoiceId ?? undefined,
    clientResponse: response
      ? { decision: response.decision, name: response.name ?? '', comment: response.comment ?? '', at: response.at.toISOString() }
      : null,
    activity: activityOf(doc),
    ...stamps(doc),
  };
}

export function toPublicInvoice(doc: Lean<InvoiceDocument>) {
  const { activity: _activity, ...record } = toInvoiceResponse(doc);
  return { ...record, invoice: { ...record.invoice, customerId: undefined } };
}

export function toPublicQuotation(doc: Lean<QuotationDocument>) {
  const { activity: _activity, convertedInvoiceId: _converted, ...record } = toQuotationResponse(doc);
  return { ...record, quotation: { ...record.quotation, customerId: undefined } };
}
