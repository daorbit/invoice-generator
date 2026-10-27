import { Schema, model, type InferSchemaType, type Types } from 'mongoose';
import { designFields, partySchema, pricingFields } from './document-parts.js';

export const QUOTATION_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

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
    notes: { type: String },
    terms: { type: String },
    paymentTerms: { type: String },
    convertedInvoiceId: { type: String },
  },
  { timestamps: true }
);

quotationSchema.index({ workspaceId: 1, createdAt: -1 });
quotationSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });
quotationSchema.index({ workspaceId: 1, quotationNumber: 1 }, { unique: true });

export type QuotationDocument = InferSchemaType<typeof quotationSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Quotation = model('Quotation', quotationSchema);
