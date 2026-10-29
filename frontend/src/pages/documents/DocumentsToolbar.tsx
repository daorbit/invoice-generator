import { useState } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { RefreshCwIcon, SearchIcon, XIcon } from 'lucide-react';
import { SearchField } from '@/components/ui/SearchField';
import { SegmentedTabs, type SegmentedTabItem } from '@/components/ui/SegmentedTabs';
import toolbar from '@/components/ui/toolbar.module.css';
import { KIND_META, STATUSES, STATUS_META } from '@/lib/documentMeta';
import type { StatusFilter } from '@/hooks/useDocumentList';
import type { DocumentKind, DocumentStatus } from '@/types/document';
import type { StatusCounts } from './statusCounts';
import classes from './DocumentsToolbar.module.css';

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
  const compact = useMediaQuery('(max-width: 48em)') ?? false;
  const [searchOpen, setSearchOpen] = useState(false);
  const expanded = !compact || searchOpen || search !== '';
  const showFilters = !compact || !expanded;
  const searchLabel = `Search ${KIND_META[kind].plural.toLowerCase()}`;

  const closeSearch = () => {
    onSearch('');
    setSearchOpen(false);
  };

  return (
    <div className={classes.root}>
      {showFilters && (
        <div className={classes.filters}>
          <SegmentedTabs
            ariaLabel="Filter by status"
            value={status}
            onChange={onStatus}
            data={statusTabs(kind, status, counts)}
            size="sm"
          />
        </div>
      )}

      <div className={classes.end} data-open={compact && expanded ? '' : undefined}>
        {expanded ? (
          <SearchField
            value={search}
            onChange={onSearch}
            placeholder="Search number or customer"
            ariaLabel={searchLabel}
            className={classes.search}
            autoFocus={compact}
          />
        ) : (
          <ActionIcon variant="subtle" className={toolbar.iconButton} size={34} radius="xl" onClick={() => setSearchOpen(true)} aria-label={searchLabel}>
            <SearchIcon size={16} />
          </ActionIcon>
        )}
        {compact && expanded ? (
          <ActionIcon variant="subtle" className={toolbar.iconButton} size={34} radius="xl" onClick={closeSearch} aria-label="Close search">
            <XIcon size={16} />
          </ActionIcon>
        ) : (
          <Tooltip label="Refresh" withArrow>
            <ActionIcon variant="subtle" className={toolbar.iconButton} size={34} radius="xl" onClick={onRefresh} aria-label="Refresh">
              <RefreshCwIcon size={16} className={loading ? toolbar.spinning : undefined} />
            </ActionIcon>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
