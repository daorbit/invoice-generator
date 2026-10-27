import { asObject, text } from './document-input.js';
import { badRequestError } from './http-error.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 5;
const MAX_PDF_CHARS = 8_000_000;
const PDF_PREFIX = /^data:application\/pdf;(?:[^;,]+;)*base64,/;
const MIN_LEAD_MS = 60 * 1000;
const MAX_LEAD_MS = 90 * 24 * 60 * 60 * 1000;

function addresses(value: unknown, label: string, required: boolean): string[] {
  const list = Array.isArray(value) ? value : [];
  const cleaned = [...new Set(list.map((entry) => text(entry, 200).toLowerCase()).filter(Boolean))];
  if (required && !cleaned.length) throw badRequestError(`Add at least one ${label} address`);
  if (cleaned.length > MAX_RECIPIENTS) throw badRequestError(`Up to ${MAX_RECIPIENTS} ${label} addresses`);
  const invalid = cleaned.find((address) => !EMAIL.test(address));
  if (invalid) throw badRequestError(`${invalid} is not a valid email address`);
  return cleaned;
}

function pdf(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  if (value.length > MAX_PDF_CHARS) throw badRequestError('The PDF is too large to attach');
  const base64 = value.replace(PDF_PREFIX, '');
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(base64)) throw badRequestError('The PDF could not be read');
  return base64;
}

function sendAt(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const at = new Date(value);
  if (Number.isNaN(at.getTime())) throw badRequestError('Pick a valid time to send');
  const lead = at.getTime() - Date.now();
  if (lead < MIN_LEAD_MS) return undefined;
  if (lead > MAX_LEAD_MS) throw badRequestError('Schedule within the next 90 days');
  return at;
}

export function readEmailInput(body: unknown) {
  const raw = asObject(body);
  const subject = text(raw.subject, 200);
  if (!subject) throw badRequestError('Add a subject');
  return {
    to: addresses(raw.to, 'recipient', true),
    cc: addresses(raw.cc, 'cc', false),
    subject,
    message: text(raw.message, 5000),
    pdf: pdf(raw.pdf),
    sendAt: sendAt(raw.sendAt),
  };
}

export type EmailInput = ReturnType<typeof readEmailInput>;
