import type { CompanyInfo } from './invoice';

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
}

export interface BusinessProfileResponse {
  profile: BusinessProfile;
  complete: boolean;
}

export interface BusinessDefaults {
  from: CompanyInfo;
  currency: string;
  notes: string;
  terms: string;
}
