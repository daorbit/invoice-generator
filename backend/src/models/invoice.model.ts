import { Schema, model, type InferSchemaType } from 'mongoose';
import { designFields, partySchema, pricingFields } from './document-parts.js';

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

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
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    notes: { type: String },
    terms: { type: String },
    sourceQuotationId: { type: String },
  },
  { timestamps: true }
);

invoiceSchema.index({ workspaceId: 1, createdAt: -1 });
invoiceSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });
invoiceSchema.index({ workspaceId: 1, invoiceNumber: 1 }, { unique: true });

export type InvoiceDocument = InferSchemaType<typeof invoiceSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Invoice = model('Invoice', invoiceSchema);
