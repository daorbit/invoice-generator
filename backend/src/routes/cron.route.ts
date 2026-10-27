import { Router } from 'express';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireBearerSecret } from '../middleware/require-bearer-secret.js';
import { sendDueEmails } from '../services/email-outbox.service.js';

export const cronRouter = Router();

cronRouter.use(requireBearerSecret(() => env.cronSecret, 'CRON_SECRET'));

cronRouter.post(
  '/scheduled-emails',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, ...(await sendDueEmails()) });
  })
);
