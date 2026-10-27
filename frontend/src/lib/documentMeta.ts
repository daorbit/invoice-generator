import type { PillTone } from '@/components/ui/StatusPill';
import type { DocumentKind, DocumentStatus } from '@/types/document';

interface StatusMeta {
  label: string;
  tone: PillTone;
}

export const STATUS_META: Record<DocumentStatus, StatusMeta> = {
  draft: { label: 'Draft', tone: 'idle' },
  sent: { label: 'Sent', tone: 'live' },
  paid: { label: 'Paid', tone: 'good' },
  overdue: { label: 'Overdue', tone: 'warn' },
  cancelled: { label: 'Cancelled', tone: 'bad' },
  accepted: { label: 'Accepted', tone: 'good' },
  rejected: { label: 'Rejected', tone: 'bad' },
  expired: { label: 'Expired', tone: 'warn' },
};

export const STATUSES: Record<DocumentKind, DocumentStatus[]> = {
  invoice: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
  quotation: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
};

interface KindMeta {
  singular: string;
  plural: string;
  dueLabel: string;
  clientLabel: string;
  referenceLabel: string;
  termsLabel: string;
}

export const KIND_META: Record<DocumentKind, KindMeta> = {
  invoice: {
    singular: 'Invoice',
    plural: 'Invoices',
    dueLabel: 'Due date',
    clientLabel: 'Bill to',
    referenceLabel: 'PO number',
    termsLabel: 'Terms',
  },
  quotation: {
    singular: 'Quotation',
    plural: 'Quotations',
    dueLabel: 'Valid until',
    clientLabel: 'Quote for',
    referenceLabel: 'Reference',
    termsLabel: 'Payment terms',
  },
};

export const CURRENCIES = [
  { value: 'INR', label: 'INR, Indian rupee' },
  { value: 'USD', label: 'USD, US dollar' },
  { value: 'EUR', label: 'EUR, Euro' },
  { value: 'GBP', label: 'GBP, British pound' },
  { value: 'AED', label: 'AED, UAE dirham' },
  { value: 'AUD', label: 'AUD, Australian dollar' },
  { value: 'CAD', label: 'CAD, Canadian dollar' },
  { value: 'SGD', label: 'SGD, Singapore dollar' },
];

export const PAGE_SIZE = 20;
