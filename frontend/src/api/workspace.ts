import { apiClient, call } from './client';
import type { DashboardStats } from '@/types/document';
import type { BusinessProfileResponse } from '@/types/businessProfile';

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await call(() => apiClient.get<{ data: DashboardStats }>('/dashboard/stats'));
  return response.data;
}

export function getBusinessProfile(): Promise<BusinessProfileResponse> {
  return call(() => apiClient.get<BusinessProfileResponse>('/settings'));
}
