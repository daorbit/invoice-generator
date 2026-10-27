import type { RequestHandler } from 'express';
import { readEmailInput } from '../lib/email-input.js';
import { disableSharing, enableSharing } from '../services/share.service.js';
import { cancelScheduledEmail, emailDocument } from '../services/document-email.service.js';
import type { DocumentKind } from '../services/document-models.js';
import { documentIdOf, workspaceIdOf } from './shared.js';

export function sharingHandlers(kind: DocumentKind) {
  const share: RequestHandler = async (req, res) => {
    res.json(await enableSharing(workspaceIdOf(req), kind, documentIdOf(req)));
  };

  const unshare: RequestHandler = async (req, res) => {
    res.json(await disableSharing(workspaceIdOf(req), kind, documentIdOf(req)));
  };

  const email: RequestHandler = async (req, res) => {
    res.json(await emailDocument(workspaceIdOf(req), kind, documentIdOf(req), readEmailInput(req.body)));
  };

  const cancelSchedule: RequestHandler = async (req, res) => {
    res.json(await cancelScheduledEmail(workspaceIdOf(req), kind, documentIdOf(req)));
  };

  return { share, unshare, email, cancelSchedule };
}
