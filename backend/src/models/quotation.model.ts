import { Schema, model, type InferSchemaType, type Types } from 'mongoose';
import {
  designFields,
  gstFields,
  partySchema,
  pricingFields,
  relationFields,
  sharingFields,
} from './document-parts.js';

export const QUOTATION_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export const CLIENT_DECISIONS = ['accepted', 'rejected'] as const;
export type ClientDecision = (typeof CLIENT_DECISIONS)[number];

const clientResponseSchema = new Schema(
  {
    decision: { type: String, enum: CLIENT_DECISIONS, required: true },
    name: { type: String, default: '' },
    comment: { type: String, default: '' },
    at: { type: Date, required: true },
  },
  { _id: false }
);

const quotationSchema = new Schema(
  {
    workspaceId: { type: String, required: true },
    createdBy: { type: String },
    status: { type: String, enum: QUOTATION_STATUSES, default: 'draft' },
    logo: { type: String },
    quotationNumber: { type: String, required: true },
    quotationDate: { type: Date },
    validUntil: { type: Date },
    referenceNumber: { type: String },
    from: { type: partySchema, default: () => ({}) },
    quoteTo: { type: partySchema, default: () => ({}) },
    ...pricingFields,
    ...designFields,
    ...gstFields,
    ...relationFields,
    ...sharingFields,
    notes: { type: String },
    terms: { type: String },
    paymentTerms: { type: String },
    convertedInvoiceId: { type: String },
    clientResponse: { type: clientResponseSchema },
  },
  { timestamps: true }
);

quotationSchema.index({ workspaceId: 1, createdAt: -1 });
quotationSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });
quotationSchema.index({ workspaceId: 1, quotationNumber: 1 }, { unique: true });
quotationSchema.index({ workspaceId: 1, quotationDate: -1 });
quotationSchema.index({ workspaceId: 1, customerId: 1, createdAt: -1 });
quotationSchema.index({ shareToken: 1 }, { unique: true, sparse: true });

export type QuotationDocument = InferSchemaType<typeof quotationSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Quotation = model('Quotation', quotationSchema);
