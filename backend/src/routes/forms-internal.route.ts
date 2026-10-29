import { Router } from 'express';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireBearerSecret } from '../middleware/require-bearer-secret.js';
import { readFormPaymentInvoiceInput } from '../lib/form-payment-invoice-input.js';
import { createInvoiceFromFormPayment } from '../services/form-payment-invoice.service.js';

export const formsInternalRouter = Router();

formsInternalRouter.use(requireBearerSecret(() => env.formsInvoiceSecret, 'FORMS_INVOICE_SECRET'));

formsInternalRouter.post(
  '/workspaces/:workspaceId/invoices',
  asyncHandler(async (req, res) => {
    const input = readFormPaymentInvoiceInput(req.body);
    const result = await createInvoiceFromFormPayment(String(req.params.workspaceId), input);
    res.status(result.created ? 201 : 200).json(result);
  })
);
