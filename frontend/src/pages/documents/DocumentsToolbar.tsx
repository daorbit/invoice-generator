import { ActionIcon, Tooltip } from '@mantine/core';
import { RefreshCwIcon } from 'lucide-react';
import { SearchField } from '@/components/ui/SearchField';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/SegmentedTabs';
import toolbar from '@/components/ui/toolbar.module.css';
import { KIND_META, STATUSES, STATUS_META } from '@/lib/documentMeta';
import type { StatusFilter } from '@/hooks/useDocumentList';
import type { DocumentKind, DocumentStatus } from '@/types/document';
import classes from './DocumentsToolbar.module.css';

type StatusCounts = Partial<Record<DocumentStatus, number>>;

interface Props {
  kind: DocumentKind;
  status: StatusFilter;
  search: string;
  loading: boolean;
  counts: StatusCounts | null;
  onStatus: (status: StatusFilter) => void;
  onSearch: (search: string) => void;
  onRefresh: () => void;
}

function chip(label: string, count: number | null) {
  return (
    <span className={classes.chip}>
      {label}
      {count !== null && <span className={classes.count}>{count}</span>}
    </span>
  );
}

function statusTabs(kind: DocumentKind, status: StatusFilter, counts: StatusCounts | null): SegmentedTabItem<StatusFilter>[] {
  const countOf = (value: DocumentStatus) => (counts ? (counts[value] ?? 0) : null);
  const total = counts ? STATUSES[kind].reduce((sum, value) => sum + (counts[value] ?? 0), 0) : null;
  const visible = STATUSES[kind].filter((value) => !counts || countOf(value) || value === status);

  return [
    { value: 'all', label: chip('All', total) },
    ...visible.map((value) => ({ value, label: chip(STATUS_META[value].label, countOf(value)) })),
  ];
}

export function DocumentsToolbar({ kind, status, search, loading, counts, onStatus, onSearch, onRefresh }: Props) {
  return (
    <div className={classes.root}>
      <div className={classes.filters}>
        <SegmentedTabs
          ariaLabel="Filter by status"
          value={status}
          onChange={onStatus}
          data={statusTabs(kind, status, counts)}
          size="sm"
        />
      </div>

      <div className={classes.end}>
        <SearchField
          value={search}
          onChange={onSearch}
          placeholder="Search number or customer"
          ariaLabel={`Search ${KIND_META[kind].plural.toLowerCase()}`}
          className={classes.search}
        />
        <Tooltip label="Refresh" withArrow>
          <ActionIcon variant="subtle" className={toolbar.iconButton} size={34} radius="xl" onClick={onRefresh} aria-label="Refresh">
            <RefreshCwIcon size={16} className={loading ? toolbar.spinning : undefined} />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
}
