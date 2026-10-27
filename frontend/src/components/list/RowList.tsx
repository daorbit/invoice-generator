import type { ReactNode } from 'react';
import { Pagination, Skeleton } from '@mantine/core';
import classes from './RowList.module.css';

interface Props {
  loading: boolean;
  empty: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  children: ReactNode;
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

export function RowList({ loading, empty, total, page, pageSize, onPage, children }: Props) {
  const showSkeleton = loading && empty;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <>
      <div className={classes.rows} data-loading={loading && !showSkeleton ? true : undefined}>
        {showSkeleton ? Array.from({ length: 4 }).map((_, index) => <SkeletonRow key={index} />) : children}
      </div>

      {total > pageSize && (
        <div className={classes.footer}>
          <span className={classes.count}>
            {first}–{last} of {total}
          </span>
          <Pagination size="sm" radius="md" total={Math.ceil(total / pageSize)} value={page} onChange={onPage} />
        </div>
      )}
    </>
  );
}
