import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { quotationApi, QuotationResponse, QuotationListParams } from '../api/quotations';
import { setQuotation } from '../store/quotationSlice';

type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

interface UseQuotationsReturn {
  quotations: QuotationResponse[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  loadQuotations: (params?: QuotationListParams) => Promise<void>;
  saveQuotation: (id?: string) => Promise<QuotationResponse>;
  loadQuotation: (id: string) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  updateStatus: (id: string, status: QuotationStatus) => Promise<void>;
  convertToInvoice: (id: string) => Promise<{ invoiceId: string; invoiceNumber: string }>;
  duplicateQuotation: (id: string) => Promise<void>;
  clearError: () => void;
}

interface UseQuotationsOptions {
  autoLoad?: boolean;
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export const useQuotations = (options: UseQuotationsOptions = {}): UseQuotationsReturn => {
  const { autoLoad = false } = options;
  const dispatch = useAppDispatch();
  const currentQuotation = useAppSelector((state) => state.quotation);

  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const loadQuotations = useCallback(async (params?: QuotationListParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quotationApi.getAll(params);
      setQuotations(data.quotations);
    } catch (err) {
      setError(messageOf(err, 'Failed to load quotations'));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveQuotation = useCallback(
    async (id?: string): Promise<QuotationResponse> => {
      setSyncing(true);
      setError(null);
      try {
        return id
          ? await quotationApi.update(id, currentQuotation)
          : await quotationApi.create(currentQuotation);
      } catch (err) {
        setError(messageOf(err, 'Failed to save quotation'));
        throw err;
      } finally {
        setSyncing(false);
      }
    },
    [currentQuotation]
  );

  const loadQuotation = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await quotationApi.getById(id);
        dispatch(setQuotation(data.quotation));
      } catch (err) {
        setError(messageOf(err, 'Failed to load quotation'));
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const deleteQuotation = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await quotationApi.delete(id);
        await loadQuotations();
      } catch (err) {
        setError(messageOf(err, 'Failed to delete quotation'));
        throw err;
      }
    },
    [loadQuotations]
  );

  const updateStatus = useCallback(
    async (id: string, status: QuotationStatus) => {
      setError(null);
      try {
        await quotationApi.updateStatus(id, status);
        await loadQuotations();
      } catch (err) {
        setError(messageOf(err, 'Failed to update status'));
        throw err;
      }
    },
    [loadQuotations]
  );

  const convertToInvoice = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const response = await quotationApi.convertToInvoice(id);
        await loadQuotations();
        return response;
      } catch (err) {
        setError(messageOf(err, 'Failed to convert quotation'));
        throw err;
      }
    },
    [loadQuotations]
  );

  const duplicateQuotation = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const copy = await quotationApi.duplicate(id);
        dispatch(setQuotation(copy.quotation));
        await loadQuotations();
      } catch (err) {
        setError(messageOf(err, 'Failed to duplicate quotation'));
        throw err;
      }
    },
    [dispatch, loadQuotations]
  );

  useEffect(() => {
    if (autoLoad) loadQuotations();
  }, [autoLoad, loadQuotations]);

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
    duplicateQuotation,
    clearError,
  };
};
