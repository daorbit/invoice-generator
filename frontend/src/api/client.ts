import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { WORKSPACE_ID } from '../lib/bootParams';
import { ensureWorkspaceToken, refreshWorkspaceToken } from '../lib/workspaceToken';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

type RetriableConfig = InternalAxiosRequestConfig & { tokenRetried?: boolean };

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/workspaces/${encodeURIComponent(WORKSPACE_ID)}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await ensureWorkspaceToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string }>) => {
    const config = error.config as RetriableConfig | undefined;
    if (config && !config.tokenRetried && error.response?.data?.error === 'workspace_token_expired') {
      config.tokenRetried = true;
      const renewed = await refreshWorkspaceToken();
      if (renewed) {
        config.headers.Authorization = `Bearer ${renewed}`;
        return apiClient(config);
      }
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return error.response.data?.message || error.response.statusText || 'Server error occurred';
    }
    if (error.request) return 'No response from server. Please check your connection.';
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

export async function call<T>(request: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await request()).data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
