import { apiClient, handleApiError } from './client';
import {
  DOCUMENT_PATH,
  draftToPayload,
  invoiceSummary,
  invoiceToDraft,
  quotationSummary,
  quotationToDraft,
} from '@/lib/documentMapping';
import type {
  DocumentDraft,
  DocumentKind,
  DocumentPage,
  DocumentQuery,
  DocumentStatus,
  InvoiceRecord,
  QuotationRecord,
} from '@/types/document';

type InvoiceList = { invoices: InvoiceRecord[]; total: number; page: number; limit: number; totalPages: number };
type QuotationList = { quotations: QuotationRecord[]; total: number; page: number; limit: number; totalPages: number };

async function call<T>(request: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await request()).data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

function toDraft(kind: DocumentKind, record: InvoiceRecord | QuotationRecord): DocumentDraft {
  return kind === 'invoice' ? invoiceToDraft(record as InvoiceRecord) : quotationToDraft(record as QuotationRecord);
}

export async function listDocuments(kind: DocumentKind, query: DocumentQuery): Promise<DocumentPage> {
  const params = { page: query.page, limit: query.limit, status: query.status, search: query.search || undefined };
  if (kind === 'invoice') {
    const data = await call(() => apiClient.get<InvoiceList>(DOCUMENT_PATH.invoice, { params }));
    return { ...data, items: data.invoices.map(invoiceSummary) };
  }
  const data = await call(() => apiClient.get<QuotationList>(DOCUMENT_PATH.quotation, { params }));
  return { ...data, items: data.quotations.map(quotationSummary) };
}

export async function getDocument(kind: DocumentKind, id: string): Promise<DocumentDraft> {
  const record = await call(() => apiClient.get<InvoiceRecord | QuotationRecord>(`${DOCUMENT_PATH[kind]}/${id}`));
  return toDraft(kind, record);
}

export async function saveDocument(draft: DocumentDraft, id?: string): Promise<{ id: string; draft: DocumentDraft }> {
  const path = DOCUMENT_PATH[draft.kind];
  const body = draftToPayload(draft);
  const record = await call(() =>
    id
      ? apiClient.put<InvoiceRecord | QuotationRecord>(`${path}/${id}`, body)
      : apiClient.post<InvoiceRecord | QuotationRecord>(path, body)
  );
  return { id: record.id, draft: toDraft(draft.kind, record) };
}

export function deleteDocument(kind: DocumentKind, id: string): Promise<unknown> {
  return call(() => apiClient.delete(`${DOCUMENT_PATH[kind]}/${id}`));
}

export function setDocumentStatus(kind: DocumentKind, id: string, status: DocumentStatus): Promise<unknown> {
  return call(() => apiClient.patch(`${DOCUMENT_PATH[kind]}/${id}/status`, { status }));
}

export async function duplicateDocument(kind: DocumentKind, id: string): Promise<string> {
  const record = await call(() => apiClient.post<{ id: string }>(`${DOCUMENT_PATH[kind]}/${id}/duplicate`));
  return record.id;
}

export function convertQuotation(id: string): Promise<{ invoiceId: string; invoiceNumber: string }> {
  return call(() =>
    apiClient.post<{ invoiceId: string; invoiceNumber: string }>(`${DOCUMENT_PATH.quotation}/${id}/convert`)
  );
}
