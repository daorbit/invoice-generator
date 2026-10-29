import { Invoice } from '../models/invoice.model.js';
import { readInvoiceInput } from '../lib/document-input.js';
import {
  buildFormPaymentInvoiceBody,
  type FormPaymentInvoiceInput,
} from '../lib/form-payment-invoice-input.js';
import { HttpError } from '../lib/http-error.js';
import { shareUrlFor } from '../lib/serialize.js';
import { getBusinessProfile } from './business-profile.service.js';
import { createInvoice } from './invoice.service.js';
import { ensureShareToken } from './share.service.js';

const DUPLICATE_KEY = 11000;

function sourceFilter(workspaceId: string, submissionId: string) {
  return { workspaceId, 'source.submissionId': submissionId };
}

async function summaryOf(workspaceId: string, submissionId: string, created: boolean) {
  const doc = await Invoice.findOne(sourceFilter(workspaceId, submissionId)).select('invoiceNumber shareToken').lean();
  if (!doc) return null;
  const token = doc.shareToken ?? (await ensureShareToken(workspaceId, 'invoice', String(doc._id)));
  return { id: String(doc._id), number: doc.invoiceNumber, shareUrl: shareUrlFor(token), created };
}

export async function createInvoiceFromFormPayment(workspaceId: string, input: FormPaymentInvoiceInput) {
  const existing = await summaryOf(workspaceId, input.submissionId, false);
  if (existing) return existing;

  const { profile, complete } = await getBusinessProfile(workspaceId);
  if (!complete) {
    throw new HttpError(422, 'profile_incomplete', 'Add your business name, email and address in Invoicing first');
  }

  const parsed = readInvoiceInput(buildFormPaymentInvoiceBody(profile, input));
  try {
    await createInvoice(workspaceId, undefined, parsed, {
      status: 'paid',
      paidAt: input.paidAt,
      source: {
        kind: 'form',
        formId: input.formId,
        formTitle: input.formTitle,
        submissionId: input.submissionId,
        paymentId: input.paymentId,
      },
    });
  } catch (error) {
    if ((error as { code?: number })?.code !== DUPLICATE_KEY) throw error;
  }

  const summary = await summaryOf(workspaceId, input.submissionId, true);
  if (!summary) throw new HttpError(500, 'invoice_failed', 'The invoice could not be created');
  return summary;
}
