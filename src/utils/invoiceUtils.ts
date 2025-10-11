import { Invoice, InvoiceCalculations } from '../types/invoice';

export const calculateInvoice = (invoice: Invoice): InvoiceCalculations => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate discount
  const discountAmount = invoice.discountType === 'percentage' 
    ? (subtotal * invoice.discount) / 100 
    : invoice.discount;
  
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // Calculate tax
  const taxAmount = (subtotalAfterDiscount * invoice.tax) / 100;
  
  // Calculate shipping
  const shippingAmount = invoice.shipping || 0;
  
  // Calculate total
  const total = subtotalAfterDiscount + taxAmount + shippingAmount;
  
  // Calculate balance due
  const balanceDue = total - (invoice.amountPaid || 0);
  
  return {
    subtotal,
    taxAmount,
    discountAmount,
    shippingAmount,
    total,
    balanceDue
  };
};

export const calculateInvoiceTotals = calculateInvoice;

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};
