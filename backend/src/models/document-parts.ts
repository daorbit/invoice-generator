import { Schema } from 'mongoose';
import { ACCENTS, TEMPLATES } from '../lib/design.js';

export interface Party {
  name: string;
  email: string;
  address: string;
  phone: string;
  website?: string;
  gstin?: string;
}

export interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate?: number;
  hsn?: string;
  unit?: string;
  itemId?: string;
}

export type DiscountType = 'percentage' | 'fixed';
export type TaxMode = 'document' | 'line';

export interface TaxLine {
  rate: number;
  taxable: number;
  tax: number;
}

export interface Totals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  roundOffAmount: number;
  total: number;
  taxLines: TaxLine[];
}

export const partySchema = new Schema<Party>(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String },
    gstin: { type: String },
  },
  { _id: false }
);

export const paymentSchema = new Schema<PaymentDetails>(
  {
    bankName: { type: String, default: '' },
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    upiId: { type: String, default: '' },
  },
  { _id: false }
);

export const designFields = {
  template: { type: String, enum: TEMPLATES, default: 'classic' },
  accent: { type: String, enum: ACCENTS, default: 'blue' },
  payment: { type: paymentSchema },
};

export const lineItemSchema = new Schema<LineItem>(
  {
    id: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    taxRate: { type: Number },
    hsn: { type: String },
    unit: { type: String },
    itemId: { type: String },
  },
  { _id: false }
);

const taxLineSchema = new Schema<TaxLine>(
  {
    rate: { type: Number, default: 0 },
    taxable: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
  },
  { _id: false }
);

export const pricingFields = {
  items: { type: [lineItemSchema], default: [] },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  shipping: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  taxMode: { type: String, enum: ['document', 'line'], default: 'document' },
  pricesIncludeTax: { type: Boolean, default: false },
  roundOff: { type: Boolean, default: false },
  subtotal: { type: Number, default: 0 },
  taxableAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  roundOffAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  taxLines: { type: [taxLineSchema], default: [] },
};

export const gstFields = {
  placeOfSupply: { type: String },
  supplyState: { type: String },
  interState: { type: Boolean, default: false },
  reverseCharge: { type: Boolean, default: false },
  exportUnderLut: { type: Boolean, default: false },
};

export const relationFields = {
  customerId: { type: String },
};

const viewsSchema = new Schema(
  {
    count: { type: Number, default: 0 },
    firstAt: { type: Date },
    lastAt: { type: Date },
  },
  { _id: false }
);

const emailStampSchema = new Schema(
  {
    to: { type: [String], default: [] },
    at: { type: Date },
  },
  { _id: false }
);

export const sharingFields = {
  shareToken: { type: String },
  views: { type: viewsSchema },
  lastEmail: { type: emailStampSchema },
  scheduledEmail: { type: emailStampSchema },
};
