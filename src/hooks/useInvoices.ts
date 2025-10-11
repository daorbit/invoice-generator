import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { invoiceApi, InvoiceResponse, InvoiceListParams } from '../api/invoices';
import { setInvoice } from '../store/invoiceSlice';
import { useAuth } from '../context/AuthContext';

interface UseInvoicesReturn {
  invoices: InvoiceResponse[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  loadInvoices: (params?: InvoiceListParams) => Promise<void>;
  saveInvoice: (id?: string) => Promise<InvoiceResponse>;
  loadInvoice: (id: string) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  emailInvoice: (id: string, recipientEmail: string) => Promise<void>;
  duplicateInvoice: (id: string) => Promise<void>;
  clearError: () => void;
}

interface UseInvoicesOptions {
  autoLoad?: boolean; // If true, automatically loads invoices on mount
}

/**
 * Custom hook for managing invoices
 * Handles both guest mode (localStorage) and authenticated mode (server sync)
 * @param options.autoLoad - If true, automatically loads invoices when authenticated (default: false)
 */
export const useInvoices = (options: UseInvoicesOptions = {}): UseInvoicesReturn => {
  const { autoLoad = false } = options;
  const { isAuthenticated, user } = useAuth();
  const isGuest = user?.isAnonymous || false;
  const dispatch = useAppDispatch();
  const currentInvoice = useAppSelector((state) => state.invoice);

  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
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
   * Load all invoices from server
   * Only works for authenticated (non-guest) users
   */
  const loadInvoices = useCallback(
    async (params?: InvoiceListParams) => {
      if (isGuest) {
        // Guest mode - no server data to load
        setInvoices([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await invoiceApi.getAll(params);
        setInvoices(data.invoices);
      } catch (err: any) {
        setError(err.message || 'Failed to load invoices');
        console.error('Load invoices error:', err);
      } finally {
        setLoading(false);
      }
    },
    [isGuest]
  );

  /**
   * Save current invoice to server
   * Guest mode: Does nothing (already handled by Redux + localStorage)
   * Authenticated: Saves to server
   */
  const saveInvoice = useCallback(
    async (id?: string): Promise<InvoiceResponse> => {
      if (isGuest) {
        // Guest mode - only save to localStorage (already handled by Redux)
        // Return a mock response for consistency
        return {
          id: 'guest-' + Date.now(),
          invoice: currentInvoice,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      setSyncing(true);
      setError(null);
      try {
        let response: InvoiceResponse;
        if (id) {
          // Update existing
          response = await invoiceApi.update(id, currentInvoice);
        } else {
          // Create new
          response = await invoiceApi.create(currentInvoice);
        }
        
        // Refresh list
        await loadInvoices();
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to save invoice');
        console.error('Save invoice error:', err);
        throw err;
      } finally {
        setSyncing(false);
      }
    },
    [isGuest, currentInvoice, loadInvoices]
  );

  /**
   * Load invoice by ID from server and set it in Redux
   */
  const loadInvoice = useCallback(
    async (id: string) => {
      if (isGuest) {
        setError('Cannot load invoice in guest mode');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await invoiceApi.getById(id);
        dispatch(setInvoice(data.invoice));
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice');
        console.error('Load invoice error:', err);
      } finally {
        setLoading(false);
      }
    },
    [isGuest, dispatch]
  );

  /**
   * Delete invoice by ID
   */
  const deleteInvoice = useCallback(
    async (id: string) => {
      if (isGuest) {
        setError('Cannot delete invoice in guest mode');
        return;
      }

      setError(null);
      try {
        await invoiceApi.delete(id);
        await loadInvoices(); // Refresh list
      } catch (err: any) {
        setError(err.message || 'Failed to delete invoice');
        console.error('Delete invoice error:', err);
        throw err;
      }
    },
    [isGuest, loadInvoices]
  );

  /**
   * Update invoice status
   */
  const updateStatus = useCallback(
    async (id: string, status: string) => {
      if (isGuest) {
        setError('Cannot update status in guest mode');
        return;
      }

      setError(null);
      try {
        await invoiceApi.updateStatus(id, status);
        await loadInvoices(); // Refresh list
      } catch (err: any) {
        setError(err.message || 'Failed to update status');
        console.error('Update status error:', err);
        throw err;
      }
    },
    [isGuest, loadInvoices]
  );

  /**
   * Email invoice to recipient
   */
  const emailInvoice = useCallback(
    async (id: string, recipientEmail: string) => {
      if (isGuest) {
        setError('Cannot email invoice in guest mode');
        return;
      }

      setError(null);
      try {
        await invoiceApi.emailInvoice(id, { recipientEmail });
      } catch (err: any) {
        setError(err.message || 'Failed to email invoice');
        console.error('Email invoice error:', err);
        throw err;
      }
    },
    [isGuest]
  );

  /**
   * Duplicate an existing invoice
   */
  const duplicateInvoice = useCallback(
    async (id: string) => {
      if (isGuest) {
        setError('Cannot duplicate invoice in guest mode');
        return;
      }

      setError(null);
      try {
        const newInvoice = await invoiceApi.duplicate(id);
        dispatch(setInvoice(newInvoice.invoice));
        await loadInvoices(); // Refresh list
      } catch (err: any) {
        setError(err.message || 'Failed to duplicate invoice');
        console.error('Duplicate invoice error:', err);
        throw err;
      }
    },
    [isGuest, dispatch, loadInvoices]
  );

  /**
   * Auto-load invoices when user becomes authenticated (only if autoLoad is enabled)
   */
  useEffect(() => {
    if (autoLoad && isAuthenticated && !isGuest) {
      loadInvoices();
    }
  }, [autoLoad, isAuthenticated, isGuest, loadInvoices]);

  return {
    invoices,
    loading,
    error,
    syncing,
    loadInvoices,
    saveInvoice,
    loadInvoice,
    deleteInvoice,
    updateStatus,
    emailInvoice,
    duplicateInvoice,
    clearError,
  };
};
