import { Link } from 'react-router-dom';
import { getGst } from '@/api/reports';
import { StatStrip } from '@/components/ui/StatStrip';
import { useAsyncData } from '@/hooks/useAsyncData';
import { exportCsv } from '@/lib/csv';
import { formatDate, formatMoney } from '@/lib/format';
import { rateLabel, stateLabel } from '@/lib/gst';
import { fileStamp } from '@/lib/reportPeriods';
import type { GstInvoiceRow, GstSplit, ReportRange } from '@/types/report';
import { ReportCard } from './ReportCard';
import { ReportTable, type ReportColumn } from './ReportTable';
import classes from './Reports.module.css';

interface Props {
  scope: { currency: string };
  range: ReportRange;
}

type RateRow = GstSplit & { rate: number };
type SupplyRow = GstSplit & { key: string; label: string; count: number };

function splitColumns<T extends GstSplit>(money: (value: number) => string, totals?: GstSplit): ReportColumn<T>[] {
  return [
    { key: 'taxable', label: 'Taxable value', numeric: true, render: (row) => money(row.taxable), total: totals && money(totals.taxable) },
    { key: 'igst', label: 'IGST', numeric: true, render: (row) => money(row.igst), total: totals && money(totals.igst) },
    { key: 'cgst', label: 'CGST', numeric: true, render: (row) => money(row.cgst), total: totals && money(totals.cgst) },
    { key: 'sgst', label: 'SGST', numeric: true, render: (row) => money(row.sgst), total: totals && money(totals.sgst) },
    { key: 'tax', label: 'Total tax', numeric: true, render: (row) => <b>{money(row.tax)}</b>, total: totals && money(totals.tax) },
  ];
}

export function GstReport({ scope, range }: Props) {
  const { data } = useAsyncData(() => getGst(scope, range), JSON.stringify([scope, range]));
  const money = (value: number) => formatMoney(value, scope.currency);
  const summary = data?.summary;

  const rateColumns: ReportColumn<RateRow>[] = [
    { key: 'rate', label: 'GST rate', render: (row) => (row.rate === 0 ? 'Nil / exempt' : rateLabel(row.rate)), total: 'Total' },
    ...splitColumns<RateRow>(money, summary),
  ];

  const supplyRows: SupplyRow[] | null = data
    ? [
        { key: 'b2b', label: 'B2B · registered customers', ...data.b2b },
        { key: 'b2c', label: 'B2C · unregistered customers', ...data.b2c },
      ]
    : null;

  const supplyColumns: ReportColumn<SupplyRow>[] = [
    {
      key: 'label',
      label: 'Supplies',
      render: (row) => (
        <>
          {row.label}
          <span className={classes.sub}>{row.count === 1 ? '1 invoice' : `${row.count} invoices`}</span>
        </>
      ),
    },
    ...splitColumns<SupplyRow>(money),
  ];

  const invoiceColumns: ReportColumn<GstInvoiceRow>[] = [
    {
      key: 'number',
      label: 'Invoice',
      render: (row) => (
        <>
          <Link to={`/invoices/${row.id}`}>{row.number}</Link>
          <span className={classes.sub}>{formatDate(row.date)}</span>
        </>
      ),
    },
    {
      key: 'client',
      label: 'Customer',
      render: (row) => (
        <>
          {row.client}
          <span className={classes.sub}>{row.gstin || 'Unregistered'}</span>
        </>
      ),
    },
    { key: 'pos', label: 'Place of supply', render: (row) => stateLabel(row.placeOfSupply) || '–' },
    ...splitColumns<GstInvoiceRow>(money),
    { key: 'total', label: 'Invoice value', numeric: true, render: (row) => money(row.total) },
  ];

  const exportGstr1 = () =>
    data &&
    exportCsv(`GST_invoices_${fileStamp(range)}`, data.invoices, [
      { label: 'GSTIN of recipient', value: (row) => row.gstin },
      { label: 'Receiver name', value: (row) => row.client },
      { label: 'Invoice number', value: (row) => row.number },
      { label: 'Invoice date', value: (row) => formatDate(row.date) },
      { label: 'Invoice value', value: (row) => row.total },
      { label: 'Place of supply', value: (row) => stateLabel(row.placeOfSupply) },
      { label: 'Reverse charge', value: (row) => (row.reverseCharge ? 'Y' : 'N') },
      { label: 'Supply type', value: (row) => (row.exportUnderLut ? 'Export under LUT' : row.gstin ? 'B2B' : 'B2C') },
      { label: 'Taxable value', value: (row) => row.taxable },
      { label: 'IGST', value: (row) => row.igst },
      { label: 'CGST', value: (row) => row.cgst },
      { label: 'SGST', value: (row) => row.sgst },
    ]);

  const exportRates = () =>
    data &&
    exportCsv(`GST_by_rate_${fileStamp(range)}`, data.byRate, [
      { label: 'Rate', value: (row) => row.rate },
      { label: 'Taxable value', value: (row) => row.taxable },
      { label: 'IGST', value: (row) => row.igst },
      { label: 'CGST', value: (row) => row.cgst },
      { label: 'SGST', value: (row) => row.sgst },
      { label: 'Total tax', value: (row) => row.tax },
    ]);

  return (
    <div className={classes.stack}>
      <StatStrip
        cells={
          summary
            ? [
                { label: 'Taxable value', value: money(summary.taxable), hint: `${summary.invoices} invoices` },
                { label: 'IGST', value: money(summary.igst) },
                { label: 'CGST', value: money(summary.cgst) },
                { label: 'SGST', value: money(summary.sgst) },
              ]
            : null
        }
      />
      <div className={classes.grid}>
        <ReportCard title="By GST rate" onExport={data?.byRate.length ? exportRates : undefined}>
          <ReportTable columns={rateColumns} rows={data?.byRate ?? null} rowKey={(row) => String(row.rate)} empty="No taxable sales in this period." showTotals />
        </ReportCard>
        <ReportCard title="B2B and B2C">
          <ReportTable columns={supplyColumns} rows={supplyRows} rowKey={(row) => row.key} empty="No sales in this period." />
        </ReportCard>
      </div>
      <ReportCard
        title="Invoices"
        description="Every issued invoice in the period, laid out like GSTR-1. Check with your accountant before you file."
        onExport={data?.invoices.length ? exportGstr1 : undefined}
        exportLabel="Export for GSTR-1"
      >
        <ReportTable
          columns={invoiceColumns}
          rows={data?.invoices ?? null}
          rowKey={(row) => row.id}
          empty="No invoices in this period."
          footnote={data?.truncated ? 'Showing the first 2,000 invoices. Pick a shorter period to see the rest.' : undefined}
        />
      </ReportCard>
    </div>
  );
}
