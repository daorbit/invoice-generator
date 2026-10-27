import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as settings from '../controllers/settings.controller.js';

export const settingsRouter = Router({ mergeParams: true });

settingsRouter.get('/', asyncHandler(settings.read));
settingsRouter.put('/', asyncHandler(settings.save));
