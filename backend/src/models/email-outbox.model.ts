import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

export const OUTBOX_STATUSES = ['scheduled', 'sending', 'sent', 'failed'] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

const emailOutboxSchema = new Schema(
  {
    workspaceId: { type: String, required: true },
    kind: { type: String, enum: ['invoice', 'quotation'], required: true },
    documentId: { type: String, required: true },
    to: { type: [String], default: [] },
    cc: { type: [String], default: [] },
    subject: { type: String, required: true },
    message: { type: String, default: '' },
    pdf: { type: String },
    sendAt: { type: Date, required: true },
    status: { type: String, enum: OUTBOX_STATUSES, default: 'scheduled' },
    claimId: { type: String },
    error: { type: String },
    expireAt: { type: Date },
  },
  { timestamps: true }
);

emailOutboxSchema.index({ status: 1, sendAt: 1 });
emailOutboxSchema.index({ workspaceId: 1, documentId: 1, status: 1 });
emailOutboxSchema.index({ claimId: 1 }, { sparse: true });
emailOutboxSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export type EmailOutboxDocument = InferSchemaType<typeof emailOutboxSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const EmailOutbox = model('EmailOutbox', emailOutboxSchema);
