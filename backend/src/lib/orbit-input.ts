import { asObject, text } from './document-input.js';
import { badRequestError } from './http-error.js';

const MAX_PROMPT = 1000;
const MAX_ATTACHMENT_CHARS = 4_200_000;
const ATTACHMENT = /^data:(image\/(png|jpeg|webp|gif)|application\/pdf);base64,/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface OrbitDocumentMeta {
  kind: 'invoice' | 'quotation';
  currency: string;
  today: string;
  gst: boolean;
  taxRates: number[];
}

export interface OrbitRequest {
  prompt: string;
  attachment?: string;
  meta: OrbitDocumentMeta;
  snapshot: Record<string, unknown> | null;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function readMeta(raw: unknown): OrbitDocumentMeta {
  const meta = asObject(raw);
  const currency = text(meta.currency, 3).toUpperCase();
  const today = text(meta.today, 10);
  const taxRates = Array.isArray(meta.taxRates)
    ? meta.taxRates.map(Number).filter((rate) => Number.isFinite(rate) && rate >= 0 && rate <= 100).slice(0, 12)
    : [];
  return {
    kind: meta.kind === 'quotation' ? 'quotation' : 'invoice',
    currency: /^[A-Z]{3}$/.test(currency) ? currency : 'INR',
    today: ISO_DATE.test(today) ? today : todayIso(),
    gst: meta.gst === true,
    taxRates,
  };
}

export function readOrbitRequest(body: unknown): OrbitRequest {
  const raw = asObject(body);
  const attachment = typeof raw.attachment === 'string' ? raw.attachment : '';
  if (attachment && (!ATTACHMENT.test(attachment) || attachment.length > MAX_ATTACHMENT_CHARS)) {
    throw badRequestError('Attach a photo, or a PDF up to 3 MB.');
  }
  const snapshot = asObject(raw.snapshot);
  return {
    prompt: text(raw.prompt, MAX_PROMPT),
    attachment: attachment || undefined,
    meta: readMeta(raw.document),
    snapshot: Array.isArray(snapshot.items) ? snapshot : null,
  };
}
