import { Button, Group, Modal, Text } from '@mantine/core';
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
    <Modal opened={Boolean(doc)} onClose={onCancel} title={`Delete this ${label}?`} size="sm">
      <Text size="sm" c="dimmed">
        {doc?.number} will be removed for everyone in this workspace. This cannot be undone.
      </Text>
      <Group justify="flex-end" mt="lg" gap="sm">
        <Button variant="default" onClick={onCancel} disabled={deleting}>
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm} loading={deleting}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
