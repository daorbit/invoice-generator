import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { UnstyledButton } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import classes from './ListRow.module.css';

interface Props {
  icon: LucideIcon;
  title: ReactNode;
  to?: string;
  onOpen?: () => void;
  meta?: ReactNode[];
  amount?: ReactNode;
  amountHint?: ReactNode;
  actions?: ReactNode;
}

export function ListRow({ icon: Icon, title, to, onOpen, meta = [], amount, amountHint, actions }: Props) {
  const visibleMeta = meta.filter(Boolean);

  return (
    <div className={classes.row}>
      <div className={classes.main}>
        <div className={classes.icon} aria-hidden>
          <Icon size={18} />
        </div>
        <div className={classes.text}>
          {to ? (
            <Link to={to} className={classes.title}>
              {title}
            </Link>
          ) : (
            <UnstyledButton className={classes.title} onClick={onOpen}>
              {title}
            </UnstyledButton>
          )}
          {visibleMeta.length > 0 && (
            <div className={classes.meta}>
              {visibleMeta.map((item, index) => (
                <span key={index} className={classes.metaItem}>
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {amount !== undefined && (
        <div className={classes.figure}>
          <span className={classes.amount}>{amount}</span>
          {amountHint && <span className={classes.amountHint}>{amountHint}</span>}
        </div>
      )}
      {actions && <div className={classes.actions}>{actions}</div>}
    </div>
  );
}

export { classes as listRowClasses };
