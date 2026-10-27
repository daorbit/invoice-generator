import { forwardRef } from 'react';
import { KIND_META } from '@/lib/documentMeta';
import { formatDate, formatMoney } from '@/lib/format';
import { computeTotals } from '@/lib/totals';
import type { DocumentDraft } from '@/types/document';
import classes from './DocumentPreview.module.css';

export const DocumentPreview = forwardRef<HTMLDivElement, { draft: DocumentDraft }>(function DocumentPreview(
  { draft },
  ref
) {
  const meta = KIND_META[draft.kind];
  const totals = computeTotals(draft);
  const money = (value: number) => formatMoney(value, draft.currency);
  const items = draft.items.filter((item) => item.description || item.amount);
  const contact = [draft.from.email, draft.from.phone, draft.from.website].filter(Boolean).join(' · ');
  const clientContact = [draft.client.email, draft.client.phone].filter(Boolean).join(' · ');

  return (
    <div ref={ref} className={classes.sheet}>
      <div className={classes.top}>
        <div>
          {draft.logo && <img src={draft.logo} alt="" className={classes.logo} />}
          <div className={classes.business}>{draft.from.name || 'Your business'}</div>
          {draft.from.address && <div className={classes.muted}>{draft.from.address}</div>}
          {contact && <div className={classes.muted}>{contact}</div>}
        </div>
        <div className={classes.heading}>
          <div className={classes.kind}>{meta.singular}</div>
          <div className={classes.number}>{draft.number || 'Draft'}</div>
        </div>
      </div>

      <div className={classes.parties}>
        <div>
          <div className={classes.label}>{meta.clientLabel}</div>
          <div className={classes.clientName}>{draft.client.name || 'Client name'}</div>
          {draft.client.address && <div className={classes.muted}>{draft.client.address}</div>}
          {clientContact && <div className={classes.muted}>{clientContact}</div>}
        </div>
        <div className={classes.dates}>
          {draft.issueDate && (
            <>
              <span className={classes.dateLabel}>Date</span>
              <span className={classes.dateValue}>{formatDate(draft.issueDate)}</span>
            </>
          )}
          {draft.dueDate && (
            <>
              <span className={classes.dateLabel}>{meta.dueLabel}</span>
              <span className={classes.dateValue}>{formatDate(draft.dueDate)}</span>
            </>
          )}
          {draft.reference && (
            <>
              <span className={classes.dateLabel}>{meta.referenceLabel}</span>
              <span className={classes.dateValue}>{draft.reference}</span>
            </>
          )}
        </div>
      </div>

      <table className={classes.table}>
        <thead>
          <tr>
            <th>Description</th>
            <th className={classes.num}>Qty</th>
            <th className={classes.num}>Rate</th>
            <th className={classes.num}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td className={classes.num}>{item.quantity}</td>
              <td className={classes.num}>{money(item.rate)}</td>
              <td className={classes.num}>{money(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={classes.summary}>
        <div className={classes.totals}>
          <span>Subtotal</span>
          <span>{money(totals.subtotal)}</span>
          {totals.taxAmount > 0 && (
            <>
              <span>Tax ({draft.tax}%)</span>
              <span>{money(totals.taxAmount)}</span>
            </>
          )}
          {totals.discountAmount > 0 && (
            <>
              <span>Discount</span>
              <span>−{money(totals.discountAmount)}</span>
            </>
          )}
          {draft.shipping > 0 && (
            <>
              <span>Shipping</span>
              <span>{money(draft.shipping)}</span>
            </>
          )}
          <span className={classes.grand}>Total</span>
          <span className={classes.grand}>{money(totals.total)}</span>
          {draft.kind === 'invoice' && draft.amountPaid > 0 && (
            <>
              <span>Paid</span>
              <span>−{money(draft.amountPaid)}</span>
              <span className={classes.grand}>Balance due</span>
              <span className={classes.grand}>{money(totals.balanceDue)}</span>
            </>
          )}
        </div>
      </div>

      {(draft.notes || draft.terms) && (
        <div className={classes.footer}>
          {draft.notes && (
            <div>
              <div className={classes.label}>Notes</div>
              <div className={classes.text}>{draft.notes}</div>
            </div>
          )}
          {draft.terms && (
            <div>
              <div className={classes.label}>{meta.termsLabel}</div>
              <div className={classes.text}>{draft.terms}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
