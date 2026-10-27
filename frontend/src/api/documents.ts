import { apiClient, call } from './client';
import {
  DOCUMENT_PATH,
  draftToPayload,
  invoiceSummary,
  quotationSummary,
  recordToLoaded,
} from '@/lib/documentMapping';
import type {
  DocumentDraft,
  DocumentKind,
  DocumentPage,
  DocumentQuery,
  DocumentStatus,
  EmailRequest,
  InvoiceRecord,
  LoadedDocument,
  QuotationRecord,
} from '@/types/document';

type InvoiceList = { invoices: InvoiceRecord[]; total: number; page: number; limit: number; totalPages: number };
type QuotationList = { quotations: QuotationRecord[]; total: number; page: number; limit: number; totalPages: number };
type AnyRecord = InvoiceRecord | QuotationRecord;

export async function listDocuments(kind: DocumentKind, query: DocumentQuery): Promise<DocumentPage> {
  const params = { page: query.page, limit: query.limit, status: query.status, search: query.search || undefined };
  if (kind === 'invoice') {
    const data = await call(() => apiClient.get<InvoiceList>(DOCUMENT_PATH.invoice, { params }));
    return { ...data, items: data.invoices.map(invoiceSummary) };
  }
  const data = await call(() => apiClient.get<QuotationList>(DOCUMENT_PATH.quotation, { params }));
  return { ...data, items: data.quotations.map(quotationSummary) };
}

export async function getDocument(kind: DocumentKind, id: string): Promise<LoadedDocument> {
  const record = await call(() => apiClient.get<AnyRecord>(`${DOCUMENT_PATH[kind]}/${id}`));
  return recordToLoaded(kind, record);
}

export async function saveDocument(draft: DocumentDraft, id?: string): Promise<LoadedDocument> {
  const path = DOCUMENT_PATH[draft.kind];
  const body = draftToPayload(draft);
  const record = await call(() =>
    id ? apiClient.put<AnyRecord>(`${path}/${id}`, body) : apiClient.post<AnyRecord>(path, body)
  );
  return recordToLoaded(draft.kind, record);
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

export function shareDocument(kind: DocumentKind, id: string): Promise<{ shareUrl: string }> {
  return call(() => apiClient.post<{ shareUrl: string }>(`${DOCUMENT_PATH[kind]}/${id}/share`));
}

export function unshareDocument(kind: DocumentKind, id: string): Promise<{ shareUrl: null }> {
  return call(() => apiClient.delete<{ shareUrl: null }>(`${DOCUMENT_PATH[kind]}/${id}/share`));
}

export async function emailDocument(kind: DocumentKind, id: string, request: EmailRequest): Promise<LoadedDocument> {
  const record = await call(() => apiClient.post<AnyRecord>(`${DOCUMENT_PATH[kind]}/${id}/email`, request, { timeout: 60000 }));
  return recordToLoaded(kind, record);
}

export async function cancelScheduledEmail(kind: DocumentKind, id: string): Promise<LoadedDocument> {
  const record = await call(() => apiClient.delete<AnyRecord>(`${DOCUMENT_PATH[kind]}/${id}/email/schedule`));
  return recordToLoaded(kind, record);
}
