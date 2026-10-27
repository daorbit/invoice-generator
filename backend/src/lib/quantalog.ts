import { env } from '../config/env.js';
import { HttpError } from './http-error.js';

const EMAIL_TIMEOUT_MS = 25_000;

export interface DocumentEmail {
  to: string[];
  cc: string[];
  subject: string;
  message: string;
  replyTo: string;
  senderName: string;
  document: {
    label: string;
    number: string;
    amount: string;
    amountLabel: string;
    dueText: string;
    link: string;
  };
  pdf?: { filename: string; content: string };
}

function emailConfigured(): boolean {
  return Boolean(env.quantalogApiUrl && env.invoiceServiceSecret);
}

async function failureMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: unknown; error?: unknown } | null;
  const message = typeof body?.message === 'string' ? body.message : typeof body?.error === 'string' ? body.error : '';
  return message || 'The email could not be sent. Try again.';
}

export async function sendDocumentEmail(workspaceId: string, email: DocumentEmail): Promise<void> {
  if (!emailConfigured()) {
    throw new HttpError(503, 'not_configured', 'Email sending is not set up on this server.');
  }

  const response = await fetch(
    `${env.quantalogApiUrl}/api/internal/invoices/email/${encodeURIComponent(workspaceId)}`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.invoiceServiceSecret}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(email),
      signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
    }
  ).catch(() => null);

  if (!response) throw new HttpError(502, 'email_failed', 'The email service did not answer. Try again.');
  if (!response.ok) throw new HttpError(response.status === 429 ? 429 : 502, 'email_failed', await failureMessage(response));
}
