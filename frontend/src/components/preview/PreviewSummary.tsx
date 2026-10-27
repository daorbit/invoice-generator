import { amountInWords } from '@/lib/amountInWords';
import { formatDate, formatMoney } from '@/lib/format';
import type { DraftTotals } from '@/lib/totals';
import type { DocumentDraft } from '@/types/document';
import classes from './DocumentPreview.module.css';

interface Props {
  draft: DocumentDraft;
  totals: DraftTotals;
}

function dueLabel(draft: DocumentDraft): string {
  if (draft.kind === 'quotation') return 'Quote total';
  return draft.amountPaid > 0 ? 'Balance due' : 'Amount due';
}

export function PreviewSummary({ draft, totals }: Props) {
  const money = (value: number) => formatMoney(value, draft.currency);
  const isInvoice = draft.kind === 'invoice';
  const headline = isInvoice ? totals.balanceDue : totals.total;
  const dueText = draft.dueDate
    ? `${isInvoice ? 'Due by' : 'Valid until'} ${formatDate(draft.dueDate)}`
    : '';

  return (
    <>
      <div className={classes.summary}>
        <div className={classes.due}>
          <div className={classes.label}>{dueLabel(draft)}</div>
          <div className={classes.dueAmount}>{money(headline)}</div>
          {dueText && <div className={classes.dueDate}>{dueText}</div>}
        </div>
        <div className={classes.totals}>
          <span>Subtotal</span>
          <span>{money(totals.subtotal)}</span>
          {totals.discountAmount > 0 && (
            <>
              <span>Discount{draft.discountType === 'percentage' ? ` (${draft.discount}%)` : ''}</span>
              <span>−{money(totals.discountAmount)}</span>
            </>
          )}
          {totals.taxAmount > 0 && (
            <>
              <span>Tax ({draft.tax}%)</span>
              <span>{money(totals.taxAmount)}</span>
            </>
          )}
          {draft.shipping > 0 && (
            <>
              <span>Shipping</span>
              <span>{money(draft.shipping)}</span>
            </>
          )}
          <div className={classes.grand}>
            <span>Total</span>
            <span>{money(totals.total)}</span>
          </div>
          {isInvoice && draft.amountPaid > 0 && (
            <>
              <span>Paid</span>
              <span>−{money(draft.amountPaid)}</span>
            </>
          )}
        </div>
      </div>
      <div className={classes.words}>
        <b>Amount in words:</b> {amountInWords(totals.total, draft.currency)}
      </div>
    </>
  );
}
