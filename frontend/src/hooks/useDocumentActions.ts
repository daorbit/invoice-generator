import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { convertQuotation, deleteDocument, duplicateDocument, setDocumentStatus } from '@/api/documents';
import { DOCUMENT_PATH } from '@/lib/documentMapping';
import { KIND_META, STATUS_META } from '@/lib/documentMeta';
import { notify } from '@/lib/notify';
import type { DocumentStatus, DocumentSummary } from '@/types/document';

export function useDocumentActions(onChanged: () => void) {
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DocumentSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const run = useCallback(async (doc: DocumentSummary, task: () => Promise<void>) => {
    setBusyId(doc.id);
    try {
      await task();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setBusyId(null);
    }
  }, []);

  const onOpen = useCallback(
    (doc: DocumentSummary) => navigate(`${DOCUMENT_PATH[doc.kind]}/${doc.id}`),
    [navigate]
  );

  const onDuplicate = useCallback(
    (doc: DocumentSummary) =>
      run(doc, async () => {
        const id = await duplicateDocument(doc.kind, doc.id);
        notify.success(`${KIND_META[doc.kind].singular} duplicated`);
        navigate(`${DOCUMENT_PATH[doc.kind]}/${id}`);
      }),
    [run, navigate]
  );

  const onStatus = useCallback(
    (doc: DocumentSummary, status: DocumentStatus) =>
      run(doc, async () => {
        await setDocumentStatus(doc.kind, doc.id, status);
        notify.success(`${doc.number} marked as ${STATUS_META[status].label.toLowerCase()}`);
        onChanged();
      }),
    [run, onChanged]
  );

  const onConvert = useCallback(
    (doc: DocumentSummary) =>
      run(doc, async () => {
        const result = await convertQuotation(doc.id);
        notify.success(`${result.invoiceNumber} created from ${doc.number}`);
        navigate(`${DOCUMENT_PATH.invoice}/${result.invoiceId}`);
      }),
    [run, navigate]
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteDocument(pendingDelete.kind, pendingDelete.id);
      notify.success(`${pendingDelete.number} deleted`);
      setPendingDelete(null);
      onChanged();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not delete');
    } finally {
      setDeleting(false);
    }
  }, [pendingDelete, onChanged]);

  return {
    busyId,
    pendingDelete,
    deleting,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    actions: { onOpen, onDuplicate, onStatus, onConvert, onDelete: setPendingDelete },
  };
}
