import { apiClient, handleApiError } from './client';
import type { DashboardStats } from '@/types/document';
import type { BusinessProfileResponse } from '@/types/businessProfile';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get<{ data: DashboardStats }>('/dashboard/stats');
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function getBusinessProfile(): Promise<BusinessProfileResponse> {
  try {
    const response = await apiClient.get<BusinessProfileResponse>('/settings');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
