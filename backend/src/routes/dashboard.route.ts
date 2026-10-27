import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as dashboard from '../controllers/dashboard.controller.js';

export const dashboardRouter = Router({ mergeParams: true });

dashboardRouter.get('/stats', asyncHandler(dashboard.stats));
dashboardRouter.get('/recent', asyncHandler(dashboard.recent));
