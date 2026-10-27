import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { notify } from '@/lib/notify';
import type { Paged } from '@/types/catalog';

const SEARCH_DELAY_MS = 300;

export interface PageRequest {
  page: number;
  limit: number;
  search?: string;
}

export function usePagedList<T>(load: (request: PageRequest) => Promise<Paged<T>>, pageSize: number) {
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, SEARCH_DELAY_MS);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load({ page, limit: pageSize, search: debouncedSearch.trim() || undefined })
      .then((result) => {
        if (cancelled) return;
        setRows(result.rows);
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
  }, [load, page, pageSize, debouncedSearch, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const changeSearch = useCallback((next: string) => {
    setSearch(next);
    setPage(1);
  }, []);

  return {
    rows,
    total,
    page,
    setPage,
    search,
    setSearch: changeSearch,
    loading,
    reload,
    isFiltered: Boolean(debouncedSearch.trim()),
  };
}
