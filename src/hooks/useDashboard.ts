import { useEffect, useState, useCallback } from 'react';
import { dashboardApi, DashboardStats, RecentDocument } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';

interface UseDashboardReturn {
  stats: DashboardStats | null;
  recentDocuments: RecentDocument[];
  loading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing dashboard data
 * Loads statistics and recent documents for authenticated users
 */
export const useDashboard = (): UseDashboardReturn => {
  const { isAuthenticated, user } = useAuth();
  const isGuest = user?.isAnonymous || false;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load dashboard data (stats + recent documents)
   */
  const loadDashboard = useCallback(async () => {
    if (isGuest) {
      // Guest mode - no server data to load
      setStats(null);
      setRecentDocuments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch both stats and recent documents in parallel
      const [statsData, recentData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentDocuments(10), // Get last 10 documents
      ]);

      setStats(statsData);
      setRecentDocuments(recentData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Load dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  /**
   * Auto-load dashboard data when user becomes authenticated
   */
  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      loadDashboard();
    }
  }, [isAuthenticated, isGuest, loadDashboard]);

  return {
    stats,
    recentDocuments,
    loading,
    error,
    loadDashboard,
    clearError,
  };
};
