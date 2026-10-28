import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDocument, saveDocument } from '@/api/documents';
import { getCustomer } from '@/api/catalog';
import { customerParty, lineFromCatalog, newDraft, newLineItem } from '@/lib/newDraft';
import { lineAmount } from '@/lib/totals';
import { notify } from '@/lib/notify';
import type { BusinessProfile } from '@/types/businessProfile';
import type { CatalogItem, Customer } from '@/types/catalog';
import type {
  ClientResponse,
  DocumentActivity,
  DocumentDraft,
  DocumentKind,
  DocumentStatus,
  LineItem,
  LoadedDocument,
  Party,
} from '@/types/document';

type EditableField = Exclude<keyof DocumentDraft, 'kind' | 'client' | 'items' | 'from' | 'status'>;
type ItemPatch = Partial<Omit<LineItem, 'id' | 'amount'>>;

function withCustomer(draft: DocumentDraft, customer: Customer): DocumentDraft {
  return {
    ...draft,
    client: customerParty(customer),
    customerId: customer.id,
    placeOfSupply: customer.gstin ? '' : customer.stateCode,
  };
}

export function useDocumentEditor(
  kind: DocumentKind,
  id: string | undefined,
  profile: BusinessProfile | null,
  profileLoading: boolean,
  prefillCustomerId?: string | null
) {
  const [draft, setDraft] = useState<DocumentDraft | null>(null);
  const [saved, setSaved] = useState<string>('');
  const [activity, setActivity] = useState<DocumentActivity | null>(null);
  const [clientResponse, setClientResponse] = useState<ClientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [missing, setMissing] = useState(false);

  const apply = useCallback((loaded: LoadedDocument) => {
    setDraft(loaded.draft);
    setSaved(JSON.stringify(loaded.draft));
    setActivity(loaded.activity);
    setClientResponse(loaded.clientResponse);
  }, []);

  useEffect(() => {
    if (id || profileLoading) return;
    let cancelled = false;
    const fresh = newDraft(kind, profile);
    const start = (next: DocumentDraft) => {
      if (cancelled) return;
      setDraft(next);
      setSaved(JSON.stringify(fresh));
      setActivity(null);
      setClientResponse(null);
      setMissing(false);
      setLoading(false);
    };
    if (!prefillCustomerId) {
      start(fresh);
    } else {
      getCustomer(prefillCustomerId)
        .then((detail) => start(withCustomer(fresh, detail.customer)))
        .catch(() => start(fresh));
    }
    return () => {
      cancelled = true;
    };
  }, [kind, id, profile, profileLoading, prefillCustomerId]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setMissing(false);
    setLoading(true);
    getDocument(kind, id)
      .then((loaded) => {
        if (!cancelled) apply(loaded);
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
  }, [kind, id, apply]);

  const setField = useCallback(<K extends EditableField>(field: K, value: DocumentDraft[K]) => {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
  }, []);

  const setClient = useCallback((field: keyof Party, value: string) => {
    setDraft((d) => {
      if (!d) return d;
      const renamed = field === 'name' && value.trim() !== d.client.name.trim();
      return { ...d, client: { ...d.client, [field]: value }, customerId: renamed ? undefined : d.customerId };
    });
  }, []);

  const fillCustomer = useCallback((customer: Customer) => {
    setDraft((d) => (d ? withCustomer(d, customer) : d));
  }, []);

  const updateItem = useCallback((itemId: string, patch: ItemPatch) => {
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

  const fillItem = useCallback((itemId: string, catalogItem: CatalogItem) => {
    setDraft((d) =>
      d ? { ...d, items: d.items.map((item) => (item.id === itemId ? lineFromCatalog(item, catalogItem) : item)) } : d
    );
  }, []);

  const addItem = useCallback(() => {
    setDraft((d) => (d ? { ...d, items: [...d.items, newLineItem(d.tax)] } : d));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setDraft((d) => (d && d.items.length > 1 ? { ...d, items: d.items.filter((item) => item.id !== itemId) } : d));
  }, []);

  const applyTaxRate = useCallback((rate: number) => {
    setDraft((d) => (d ? { ...d, tax: rate, items: d.items.map((item) => ({ ...item, taxRate: rate })) } : d));
  }, []);

  const replaceDraft = useCallback((next: DocumentDraft) => {
    setDraft(next);
  }, []);

  const setShareUrl = useCallback((shareUrl: string | null) => {
    setActivity((current) => ({
      views: { count: 0, firstAt: null, lastAt: null },
      lastEmail: null,
      scheduledEmail: null,
      ...current,
      shareUrl,
    }));
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
      apply(result);
      notify.success(id ? 'Changes saved' : `${result.draft.number} created`);
      return result.id;
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not save');
      return null;
    } finally {
      setSaving(false);
    }
  }, [draft, id, apply]);

  return {
    draft,
    activity,
    clientResponse,
    loading,
    saving,
    missing,
    dirty,
    setField,
    setClient,
    fillCustomer,
    updateItem,
    fillItem,
    addItem,
    removeItem,
    applyTaxRate,
    replaceDraft,
    markStatus,
    setShareUrl,
    apply,
    save,
  };
}
