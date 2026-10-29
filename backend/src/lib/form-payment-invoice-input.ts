import type { BusinessProfileFields } from '../models/business-profile.model.js';
import { asObject, amount, text } from './document-input.js';
import { badRequestError } from './http-error.js';

export interface FormPaymentInvoiceInput {
  formId: string;
  formTitle: string;
  submissionId: string;
  paymentId: string;
  description: string;
  amount: number;
  currency: string;
  paidAt: Date;
  taxRate: number;
  payer: { name: string; email: string; phone: string };
}

export function readFormPaymentInvoiceInput(body: unknown): FormPaymentInvoiceInput {
  const raw = asObject(body);
  const payer = asObject(raw.payer);
  const paidAt = new Date(typeof raw.paidAt === 'string' ? raw.paidAt : Date.now());
  const input = {
    formId: text(raw.formId, 64),
    formTitle: text(raw.formTitle, 200),
    submissionId: text(raw.submissionId, 64),
    paymentId: text(raw.paymentId, 120),
    description: text(raw.description, 300) || text(raw.formTitle, 200) || 'Payment',
    amount: amount(raw.amount),
    currency: text(raw.currency, 3).toUpperCase(),
    paidAt: Number.isNaN(paidAt.getTime()) ? new Date() : paidAt,
    taxRate: amount(raw.taxRate, 0, 100),
    payer: {
      name: text(payer.name, 200),
      email: text(payer.email, 200),
      phone: text(payer.phone, 50),
    },
  };
  if (!input.formId || !input.submissionId) throw badRequestError('formId and submissionId are required');
  if (input.amount <= 0) throw badRequestError('The payment amount must be greater than zero');
  if (!/^[A-Z]{3}$/.test(input.currency)) throw badRequestError('A valid currency is required');
  return input;
}

function businessPayment(profile: BusinessProfileFields) {
  const details = {
    bankName: profile.bankName,
    accountName: profile.accountName,
    accountNumber: profile.accountNumber,
    ifsc: profile.ifsc,
    upiId: profile.upiId,
  };
  return Object.values(details).some(Boolean) ? details : undefined;
}

export function buildFormPaymentInvoiceBody(profile: BusinessProfileFields, input: FormPaymentInvoiceInput) {
  const paidOn = input.paidAt.toISOString();
  const reference = [input.paymentId && `Payment reference: ${input.paymentId}`, input.formTitle && `Form: ${input.formTitle}`]
    .filter(Boolean)
    .join(' · ');
  return {
    invoice: {
      logo: profile.logo || undefined,
      invoiceDate: paidOn,
      dueDate: paidOn,
      from: {
        name: profile.businessName,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        address: profile.address,
        gstin: profile.gstin || undefined,
      },
      billTo: {
        name: input.payer.name || input.payer.email || 'Customer',
        email: input.payer.email,
        phone: input.payer.phone,
        address: '',
      },
      items: [
        {
          id: '1',
          description: input.description,
          quantity: 1,
          rate: input.amount,
          taxRate: input.taxRate,
        },
      ],
      tax: input.taxRate,
      taxMode: 'line',
      pricesIncludeTax: true,
      roundOff: false,
      currency: input.currency,
      amountPaid: input.amount,
      notes: [reference, profile.defaultNotes].filter(Boolean).join('\n'),
      terms: profile.defaultTerms || undefined,
      template: profile.defaultTemplate,
      accent: profile.accentColor,
      payment: businessPayment(profile),
    },
  };
}
