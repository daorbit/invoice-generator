import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { quotationApi, QuotationResponse, QuotationListParams } from '../api/quotations';
import { setQuotation } from '../store/quotationSlice';
import { useAuth } from '../context/AuthContext';

interface UseQuotationsReturn {
  quotations: QuotationResponse[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  loadQuotations: (params?: QuotationListParams) => Promise<void>;
  saveQuotation: (id?: string) => Promise<QuotationResponse>;
  loadQuotation: (id: string) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  updateStatus: (id: string, status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired') => Promise<void>;
  convertToInvoice: (id: string) => Promise<{ invoiceId: string; invoiceNumber: string }>;
  emailQuotation: (id: string, recipientEmail: string) => Promise<void>;
  duplicateQuotation: (id: string) => Promise<void>;
  clearError: () => void;
}

interface UseQuotationsOptions {
  autoLoad?: boolean; // If true, automatically loads quotations on mount
}

/**
 * Custom hook for managing quotations
 * Handles both guest mode (localStorage) and authenticated mode (server sync)
 * @param options.autoLoad - If true, automatically loads quotations when authenticated (default: false)
 */
export const useQuotations = (options: UseQuotationsOptions = {}): UseQuotationsReturn => {
  const { autoLoad = false } = options;
  const { isAuthenticated, user } = useAuth();
  const isGuest = user?.isAnonymous || false;
  const dispatch = useAppDispatch();
  const currentQuotation = useAppSelector((state) => state.quotation);

  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load all quotations from server
   * Only works for authenticated (non-guest) users
   */
  const loadQuotations = useCallback(
    async (params?: QuotationListParams) => {
      if (isGuest) {
        // Guest mode - no server data to load
        setQuotations([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await quotationApi.getAll(params);
        setQuotations(data.quotations);
      } catch (err: any) {
        setError(err.message || 'Failed to load quotations');
        console.error('Load quotations error:', err);
      } finally {
        setLoading(false);
      }
    },
    [isGuest]
  );

  /**
   * Save current quotation to server
   * Guest mode: Does nothing (already handled by Redux + localStorage)
   * Authenticated: Saves to server
   */
  const saveQuotation = useCallback(
    async (id?: string): Promise<QuotationResponse> => {
      if (isGuest) {
        // Guest mode - only save to localStorage (already handled by Redux)
        // Return a mock response for consistency
        return {
          id: 'guest-' + Date.now(),
          quotation: currentQuotation,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      setSyncing(true);
      setError(null);
      try {
        let response: QuotationResponse;
        if (id) {
          // Update existing
          response = await quotationApi.update(id, currentQuotation);
        } else {
          // Create new
          response = await quotationApi.create(currentQuotation);
        }
        
        // Refresh list
        await loadQuotations();
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to save quotation');
        console.error('Save quotation error:', err);
        throw err;
      } finally {
        setSyncing(false);
      }
    },
    [isGuest, currentQuotation, loadQuotations]
  );

  /**
   * Load quotation by ID from server and set it in Redux
   */
  const loadQuotation = useCallback(
    async (id: string) => {
      if (isGuest) {
        setError('Cannot load quotation in guest mode');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await quotationApi.getById(id);
        dispatch(setQuotation(data.quotation));
      } catch (err: any) {
        setError(err.message || 'Failed to load quotation');
        console.error('Load quotation error:', err);
      } finally {
        setLoading(false);
      }
    },
    [isGuest, dispatch]
  );

  /**
   * Delete quotation by ID
   */
  const deleteQuotation = useCallback(
    async (id: string) => {
      if (isGuest) {
        setError('Cannot delete quotation in guest mode');
        return;
      }

      setError(null);
      try {
        await quotationApi.delete(id);
        await loadQuotations(); // Refresh list
      } catch (err: any) {
        setError(err.message || 'Failed to delete quotation');
        console.error('Delete quotation error:', err);
        throw err;
      }
    },
    [isGuest, loadQuotations]
  );

  /**
   * Update quotation status
   */
  const updateStatus = useCallback(
    async (id: string, status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired') => {
      if (isGuest) {
        setError('Cannot update status in guest mode');
        return;
      }

      setError(null);
      try {
        await quotationApi.updateStatus(id, status);
        await loadQuotations(); // Refresh list
      } catch (err: any) {
        setError(err.message || 'Failed to update status');
        console.error('Update status error:', err);
        throw err;
      }
    },
    [isGuest, loadQuotations]
  );

  /**
   * Convert quotation to invoice
   */
  const convertToInvoice = useCallback(
    async (id: string): Promise<{ invoiceId: string; invoiceNumber: string }> => {
      if (isGuest) {
        setError('Cannot convert quotation in guest mode');
        throw new Error('Cannot convert quotation in guest mode');
      }

      setError(null);
      try {
        const response = await quotationApi.convertToInvoice(id);
        await loadQuotations(); // Refresh list
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to convert quotation');
        console.error('Convert quotation error:', err);
        throw err;
      }
    },
    [isGuest, loadQuotations]
  );

  /**
   * Email quotation to recipient
   */
  const emailQuotation = useCallback(
    async (id: string, recipientEmail: string) => {
      if (isGuest) {
        setError('Cannot email quotation in guest mode');
        return;
      }

      setError(null);
      try {
        await quotationApi.emailQuotation(id, { recipientEmail });
      } catch (err: any) {
        setError(err.message || 'Failed to email quotation');
        console.error('Email quotation error:', err);
        throw err;
      }
    },
    [isGuest]
  );

  /**
   * Duplicate an existing quotation
   */
  const duplicateQuotation = useCallback(
    async (id: string) => {
      if (isGuest) {
        setError('Cannot duplicate quotation in guest mode');
        return;
      }

      setError(null);
      try {
        const newQuotation = await quotationApi.duplicate(id);
        dispatch(setQuotation(newQuotation.quotation));
        await loadQuotations(); // Refresh list
      } catch (err: any) {
        setError(err.message || 'Failed to duplicate quotation');
        console.error('Duplicate quotation error:', err);
        throw err;
      }
    },
    [isGuest, dispatch, loadQuotations]
  );

  /**
   * Auto-load quotations when user becomes authenticated (only if autoLoad is enabled)
   */
  useEffect(() => {
    if (autoLoad && isAuthenticated && !isGuest) {
      loadQuotations();
    }
  }, [autoLoad, isAuthenticated, isGuest, loadQuotations]);

  return {
    quotations,
    loading,
    error,
    syncing,
    loadQuotations,
    saveQuotation,
    loadQuotation,
    deleteQuotation,
    updateStatus,
    convertToInvoice,
    emailQuotation,
    duplicateQuotation,
    clearError,
  };
};
