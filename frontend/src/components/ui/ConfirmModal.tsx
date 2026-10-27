import type { ReactNode } from 'react';
import { Button, Group, Modal, Text } from '@mantine/core';

interface Props {
  opened: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  busy: boolean;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ opened, title, body, confirmLabel, busy, danger = true, onCancel, onConfirm }: Props) {
  return (
    <Modal opened={opened} onClose={onCancel} title={title} size="sm">
      <Text size="sm" c="dimmed">
        {body}
      </Text>
      <Group justify="flex-end" mt="lg" gap="sm">
        <Button variant="default" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button color={danger ? 'red' : undefined} onClick={onConfirm} loading={busy}>
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
