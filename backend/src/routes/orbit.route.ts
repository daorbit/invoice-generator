import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as orbit from '../controllers/orbit.controller.js';

export const orbitRouter = Router({ mergeParams: true });

orbitRouter.post('/draft', asyncHandler(orbit.draft));
orbitRouter.post('/edit', asyncHandler(orbit.edit));
orbitRouter.post('/gst', asyncHandler(orbit.gst));
