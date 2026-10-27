import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSales } from '@/api/reports';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { useAsyncData } from '@/hooks/useAsyncData';
import { exportCsv } from '@/lib/csv';
import { formatMoney } from '@/lib/format';
import { fileStamp } from '@/lib/reportPeriods';
import type { ReportRange, SalesByCustomerRow, SalesByItemRow, SalesGrouping } from '@/types/report';
import { ReportCard } from './ReportCard';
import { ReportTable, type ReportColumn } from './ReportTable';
import classes from './Reports.module.css';

interface Props {
  scope: { currency: string };
  range: ReportRange;
}

const GROUPINGS: { value: SalesGrouping; label: string }[] = [
  { value: 'customer', label: 'By customer' },
  { value: 'item', label: 'By item' },
];

function sum<T>(rows: T[] | undefined, pick: (row: T) => number): number {
  return (rows ?? []).reduce((total, row) => total + pick(row), 0);
}

export function SalesReport({ scope, range }: Props) {
  const [by, setBy] = useState<SalesGrouping>('customer');
  const { data } = useAsyncData(() => getSales(scope, range, by), JSON.stringify([scope, range, by]));
  const money = (value: number) => formatMoney(value, scope.currency);
  const ready = data?.by === by ? data : null;

  const customerColumns: ReportColumn<SalesByCustomerRow>[] = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (row.customerId ? <Link to={`/customers/${row.customerId}`}>{row.name}</Link> : row.name),
      total: 'Total',
    },
    { key: 'invoices', label: 'Invoices', numeric: true, render: (row) => row.invoices, total: sum(ready?.customers, (r) => r.invoices) },
    { key: 'taxable', label: 'Before tax', numeric: true, render: (row) => money(row.taxable), total: money(sum(ready?.customers, (r) => r.taxable)) },
    { key: 'amount', label: 'Invoiced', numeric: true, render: (row) => <b>{money(row.amount)}</b>, total: money(sum(ready?.customers, (r) => r.amount)) },
    { key: 'paid', label: 'Paid', numeric: true, render: (row) => <span className={classes.money}>{money(row.paid)}</span>, total: money(sum(ready?.customers, (r) => r.paid)) },
    { key: 'outstanding', label: 'Outstanding', numeric: true, render: (row) => money(row.outstanding), total: money(sum(ready?.customers, (r) => r.outstanding)) },
  ];

  const itemColumns: ReportColumn<SalesByItemRow>[] = [
    {
      key: 'name',
      label: 'Item',
      render: (row) => (
        <>
          {row.name}
          {row.hsn && <span className={classes.sub}>HSN/SAC {row.hsn}</span>}
        </>
      ),
      total: 'Total',
    },
    { key: 'quantity', label: 'Quantity', numeric: true, render: (row) => `${row.quantity}${row.unit ? ` ${row.unit}` : ''}` },
    { key: 'lines', label: 'Times billed', numeric: true, render: (row) => row.lines, total: sum(ready?.items, (r) => r.lines) },
    { key: 'amount', label: 'Amount', numeric: true, render: (row) => <b>{money(row.amount)}</b>, total: money(sum(ready?.items, (r) => r.amount)) },
  ];

  const exportRows = () => {
    if (!ready) return;
    const stamp = fileStamp(range);
    if (ready.by === 'item') {
      exportCsv(`Sales_by_item_${stamp}`, ready.items ?? [], [
        { label: 'Item', value: (row) => row.name },
        { label: 'HSN/SAC', value: (row) => row.hsn },
        { label: 'Quantity', value: (row) => row.quantity },
        { label: 'Unit', value: (row) => row.unit },
        { label: 'Times billed', value: (row) => row.lines },
        { label: 'Amount', value: (row) => row.amount },
      ]);
      return;
    }
    exportCsv(`Sales_by_customer_${stamp}`, ready.customers ?? [], [
      { label: 'Customer', value: (row) => row.name },
      { label: 'Invoices', value: (row) => row.invoices },
      { label: 'Before tax', value: (row) => row.taxable },
      { label: 'Invoiced', value: (row) => row.amount },
      { label: 'Paid', value: (row) => row.paid },
      { label: 'Outstanding', value: (row) => row.outstanding },
    ]);
  };

  const rows = by === 'item' ? ready?.items : ready?.customers;

  return (
    <ReportCard
      title="Sales"
      description="Sent, paid and overdue invoices dated in this period. Drafts and cancelled invoices are left out."
      onExport={rows?.length ? exportRows : undefined}
      actions={<SegmentedTabs ariaLabel="Group sales" value={by} onChange={setBy} data={GROUPINGS} size="sm" />}
    >
      {by === 'item' ? (
        <ReportTable
          columns={itemColumns}
          rows={ready ? ready.items ?? [] : null}
          rowKey={(row) => row.key}
          empty="No invoiced items in this period."
          showTotals
          footnote={ready?.truncated ? 'Showing the top 200 items.' : undefined}
        />
      ) : (
        <ReportTable
          columns={customerColumns}
          rows={ready ? ready.customers ?? [] : null}
          rowKey={(row) => row.key}
          empty="No invoices in this period."
          showTotals
          footnote={ready?.truncated ? 'Showing the top 200 customers.' : undefined}
        />
      )}
    </ReportCard>
  );
}
