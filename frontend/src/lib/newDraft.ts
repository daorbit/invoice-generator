import type { BusinessProfile } from '@/types/businessProfile';
import type { CatalogItem, Customer } from '@/types/catalog';
import type { DocumentDraft, DocumentKind, LineItem, Party, PaymentDetails } from '@/types/document';
import { addDaysIso, todayIso } from './format';
import { lineAmount } from './totals';

const DEFAULT_TERMS_DAYS = 30;

export function newLineItem(taxRate = 0): LineItem {
  return { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0, taxRate };
}

export function lineFromCatalog(line: LineItem, item: CatalogItem): LineItem {
  const next = {
    ...line,
    description: item.description ? `${item.name} – ${item.description}` : item.name,
    rate: item.rate,
    taxRate: item.taxRate,
    hsn: item.hsn || undefined,
    unit: item.unit || undefined,
    itemId: item.id,
  };
  return { ...next, amount: lineAmount(next) };
}

export function customerParty(customer: Customer): Party {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    website: customer.website || undefined,
    gstin: customer.gstin || undefined,
  };
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
  const currency = profile?.currency || 'INR';
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
    currency,
    tax: 0,
    discount: 0,
    discountType: 'percentage',
    shipping: 0,
    amountPaid: 0,
    pricesIncludeTax: false,
    roundOff: currency === 'INR',
    placeOfSupply: '',
    reverseCharge: false,
    exportUnderLut: false,
    notes: profile?.defaultNotes ?? '',
    terms: profile?.defaultTerms ?? '',
    logo: profile?.logo || undefined,
    template: profile?.defaultTemplate ?? 'classic',
    accent: profile?.accentColor ?? 'blue',
    payment: businessPayment(profile),
  };
}
