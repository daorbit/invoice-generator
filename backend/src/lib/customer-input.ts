import { asObject, gstin, text } from './document-input.js';
import { badRequestError } from './http-error.js';
import { readStateCode } from './gst.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

export function nameKeyOf(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function readCustomerInput(body: unknown) {
  const raw = asObject(body);

  const name = text(raw.name, 200);
  if (!name) throw badRequestError('Customer name is required');

  const email = text(raw.email, 200);
  if (email && !EMAIL.test(email)) throw badRequestError('Enter a valid email, or leave it blank');

  const taxId = gstin(raw.gstin) ?? '';
  if (taxId && !GSTIN.test(taxId)) throw badRequestError('Enter a valid 15-character GSTIN, or leave it blank');

  return {
    name,
    nameKey: nameKeyOf(name),
    contactName: text(raw.contactName, 200),
    email,
    phone: text(raw.phone, 50),
    website: text(raw.website, 200),
    gstin: taxId,
    address: text(raw.address, 1000),
    shippingAddress: text(raw.shippingAddress, 1000),
    stateCode: readStateCode(raw.stateCode) || readStateCode(taxId.slice(0, 2)),
    notes: text(raw.notes, 2000),
  };
}

export type CustomerInput = ReturnType<typeof readCustomerInput>;
