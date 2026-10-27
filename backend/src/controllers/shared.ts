import type { Request, Response } from 'express';
import { badRequestError } from '../lib/http-error.js';

export function workspaceIdOf(req: Request): string {
  return String(req.params.workspaceId);
}

export function documentIdOf(req: Request): string {
  return String(req.params.id);
}

export function actorOf(res: Response): string | undefined {
  return typeof res.locals.actorId === 'string' ? res.locals.actorId : undefined;
}

export function readStatus<T extends string>(body: unknown, allowed: readonly T[]): T {
  const status = (body as { status?: unknown } | undefined)?.status;
  if (typeof status === 'string' && (allowed as readonly string[]).includes(status)) return status as T;
  throw badRequestError(`Status must be one of: ${allowed.join(', ')}`);
}
