import type { BusinessProfile } from '@/types/businessProfile';
import type { DocumentDraft, DocumentKind, LineItem, Party, PaymentDetails } from '@/types/document';
import { addDaysIso, todayIso } from './format';

const DEFAULT_TERMS_DAYS = 30;

export function newLineItem(): LineItem {
  return { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 };
}

export function businessParty(profile: BusinessProfile | null): Party {
  if (!profile) return { name: '', email: '', address: '', phone: '' };
  return {
    name: profile.businessName,
    email: profile.email,
    phone: profile.phone,
    website: profile.website,
    address: profile.address,
    gstin: profile.gstin || undefined,
  };
}

function businessPayment(profile: BusinessProfile | null): PaymentDetails | undefined {
  if (!profile) return undefined;
  const details = {
    bankName: profile.bankName,
    accountName: profile.accountName,
    accountNumber: profile.accountNumber,
    ifsc: profile.ifsc,
    upiId: profile.upiId,
  };
  return Object.values(details).some(Boolean) ? details : undefined;
}

export function newDraft(kind: DocumentKind, profile: BusinessProfile | null): DocumentDraft {
  return {
    kind,
    status: 'draft',
    number: '',
    issueDate: todayIso(),
    dueDate: addDaysIso(profile?.paymentTermsDays ?? DEFAULT_TERMS_DAYS),
    reference: '',
    from: businessParty(profile),
    client: { name: '', email: '', address: '', phone: '' },
    items: [newLineItem()],
    currency: profile?.currency || 'INR',
    tax: 0,
    discount: 0,
    discountType: 'percentage',
    shipping: 0,
    amountPaid: 0,
    notes: profile?.defaultNotes ?? '',
    terms: profile?.defaultTerms ?? '',
    logo: profile?.logo || undefined,
    template: profile?.defaultTemplate ?? 'classic',
    accent: profile?.accentColor ?? 'blue',
    payment: businessPayment(profile),
  };
}
