import { Schema } from 'mongoose';

export interface Party {
  name: string;
  email: string;
  address: string;
  phone: string;
  website?: string;
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
  },
  { _id: false }
);

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
