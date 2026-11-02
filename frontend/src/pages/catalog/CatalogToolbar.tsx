import { RefreshButton } from '@/components/ui/RefreshButton';
import { SearchField } from '@/components/ui/SearchField';
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
        <RefreshButton refreshing={loading} onRefresh={onRefresh} />
      </div>
    </div>
  );
}
