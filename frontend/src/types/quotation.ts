export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CompanyInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
  website?: string;
}

export interface Quotation {
  // Logo
  logo?: string;
  
  // Quotation Details
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;
  referenceNumber?: string;
  
  // From
  from: CompanyInfo;
  
  // Quote For (Client)
  quoteTo: CompanyInfo;
  
  // Items
  items: QuotationItem[];
  
  // Financial
  tax: number; // percentage
  discount: number; // percentage or fixed
  discountType: 'percentage' | 'fixed';
  shipping: number;
  currency: string;
  
  // Status
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  
  // Additional
  notes?: string;
  terms?: string;
  
  // Payment terms
  paymentTerms?: string;
}

export interface QuotationCalculations {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
}
