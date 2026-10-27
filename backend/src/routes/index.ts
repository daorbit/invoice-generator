import { Router } from 'express';
import { healthRouter } from './health.route.js';
import { internalRouter } from './internal.route.js';
import { workspaceRouter } from './workspace.route.js';

export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/internal', internalRouter);
routes.use('/workspaces/:workspaceId', workspaceRouter);
