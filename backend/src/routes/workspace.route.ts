import { Router } from 'express';
import { requireWorkspaceToken } from '../middleware/require-workspace-token.js';
import { invoiceRouter } from './invoice.route.js';
import { quotationRouter } from './quotation.route.js';
import { dashboardRouter } from './dashboard.route.js';
import { settingsRouter } from './settings.route.js';

export const workspaceRouter = Router({ mergeParams: true });

workspaceRouter.use(requireWorkspaceToken);
workspaceRouter.use('/invoices', invoiceRouter);
workspaceRouter.use('/quotations', quotationRouter);
workspaceRouter.use('/dashboard', dashboardRouter);
workspaceRouter.use('/settings', settingsRouter);
