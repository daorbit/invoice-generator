import { Router } from 'express';
import { requireWorkspaceToken } from '../middleware/require-workspace-token.js';
import { invoiceRouter } from './invoice.route.js';
import { quotationRouter } from './quotation.route.js';
import { dashboardRouter } from './dashboard.route.js';
import { settingsRouter } from './settings.route.js';
import { customerRouter, itemRouter } from './catalog.route.js';
import { reportRouter } from './report.route.js';

export const workspaceRouter = Router({ mergeParams: true });

workspaceRouter.use(requireWorkspaceToken);
workspaceRouter.use('/invoices', invoiceRouter);
workspaceRouter.use('/quotations', quotationRouter);
workspaceRouter.use('/customers', customerRouter);
workspaceRouter.use('/items', itemRouter);
workspaceRouter.use('/reports', reportRouter);
workspaceRouter.use('/dashboard', dashboardRouter);
workspaceRouter.use('/settings', settingsRouter);
