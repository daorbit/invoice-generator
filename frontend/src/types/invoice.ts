export interface InvoiceItem {
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

export interface Invoice {
  // Logo
  logo?: string;
  
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  poNumber?: string;
  
  // From
  from: CompanyInfo;
  
  // Bill To
  billTo: CompanyInfo;
  
  // Ship To (optional)
  shipTo?: CompanyInfo;
  
  // Items
  items: InvoiceItem[];
  
  // Financial
  tax: number; // percentage
  taxAmount?: number;
  discount: number; // percentage or fixed
  discountType: 'percentage' | 'fixed';
  discountAmount?: number;
  shipping: number;
  amountPaid: number;
  currency: string;
  
  // Additional
  notes?: string;
  terms?: string;
}

export interface InvoiceCalculations {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  balanceDue: number;
}
