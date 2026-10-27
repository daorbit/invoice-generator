import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as customers from '../controllers/customer.controller.js';
import * as items from '../controllers/item.controller.js';

export const customerRouter = Router({ mergeParams: true });

customerRouter.get('/', asyncHandler(customers.list));
customerRouter.post('/', asyncHandler(customers.create));
customerRouter.get('/:id', asyncHandler(customers.read));
customerRouter.put('/:id', asyncHandler(customers.update));
customerRouter.delete('/:id', asyncHandler(customers.remove));

export const itemRouter = Router({ mergeParams: true });

itemRouter.get('/', asyncHandler(items.list));
itemRouter.post('/', asyncHandler(items.create));
itemRouter.put('/:id', asyncHandler(items.update));
itemRouter.delete('/:id', asyncHandler(items.remove));
