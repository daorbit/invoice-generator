import { apiClient, call } from './client';
import type { OrbitReply, OrbitRequest } from '@/types/orbit';

const ORBIT_TIMEOUT_MS = 70_000;

export type OrbitAction = 'draft' | 'edit' | 'gst';

export function askOrbit(action: OrbitAction, request: OrbitRequest): Promise<OrbitReply> {
  return call(() => apiClient.post<OrbitReply>(`/orbit/${action}`, request, { timeout: ORBIT_TIMEOUT_MS }));
}
