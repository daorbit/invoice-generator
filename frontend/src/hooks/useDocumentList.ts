import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { listDocuments } from '@/api/documents';
import { PAGE_SIZE } from '@/lib/documentMeta';
import { notify } from '@/lib/notify';
import type { DocumentKind, DocumentStatus, DocumentSummary } from '@/types/document';

const SEARCH_DELAY_MS = 300;
const EMPTY: DocumentSummary[] = [];

export type StatusFilter = DocumentStatus | 'all';

export function useDocumentList(kind: DocumentKind) {
  const [items, setItems] = useState<DocumentSummary[]>(EMPTY);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, SEARCH_DELAY_MS);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setPage(1);
    setStatus('all');
    setSearch('');
  }, [kind]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listDocuments(kind, {
      page,
      limit: PAGE_SIZE,
      status: status === 'all' ? undefined : status,
      search: debouncedSearch.trim() || undefined,
    })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      })
      .catch((error: Error) => {
        if (!cancelled) notify.error(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, page, status, debouncedSearch, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const changeStatus = useCallback((next: StatusFilter) => {
    setStatus(next);
    setPage(1);
  }, []);

  const changeSearch = useCallback((next: string) => {
    setSearch(next);
    setPage(1);
  }, []);

  return {
    items,
    total,
    page,
    setPage,
    status,
    setStatus: changeStatus,
    search,
    setSearch: changeSearch,
    loading,
    reload,
    isFiltered: status !== 'all' || Boolean(debouncedSearch.trim()),
  };
}
