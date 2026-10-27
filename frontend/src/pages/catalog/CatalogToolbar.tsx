import { ActionIcon, Tooltip } from '@mantine/core';
import { RefreshCwIcon } from 'lucide-react';
import { SearchField } from '@/components/ui/SearchField';
import toolbar from '@/components/ui/toolbar.module.css';
import classes from './CatalogToolbar.module.css';

interface Props {
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  count: number;
  noun: string;
  loading: boolean;
  onRefresh: () => void;
}

export function CatalogToolbar({ search, onSearch, placeholder, ariaLabel, count, noun, loading, onRefresh }: Props) {
  return (
    <div className={classes.root}>
      <span className={classes.count}>
        {count} {count === 1 ? noun : `${noun}s`}
      </span>
      <div className={classes.end}>
        <SearchField value={search} onChange={onSearch} placeholder={placeholder} ariaLabel={ariaLabel} className={classes.search} />
        <Tooltip label="Refresh" withArrow>
          <ActionIcon variant="subtle" className={toolbar.iconButton} size={34} radius="xl" onClick={onRefresh} aria-label="Refresh">
            <RefreshCwIcon size={16} className={loading ? toolbar.spinning : undefined} />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
}
