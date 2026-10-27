import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { KIND_META } from '@/lib/documentMeta';
import type { DocumentSummary } from '@/types/document';

interface Props {
  doc: DocumentSummary | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDocumentModal({ doc, deleting, onCancel, onConfirm }: Props) {
  const label = doc ? KIND_META[doc.kind].singular.toLowerCase() : '';

  return (
    <ConfirmModal
      opened={Boolean(doc)}
      title={`Delete this ${label}?`}
      body={`${doc?.number ?? ''} will be removed for everyone in this workspace. This cannot be undone.`}
      confirmLabel="Delete"
      busy={deleting}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
