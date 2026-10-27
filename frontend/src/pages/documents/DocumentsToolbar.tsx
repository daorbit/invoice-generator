import { ActionIcon, Button, Menu, Tooltip } from '@mantine/core';
import { CheckIcon, ChevronDownIcon, RefreshCwIcon } from 'lucide-react';
import { SearchField } from '@/components/ui/SearchField';
import { StatusDot } from '@/components/ui/StatusPill';
import toolbar from '@/components/ui/toolbar.module.css';
import { KIND_META, STATUSES, STATUS_META } from '@/lib/documentMeta';
import type { StatusFilter } from '@/hooks/useDocumentList';
import type { DocumentKind } from '@/types/document';
import classes from './DocumentsToolbar.module.css';

interface Props {
  kind: DocumentKind;
  status: StatusFilter;
  search: string;
  loading: boolean;
  onStatus: (status: StatusFilter) => void;
  onSearch: (search: string) => void;
  onRefresh: () => void;
}

export function DocumentsToolbar({ kind, status, search, loading, onStatus, onSearch, onRefresh }: Props) {
  const statusLabel = status === 'all' ? 'All statuses' : STATUS_META[status].label;

  return (
    <div className={classes.root}>
      <SearchField
        value={search}
        onChange={onSearch}
        placeholder="Search by number or customer"
        ariaLabel={`Search ${KIND_META[kind].plural.toLowerCase()}`}
        className={classes.search}
      />

      <div className={classes.end}>
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
                leftSection={<StatusDot tone={STATUS_META[value].tone} />}
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
