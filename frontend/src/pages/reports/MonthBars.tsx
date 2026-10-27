import { useCallback } from 'react';
import { Tooltip } from '@mantine/core';
import dayjs from 'dayjs';
import { monthsBetween } from '@/lib/reportPeriods';
import type { OverviewReport, ReportRange } from '@/types/report';
import classes from './MonthBars.module.css';

type Series = 'invoiced' | 'collected';

interface Props {
  monthly: OverviewReport['monthly'];
  range: ReportRange;
  money: (value: number) => string;
}

function Bar({ series, share }: { series: Series; share: number }) {
  const percent = `${share > 0 ? Math.max(2, Math.round(share * 100)) : 0}%`;
  const attach = useCallback((node: HTMLSpanElement | null) => node?.style.setProperty('--bar-height', percent), [percent]);
  return <span ref={attach} className={classes.bar} data-series={series} />;
}

export function MonthBars({ monthly, range, money }: Props) {
  const byMonth = new Map(monthly.map((row) => [row.month, row]));
  const months = monthsBetween(range).map((month) => byMonth.get(month) ?? { month, invoiced: 0, collected: 0 });
  const peak = Math.max(1, ...months.flatMap((row) => [row.invoiced, row.collected]));

  return (
    <div className={classes.root}>
      <div className={classes.legend}>
        <span className={classes.key} data-series="invoiced">
          Invoiced
        </span>
        <span className={classes.key} data-series="collected">
          Collected
        </span>
      </div>
      <div className={classes.chart} data-dense={months.length > 12 || undefined}>
        {months.map((row) => (
          <Tooltip
            key={row.month}
            withArrow
            label={`${dayjs(`${row.month}-01`).format('MMM YYYY')} · Invoiced ${money(row.invoiced)} · Collected ${money(row.collected)}`}
          >
            <div className={classes.month}>
              <div className={classes.bars}>
                <Bar series="invoiced" share={row.invoiced / peak} />
                <Bar series="collected" share={row.collected / peak} />
              </div>
              <span className={classes.label}>{dayjs(`${row.month}-01`).format('MMM')}</span>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
