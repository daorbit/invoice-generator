import axios from 'axios';
import { API_BASE_URL, handleApiError } from './client';
import { invoiceToDraft, quotationToDraft } from '@/lib/documentMapping';
import type { ClientResponse, DocumentDraft, InvoiceRecord, QuotationRecord } from '@/types/document';

const publicClient = axios.create({ baseURL: `${API_BASE_URL}/public`, timeout: 30000 });

type PublicPayload =
  | { kind: 'invoice'; record: InvoiceRecord; brandLogo: string; canRespond: boolean }
  | { kind: 'quotation'; record: QuotationRecord; brandLogo: string; canRespond: boolean };

export interface PublicDocument {
  draft: DocumentDraft;
  brandLogo: string;
  canRespond: boolean;
  clientResponse: ClientResponse | null;
}

function toPublicDocument(payload: PublicPayload): PublicDocument {
  if (payload.kind === 'invoice') {
    return { draft: invoiceToDraft(payload.record), brandLogo: payload.brandLogo, canRespond: false, clientResponse: null };
  }
  return {
    draft: quotationToDraft(payload.record),
    brandLogo: payload.brandLogo,
    canRespond: payload.canRespond,
    clientResponse: payload.record.clientResponse ?? null,
  };
}

async function request(run: () => Promise<{ data: PublicPayload }>): Promise<PublicDocument> {
  try {
    return toPublicDocument((await run()).data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export function getPublicDocument(token: string, preview: boolean): Promise<PublicDocument> {
  return request(() =>
    publicClient.get<PublicPayload>(`/documents/${encodeURIComponent(token)}`, {
      params: preview ? { preview: '1' } : undefined,
    })
  );
}

export function replyToQuotation(
  token: string,
  reply: { decision: ClientResponse['decision']; name: string; comment: string }
): Promise<PublicDocument> {
  return request(() => publicClient.post<PublicPayload>(`/documents/${encodeURIComponent(token)}/respond`, reply));
}
