import type { ReactNode } from 'react';
import { Text, Title } from '@mantine/core';
import classes from './PageHeader.module.css';

export function PageHeader({
  title,
  description,
  actions,
  leading,
  compact = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  leading?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={classes.root} data-leading={leading ? true : undefined} data-compact={compact || undefined}>
      <div className={classes.row}>
        <div className={classes.main}>
          {leading}
          <div className={classes.text}>
            <Title order={1} size={compact ? 'h2' : undefined} className={classes.title}>
              {title}
            </Title>
            {description && (
              <Text c="dimmed" size={compact ? 'xs' : 'sm'} mt={compact ? 2 : 6} className={classes.description}>
                {description}
              </Text>
            )}
          </div>
        </div>
        {actions && <div className={classes.actions}>{actions}</div>}
      </div>
    </div>
  );
}
