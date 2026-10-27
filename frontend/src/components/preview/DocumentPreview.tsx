import { forwardRef } from 'react';
import { useUpiQr } from '@/hooks/useUpiQr';
import { computeTotals } from '@/lib/totals';
import type { DocumentDraft } from '@/types/document';
import { PreviewHeader } from './PreviewHeader';
import { PreviewParties } from './PreviewParties';
import { PreviewItems } from './PreviewItems';
import { PreviewSummary } from './PreviewSummary';
import { PreviewPayment } from './PreviewPayment';
import { PreviewFooter } from './PreviewFooter';
import classes from './DocumentPreview.module.css';

const STAMPS: Partial<Record<DocumentDraft['status'], { label: string; tone: string }>> = {
  paid: { label: 'Paid', tone: 'paid' },
  cancelled: { label: 'Cancelled', tone: 'cancelled' },
};

export const DocumentPreview = forwardRef<HTMLDivElement, { draft: DocumentDraft }>(function DocumentPreview(
  { draft },
  ref
) {
  const totals = computeTotals(draft);
  const isInvoice = draft.kind === 'invoice';
  const qr = useUpiQr({
    upiId: isInvoice ? draft.payment?.upiId : undefined,
    payee: draft.from.name,
    amount: totals.balanceDue,
    currency: draft.currency,
    note: draft.number || 'Invoice',
  });
  const stamp = isInvoice ? STAMPS[draft.status] : undefined;

  return (
    <div ref={ref} className={classes.sheet} data-template={draft.template} data-accent={draft.accent}>
      {stamp && (
        <span className={classes.stamp} data-tone={stamp.tone}>
          {stamp.label}
        </span>
      )}
      <PreviewHeader draft={draft} />
      <PreviewParties draft={draft} />
      <PreviewItems draft={draft} />
      <PreviewSummary draft={draft} totals={totals} />
      {isInvoice && draft.payment && <PreviewPayment payment={draft.payment} qr={qr} />}
      <PreviewFooter draft={draft} />
    </div>
  );
});
