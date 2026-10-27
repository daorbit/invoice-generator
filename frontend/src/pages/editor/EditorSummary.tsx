import { Button } from '@mantine/core';
import { Download, Eye } from 'lucide-react';
import { ACCENT_OPTIONS, TEMPLATE_OPTIONS } from '@/lib/designOptions';
import { formatDate, formatMoney } from '@/lib/format';
import { openBusinessDetails } from '@/lib/hostMessages';
import { computeTotals } from '@/lib/totals';
import type { DocumentDraft } from '@/types/document';
import classes from './EditorSummary.module.css';

interface Props {
  draft: DocumentDraft;
  downloading: boolean;
  onPreview: () => void;
  onDownload: () => void;
}

export function EditorSummary({ draft, downloading, onPreview, onDownload }: Props) {
  const totals = computeTotals(draft);
  const money = (value: number) => formatMoney(value, draft.currency);
  const isInvoice = draft.kind === 'invoice';
  const headline = isInvoice ? totals.balanceDue : totals.total;
  const template = TEMPLATE_OPTIONS.find((option) => option.id === draft.template)?.label;
  const accent = ACCENT_OPTIONS.find((option) => option.id === draft.accent)?.label;

  const lines: [string, string][] = [['Subtotal', money(totals.subtotal)]];
  if (totals.discountAmount > 0) lines.push(['Discount', `−${money(totals.discountAmount)}`]);
  if (totals.taxAmount > 0) lines.push([`Tax ${draft.tax}%`, money(totals.taxAmount)]);
  if (draft.shipping > 0) lines.push(['Shipping', money(draft.shipping)]);
  if (isInvoice && draft.amountPaid > 0) lines.push(['Paid', `−${money(draft.amountPaid)}`]);

  return (
    <aside className={classes.card}>
      <div className={classes.parties}>
        <div>
          <div className={classes.partyLabel}>From</div>
          <div className={classes.partyRow}>
            {draft.from.name ? (
              <span className={classes.partyName}>{draft.from.name}</span>
            ) : (
              <span className={classes.partyEmpty}>No business details yet</span>
            )}
            <Button variant="subtle" size="compact-xs" onClick={openBusinessDetails}>
              Edit
            </Button>
          </div>
        </div>
        <div>
          <div className={classes.partyLabel}>To</div>
          {draft.client.name ? (
            <span className={classes.partyName}>{draft.client.name}</span>
          ) : (
            <span className={classes.partyEmpty}>Add a client in step 1</span>
          )}
        </div>
      </div>

      <div>
        <div className={classes.totalLabel}>{isInvoice ? 'Amount due' : 'Quote total'}</div>
        <div className={classes.total}>{money(headline)}</div>
        {draft.dueDate && (
          <div className={classes.due}>
            {isInvoice ? 'Due' : 'Valid until'} {formatDate(draft.dueDate)}
          </div>
        )}
      </div>

      <div className={classes.lines}>
        {lines.map(([label, value]) => (
          <div key={label} className={classes.line}>
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>

      <div className={classes.actions}>
        <Button variant="default" leftSection={<Eye size={16} />} onClick={onPreview}>
          Preview and design
        </Button>
        <Button variant="subtle" color="gray" leftSection={<Download size={16} />} loading={downloading} onClick={onDownload}>
          Download PDF
        </Button>
        <span className={classes.style}>
          {template} template · {accent}
        </span>
      </div>
    </aside>
  );
}
