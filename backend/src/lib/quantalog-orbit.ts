import { env } from '../config/env.js';
import { HttpError } from './http-error.js';
import { quantalogConfigured } from './quantalog.js';
import { readOrbitReply, type OrbitReply } from './orbit-ops.js';

const ORBIT_TIMEOUT_MS = 55_000;
const PASSED_THROUGH = new Set([400, 402, 403, 503]);

export type OrbitAction = 'draft' | 'edit' | 'gst';

async function failure(response: Response): Promise<HttpError> {
  const body = (await response.json().catch(() => null)) as { message?: unknown; error?: unknown } | null;
  const message = typeof body?.message === 'string' ? body.message : 'Orbit could not answer. Try again.';
  const code = typeof body?.error === 'string' ? body.error : 'orbit_failed';
  return new HttpError(PASSED_THROUGH.has(response.status) ? response.status : 502, code, message);
}

export async function askOrbit(action: OrbitAction, workspaceId: string, body: unknown): Promise<OrbitReply> {
  if (!quantalogConfigured()) throw new HttpError(503, 'not_configured', 'Orbit is not set up on this server.');

  const response = await fetch(
    `${env.quantalogApiUrl}/api/internal/invoices/ai/${action}/${encodeURIComponent(workspaceId)}`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${env.invoiceServiceSecret}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(ORBIT_TIMEOUT_MS),
    }
  ).catch(() => null);

  if (!response) throw new HttpError(504, 'orbit_timeout', 'Orbit took too long to answer. Try again.');
  if (!response.ok) throw await failure(response);

  const reply = readOrbitReply(await response.json().catch(() => null));
  if (!reply) throw new HttpError(502, 'orbit_failed', 'Orbit returned nothing usable. Try again.');
  return reply;
}
