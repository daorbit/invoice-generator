import { Schema, model, type InferSchemaType, type Types } from 'mongoose';
import {
  designFields,
  gstFields,
  partySchema,
  pricingFields,
  relationFields,
  sharingFields,
} from './document-parts.js';

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

const invoiceSourceSchema = new Schema(
  {
    kind: { type: String, enum: ['form'], required: true },
    formId: { type: String, required: true },
    formTitle: { type: String, default: '' },
    submissionId: { type: String, required: true },
    paymentId: { type: String, default: '' },
  },
  { _id: false }
);

const invoiceSchema = new Schema(
  {
    workspaceId: { type: String, required: true },
    createdBy: { type: String },
    status: { type: String, enum: INVOICE_STATUSES, default: 'draft' },
    logo: { type: String },
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date },
    dueDate: { type: Date },
    poNumber: { type: String },
    from: { type: partySchema, default: () => ({}) },
    billTo: { type: partySchema, default: () => ({}) },
    shipTo: { type: partySchema },
    ...pricingFields,
    ...designFields,
    ...gstFields,
    ...relationFields,
    ...sharingFields,
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    paidAt: { type: Date },
    notes: { type: String },
    terms: { type: String },
    sourceQuotationId: { type: String },
    source: { type: invoiceSourceSchema },
  },
  { timestamps: true }
);

invoiceSchema.index({ workspaceId: 1, createdAt: -1 });
invoiceSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });
invoiceSchema.index({ workspaceId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ workspaceId: 1, invoiceDate: -1 });
invoiceSchema.index({ workspaceId: 1, paidAt: -1 });
invoiceSchema.index({ workspaceId: 1, customerId: 1, createdAt: -1 });
invoiceSchema.index(
  { workspaceId: 1, 'source.submissionId': 1 },
  { unique: true, partialFilterExpression: { 'source.submissionId': { $type: 'string' } } }
);
invoiceSchema.index({ shareToken: 1 }, { unique: true, sparse: true });

export type InvoiceDocument = InferSchemaType<typeof invoiceSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Invoice = model('Invoice', invoiceSchema);
