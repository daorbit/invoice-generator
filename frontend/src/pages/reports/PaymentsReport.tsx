import { Link } from 'react-router-dom';
import { getPayments } from '@/api/reports';
import { StatStrip } from '@/components/ui/StatStrip';
import { useAsyncData } from '@/hooks/useAsyncData';
import { exportCsv } from '@/lib/csv';
import { formatDate, formatMoney } from '@/lib/format';
import { fileStamp } from '@/lib/reportPeriods';
import type { PaymentRow, ReportRange } from '@/types/report';
import { ReportCard } from './ReportCard';
import { ReportTable, type ReportColumn } from './ReportTable';
import classes from './Reports.module.css';

interface Props {
  scope: { currency: string };
  range: ReportRange;
}

function days(value: number | null): string {
  if (value === null) return '–';
  return value === 1 ? '1 day' : `${value} days`;
}

export function PaymentsReport({ scope, range }: Props) {
  const { data } = useAsyncData(() => getPayments(scope, range), JSON.stringify([scope, range]));
  const money = (value: number) => formatMoney(value, scope.currency);

  const columns: ReportColumn<PaymentRow>[] = [
    { key: 'paidAt', label: 'Paid on', render: (row) => formatDate(row.paidAt), total: 'Total' },
    { key: 'number', label: 'Invoice', render: (row) => <Link to={`/invoices/${row.id}`}>{row.number}</Link> },
    {
      key: 'client',
      label: 'Customer',
      render: (row) => (row.customerId ? <Link to={`/customers/${row.customerId}`}>{row.client}</Link> : row.client),
    },
    { key: 'days', label: 'Took', numeric: true, render: (row) => days(row.daysToPay) },
    {
      key: 'amount',
      label: 'Amount',
      numeric: true,
      render: (row) => <span className={classes.money}>{money(row.amount)}</span>,
      total: data ? <span className={classes.money}>{money(data.total)}</span> : '',
    },
  ];

  const exportRows = () =>
    data &&
    exportCsv(`Payments_${fileStamp(range)}`, data.payments, [
      { label: 'Paid on', value: (row) => formatDate(row.paidAt) },
      { label: 'Invoice', value: (row) => row.number },
      { label: 'Customer', value: (row) => row.client },
      { label: 'Invoice date', value: (row) => formatDate(row.invoiceDate) },
      { label: 'Days to pay', value: (row) => row.daysToPay },
      { label: 'Amount', value: (row) => row.amount },
    ]);

  return (
    <div className={classes.stack}>
      <StatStrip
        cells={
          data
            ? [
                { label: 'Collected', value: money(data.total), tone: 'money' },
                { label: 'Payments', value: String(data.payments.length) },
                { label: 'Average time to pay', value: days(data.averageDaysToPay), hint: 'From invoice date to paid' },
              ]
            : null
        }
        placeholders={3}
      />
      <ReportCard
        title="Payments received"
        description="Invoices marked as paid in this period."
        onExport={data?.payments.length ? exportRows : undefined}
      >
        <ReportTable
          columns={columns}
          rows={data?.payments ?? null}
          rowKey={(row) => row.id}
          empty="No payments in this period."
          showTotals
          footnote={data?.truncated ? 'Showing the latest 500 payments.' : undefined}
        />
      </ReportCard>
    </div>
  );
}
