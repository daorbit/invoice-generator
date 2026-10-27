import { Link } from 'react-router-dom';
import { FileText, ReceiptText } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import { DOCUMENT_PATH } from '@/lib/documentMapping';
import { KIND_META, STATUS_META } from '@/lib/documentMeta';
import { formatDate, formatMoney } from '@/lib/format';
import type { DocumentSummary } from '@/types/document';
import { DocumentRowMenu, type DocumentRowActions } from './DocumentRowMenu';
import classes from './DocumentRow.module.css';

interface Props {
  doc: DocumentSummary;
  busy: boolean;
  actions: DocumentRowActions;
}

export function DocumentRow({ doc, busy, actions }: Props) {
  const Icon = doc.kind === 'invoice' ? ReceiptText : FileText;
  const status = STATUS_META[doc.status];

  return (
    <div className={classes.row}>
      <div className={classes.main}>
        <div className={classes.icon} aria-hidden>
          <Icon size={18} />
        </div>
        <div className={classes.text}>
          <Link to={`${DOCUMENT_PATH[doc.kind]}/${doc.id}`} className={classes.title}>
            {doc.number}
          </Link>
          <div className={classes.meta}>
            <span className={classes.metaItem}>
              <StatusPill tone={status.tone} label={status.label} />
            </span>
            {doc.client && <span className={`${classes.metaItem} ${classes.client}`}>{doc.client}</span>}
            {doc.issueDate && <span className={classes.metaItem}>{formatDate(doc.issueDate)}</span>}
            {doc.dueDate && (
              <span className={classes.metaItem}>
                {KIND_META[doc.kind].dueLabel} {formatDate(doc.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
      <span className={classes.amount}>{formatMoney(doc.total, doc.currency)}</span>
      <div className={classes.actions}>
        <DocumentRowMenu doc={doc} busy={busy} actions={actions} />
      </div>
    </div>
  );
}
