import type { DiscountType, DocumentKind } from './document';

export interface OrbitClientPatch {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  customerId?: string;
}

export interface OrbitItemPatch {
  description?: string;
  quantity?: number;
  rate?: number;
  unit?: string;
  hsn?: string;
  taxRate?: number;
  itemId?: string;
}

export interface OrbitDocumentPatch {
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  dueInDays?: number;
  reference?: string;
  discount?: number;
  discountType?: DiscountType;
  shipping?: number;
  amountPaid?: number;
  notes?: string;
  terms?: string;
  taxRate?: number;
  pricesIncludeTax?: boolean;
}

export type OrbitOp =
  | { op: 'setClient'; patch: OrbitClientPatch }
  | { op: 'addItem'; item: OrbitItemPatch & { description: string } }
  | { op: 'updateItem'; id: string; patch: OrbitItemPatch }
  | { op: 'removeItem'; id: string }
  | { op: 'setDocument'; patch: OrbitDocumentPatch };

export interface OrbitReply {
  ops: OrbitOp[];
  summary: string;
}

export interface OrbitDocumentMeta {
  kind: DocumentKind;
  currency: string;
  today: string;
  gst: boolean;
  taxRates: number[];
}

export interface OrbitSnapshot {
  client: { name: string; email: string; phone: string; address: string; gstin: string };
  items: { id: string; description: string; quantity: number; rate: number; unit: string; hsn: string; taxRate: number }[];
  currency: string;
  issueDate: string;
  dueDate: string;
  discount: number;
  discountType: DiscountType;
  shipping: number;
  amountPaid: number;
  reference: string;
  notes: string;
  terms: string;
}

export interface OrbitRequest {
  prompt?: string;
  attachment?: string;
  document: OrbitDocumentMeta;
  snapshot?: OrbitSnapshot;
}
