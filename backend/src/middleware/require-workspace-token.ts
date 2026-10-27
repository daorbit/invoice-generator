import type { RequestHandler } from 'express';
import { verifyWorkspaceToken, isTokenAuthConfigured } from '../lib/workspace-token.js';

function readToken(header: string, query: unknown): string {
  if (header.startsWith('Bearer ')) return header.slice(7);
  return typeof query === 'string' ? query : '';
}

export const requireWorkspaceToken: RequestHandler = (req, res, next) => {
  if (!isTokenAuthConfigured()) {
    console.error('[workspace-token] INVOICE_SERVICE_SECRET is not set, refusing');
    return res.status(503).json({
      error: 'not_configured',
      message: 'Workspace verification is not configured on this server.',
    });
  }

  const token = readToken(req.get('authorization') ?? '', req.query.wt);
  if (!token) {
    return res.status(401).json({
      error: 'workspace_token_required',
      message: 'Open this from your Quantalog workspace.',
    });
  }

  const result = verifyWorkspaceToken(token, req.params.workspaceId);
  if (!result.ok) {
    const expired = result.reason === 'expired';
    return res.status(401).json({
      error: expired ? 'workspace_token_expired' : 'workspace_token_invalid',
      message: expired
        ? 'This session has expired. Reload the page to continue.'
        : 'Open this from your Quantalog workspace.',
    });
  }

  res.locals.actorId = result.actorId;
  next();
};
