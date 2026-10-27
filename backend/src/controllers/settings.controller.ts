import type { RequestHandler } from 'express';
import { readBusinessProfileInput } from '../lib/business-profile-input.js';
import { getBusinessProfile, saveBusinessProfile } from '../services/business-profile.service.js';
import { actorOf, workspaceIdOf } from './shared.js';

export const read: RequestHandler = async (req, res) => {
  res.json(await getBusinessProfile(workspaceIdOf(req)));
};

export const save: RequestHandler = async (req, res) => {
  const input = readBusinessProfileInput(req.body);
  res.json(await saveBusinessProfile(workspaceIdOf(req), actorOf(res), input));
};
