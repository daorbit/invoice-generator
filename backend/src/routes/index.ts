import { Router } from 'express';
import { healthRouter } from './health.route.js';
import { internalRouter } from './internal.route.js';
import { workspaceRouter } from './workspace.route.js';
import { publicRouter } from './public.route.js';
import { cronRouter } from './cron.route.js';

export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/internal', internalRouter);
routes.use('/cron', cronRouter);
routes.use('/public', publicRouter);
routes.use('/workspaces/:workspaceId', workspaceRouter);
