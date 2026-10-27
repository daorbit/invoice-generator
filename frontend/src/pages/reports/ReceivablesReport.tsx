import { Link } from 'react-router-dom';
import { getReceivables } from '@/api/reports';
import { useAsyncData } from '@/hooks/useAsyncData';
import { exportCsv } from '@/lib/csv';
import { formatMoney } from '@/lib/format';
import type { AgingBuckets, ReceivablesReport as Report } from '@/types/report';
import { ReportCard } from './ReportCard';
import { ReportTable, type ReportColumn } from './ReportTable';
import classes from './Reports.module.css';

type Row = Report['customers'][number];

const BUCKETS: { key: keyof AgingBuckets; label: string }[] = [
  { key: 'current', label: 'Not due yet' },
  { key: 'days1to15', label: '1–15 days' },
  { key: 'days16to30', label: '16–30 days' },
  { key: 'days31to45', label: '31–45 days' },
  { key: 'over45', label: 'Over 45 days' },
];

export function ReceivablesReport({ scope }: { scope: { currency: string } }) {
  const { data } = useAsyncData(() => getReceivables(scope), scope.currency);
  const money = (value: number) => (value ? formatMoney(value, scope.currency) : '–');

  const columns: ReportColumn<Row>[] = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (
        <>
          {row.customerId ? <Link to={`/customers/${row.customerId}`}>{row.name}</Link> : row.name}
          <span className={classes.sub}>{row.invoices === 1 ? '1 invoice' : `${row.invoices} invoices`}</span>
        </>
      ),
      total: 'Total',
    },
    ...BUCKETS.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      numeric: true,
      render: (row: Row) => (
        <span className={bucket.key === 'over45' && row[bucket.key] > 0 ? classes.warn : undefined}>{money(row[bucket.key])}</span>
      ),
      total: data ? money(data.totals[bucket.key]) : '',
    })),
    {
      key: 'total',
      label: 'Balance due',
      numeric: true,
      render: (row) => <b>{money(row.total)}</b>,
      total: data ? money(data.totals.total) : '',
    },
  ];

  const exportRows = () =>
    data &&
    exportCsv(`Receivables_${scope.currency}`, data.customers, [
      { label: 'Customer', value: (row) => row.name },
      { label: 'Invoices', value: (row) => row.invoices },
      ...BUCKETS.map((bucket) => ({ label: bucket.label, value: (row: Row) => row[bucket.key] })),
      { label: 'Balance due', value: (row) => row.total },
    ]);

  return (
    <ReportCard
      title="Who owes you"
      description="Unpaid invoices as of today, grouped by how long they are past due."
      onExport={data?.customers.length ? exportRows : undefined}
    >
      <ReportTable
        columns={columns}
        rows={data?.customers ?? null}
        rowKey={(row) => row.key}
        empty="Nothing is outstanding. Every sent invoice is paid."
        showTotals
        footnote={data?.truncated ? 'Showing the 200 customers who owe the most.' : undefined}
      />
    </ReportCard>
  );
}
