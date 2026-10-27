import { useCallback, useEffect, useState } from 'react';
import { notify } from '@/lib/notify';

export function useAsyncData<T>(load: (() => Promise<T>) | null, key: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(load));
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!load) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    load()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setFailed(true);
        notify.error(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, failed, reload, setData };
}
