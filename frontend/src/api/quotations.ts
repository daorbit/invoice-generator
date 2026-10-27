import { apiClient, handleApiError } from './client';
import { Quotation } from '../types/quotation';

export interface QuotationResponse {
  id: string;
  quotation: Quotation;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: 'date' | 'number' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface QuotationListResponse {
  quotations: QuotationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConvertToInvoiceResponse {
  invoiceId: string;
  invoiceNumber: string;
}

/**
 * Quotation API service
 */
export const quotationApi = {
  /**
   * Get all user's quotations with optional filters
   */
  getAll: async (params?: QuotationListParams): Promise<QuotationListResponse> => {
    try {
      const response = await apiClient.get('/quotations', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single quotation by ID
   */
  getById: async (id: string): Promise<QuotationResponse> => {
    try {
      const response = await apiClient.get(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new quotation
   */
  create: async (quotation: Quotation): Promise<QuotationResponse> => {
    try {
      const response = await apiClient.post('/quotations', { quotation });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update existing quotation
   */
  update: async (id: string, quotation: Quotation): Promise<QuotationResponse> => {
    try {
      const response = await apiClient.put(`/quotations/${id}`, { quotation });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete quotation
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/quotations/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update quotation status
   */
  updateStatus: async (
    id: string,
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  ): Promise<QuotationResponse> => {
    try {
      const response = await apiClient.patch(`/quotations/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Convert quotation to invoice
   */
  convertToInvoice: async (id: string): Promise<ConvertToInvoiceResponse> => {
    try {
      const response = await apiClient.post(`/quotations/${id}/convert`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Duplicate an existing quotation
   */
  duplicate: async (id: string): Promise<QuotationResponse> => {
    try {
      const response = await apiClient.post(`/quotations/${id}/duplicate`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
