import { ActionIcon, Loader, Menu } from '@mantine/core';
import { ArrowRightLeft, Check, Copy, MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import { STATUSES, STATUS_META } from '@/lib/documentMeta';
import type { DocumentStatus, DocumentSummary } from '@/types/document';

export interface DocumentRowActions {
  onOpen: (doc: DocumentSummary) => void;
  onDuplicate: (doc: DocumentSummary) => void;
  onStatus: (doc: DocumentSummary, status: DocumentStatus) => void;
  onConvert: (doc: DocumentSummary) => void;
  onDelete: (doc: DocumentSummary) => void;
}

interface Props {
  doc: DocumentSummary;
  busy: boolean;
  actions: DocumentRowActions;
}

export function DocumentRowMenu({ doc, busy, actions }: Props) {
  const canConvert = doc.kind === 'quotation' && !doc.convertedInvoiceId;

  return (
    <Menu position="bottom-end" width={210}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" aria-label="More actions" disabled={busy}>
          {busy ? <Loader size={14} /> : <MoreHorizontal size={17} />}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<PencilLine size={15} />} onClick={() => actions.onOpen(doc)}>
          Open
        </Menu.Item>
        <Menu.Item leftSection={<Copy size={15} />} onClick={() => actions.onDuplicate(doc)}>
          Duplicate
        </Menu.Item>
        {canConvert && (
          <Menu.Item leftSection={<ArrowRightLeft size={15} />} onClick={() => actions.onConvert(doc)}>
            Convert to invoice
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Label>Mark as</Menu.Label>
        {STATUSES[doc.kind].map((status) => (
          <Menu.Item
            key={status}
            disabled={status === doc.status}
            rightSection={status === doc.status ? <Check size={14} /> : undefined}
            onClick={() => actions.onStatus(doc, status)}
          >
            {STATUS_META[status].label}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<Trash2 size={15} />} onClick={() => actions.onDelete(doc)}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
