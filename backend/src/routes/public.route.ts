import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../middleware/async-handler.js';
import * as publicDocuments from '../controllers/public.controller.js';

export const publicRouter = Router();

const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Too many requests. Try again in a minute.' },
});

const replyLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Too many replies. Try again in a minute.' },
});

publicRouter.get('/documents/:token', readLimiter, asyncHandler(publicDocuments.read));
publicRouter.post('/documents/:token/respond', replyLimiter, asyncHandler(publicDocuments.respond));
