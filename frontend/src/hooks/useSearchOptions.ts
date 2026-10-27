import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import type { Paged } from '@/types/catalog';
import type { PageRequest } from './usePagedList';

const SEARCH_DELAY_MS = 250;
const OPTION_LIMIT = 8;

export function useSearchOptions<T>(load: (request: PageRequest) => Promise<Paged<T>>, search: string, active: boolean) {
  const [options, setOptions] = useState<T[]>([]);
  const [debounced] = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    load({ page: 1, limit: OPTION_LIMIT, search: debounced || undefined })
      .then((result) => {
        if (!cancelled) setOptions(result.rows);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [load, debounced, active]);

  return options;
}
