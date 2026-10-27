import { useEffect, useState, useCallback } from 'react';
import { dashboardApi, DashboardStats, RecentDocument } from '../api/dashboard';

const RECENT_LIMIT = 10;

interface UseDashboardReturn {
  stats: DashboardStats | null;
  recentDocuments: RecentDocument[];
  loading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  clearError: () => void;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, recentData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentDocuments(RECENT_LIMIT),
      ]);
      setStats(statsData);
      setRecentDocuments(recentData);
    } catch (err) {
      setError(typeof err === 'string' ? err : err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    stats,
    recentDocuments,
    loading,
    error,
    loadDashboard,
    clearError,
  };
};
