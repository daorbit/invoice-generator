import { Schema, model } from 'mongoose';

export type CounterKind = 'invoice' | 'quotation';

const counterSchema = new Schema({
  workspaceId: { type: String, required: true },
  kind: { type: String, enum: ['invoice', 'quotation'], required: true },
  seq: { type: Number, default: 0 },
});

counterSchema.index({ workspaceId: 1, kind: 1 }, { unique: true });

export const Counter = model('Counter', counterSchema);
