import type { ReactNode } from 'react';
import { Text, Title } from '@mantine/core';
import classes from './PageHeader.module.css';

export function PageHeader({
  title,
  description,
  actions,
  leading,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  leading?: ReactNode;
}) {
  return (
    <div className={classes.root} data-leading={leading ? true : undefined}>
      <div className={classes.row}>
        <div className={classes.main}>
          {leading}
          <div className={classes.text}>
            <Title order={1} className={classes.title}>
              {title}
            </Title>
            {description && (
              <Text c="dimmed" size="sm" mt={6} className={classes.description}>
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
