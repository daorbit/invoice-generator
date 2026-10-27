import type { Model } from 'mongoose';
import { Invoice, type InvoiceDocument } from '../models/invoice.model.js';
import { Quotation, type QuotationDocument } from '../models/quotation.model.js';
import { toInvoiceResponse, toQuotationResponse } from '../lib/serialize.js';

export const DOCUMENT_KINDS = ['invoice', 'quotation'] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const DOCUMENT_LABEL: Record<DocumentKind, string> = {
  invoice: 'Invoice',
  quotation: 'Quotation',
};

export type AnyDocument = InvoiceDocument | QuotationDocument;

export function documentModel(kind: DocumentKind): Model<AnyDocument> {
  return (kind === 'invoice' ? Invoice : Quotation) as unknown as Model<AnyDocument>;
}

export function toDocumentResponse(kind: DocumentKind, doc: unknown) {
  return kind === 'invoice'
    ? toInvoiceResponse(doc as Parameters<typeof toInvoiceResponse>[0])
    : toQuotationResponse(doc as Parameters<typeof toQuotationResponse>[0]);
}

export function numberOf(doc: Partial<AnyDocument>): string {
  return ('invoiceNumber' in doc && doc.invoiceNumber) || ('quotationNumber' in doc && doc.quotationNumber) || '';
}

export function clientOf(doc: Partial<AnyDocument>) {
  return ('billTo' in doc && doc.billTo) || ('quoteTo' in doc && doc.quoteTo) || undefined;
}
