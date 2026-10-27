import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDocument, saveDocument } from '@/api/documents';
import { newDraft, newLineItem } from '@/lib/newDraft';
import { lineAmount } from '@/lib/totals';
import { notify } from '@/lib/notify';
import type { BusinessProfile } from '@/types/businessProfile';
import type { DocumentDraft, DocumentKind, DocumentStatus, LineItem, Party } from '@/types/document';

type EditableField = Exclude<keyof DocumentDraft, 'kind' | 'client' | 'items' | 'from' | 'status'>;

export function useDocumentEditor(
  kind: DocumentKind,
  id: string | undefined,
  profile: BusinessProfile | null,
  profileLoading: boolean
) {
  const [draft, setDraft] = useState<DocumentDraft | null>(null);
  const [saved, setSaved] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (id || profileLoading) return;
    const fresh = newDraft(kind, profile);
    setDraft(fresh);
    setSaved(JSON.stringify(fresh));
    setMissing(false);
    setLoading(false);
  }, [kind, id, profile, profileLoading]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setMissing(false);
    setLoading(true);
    getDocument(kind, id)
      .then((loaded) => {
        if (cancelled) return;
        setDraft(loaded);
        setSaved(JSON.stringify(loaded));
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setMissing(true);
        notify.error(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  const setField = useCallback(<K extends EditableField>(field: K, value: DocumentDraft[K]) => {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
  }, []);

  const setClient = useCallback((field: keyof Party, value: string) => {
    setDraft((d) => (d ? { ...d, client: { ...d.client, [field]: value } } : d));
  }, []);

  const fillClient = useCallback((client: Party) => {
    setDraft((d) => (d ? { ...d, client: { ...client } } : d));
  }, []);

  const updateItem = useCallback((itemId: string, patch: Partial<Omit<LineItem, 'id' | 'amount'>>) => {
    setDraft((d) =>
      d
        ? {
            ...d,
            items: d.items.map((item) => {
              if (item.id !== itemId) return item;
              const next = { ...item, ...patch };
              return { ...next, amount: lineAmount(next) };
            }),
          }
        : d
    );
  }, []);

  const addItem = useCallback(() => {
    setDraft((d) => (d ? { ...d, items: [...d.items, newLineItem()] } : d));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setDraft((d) => (d && d.items.length > 1 ? { ...d, items: d.items.filter((item) => item.id !== itemId) } : d));
  }, []);

  const markStatus = useCallback((status: DocumentStatus) => {
    setDraft((d) => (d ? { ...d, status } : d));
    setSaved((snapshot) => (snapshot ? JSON.stringify({ ...JSON.parse(snapshot), status }) : snapshot));
  }, []);

  const dirty = useMemo(() => Boolean(draft) && JSON.stringify(draft) !== saved, [draft, saved]);

  const save = useCallback(async (): Promise<string | null> => {
    if (!draft) return null;
    if (!draft.client.name.trim()) {
      notify.error('Add who this is for before saving.');
      return null;
    }
    setSaving(true);
    try {
      const result = await saveDocument(draft, id);
      setDraft(result.draft);
      setSaved(JSON.stringify(result.draft));
      notify.success(id ? 'Changes saved' : `${result.draft.number} created`);
      return result.id;
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not save');
      return null;
    } finally {
      setSaving(false);
    }
  }, [draft, id]);

  return {
    draft,
    loading,
    saving,
    missing,
    dirty,
    setField,
    setClient,
    fillClient,
    updateItem,
    addItem,
    removeItem,
    markStatus,
    save,
  };
}
