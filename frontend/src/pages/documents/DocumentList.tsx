import { Pagination, Skeleton } from '@mantine/core';
import { PAGE_SIZE } from '@/lib/documentMeta';
import type { DocumentSummary } from '@/types/document';
import { DocumentRow } from './DocumentRow';
import type { DocumentRowActions } from './DocumentRowMenu';
import classes from './DocumentList.module.css';

interface Props {
  items: DocumentSummary[];
  loading: boolean;
  total: number;
  page: number;
  busyId: string | null;
  onPage: (page: number) => void;
  actions: DocumentRowActions;
}

function SkeletonRow() {
  return (
    <div className={classes.skeleton}>
      <Skeleton height={40} width={40} radius={10} />
      <div>
        <Skeleton height={14} width={140} radius="sm" />
        <Skeleton height={10} width={260} radius="sm" mt={10} />
      </div>
    </div>
  );
}

export function DocumentList({ items, loading, total, page, busyId, onPage, actions }: Props) {
  const showSkeleton = loading && items.length === 0;
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <div className={classes.rows} data-loading={loading && !showSkeleton ? true : undefined}>
        {showSkeleton
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonRow key={index} />)
          : items.map((doc) => <DocumentRow key={doc.id} doc={doc} busy={busyId === doc.id} actions={actions} />)}
      </div>

      {total > PAGE_SIZE && (
        <div className={classes.footer}>
          <span className={classes.count}>
            {first}–{last} of {total}
          </span>
          <Pagination size="sm" radius="md" total={Math.ceil(total / PAGE_SIZE)} value={page} onChange={onPage} />
        </div>
      )}
    </>
  );
}
