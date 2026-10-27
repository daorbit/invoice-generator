import { RowList } from '@/components/list/RowList';
import { PAGE_SIZE } from '@/lib/documentMeta';
import type { DocumentSummary } from '@/types/document';
import { DocumentRow } from './DocumentRow';
import type { DocumentRowActions } from './DocumentRowMenu';

interface Props {
  items: DocumentSummary[];
  loading: boolean;
  total: number;
  page: number;
  busyId: string | null;
  onPage: (page: number) => void;
  actions: DocumentRowActions;
}

export function DocumentList({ items, loading, total, page, busyId, onPage, actions }: Props) {
  return (
    <RowList
      loading={loading}
      empty={items.length === 0}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      onPage={onPage}
    >
      {items.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} busy={busyId === doc.id} actions={actions} />
      ))}
    </RowList>
  );
}
