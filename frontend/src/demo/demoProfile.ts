import type { BusinessProfile } from '@/types/businessProfile';
import type { Party, PaymentDetails } from '@/types/document';

export const demoProfile: BusinessProfile = {
  businessName: 'Acme Studio Pvt Ltd',
  email: 'billing@acme.example',
  phone: '+91 98765 43210',
  address: '4th Floor, Indiranagar 100ft Road\nBengaluru, Karnataka 560038',
  website: 'acme.example',
  gstin: '29ABCDE1234F1Z5',
  currency: 'INR',
  invoicePrefix: 'INV',
  quotationPrefix: 'QT',
  paymentTermsDays: 15,
  defaultNotes: 'Thank you for your business.',
  defaultTerms: 'Payment due within 15 days. Late payments attract 1.5% interest a month.',
  logo: '',
  defaultTemplate: 'modern',
  accentColor: 'indigo',
  bankName: 'HDFC Bank',
  accountName: 'Acme Studio Pvt Ltd',
  accountNumber: '50200012345678',
  ifsc: 'HDFC0001234',
  upiId: 'acmestudio@hdfcbank',
};

export const demoFrom: Party = {
  name: demoProfile.businessName,
  email: demoProfile.email,
  address: demoProfile.address,
  phone: demoProfile.phone,
  website: demoProfile.website,
  gstin: demoProfile.gstin,
};

export const demoPayment: PaymentDetails = {
  bankName: demoProfile.bankName,
  accountName: demoProfile.accountName,
  accountNumber: demoProfile.accountNumber,
  ifsc: demoProfile.ifsc,
  upiId: demoProfile.upiId,
};
