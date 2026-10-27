import type { ReactNode } from 'react';
import { Skeleton } from '@mantine/core';
import classes from './Reports.module.css';

export interface ReportColumn<T> {
  key: string;
  label: string;
  numeric?: boolean;
  render: (row: T) => ReactNode;
  total?: ReactNode;
}

interface Props<T> {
  columns: ReportColumn<T>[];
  rows: T[] | null;
  rowKey: (row: T) => string;
  empty: string;
  showTotals?: boolean;
  footnote?: string;
}

export function ReportTable<T>({ columns, rows, rowKey, empty, showTotals, footnote }: Props<T>) {
  if (rows === null) {
    return (
      <div className={classes.tableSkeleton}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} height={14} radius="sm" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) return <p className={classes.empty}>{empty}</p>;

  return (
    <>
      <div className={classes.tableScroll}>
        <table className={classes.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} data-numeric={column.numeric || undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} data-numeric={column.numeric || undefined}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {showTotals && (
            <tfoot>
              <tr>
                {columns.map((column) => (
                  <td key={column.key} data-numeric={column.numeric || undefined}>
                    {column.total}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {footnote && <p className={classes.footnote}>{footnote}</p>}
    </>
  );
}
