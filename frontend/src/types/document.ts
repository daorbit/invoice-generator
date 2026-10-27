export type DocumentKind = 'invoice' | 'quotation';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type DocumentStatus = InvoiceStatus | QuotationStatus;

export type DiscountType = 'percentage' | 'fixed';

export type TemplateId =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'bold'
  | 'soft'
  | 'studio'
  | 'agency'
  | 'capsule'
  | 'banner'
  | 'panel';
export type AccentId = 'blue' | 'indigo' | 'teal' | 'emerald' | 'amber' | 'crimson' | 'slate';

export interface Party {
  name: string;
  email: string;
  address: string;
  phone: string;
  website?: string;
  gstin?: string;
}

export interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

interface DesignFields {
  template?: TemplateId;
  accent?: AccentId;
  payment?: PaymentDetails;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface PricingFields extends DesignFields {
  items: LineItem[];
  tax: number;
  discount: number;
  discountType: DiscountType;
  shipping: number;
  currency: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  total?: number;
}

export interface InvoiceFields extends PricingFields {
  logo?: string;
  invoiceNumber: string;
  invoiceDate: string | null;
  dueDate: string | null;
  poNumber?: string;
  from: Party;
  billTo: Party;
  amountPaid: number;
  balanceDue?: number;
  notes?: string;
  terms?: string;
}

export interface QuotationFields extends PricingFields {
  logo?: string;
  quotationNumber: string;
  quotationDate: string | null;
  validUntil: string | null;
  referenceNumber?: string;
  from: Party;
  quoteTo: Party;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
  paymentTerms?: string;
}

export interface InvoiceRecord {
  id: string;
  invoice: InvoiceFields;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationRecord {
  id: string;
  quotation: QuotationFields;
  convertedInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDraft {
  kind: DocumentKind;
  status: DocumentStatus;
  number: string;
  issueDate: string | null;
  dueDate: string | null;
  reference: string;
  from: Party;
  client: Party;
  items: LineItem[];
  currency: string;
  tax: number;
  discount: number;
  discountType: DiscountType;
  shipping: number;
  amountPaid: number;
  notes: string;
  terms: string;
  logo?: string;
  template: TemplateId;
  accent: AccentId;
  payment?: PaymentDetails;
}

export interface DocumentSummary {
  id: string;
  kind: DocumentKind;
  number: string;
  client: string;
  issueDate: string | null;
  dueDate: string | null;
  total: number;
  currency: string;
  status: DocumentStatus;
  convertedInvoiceId?: string;
}

export interface DocumentPage {
  items: DocumentSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentQuery {
  page: number;
  limit: number;
  status?: DocumentStatus;
  search?: string;
}

export interface DashboardStats {
  invoices: { total: number; paid: number; unpaid: number; recent: number };
  quotations: { total: number; pending: number; accepted: number; rejected: number; recent: number };
  revenue: { total: number; paid: number; pending: number };
}
