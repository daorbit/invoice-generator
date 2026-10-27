import { useCallback, useState } from 'react';
import { notify } from '@/lib/notify';

export function useCatalogDelete<T extends { id: string; name: string }>(
  remove: (id: string) => Promise<unknown>,
  onDeleted: () => void
) {
  const [pending, setPending] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirm = useCallback(async () => {
    if (!pending) return;
    setDeleting(true);
    try {
      await remove(pending.id);
      notify.success(`${pending.name} deleted`);
      setPending(null);
      onDeleted();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not delete');
    } finally {
      setDeleting(false);
    }
  }, [pending, remove, onDeleted]);

  return { pending, deleting, ask: setPending, cancel: () => setPending(null), confirm };
}
