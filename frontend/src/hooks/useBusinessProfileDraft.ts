import { useEffect, useState } from 'react';
import { saveBusinessProfile } from '@/api/workspace';
import { notify } from '@/lib/notify';
import type { BusinessProfile, BusinessProfileResponse } from '@/types/businessProfile';
import { rememberBusinessProfile, useBusinessProfile } from './useBusinessProfile';

export type SetProfileField = <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => void;

function sameProfile(a: BusinessProfile | null, b: BusinessProfile | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useBusinessProfileDraft() {
  const loaded = useBusinessProfile();
  const [saved, setSaved] = useState<BusinessProfileResponse | null>(null);
  const [draft, setDraft] = useState<BusinessProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loaded.profile) return;
    setSaved({ profile: loaded.profile, complete: loaded.complete });
    setDraft(loaded.profile);
  }, [loaded.profile, loaded.complete]);

  const dirty = Boolean(draft && saved && !sameProfile(draft, saved.profile));

  const setField: SetProfileField = (field, value) => setDraft((current) => (current ? { ...current, [field]: value } : current));

  const discard = () => setDraft(saved?.profile ?? null);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const response = await saveBusinessProfile(draft);
      rememberBusinessProfile(response);
      setSaved(response);
      setDraft(response.profile);
      notify.success('Business details saved');
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not save business details');
    } finally {
      setSaving(false);
    }
  };

  return {
    draft,
    setField,
    dirty,
    saving,
    save,
    discard,
    complete: saved?.complete ?? false,
    loading: loaded.loading,
    failed: !loaded.loading && !loaded.profile,
  };
}
