import { DEFAULT_PROFILE, type BusinessProfileFields } from '../models/business-profile.model.js';
import { badRequestError } from './http-error.js';
import { text } from './document-input.js';

const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PREFIX = /^[A-Z0-9-]{1,10}$/;
const CURRENCY = /^[A-Z]{3}$/;
const MAX_TERMS_DAYS = 365;

function prefix(value: unknown, fallback: string): string {
  const cleaned = text(value, 10).toUpperCase();
  if (!cleaned) return fallback;
  if (!PREFIX.test(cleaned)) throw badRequestError('Prefixes use letters, numbers and dashes, up to 10 characters');
  return cleaned;
}

export function readBusinessProfileInput(body: unknown): BusinessProfileFields {
  const raw = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const businessName = text(raw.businessName, 200);
  if (!businessName) throw badRequestError('Business name is required');

  const email = text(raw.email, 200);
  if (!EMAIL.test(email)) throw badRequestError('Enter a valid business email');

  const address = text(raw.address, 1000);
  if (!address) throw badRequestError('Business address is required');

  const gstin = text(raw.gstin, 15).toUpperCase();
  if (gstin && !GSTIN.test(gstin)) throw badRequestError('Enter a valid 15-character GSTIN, or leave it blank');

  const currency = text(raw.currency, 3).toUpperCase() || DEFAULT_PROFILE.currency;
  if (!CURRENCY.test(currency)) throw badRequestError('Pick a valid currency');

  const days = Number(raw.paymentTermsDays);
  const paymentTermsDays = Number.isInteger(days) && days >= 0 && days <= MAX_TERMS_DAYS
    ? days
    : DEFAULT_PROFILE.paymentTermsDays;

  return {
    businessName,
    email,
    phone: text(raw.phone, 50),
    address,
    website: text(raw.website, 200),
    gstin,
    currency,
    invoicePrefix: prefix(raw.invoicePrefix, DEFAULT_PROFILE.invoicePrefix),
    quotationPrefix: prefix(raw.quotationPrefix, DEFAULT_PROFILE.quotationPrefix),
    paymentTermsDays,
    defaultNotes: text(raw.defaultNotes, 2000),
    defaultTerms: text(raw.defaultTerms, 2000),
  };
}
