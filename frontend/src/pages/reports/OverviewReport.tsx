import { getOverview } from '@/api/reports';
import { StatStrip } from '@/components/ui/StatStrip';
import { useAsyncData } from '@/hooks/useAsyncData';
import { formatMoney } from '@/lib/format';
import type { ReportRange } from '@/types/report';
import { MonthBars } from './MonthBars';
import { ReportCard } from './ReportCard';
import classes from './Reports.module.css';

interface Props {
  scope: { currency: string };
  range: ReportRange;
}

function count(value: number, noun: string): string {
  return `${value} ${value === 1 ? noun : `${noun}s`}`;
}

export function OverviewReport({ scope, range }: Props) {
  const { data } = useAsyncData(() => getOverview(scope, range), JSON.stringify([scope, range]));
  const money = (value: number) => formatMoney(value, scope.currency);

  return (
    <div className={classes.stack}>
      <StatStrip
        cells={
          data
            ? [
                { label: 'Invoiced', value: money(data.invoiced.amount), hint: count(data.invoiced.count, 'invoice') },
                { label: 'Collected', value: money(data.collected.amount), hint: count(data.collected.count, 'payment'), tone: 'money' },
                { label: 'Outstanding', value: money(data.outstanding.amount), hint: `${count(data.outstanding.count, 'invoice')}, as of today` },
                {
                  label: 'Overdue',
                  value: money(data.overdue.amount),
                  hint: count(data.overdue.count, 'invoice'),
                  tone: data.overdue.amount > 0 ? 'warn' : undefined,
                },
              ]
            : null
        }
      />
      <div className={classes.grid}>
        <ReportCard title="Invoiced and collected" description="By month, for the period you picked.">
          {data ? <MonthBars monthly={data.monthly} range={range} money={money} /> : <p className={classes.empty}>Loading…</p>}
        </ReportCard>
        <ReportCard title="Quotations" description="Sent in this period and what came of them.">
          <div className={classes.figures}>
            <div className={classes.figure}>
              <span className={classes.figureLabel}>Quoted</span>
              <span className={classes.figureValue}>{data ? money(data.quotations.amount) : '–'}</span>
              <span className={classes.sub}>{data ? count(data.quotations.count, 'quotation') : ''}</span>
            </div>
            <div className={classes.figure}>
              <span className={classes.figureLabel}>Accepted</span>
              <span className={`${classes.figureValue} ${classes.money}`}>{data ? money(data.quotations.acceptedAmount) : '–'}</span>
              <span className={classes.sub}>{data ? count(data.quotations.accepted, 'quotation') : ''}</span>
            </div>
            <div className={classes.figure}>
              <span className={classes.figureLabel}>Win rate</span>
              <span className={classes.figureValue}>{data ? `${data.quotations.conversion}%` : '–'}</span>
              <span className={classes.sub}>Accepted out of sent</span>
            </div>
          </div>
        </ReportCard>
      </div>
    </div>
  );
}
