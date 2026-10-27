import { apiClient, handleApiError } from './client';

/**
 * Backend API Response Structure for /dashboard/stats
 */
interface StatsApiResponse {
  success: boolean;
  data: {
    invoices: {
      total: number;
      paid: number;
      unpaid: number;
      recent: number;
    };
    quotations: {
      total: number;
      pending: number;
      accepted: number;
      rejected: number;
      recent: number;
    };
    revenue: {
      total: number;
      paid: number;
      pending: number;
    };
  };
}

/**
 * Backend API Response Structure for /dashboard/recent
 */
interface RecentApiResponse {
  success: boolean;
  data: RecentDocument[];
}

/**
 * Recent Document (can be invoice or quotation)
 */
export interface RecentDocument {
  _id: string;
  type: 'invoice' | 'quotation';
  // Invoice fields
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  billToName?: string;
  // Quotation fields
  quotationNumber?: string;
  quotationDate?: string;
  validUntil?: string;
  quoteToName?: string;
  // Common fields
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    sortOrder: number;
    _id: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  }>;
  tax: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  shipping: number;
  status: string;
  createdAt: string;
  subtotal: number;
  total: number;
  id: string;
}

/**
 * Dashboard Statistics (normalized for frontend)
 */
export interface DashboardStats {
  invoices: {
    total: number;
    paid: number;
    unpaid: number;
    recent: number;
  };
  quotations: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    recent: number;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
  };
}

/**
 * Dashboard API Service
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   * GET /api/dashboard/stats
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<StatsApiResponse>('/dashboard/stats');
      return response.data.data; // Return the nested data object
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get recent documents (invoices and quotations)
   * GET /api/dashboard/recent
   * @param limit - Number of documents to fetch (default: 10)
   */
  getRecentDocuments: async (limit: number = 10): Promise<RecentDocument[]> => {
    try {
      const response = await apiClient.get<RecentApiResponse>('/dashboard/recent', {
        params: { limit },
      });
      return response.data.data; // Return the array of documents
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
