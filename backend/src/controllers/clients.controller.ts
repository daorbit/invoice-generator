import type { RequestHandler } from 'express';
import { listRecentClients } from '../services/clients.service.js';
import { workspaceIdOf } from './shared.js';

export const list: RequestHandler = async (req, res) => {
  res.json({ clients: await listRecentClients(workspaceIdOf(req)) });
};
