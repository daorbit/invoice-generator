import { ActionIcon, Button, Menu, Tooltip } from '@mantine/core';
import { CheckIcon, ChevronDownIcon, RefreshCwIcon } from 'lucide-react';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { SearchField } from '@/components/ui/SearchField';
import toolbar from '@/components/ui/toolbar.module.css';
import { KIND_META, STATUSES, STATUS_META } from '@/lib/documentMeta';
import type { StatusFilter } from '@/hooks/useDocumentList';
import type { DocumentKind } from '@/types/document';
import classes from './DocumentsToolbar.module.css';

const KIND_TABS: { value: DocumentKind; label: string }[] = [
  { value: 'invoice', label: 'Invoices' },
  { value: 'quotation', label: 'Quotations' },
];

interface Props {
  kind: DocumentKind;
  status: StatusFilter;
  search: string;
  loading: boolean;
  onKind: (kind: DocumentKind) => void;
  onStatus: (status: StatusFilter) => void;
  onSearch: (search: string) => void;
  onRefresh: () => void;
}

export function DocumentsToolbar({ kind, status, search, loading, onKind, onStatus, onSearch, onRefresh }: Props) {
  const statusLabel = status === 'all' ? 'All statuses' : STATUS_META[status].label;

  return (
    <div className={classes.root}>
      <SegmentedTabs ariaLabel="Documents" value={kind} onChange={onKind} data={KIND_TABS} />

      <div className={classes.end}>
        <SearchField
          value={search}
          onChange={onSearch}
          placeholder="Number or client"
          ariaLabel={`Search ${KIND_META[kind].plural.toLowerCase()}`}
          className={classes.search}
        />

        <Menu position="bottom-end" width={190}>
          <Menu.Target>
            <Button variant="subtle" className={toolbar.pillButton} rightSection={<ChevronDownIcon size={14} />}>
              {statusLabel}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Status</Menu.Label>
            <Menu.Item onClick={() => onStatus('all')} rightSection={status === 'all' ? <CheckIcon size={14} /> : undefined}>
              All statuses
            </Menu.Item>
            {STATUSES[kind].map((value) => (
              <Menu.Item
                key={value}
                onClick={() => onStatus(value)}
                rightSection={status === value ? <CheckIcon size={14} /> : undefined}
              >
                {STATUS_META[value].label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        <Tooltip label="Refresh" withArrow>
          <ActionIcon variant="subtle" className={toolbar.iconButton} size={34} radius="xl" onClick={onRefresh} aria-label="Refresh">
            <RefreshCwIcon size={16} className={loading ? toolbar.spinning : undefined} />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
}
