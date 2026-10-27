import { Skeleton } from '@mantine/core';
import classes from './StatStrip.module.css';

export interface StatCell {
  label: string;
  value: string;
  hint?: string;
  tone?: 'money' | 'warn';
}

interface Props {
  cells: StatCell[] | null;
  placeholders?: number;
}

export function StatStrip({ cells, placeholders = 4 }: Props) {
  return (
    <div className={classes.strip} data-count={cells?.length ?? placeholders}>
      {cells
        ? cells.map((cell) => (
            <div key={cell.label} className={classes.cell}>
              <span className={classes.label}>{cell.label}</span>
              <span className={classes.value} data-tone={cell.tone}>
                {cell.value}
              </span>
              {cell.hint && <span className={classes.hint}>{cell.hint}</span>}
            </div>
          ))
        : Array.from({ length: placeholders }).map((_, index) => (
            <div key={index} className={classes.cell}>
              <Skeleton height={12} width={80} radius="sm" />
              <Skeleton height={22} width={120} radius="sm" mt={6} />
            </div>
          ))}
    </div>
  );
}
