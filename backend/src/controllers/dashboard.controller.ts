import type { RequestHandler } from 'express';
import { readLimit } from '../lib/list-query.js';
import { getDashboardStats, getRecentDocuments } from '../services/dashboard.service.js';
import { getHomeCurrency } from '../services/business-profile.service.js';
import { workspaceIdOf } from './shared.js';

const DEFAULT_RECENT = 10;
const MAX_RECENT = 25;

export const stats: RequestHandler = async (req, res) => {
  const workspaceId = workspaceIdOf(req);
  const homeCurrency = await getHomeCurrency(workspaceId);
  res.json({ success: true, data: await getDashboardStats(workspaceId, homeCurrency) });
};

export const recent: RequestHandler = async (req, res) => {
  const limit = readLimit(req.query.limit, DEFAULT_RECENT, MAX_RECENT);
  res.json({ success: true, data: await getRecentDocuments(workspaceIdOf(req), limit) });
};
