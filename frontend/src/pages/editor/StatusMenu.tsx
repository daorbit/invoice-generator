import { useState } from 'react';
import { Button, Loader, Menu } from '@mantine/core';
import { Check, ChevronDown } from 'lucide-react';
import { setDocumentStatus } from '@/api/documents';
import { StatusDot } from '@/components/ui/StatusPill';
import { STATUSES, STATUS_META } from '@/lib/documentMeta';
import { notify } from '@/lib/notify';
import type { DocumentKind, DocumentStatus } from '@/types/document';
import classes from './StatusMenu.module.css';

interface Props {
  kind: DocumentKind;
  id: string;
  status: DocumentStatus;
  onChange: (status: DocumentStatus) => void;
}

export function StatusMenu({ kind, id, status, onChange }: Props) {
  const [saving, setSaving] = useState(false);
  const current = STATUS_META[status];

  const change = async (next: DocumentStatus) => {
    setSaving(true);
    try {
      await setDocumentStatus(kind, id, next);
      onChange(next);
      notify.success(`Marked as ${STATUS_META[next].label.toLowerCase()}`);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not change the status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Menu position="bottom-end" width={180}>
      <Menu.Target>
        <Button
          variant="default"
          disabled={saving}
          aria-label={`Status: ${current.label}. Change status`}
          leftSection={saving ? <Loader size={10} color="currentColor" /> : <StatusDot tone={current.tone} />}
          rightSection={<ChevronDown size={14} className={classes.chevron} />}
        >
          {current.label}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Mark as</Menu.Label>
        {STATUSES[kind].map((value) => (
          <Menu.Item
            key={value}
            leftSection={<StatusDot tone={STATUS_META[value].tone} />}
            rightSection={value === status ? <Check size={14} /> : undefined}
            onClick={() => value !== status && void change(value)}
          >
            {STATUS_META[value].label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
