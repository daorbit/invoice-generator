import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { invoiceApi, InvoiceResponse, InvoiceListParams } from '../api/invoices';
import { setInvoice } from '../store/invoiceSlice';

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
  duplicateInvoice: (id: string) => Promise<void>;
  clearError: () => void;
}

interface UseInvoicesOptions {
  autoLoad?: boolean;
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export const useInvoices = (options: UseInvoicesOptions = {}): UseInvoicesReturn => {
  const { autoLoad = false } = options;
  const dispatch = useAppDispatch();
  const currentInvoice = useAppSelector((state) => state.invoice);

  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const loadInvoices = useCallback(async (params?: InvoiceListParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceApi.getAll(params);
      setInvoices(data.invoices);
    } catch (err) {
      setError(messageOf(err, 'Failed to load invoices'));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveInvoice = useCallback(
    async (id?: string): Promise<InvoiceResponse> => {
      setSyncing(true);
      setError(null);
      try {
        return id ? await invoiceApi.update(id, currentInvoice) : await invoiceApi.create(currentInvoice);
      } catch (err) {
        setError(messageOf(err, 'Failed to save invoice'));
        throw err;
      } finally {
        setSyncing(false);
      }
    },
    [currentInvoice]
  );

  const loadInvoice = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await invoiceApi.getById(id);
        dispatch(setInvoice(data.invoice));
      } catch (err) {
        setError(messageOf(err, 'Failed to load invoice'));
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await invoiceApi.delete(id);
        await loadInvoices();
      } catch (err) {
        setError(messageOf(err, 'Failed to delete invoice'));
        throw err;
      }
    },
    [loadInvoices]
  );

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      setError(null);
      try {
        await invoiceApi.updateStatus(id, status);
        await loadInvoices();
      } catch (err) {
        setError(messageOf(err, 'Failed to update status'));
        throw err;
      }
    },
    [loadInvoices]
  );

  const duplicateInvoice = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const copy = await invoiceApi.duplicate(id);
        dispatch(setInvoice(copy.invoice));
        await loadInvoices();
      } catch (err) {
        setError(messageOf(err, 'Failed to duplicate invoice'));
        throw err;
      }
    },
    [dispatch, loadInvoices]
  );

  useEffect(() => {
    if (autoLoad) loadInvoices();
  }, [autoLoad, loadInvoices]);

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
    duplicateInvoice,
    clearError,
  };
};
