import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { ArrowLeft, FileText, PencilLine, ReceiptText, UserRoundX } from 'lucide-react';
import { SectionPage } from '@/components/layout/SectionPage';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatStrip } from '@/components/ui/StatStrip';
import { HostNotificationsBell } from '@/components/ui/HostNotificationsBell';
import { DocsButton } from '@/components/ui/DocsButton';
import { getCustomer } from '@/api/catalog';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useHostPhone } from '@/hooks/useHostPhone';
import { IS_EMBEDDED } from '@/lib/bootParams';
import { DOCS } from '@/lib/docs';
import { DOCUMENT_PATH } from '@/lib/documentMapping';
import { formatMoney } from '@/lib/format';
import type { DocumentKind } from '@/types/document';
import { CustomerFormModal } from './customers/CustomerFormModal';
import { CustomerProfile } from './customers/CustomerProfile';
import { CustomerDocuments } from './customers/CustomerDocuments';
import classes from './customers/CustomerDetail.module.css';

export function CustomerDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hostPhone = useHostPhone();
  const { profile } = useBusinessProfile();
  const { data, loading, failed, reload } = useAsyncData(() => getCustomer(id), id);
  const [editing, setEditing] = useState(false);
  const currency = profile?.currency || 'INR';

  const back = (
    <Tooltip label="All customers" withArrow>
      <ActionIcon variant="default" size="lg" radius="md" aria-label="Back" onClick={() => navigate('/customers')}>
        <ArrowLeft size={17} />
      </ActionIcon>
    </Tooltip>
  );

  if (failed && !data) {
    return (
      <SectionPage>
        <EmptyState
          icon={UserRoundX}
          title="This customer could not be found"
          description="They may have been deleted."
          action={{ label: 'All customers', icon: ArrowLeft, onClick: () => navigate('/customers') }}
        />
      </SectionPage>
    );
  }

  const customer = data?.customer;
  const start = (kind: DocumentKind) => navigate(`${DOCUMENT_PATH[kind]}/new?customer=${id}`);
  const stats = data?.stats;

  return (
    <SectionPage>
      <PageHeader
        leading={back}
        title={customer?.name ?? 'Customer'}
        description={[customer?.contactName, customer?.email, customer?.phone].filter(Boolean).join(' · ') || undefined}
        actions={
          <>
            <Button variant="default" leftSection={<PencilLine size={15} />} disabled={!customer} onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="default" leftSection={<FileText size={15} />} onClick={() => start('quotation')}>
              New quotation
            </Button>
            <Button leftSection={<ReceiptText size={15} />} onClick={() => start('invoice')}>
              New invoice
            </Button>
            {!hostPhone && <DocsButton path={DOCS.invoicing} />}
            {IS_EMBEDDED && <HostNotificationsBell />}
          </>
        }
      />

      <StatStrip
        cells={
          stats
            ? [
                { label: 'Outstanding', value: formatMoney(stats.outstanding, currency), hint: 'Sent and not yet paid' },
                {
                  label: 'Overdue',
                  value: formatMoney(stats.overdue, currency),
                  hint: 'Past the due date',
                  tone: stats.overdue > 0 ? 'warn' : undefined,
                },
                { label: 'Invoiced', value: formatMoney(stats.invoiced, currency), hint: `${stats.invoices} invoices` },
                { label: 'Paid', value: formatMoney(stats.paid, currency), tone: 'money' },
              ]
            : null
        }
      />

      <div className={classes.layout}>
        <CustomerProfile customer={customer ?? null} />
        <CustomerDocuments detail={loading && !data ? null : data} onChanged={reload} />
      </div>

      {customer && (
        <CustomerFormModal
          key={editing ? 'open' : 'closed'}
          opened={editing}
          customer={customer}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            reload();
          }}
        />
      )}
    </SectionPage>
  );
}
