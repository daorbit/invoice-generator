import { apiClient, handleApiError } from './client';
import type { DashboardStats, Party } from '@/types/document';
import type { BusinessProfileResponse } from '@/types/businessProfile';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get<{ data: DashboardStats }>('/dashboard/stats');
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function getRecentClients(): Promise<Party[]> {
  try {
    const response = await apiClient.get<{ clients: Party[] }>('/clients');
    return response.data.clients;
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
