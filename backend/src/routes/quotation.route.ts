import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as quotations from '../controllers/quotation.controller.js';
import { sharingHandlers } from '../controllers/sharing.controller.js';

export const quotationRouter = Router({ mergeParams: true });

const sharing = sharingHandlers('quotation');

quotationRouter.get('/', asyncHandler(quotations.list));
quotationRouter.post('/', asyncHandler(quotations.create));
quotationRouter.get('/:id', asyncHandler(quotations.read));
quotationRouter.put('/:id', asyncHandler(quotations.update));
quotationRouter.delete('/:id', asyncHandler(quotations.remove));
quotationRouter.patch('/:id/status', asyncHandler(quotations.updateStatus));
quotationRouter.post('/:id/duplicate', asyncHandler(quotations.duplicate));
quotationRouter.post('/:id/convert', asyncHandler(quotations.convert));
quotationRouter.post('/:id/share', asyncHandler(sharing.share));
quotationRouter.delete('/:id/share', asyncHandler(sharing.unshare));
quotationRouter.post('/:id/email', asyncHandler(sharing.email));
quotationRouter.delete('/:id/email/schedule', asyncHandler(sharing.cancelSchedule));
