import { useState } from 'react';
import { Loader, Menu, UnstyledButton } from '@mantine/core';
import { Check, ChevronDown } from 'lucide-react';
import { setDocumentStatus } from '@/api/documents';
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
    <Menu position="bottom-end" width={190}>
      <Menu.Target>
        <UnstyledButton className={classes.trigger} data-tone={current.tone} disabled={saving} aria-label="Change status">
          {saving ? <Loader size={12} color="currentColor" /> : <span className={classes.dot} aria-hidden />}
          {current.label}
          <ChevronDown size={14} className={classes.chevron} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Mark as</Menu.Label>
        {STATUSES[kind].map((value) => (
          <Menu.Item
            key={value}
            disabled={value === status}
            rightSection={value === status ? <Check size={14} /> : undefined}
            onClick={() => void change(value)}
          >
            <span className={classes.option}>
              <span className={classes.optionDot} data-tone={STATUS_META[value].tone} aria-hidden />
              {STATUS_META[value].label}
            </span>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
