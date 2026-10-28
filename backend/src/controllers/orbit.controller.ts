import type { RequestHandler } from 'express';
import { readOrbitRequest } from '../lib/orbit-input.js';
import { orbitDraft, orbitEdit, orbitGst } from '../services/orbit.service.js';
import { workspaceIdOf } from './shared.js';

export const draft: RequestHandler = async (req, res) => {
  res.json(await orbitDraft(workspaceIdOf(req), readOrbitRequest(req.body)));
};

export const edit: RequestHandler = async (req, res) => {
  res.json(await orbitEdit(workspaceIdOf(req), readOrbitRequest(req.body)));
};

export const gst: RequestHandler = async (req, res) => {
  res.json(await orbitGst(workspaceIdOf(req), readOrbitRequest(req.body)));
};
