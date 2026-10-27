import { Schema, model } from 'mongoose';

export const DEFAULT_PROFILE = {
  businessName: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  gstin: '',
  currency: 'INR',
  invoicePrefix: 'INV',
  quotationPrefix: 'QUO',
  paymentTermsDays: 30,
  defaultNotes: '',
  defaultTerms: '',
  logo: '',
  defaultTemplate: 'classic',
  accentColor: 'blue',
  bankName: '',
  accountName: '',
  accountNumber: '',
  ifsc: '',
  upiId: '',
};

export type BusinessProfileFields = typeof DEFAULT_PROFILE;

const businessProfileSchema = new Schema(
  {
    workspaceId: { type: String, required: true },
    updatedBy: { type: String },
    businessName: { type: String, default: DEFAULT_PROFILE.businessName },
    email: { type: String, default: DEFAULT_PROFILE.email },
    phone: { type: String, default: DEFAULT_PROFILE.phone },
    address: { type: String, default: DEFAULT_PROFILE.address },
    website: { type: String, default: DEFAULT_PROFILE.website },
    gstin: { type: String, default: DEFAULT_PROFILE.gstin },
    currency: { type: String, default: DEFAULT_PROFILE.currency },
    invoicePrefix: { type: String, default: DEFAULT_PROFILE.invoicePrefix },
    quotationPrefix: { type: String, default: DEFAULT_PROFILE.quotationPrefix },
    paymentTermsDays: { type: Number, default: DEFAULT_PROFILE.paymentTermsDays },
    defaultNotes: { type: String, default: DEFAULT_PROFILE.defaultNotes },
    defaultTerms: { type: String, default: DEFAULT_PROFILE.defaultTerms },
    logo: { type: String, default: DEFAULT_PROFILE.logo },
    defaultTemplate: { type: String, default: DEFAULT_PROFILE.defaultTemplate },
    accentColor: { type: String, default: DEFAULT_PROFILE.accentColor },
    bankName: { type: String, default: DEFAULT_PROFILE.bankName },
    accountName: { type: String, default: DEFAULT_PROFILE.accountName },
    accountNumber: { type: String, default: DEFAULT_PROFILE.accountNumber },
    ifsc: { type: String, default: DEFAULT_PROFILE.ifsc },
    upiId: { type: String, default: DEFAULT_PROFILE.upiId },
    customersSeededAt: { type: Date },
  },
  { timestamps: true }
);

businessProfileSchema.index({ workspaceId: 1 }, { unique: true });

export const BusinessProfile = model('BusinessProfile', businessProfileSchema);
