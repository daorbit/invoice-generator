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
}

export type DiscountType = 'percentage' | 'fixed';

export interface Totals {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
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
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
};
