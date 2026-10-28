import { Link } from 'react-router-dom';
import { StatusPill } from '@/components/ui/StatusPill';
import { DOCUMENT_PATH } from '@/lib/documentMapping';
import { KIND_META, STATUS_META } from '@/lib/documentMeta';
import { formatDate, formatMoney } from '@/lib/format';
import type { DocumentKind, DocumentSummary } from '@/types/document';
import { DocumentRowMenu, type DocumentRowActions } from './DocumentRowMenu';
import { dueHint } from './dueHint';
import classes from './DocumentRow.module.css';

interface Props {
  doc: DocumentSummary;
  busy: boolean;
  actions: DocumentRowActions;
}

export function DocumentListHeader({ kind }: { kind: DocumentKind }) {
  return (
    <div className={classes.header} aria-hidden>
      <span className={classes.party}>Customer</span>
      <span className={classes.issued}>Issued</span>
      <span className={classes.due}>{KIND_META[kind].dueLabel}</span>
      <span className={classes.status}>Status</span>
      <span className={classes.amount}>Amount</span>
      <span className={classes.actions} />
    </div>
  );
}

export function DocumentRow({ doc, busy, actions }: Props) {
  const status = STATUS_META[doc.status];
  const hint = dueHint(doc);

  return (
    <div className={classes.row}>
      <div className={classes.party}>
        <Link to={`${DOCUMENT_PATH[doc.kind]}/${doc.id}`} className={classes.name} data-empty={!doc.client || undefined}>
          {doc.client || 'No customer'}
        </Link>
        <span className={classes.number}>{doc.number}</span>
      </div>
      <span className={classes.issued}>{formatDate(doc.issueDate) || '—'}</span>
      <div className={classes.due}>
        <span className={classes.dueDate}>{formatDate(doc.dueDate) || '—'}</span>
        {hint && (
          <span className={classes.dueHint} data-tone={hint.tone}>
            {hint.label}
          </span>
        )}
      </div>
      <div className={classes.status}>
        <StatusPill tone={status.tone} label={status.label} />
      </div>
      <span className={classes.amount}>{formatMoney(doc.total, doc.currency)}</span>
      <div className={classes.actions}>
        <DocumentRowMenu doc={doc} busy={busy} actions={actions} />
      </div>
    </div>
  );
}
