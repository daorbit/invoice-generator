import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as invoices from '../controllers/invoice.controller.js';

export const invoiceRouter = Router({ mergeParams: true });

invoiceRouter.get('/', asyncHandler(invoices.list));
invoiceRouter.post('/', asyncHandler(invoices.create));
invoiceRouter.get('/:id', asyncHandler(invoices.read));
invoiceRouter.put('/:id', asyncHandler(invoices.update));
invoiceRouter.delete('/:id', asyncHandler(invoices.remove));
invoiceRouter.patch('/:id/status', asyncHandler(invoices.updateStatus));
invoiceRouter.post('/:id/duplicate', asyncHandler(invoices.duplicate));
