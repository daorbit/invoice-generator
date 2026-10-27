import type { AccentId, TemplateId } from './document';

export interface BusinessProfile {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  gstin: string;
  currency: string;
  invoicePrefix: string;
  quotationPrefix: string;
  paymentTermsDays: number;
  defaultNotes: string;
  defaultTerms: string;
  logo: string;
  defaultTemplate: TemplateId;
  accentColor: AccentId;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

export interface BusinessProfileResponse {
  profile: BusinessProfile;
  complete: boolean;
}
