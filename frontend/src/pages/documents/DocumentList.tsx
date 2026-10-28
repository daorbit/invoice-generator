import { RowList } from '@/components/list/RowList';
import { PAGE_SIZE } from '@/lib/documentMeta';
import type { DocumentKind, DocumentSummary } from '@/types/document';
import { DocumentListHeader, DocumentRow } from './DocumentRow';
import type { DocumentRowActions } from './DocumentRowMenu';

interface Props {
  kind: DocumentKind;
  items: DocumentSummary[];
  loading: boolean;
  total: number;
  page: number;
  busyId: string | null;
  onPage: (page: number) => void;
  actions: DocumentRowActions;
}

export function DocumentList({ kind, items, loading, total, page, busyId, onPage, actions }: Props) {
  return (
    <RowList
      loading={loading}
      empty={items.length === 0}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      onPage={onPage}
    >
      <DocumentListHeader kind={kind} />
      {items.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} busy={busyId === doc.id} actions={actions} />
      ))}
    </RowList>
  );
}
