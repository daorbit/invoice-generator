import { daysUntil, plural } from '@/lib/format';
import { AWAITING_PAYMENT } from '@/lib/documentMeta';
import type { DocumentSummary } from '@/types/document';

export interface DueHint {
  label: string;
  tone: 'muted' | 'warn' | 'bad';
}

const SOON_DAYS = 3;

function draftHint(invoice: boolean, days: number): DueHint | null {
  if (days >= 0) return null;
  return { label: invoice ? 'Due date passed' : 'Valid date passed', tone: 'warn' };
}

export function dueHint(doc: DocumentSummary): DueHint | null {
  if (!doc.dueDate) return null;
  const invoice = doc.kind === 'invoice';
  const days = daysUntil(doc.dueDate);

  if (doc.status === 'draft') return draftHint(invoice, days);
  if (invoice ? !AWAITING_PAYMENT.includes(doc.status) : doc.status !== 'sent') return null;

  if (days < 0) {
    return { label: invoice ? `${plural(-days, 'day')} overdue` : `Expired ${plural(-days, 'day')} ago`, tone: 'bad' };
  }
  if (days === 0) return { label: invoice ? 'Due today' : 'Expires today', tone: 'warn' };
  return {
    label: `${invoice ? 'Due' : 'Expires'} in ${plural(days, 'day')}`,
    tone: days <= SOON_DAYS ? 'warn' : 'muted',
  };
}

export function partlyDue(doc: DocumentSummary): number | null {
  if (doc.kind !== 'invoice' || !AWAITING_PAYMENT.includes(doc.status)) return null;
  const balance = doc.balanceDue ?? doc.total;
  return balance > 0 && balance < doc.total ? balance : null;
}
