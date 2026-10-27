import { useEffect, useState } from 'react';
import { getRecentClients } from '@/api/workspace';
import type { Party } from '@/types/document';

const EMPTY: Party[] = [];

export function useRecentClients(): Party[] {
  const [clients, setClients] = useState<Party[]>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    getRecentClients()
      .then((result) => {
        if (!cancelled) setClients(result);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return clients;
}
