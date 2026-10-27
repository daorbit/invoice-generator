import type { InvoiceRecord, QuotationRecord } from './document';

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  gstin: string;
  address: string;
  shippingAddress: string;
  stateCode: string;
  notes: string;
  outstanding: number;
  updatedAt: string;
}

export type CustomerInput = Omit<Customer, 'id' | 'outstanding' | 'updatedAt'>;

export interface CustomerStats {
  invoiced: number;
  paid: number;
  outstanding: number;
  overdue: number;
  invoices: number;
}

export interface CustomerDetail {
  customer: Customer;
  stats: CustomerStats;
  invoices: InvoiceRecord[];
  quotations: QuotationRecord[];
}

export type ItemKind = 'service' | 'goods';

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  kind: ItemKind;
  unit: string;
  rate: number;
  hsn: string;
  taxRate: number;
  updatedAt: string;
}

export type CatalogItemInput = Omit<CatalogItem, 'id' | 'updatedAt'>;

export interface Paged<T> {
  rows: T[];
  total: number;
  page: number;
  totalPages: number;
}
