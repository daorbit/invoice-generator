import type { ReactNode } from 'react';
import { Button } from '@mantine/core';
import { Download } from 'lucide-react';
import classes from './Reports.module.css';

interface Props {
  title: string;
  description?: string;
  onExport?: () => void;
  exportLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function ReportCard({ title, description, onExport, exportLabel = 'Export CSV', actions, children }: Props) {
  return (
    <section className={classes.card}>
      <header className={classes.cardHead}>
        <div>
          <h2 className={classes.cardTitle}>{title}</h2>
          {description && <p className={classes.cardDescription}>{description}</p>}
        </div>
        <div className={classes.cardActions}>
          {actions}
          {onExport && (
            <Button variant="subtle" color="gray" size="compact-sm" leftSection={<Download size={14} />} onClick={onExport}>
              {exportLabel}
            </Button>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}
