import type { InvoiceDocument } from '../models/invoice.model.js';
import type { QuotationDocument } from '../models/quotation.model.js';

type Lean<T> = Partial<T> & { _id: unknown; createdAt?: Date; updatedAt?: Date };

function pricingOf(doc: Lean<InvoiceDocument> | Lean<QuotationDocument>) {
  return {
    items: doc.items ?? [],
    tax: doc.tax ?? 0,
    taxAmount: doc.taxAmount ?? 0,
    discount: doc.discount ?? 0,
    discountType: doc.discountType ?? 'percentage',
    discountAmount: doc.discountAmount ?? 0,
    shipping: doc.shipping ?? 0,
    currency: doc.currency ?? 'USD',
    subtotal: doc.subtotal ?? 0,
    total: doc.total ?? 0,
  };
}

function stamps(doc: { createdAt?: Date; updatedAt?: Date }) {
  return {
    createdAt: doc.createdAt?.toISOString() ?? '',
    updatedAt: doc.updatedAt?.toISOString() ?? '',
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
      notes: doc.notes ?? undefined,
      terms: doc.terms ?? undefined,
    },
    status: doc.status ?? 'draft',
    ...stamps(doc),
  };
}

export function toQuotationResponse(doc: Lean<QuotationDocument>) {
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
    ...stamps(doc),
  };
}
