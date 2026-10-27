import { useCallback, useEffect, useState } from 'react';
import { getDashboardStats } from '@/api/workspace';
import type { DashboardStats } from '@/types/document';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const reload = useCallback(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { stats, reload };
}
