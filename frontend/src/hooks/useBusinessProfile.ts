import { useEffect, useState } from 'react';
import { getBusinessProfile } from '@/api/workspace';
import type { BusinessProfileResponse } from '@/types/businessProfile';

let cached: Promise<BusinessProfileResponse> | null = null;

function loadProfile(): Promise<BusinessProfileResponse> {
  if (!cached) {
    cached = getBusinessProfile().catch((error) => {
      cached = null;
      throw error;
    });
  }
  return cached;
}

export function useBusinessProfile() {
  const [data, setData] = useState<BusinessProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadProfile()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile: data?.profile ?? null, complete: data?.complete ?? false, loading };
}
