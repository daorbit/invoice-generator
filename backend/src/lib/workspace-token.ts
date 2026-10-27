import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

const CLOCK_SKEW_SECONDS = 60;

export function isTokenAuthConfigured(): boolean {
  return Boolean(env.invoiceServiceSecret);
}

function sign(payload: string): string {
  return createHmac('sha256', env.invoiceServiceSecret).update(payload).digest('base64url');
}

export type TokenFailure = 'malformed' | 'bad_signature' | 'expired' | 'wrong_workspace';

export interface TokenResult {
  ok: boolean;
  reason?: TokenFailure;
  actorId?: string;
}

export function verifyWorkspaceToken(token: string, workspaceId: string): TokenResult {
  const parts = token.split('.');
  if (parts.length !== 3 && parts.length !== 4) return { ok: false, reason: 'malformed' };

  const signature = parts[parts.length - 1];
  const [claimedWorkspace, expiresAtRaw, actorId = ''] = parts.slice(0, -1);
  const expected = sign(parts.slice(0, -1).join('.'));

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: 'bad_signature' };
  }

  if (claimedWorkspace !== workspaceId) return { ok: false, reason: 'wrong_workspace' };

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt)) return { ok: false, reason: 'malformed' };
  if (expiresAt + CLOCK_SKEW_SECONDS < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, actorId: /^[a-f0-9]{24}$/i.test(actorId) ? actorId : undefined };
}
