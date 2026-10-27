import type {
  DocumentDraft,
  DocumentKind,
  DocumentSummary,
  InvoiceRecord,
  Party,
  QuotationRecord,
} from '@/types/document';

const EMPTY_PARTY: Party = { name: '', email: '', address: '', phone: '' };

function dateOnly(value: string | null | undefined): string | null {
  return value ? value.slice(0, 10) : null;
}

function party(value: Party | undefined): Party {
  return { ...EMPTY_PARTY, ...value };
}

function design(doc: InvoiceRecord['invoice'] | QuotationRecord['quotation']) {
  return {
    template: doc.template ?? 'classic',
    accent: doc.accent ?? 'blue',
    payment: doc.payment,
  };
}

export function invoiceToDraft(record: InvoiceRecord): DocumentDraft {
  const doc = record.invoice;
  return {
    kind: 'invoice',
    status: record.status,
    number: doc.invoiceNumber,
    issueDate: dateOnly(doc.invoiceDate),
    dueDate: dateOnly(doc.dueDate),
    reference: doc.poNumber ?? '',
    from: party(doc.from),
    client: party(doc.billTo),
    items: doc.items,
    currency: doc.currency,
    tax: doc.tax,
    discount: doc.discount,
    discountType: doc.discountType,
    shipping: doc.shipping,
    amountPaid: doc.amountPaid,
    notes: doc.notes ?? '',
    terms: doc.terms ?? '',
    logo: doc.logo,
    ...design(doc),
  };
}

export function quotationToDraft(record: QuotationRecord): DocumentDraft {
  const doc = record.quotation;
  return {
    kind: 'quotation',
    status: doc.status,
    number: doc.quotationNumber,
    issueDate: dateOnly(doc.quotationDate),
    dueDate: dateOnly(doc.validUntil),
    reference: doc.referenceNumber ?? '',
    from: party(doc.from),
    client: party(doc.quoteTo),
    items: doc.items,
    currency: doc.currency,
    tax: doc.tax,
    discount: doc.discount,
    discountType: doc.discountType,
    shipping: doc.shipping,
    amountPaid: 0,
    notes: doc.notes ?? '',
    terms: doc.paymentTerms ?? doc.terms ?? '',
    logo: doc.logo,
    ...design(doc),
  };
}

function pricing(draft: DocumentDraft) {
  return {
    items: draft.items,
    currency: draft.currency,
    tax: draft.tax,
    discount: draft.discount,
    discountType: draft.discountType,
    shipping: draft.shipping,
    notes: draft.notes,
    logo: draft.logo,
    template: draft.template,
    accent: draft.accent,
    payment: draft.payment,
  };
}

export function draftToPayload(draft: DocumentDraft) {
  if (draft.kind === 'invoice') {
    return {
      invoice: {
        ...pricing(draft),
        invoiceNumber: draft.number,
        invoiceDate: draft.issueDate,
        dueDate: draft.dueDate,
        poNumber: draft.reference,
        from: draft.from,
        billTo: draft.client,
        amountPaid: draft.amountPaid,
        terms: draft.terms,
      },
    };
  }
  return {
    quotation: {
      ...pricing(draft),
      quotationNumber: draft.number,
      quotationDate: draft.issueDate,
      validUntil: draft.dueDate,
      referenceNumber: draft.reference,
      from: draft.from,
      quoteTo: draft.client,
      paymentTerms: draft.terms,
    },
  };
}

export function invoiceSummary(record: InvoiceRecord): DocumentSummary {
  const doc = record.invoice;
  return {
    id: record.id,
    kind: 'invoice',
    number: doc.invoiceNumber,
    client: doc.billTo?.name ?? '',
    issueDate: dateOnly(doc.invoiceDate),
    dueDate: dateOnly(doc.dueDate),
    total: doc.total ?? 0,
    currency: doc.currency,
    status: record.status,
  };
}

export function quotationSummary(record: QuotationRecord): DocumentSummary {
  const doc = record.quotation;
  return {
    id: record.id,
    kind: 'quotation',
    number: doc.quotationNumber,
    client: doc.quoteTo?.name ?? '',
    issueDate: dateOnly(doc.quotationDate),
    dueDate: dateOnly(doc.validUntil),
    total: doc.total ?? 0,
    currency: doc.currency,
    status: doc.status,
    convertedInvoiceId: record.convertedInvoiceId,
  };
}

export const DOCUMENT_PATH: Record<DocumentKind, string> = {
  invoice: '/invoices',
  quotation: '/quotations',
};
