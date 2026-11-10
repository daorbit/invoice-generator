import type {
  DocumentActivity,
  InvoiceRecord,
  InvoiceStatus,
  LineItem,
  Party,
  QuotationRecord,
  QuotationStatus,
} from '@/types/document';
import { demoCustomers, demoItems } from './demoCatalog';
import { daysAgo, daysAhead } from './demoDates';
import { demoFrom, demoPayment, demoProfile } from './demoProfile';

type Line = [itemIndex: number, quantity: number];

const SELLER_STATE = '29';

function lines(spec: Line[]): LineItem[] {
  return spec.map(([index, quantity], n) => {
    const item = demoItems[index];
    return {
      id: `line-${n}`,
      description: item.name,
      quantity,
      rate: item.rate,
      amount: item.rate * quantity,
      taxRate: item.taxRate,
      hsn: item.hsn,
      unit: item.unit,
      itemId: item.id,
    };
  });
}

function pricing(items: LineItem[], customerIndex: number) {
  const subtotal = items.reduce((sum, line) => sum + line.amount, 0);
  const taxAmount = items.reduce((sum, line) => sum + (line.amount * line.taxRate) / 100, 0);
  const customer = demoCustomers[customerIndex];
  return {
    items,
    tax: 18,
    taxMode: 'line' as const,
    discount: 0,
    discountType: 'percentage' as const,
    shipping: 0,
    currency: demoProfile.currency,
    pricesIncludeTax: false,
    roundOff: true,
    subtotal,
    taxableAmount: subtotal,
    taxAmount,
    taxLines: [{ rate: 18, taxable: subtotal, tax: taxAmount }],
    discountAmount: 0,
    roundOffAmount: 0,
    total: subtotal + taxAmount,
    placeOfSupply: customer.stateCode,
    supplyState: customer.stateCode,
    interState: customer.stateCode !== SELLER_STATE,
    customerId: customer.id,
    template: demoProfile.defaultTemplate,
    accent: demoProfile.accentColor,
    payment: demoPayment,
  };
}

function party(customerIndex: number): Party {
  const c = demoCustomers[customerIndex];
  return { name: c.name, email: c.email, address: c.address, phone: c.phone, gstin: c.gstin };
}

function activity(views: number, emailedDaysAgo: number | null, email: string): DocumentActivity {
  return {
    shareUrl: null,
    views: { count: views, firstAt: views ? daysAgo(6) : null, lastAt: views ? daysAgo(1) : null },
    lastEmail: emailedDaysAgo === null ? null : { to: [email], at: daysAgo(emailedDaysAgo) },
    scheduledEmail: null,
  };
}

type InvoiceSpec = { n: number; customer: number; status: InvoiceStatus; issued: number; terms: number; items: Line[]; views: number };

const INVOICES: InvoiceSpec[] = [
  { n: 14, customer: 0, status: 'sent', issued: 4, terms: 15, items: [[0, 1], [4, 3]], views: 3 },
  { n: 13, customer: 1, status: 'paid', issued: 12, terms: 15, items: [[1, 1]], views: 2 },
  { n: 12, customer: 2, status: 'overdue', issued: 34, terms: 15, items: [[2, 1], [3, 12]], views: 5 },
  { n: 11, customer: 3, status: 'draft', issued: 1, terms: 15, items: [[3, 20]], views: 0 },
  { n: 10, customer: 4, status: 'paid', issued: 41, terms: 15, items: [[1, 1], [4, 1]], views: 1 },
  { n: 9, customer: 0, status: 'paid', issued: 58, terms: 15, items: [[3, 32]], views: 2 },
  { n: 8, customer: 1, status: 'paid', issued: 72, terms: 15, items: [[0, 1]], views: 4 },
  { n: 7, customer: 2, status: 'cancelled', issued: 80, terms: 15, items: [[4, 6]], views: 0 },
];

function invoiceRecord(spec: InvoiceSpec): InvoiceRecord {
  const price = pricing(lines(spec.items), spec.customer);
  const paid = spec.status === 'paid';
  const sent = spec.status !== 'draft';
  return {
    id: `inv-${spec.n}`,
    status: spec.status,
    invoice: {
      ...price,
      invoiceNumber: `${demoProfile.invoicePrefix}-${String(spec.n).padStart(4, '0')}`,
      invoiceDate: daysAgo(spec.issued),
      dueDate: daysAgo(spec.issued - spec.terms),
      from: demoFrom,
      billTo: party(spec.customer),
      amountPaid: paid ? price.total : 0,
      balanceDue: paid || spec.status === 'cancelled' ? 0 : price.total,
      paidAt: paid ? daysAgo(Math.max(0, spec.issued - 9)) : null,
      notes: demoProfile.defaultNotes,
      terms: demoProfile.defaultTerms,
    },
    activity: activity(spec.views, sent ? spec.issued : null, demoCustomers[spec.customer].email),
    createdAt: daysAgo(spec.issued),
    updatedAt: daysAgo(Math.max(0, spec.issued - 2)),
  };
}

type QuotationSpec = { n: number; customer: number; status: QuotationStatus; issued: number; items: Line[]; converted?: string };

const QUOTATIONS: QuotationSpec[] = [
  { n: 6, customer: 4, status: 'sent', issued: 3, items: [[0, 1], [2, 1]] },
  { n: 5, customer: 3, status: 'accepted', issued: 9, items: [[1, 1], [4, 12]] },
  { n: 4, customer: 1, status: 'draft', issued: 1, items: [[3, 40]] },
  { n: 3, customer: 0, status: 'accepted', issued: 20, items: [[0, 1], [4, 3]], converted: 'inv-14' },
  { n: 2, customer: 2, status: 'rejected', issued: 26, items: [[2, 1]] },
  { n: 1, customer: 4, status: 'expired', issued: 60, items: [[1, 1]] },
];

function quotationRecord(spec: QuotationSpec): QuotationRecord {
  const price = pricing(lines(spec.items), spec.customer);
  const customer = demoCustomers[spec.customer];
  const answered = spec.status === 'accepted' || spec.status === 'rejected';
  return {
    id: `qt-${spec.n}`,
    convertedInvoiceId: spec.converted,
    clientResponse: answered
      ? { decision: spec.status as 'accepted' | 'rejected', name: customer.contactName, comment: '', at: daysAgo(spec.issued - 2) }
      : null,
    quotation: {
      ...price,
      quotationNumber: `${demoProfile.quotationPrefix}-${String(spec.n).padStart(4, '0')}`,
      quotationDate: daysAgo(spec.issued),
      validUntil: spec.status === 'expired' ? daysAgo(spec.issued - 30) : daysAhead(30 - spec.issued),
      quoteTo: party(spec.customer),
      from: demoFrom,
      status: spec.status,
      notes: demoProfile.defaultNotes,
      paymentTerms: demoProfile.defaultTerms,
    },
    activity: activity(spec.status === 'draft' ? 0 : 2, spec.status === 'draft' ? null : spec.issued, customer.email),
    createdAt: daysAgo(spec.issued),
    updatedAt: daysAgo(Math.max(0, spec.issued - 2)),
  };
}

export const demoInvoices: InvoiceRecord[] = INVOICES.map(invoiceRecord);
export const demoQuotations: QuotationRecord[] = QUOTATIONS.map(quotationRecord);
