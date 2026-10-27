import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as reports from '../controllers/report.controller.js';

export const reportRouter = Router({ mergeParams: true });

reportRouter.get('/overview', asyncHandler(reports.overview));
reportRouter.get('/receivables', asyncHandler(reports.receivables));
reportRouter.get('/sales', asyncHandler(reports.sales));
reportRouter.get('/payments', asyncHandler(reports.payments));
reportRouter.get('/gst', asyncHandler(reports.gst));
