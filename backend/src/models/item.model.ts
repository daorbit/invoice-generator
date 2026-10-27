import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

export const ITEM_KINDS = ['service', 'goods'] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

const itemSchema = new Schema(
  {
    workspaceId: { type: String, required: true },
    createdBy: { type: String },
    nameKey: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    kind: { type: String, enum: ITEM_KINDS, default: 'service' },
    unit: { type: String, default: '' },
    rate: { type: Number, default: 0 },
    hsn: { type: String, default: '' },
    taxRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

itemSchema.index({ workspaceId: 1, nameKey: 1 }, { unique: true });
itemSchema.index({ workspaceId: 1, updatedAt: -1 });

export type ItemDocument = InferSchemaType<typeof itemSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Item = model('Item', itemSchema);
