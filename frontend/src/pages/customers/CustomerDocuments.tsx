import { useState } from 'react';
import { Button } from '@mantine/core';
import { Download, FileText, ReceiptText } from 'lucide-react';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocumentActions } from '@/hooks/useDocumentActions';
import { invoiceSummary, quotationSummary } from '@/lib/documentMapping';
import { exportCsv } from '@/lib/csv';
import { formatDate } from '@/lib/format';
import { STATUS_META } from '@/lib/documentMeta';
import type { CustomerDetail } from '@/types/catalog';
import type { DocumentKind } from '@/types/document';
import { DocumentList } from '../documents/DocumentList';
import { DeleteDocumentModal } from '../documents/DeleteDocumentModal';
import classes from './CustomerDetail.module.css';

const TABS: { value: DocumentKind; label: string }[] = [
  { value: 'invoice', label: 'Invoices' },
  { value: 'quotation', label: 'Quotations' },
];

function exportStatement(detail: CustomerDetail) {
  const name = detail.customer.name.replace(/[^\w-]+/g, '_');
  exportCsv(`Statement_${name}`, detail.invoices, [
    { label: 'Invoice', value: (row) => row.invoice.invoiceNumber },
    { label: 'Date', value: (row) => formatDate(row.invoice.invoiceDate) },
    { label: 'Due', value: (row) => formatDate(row.invoice.dueDate) },
    { label: 'Status', value: (row) => STATUS_META[row.status].label },
    { label: 'Currency', value: (row) => row.invoice.currency },
    { label: 'Total', value: (row) => row.invoice.total ?? 0 },
    { label: 'Balance due', value: (row) => (row.status === 'paid' || row.status === 'cancelled' ? 0 : row.invoice.balanceDue ?? 0) },
  ]);
}

export function CustomerDocuments({ detail, onChanged }: { detail: CustomerDetail | null; onChanged: () => void }) {
  const [kind, setKind] = useState<DocumentKind>('invoice');
  const actions = useDocumentActions(onChanged);
  const items = detail
    ? kind === 'invoice'
      ? detail.invoices.map(invoiceSummary)
      : detail.quotations.map(quotationSummary)
    : [];

  return (
    <section className={classes.documents} aria-label="Documents">
      <div className={classes.documentsHead}>
        <SegmentedTabs ariaLabel="Documents" value={kind} onChange={setKind} data={TABS} size="sm" />
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          leftSection={<Download size={14} />}
          disabled={!detail?.invoices.length}
          onClick={() => detail && exportStatement(detail)}
        >
          Statement
        </Button>
      </div>
      {detail && items.length === 0 ? (
        <EmptyState
          compact
          icon={kind === 'invoice' ? ReceiptText : FileText}
          title={kind === 'invoice' ? 'No invoices yet' : 'No quotations yet'}
          description="Documents for this customer show up here."
        />
      ) : (
        <DocumentList
          items={items}
          loading={!detail}
          total={items.length}
          page={1}
          busyId={actions.busyId}
          onPage={() => undefined}
          actions={actions.actions}
        />
      )}
      <DeleteDocumentModal
        doc={actions.pendingDelete}
        deleting={actions.deleting}
        onCancel={actions.cancelDelete}
        onConfirm={actions.confirmDelete}
      />
    </section>
  );
}
