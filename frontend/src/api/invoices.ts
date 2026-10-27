import { apiClient, handleApiError } from './client';
import { Invoice } from '../types/invoice';

export interface InvoiceResponse {
  id: string;
  invoice: Invoice;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: 'date' | 'number' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceListResponse {
  invoices: InvoiceResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Invoice API service
 */
export const invoiceApi = {
  /**
   * Get all user's invoices with optional filters
   */
  getAll: async (params?: InvoiceListParams): Promise<InvoiceListResponse> => {
    try {
      const response = await apiClient.get('/invoices', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single invoice by ID
   */
  getById: async (id: string): Promise<InvoiceResponse> => {
    try {
      const response = await apiClient.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new invoice
   */
  create: async (invoice: Invoice): Promise<InvoiceResponse> => {
    try {
      const response = await apiClient.post('/invoices', { invoice });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update existing invoice
   */
  update: async (id: string, invoice: Invoice): Promise<InvoiceResponse> => {
    try {
      const response = await apiClient.put(`/invoices/${id}`, { invoice });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete invoice
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/invoices/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update invoice status
   */
  updateStatus: async (id: string, status: string): Promise<InvoiceResponse> => {
    try {
      const response = await apiClient.patch(`/invoices/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Duplicate an existing invoice
   */
  duplicate: async (id: string): Promise<InvoiceResponse> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/duplicate`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
