import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as invoices from '../controllers/invoice.controller.js';
import { sharingHandlers } from '../controllers/sharing.controller.js';

export const invoiceRouter = Router({ mergeParams: true });

const sharing = sharingHandlers('invoice');

invoiceRouter.get('/', asyncHandler(invoices.list));
invoiceRouter.post('/', asyncHandler(invoices.create));
invoiceRouter.get('/:id', asyncHandler(invoices.read));
invoiceRouter.put('/:id', asyncHandler(invoices.update));
invoiceRouter.delete('/:id', asyncHandler(invoices.remove));
invoiceRouter.patch('/:id/status', asyncHandler(invoices.updateStatus));
invoiceRouter.post('/:id/duplicate', asyncHandler(invoices.duplicate));
invoiceRouter.post('/:id/share', asyncHandler(sharing.share));
invoiceRouter.delete('/:id/share', asyncHandler(sharing.unshare));
invoiceRouter.post('/:id/email', asyncHandler(sharing.email));
invoiceRouter.delete('/:id/email/schedule', asyncHandler(sharing.cancelSchedule));
