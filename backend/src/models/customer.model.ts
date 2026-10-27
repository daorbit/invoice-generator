import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

const customerSchema = new Schema(
  {
    workspaceId: { type: String, required: true },
    createdBy: { type: String },
    nameKey: { type: String, required: true },
    name: { type: String, required: true },
    contactName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    gstin: { type: String, default: '' },
    address: { type: String, default: '' },
    shippingAddress: { type: String, default: '' },
    stateCode: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

customerSchema.index({ workspaceId: 1, nameKey: 1 }, { unique: true });
customerSchema.index({ workspaceId: 1, updatedAt: -1 });

export type CustomerDocument = InferSchemaType<typeof customerSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Customer = model('Customer', customerSchema);
