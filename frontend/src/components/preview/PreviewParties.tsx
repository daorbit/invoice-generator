import { KIND_META } from '@/lib/documentMeta';
import { formatDate } from '@/lib/format';
import type { DocumentDraft } from '@/types/document';
import classes from './DocumentPreview.module.css';

export function PreviewParties({ draft }: { draft: DocumentDraft }) {
  const meta = KIND_META[draft.kind];
  const { client } = draft;
  const contact = [client.email, client.phone].filter(Boolean).join(' · ');
  const rows: [string, string][] = [
    ['Date', formatDate(draft.issueDate)],
    [meta.dueLabel, formatDate(draft.dueDate)],
    [meta.referenceLabel, draft.reference],
  ];

  return (
    <div className={classes.parties}>
      <div>
        <div className={classes.label}>{meta.clientLabel}</div>
        <div className={classes.clientName}>{client.name || 'Client name'}</div>
        {client.address && <div className={classes.muted}>{client.address}</div>}
        {client.gstin && <div className={classes.gstin}>GSTIN {client.gstin}</div>}
        {contact && <div className={classes.muted}>{contact}</div>}
      </div>
      <div className={classes.meta}>
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className={classes.metaRow}>
              <span className={classes.metaLabel}>{label}</span>
              <span className={classes.metaValue}>{value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
