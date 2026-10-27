import { FileText, ReceiptText } from 'lucide-react';
import { ListRow, listRowClasses } from '@/components/list/ListRow';
import { StatusPill } from '@/components/ui/StatusPill';
import { DOCUMENT_PATH } from '@/lib/documentMapping';
import { KIND_META, STATUS_META } from '@/lib/documentMeta';
import { formatDate, formatMoney } from '@/lib/format';
import type { DocumentSummary } from '@/types/document';
import { DocumentRowMenu, type DocumentRowActions } from './DocumentRowMenu';

interface Props {
  doc: DocumentSummary;
  busy: boolean;
  actions: DocumentRowActions;
}

export function DocumentRow({ doc, busy, actions }: Props) {
  const status = STATUS_META[doc.status];

  return (
    <ListRow
      icon={doc.kind === 'invoice' ? ReceiptText : FileText}
      title={doc.number}
      to={`${DOCUMENT_PATH[doc.kind]}/${doc.id}`}
      meta={[
        <StatusPill key="status" tone={status.tone} label={status.label} />,
        doc.client ? <span className={listRowClasses.emphasis}>{doc.client}</span> : null,
        doc.issueDate ? formatDate(doc.issueDate) : null,
        doc.dueDate ? `${KIND_META[doc.kind].dueLabel} ${formatDate(doc.dueDate)}` : null,
      ]}
      amount={formatMoney(doc.total, doc.currency)}
      actions={<DocumentRowMenu doc={doc} busy={busy} actions={actions} />}
    />
  );
}
