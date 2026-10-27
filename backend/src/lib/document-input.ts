import type { DiscountType, LineItem, Party } from '../models/document-parts.js';
import { round2 } from './totals.js';
import { badRequestError } from './http-error.js';

const MAX_TEXT = 500;
const MAX_LONG_TEXT = 5000;
const MAX_ITEMS = 200;
const MAX_LOGO_CHARS = 3_000_000;
const MAX_AMOUNT = 1_000_000_000_000;

type Raw = Record<string, unknown>;

function asObject(value: unknown): Raw {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Raw) : {};
}

export function text(value: unknown, max = MAX_TEXT): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function optionalText(value: unknown, max = MAX_TEXT): string | undefined {
  const result = text(value, max);
  return result || undefined;
}

function amount(value: unknown, min = 0, max = MAX_AMOUNT): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(parsed, min), max);
}

function date(value: unknown): Date | undefined {
  if (typeof value !== 'string' && !(value instanceof Date)) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function party(value: unknown): Party {
  const raw = asObject(value);
  return {
    name: text(raw.name),
    email: text(raw.email),
    address: text(raw.address, 1000),
    phone: text(raw.phone, 50),
    website: optionalText(raw.website),
  };
}

function lineItems(value: unknown): LineItem[] {
  if (!Array.isArray(value)) return [];
  if (value.length > MAX_ITEMS) throw badRequestError(`A document can have at most ${MAX_ITEMS} items`);
  return value.map((entry, index) => {
    const raw = asObject(entry);
    const quantity = amount(raw.quantity);
    const rate = amount(raw.rate);
    return {
      id: text(raw.id, 64) || String(index + 1),
      description: text(raw.description, 1000),
      quantity,
      rate,
      amount: round2(quantity * rate),
    };
  });
}

function logo(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  if (value.length > MAX_LOGO_CHARS) throw badRequestError('The logo is too large');
  return value.startsWith('data:image/') || value.startsWith('https://') ? value : undefined;
}

function currency(value: unknown): string {
  const code = text(value, 3).toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : 'USD';
}

function discountType(value: unknown): DiscountType {
  return value === 'fixed' ? 'fixed' : 'percentage';
}

function pricing(raw: Raw) {
  return {
    items: lineItems(raw.items),
    tax: amount(raw.tax, 0, 100),
    discount: amount(raw.discount),
    discountType: discountType(raw.discountType),
    shipping: amount(raw.shipping),
    currency: currency(raw.currency),
  };
}

export function readInvoiceInput(body: unknown) {
  const raw = asObject(asObject(body).invoice);
  const shipTo = raw.shipTo ? party(raw.shipTo) : undefined;
  return {
    logo: logo(raw.logo),
    invoiceNumber: text(raw.invoiceNumber, 64),
    invoiceDate: date(raw.invoiceDate),
    dueDate: date(raw.dueDate),
    poNumber: optionalText(raw.poNumber, 64),
    from: party(raw.from),
    billTo: party(raw.billTo),
    shipTo,
    ...pricing(raw),
    amountPaid: amount(raw.amountPaid),
    notes: optionalText(raw.notes, MAX_LONG_TEXT),
    terms: optionalText(raw.terms, MAX_LONG_TEXT),
  };
}

export function readQuotationInput(body: unknown) {
  const raw = asObject(asObject(body).quotation);
  return {
    logo: logo(raw.logo),
    quotationNumber: text(raw.quotationNumber, 64),
    quotationDate: date(raw.quotationDate),
    validUntil: date(raw.validUntil),
    referenceNumber: optionalText(raw.referenceNumber, 64),
    from: party(raw.from),
    quoteTo: party(raw.quoteTo),
    ...pricing(raw),
    notes: optionalText(raw.notes, MAX_LONG_TEXT),
    terms: optionalText(raw.terms, MAX_LONG_TEXT),
    paymentTerms: optionalText(raw.paymentTerms, MAX_LONG_TEXT),
  };
}

export type InvoiceInput = ReturnType<typeof readInvoiceInput>;
export type QuotationInput = ReturnType<typeof readQuotationInput>;
