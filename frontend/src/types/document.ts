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
  taxRate: number;
  hsn?: string;
  unit?: string;
  itemId?: string;
}

export interface TaxLine {
  rate: number;
  taxable: number;
  tax: number;
}

interface PricingFields extends DesignFields {
  items: LineItem[];
  tax: number;
  discount: number;
  discountType: DiscountType;
  shipping: number;
  currency: string;
  taxMode?: 'document' | 'line';
  pricesIncludeTax?: boolean;
  roundOff?: boolean;
  subtotal?: number;
  taxableAmount?: number;
  taxAmount?: number;
  taxLines?: TaxLine[];
  discountAmount?: number;
  roundOffAmount?: number;
  total?: number;
  placeOfSupply?: string;
  supplyState?: string;
  interState?: boolean;
  reverseCharge?: boolean;
  exportUnderLut?: boolean;
  customerId?: string;
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
  paidAt?: string | null;
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

export interface EmailStamp {
  to: string[];
  at: string;
}

export interface DocumentActivity {
  shareUrl: string | null;
  views: { count: number; firstAt: string | null; lastAt: string | null };
  lastEmail: EmailStamp | null;
  scheduledEmail: EmailStamp | null;
}

export interface ClientResponse {
  decision: 'accepted' | 'rejected';
  name: string;
  comment: string;
  at: string;
}

export interface InvoiceRecord {
  id: string;
  invoice: InvoiceFields;
  status: InvoiceStatus;
  activity?: DocumentActivity;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationRecord {
  id: string;
  quotation: QuotationFields;
  convertedInvoiceId?: string;
  clientResponse?: ClientResponse | null;
  activity?: DocumentActivity;
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
  customerId?: string;
  items: LineItem[];
  currency: string;
  tax: number;
  discount: number;
  discountType: DiscountType;
  shipping: number;
  amountPaid: number;
  pricesIncludeTax: boolean;
  roundOff: boolean;
  placeOfSupply: string;
  reverseCharge: boolean;
  exportUnderLut: boolean;
  notes: string;
  terms: string;
  logo?: string;
  template: TemplateId;
  accent: AccentId;
  payment?: PaymentDetails;
}

export interface LoadedDocument {
  id: string;
  draft: DocumentDraft;
  activity: DocumentActivity | null;
  clientResponse: ClientResponse | null;
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

export interface CurrencyDashboardStats {
  currency: string;
  invoices: { total: number; paid: number; unpaid: number; recent: number; byStatus?: Partial<Record<DocumentStatus, number>> };
  quotations: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    recent: number;
    byStatus?: Partial<Record<DocumentStatus, number>>;
  };
  revenue: { total: number; paid: number; pending: number };
  receivables: { current: number; overdue: number; openCount: number; overdueCount: number };
}

export interface DashboardStats extends CurrencyDashboardStats {
  currencies: string[];
  byCurrency: Record<string, CurrencyDashboardStats>;
}

export interface EmailRequest {
  to: string[];
  cc: string[];
  subject: string;
  message: string;
  pdf?: string;
  sendAt?: string;
}
