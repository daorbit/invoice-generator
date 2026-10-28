import { daysUntil, plural } from '@/lib/format';
import type { DocumentStatus, DocumentSummary } from '@/types/document';

export interface DueHint {
  label: string;
  tone: 'muted' | 'warn' | 'bad';
}

const OPEN: DocumentStatus[] = ['draft', 'sent', 'overdue'];
const SOON_DAYS = 3;

export function dueHint(doc: DocumentSummary): DueHint | null {
  if (!doc.dueDate || !OPEN.includes(doc.status)) return null;
  const invoice = doc.kind === 'invoice';
  const days = daysUntil(doc.dueDate);

  if (days < 0) {
    return { label: invoice ? `${plural(-days, 'day')} overdue` : `Expired ${plural(-days, 'day')} ago`, tone: 'bad' };
  }
  if (days === 0) return { label: invoice ? 'Due today' : 'Expires today', tone: 'warn' };
  return {
    label: `${invoice ? 'Due' : 'Expires'} in ${plural(days, 'day')}`,
    tone: days <= SOON_DAYS ? 'warn' : 'muted',
  };
}
