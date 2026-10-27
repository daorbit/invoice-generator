import { apiClient, handleApiError } from './client';
import type { BusinessProfileResponse } from '../types/businessProfile';

export const businessProfileApi = {
  get: async (): Promise<BusinessProfileResponse> => {
    try {
      const response = await apiClient.get<BusinessProfileResponse>('/settings');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
