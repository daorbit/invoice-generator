import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button } from '@mantine/core';
import { FileText, Plus, ReceiptText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DocsButton } from '@/components/ui/DocsButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HostNotificationsBell } from '@/components/ui/HostNotificationsBell';
import { useHostPhone } from '@/hooks/useHostPhone';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDocumentList } from '@/hooks/useDocumentList';
import { useDocumentActions } from '@/hooks/useDocumentActions';
import { IS_EMBEDDED } from '@/lib/bootParams';
import { DOCS } from '@/lib/docs';
import { DOCUMENT_PATH } from '@/lib/documentMapping';
import { KIND_META } from '@/lib/documentMeta';
import type { DocumentKind } from '@/types/document';
import { SummaryStrip } from './documents/SummaryStrip';
import { SetupNotice } from './documents/SetupNotice';
import { DocumentsToolbar } from './documents/DocumentsToolbar';
import { DocumentList } from './documents/DocumentList';
import { DeleteDocumentModal } from './documents/DeleteDocumentModal';
import classes from './DocumentsPage.module.css';

const VIEW_PARAM = 'view';

export function DocumentsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const kind: DocumentKind = params.get(VIEW_PARAM) === 'quotations' ? 'quotation' : 'invoice';
  const hostPhone = useHostPhone();
  const { profile, complete, loading: profileLoading } = useBusinessProfile();
  const { stats, reload: reloadStats } = useDashboardStats();
  const list = useDocumentList(kind);
  const { reload: reloadList } = list;

  const refresh = useCallback(() => {
    reloadList();
    reloadStats();
  }, [reloadList, reloadStats]);

  const docActions = useDocumentActions(refresh);

  const setKind = (next: DocumentKind) =>
    setParams(next === 'quotation' ? { [VIEW_PARAM]: 'quotations' } : {}, { replace: true });

  const create = (target: DocumentKind) => navigate(`${DOCUMENT_PATH[target]}/new`);
  const meta = KIND_META[kind];
  const isEmpty = !list.loading && list.items.length === 0;

  return (
    <Box className={classes.page}>
      <PageHeader
        title="Invoices"
        description="Quotations and invoices for your leads, with what is paid and what is still due."
        actions={
          <>
            <Button leftSection={<Plus size={16} />} onClick={() => create('invoice')}>
              New invoice
            </Button>
            <Button variant="default" leftSection={<Plus size={16} />} onClick={() => create('quotation')}>
              New quotation
            </Button>
            {!hostPhone && <DocsButton path={DOCS.invoicing} />}
            {IS_EMBEDDED && <HostNotificationsBell />}
          </>
        }
      />

      {!profileLoading && !complete && <SetupNotice />}

      <SummaryStrip stats={stats} currency={profile?.currency || 'INR'} />

      <DocumentsToolbar
        kind={kind}
        status={list.status}
        search={list.search}
        loading={list.loading}
        onKind={setKind}
        onStatus={list.setStatus}
        onSearch={list.setSearch}
        onRefresh={refresh}
      />

      {isEmpty ? (
        <EmptyState
          icon={kind === 'invoice' ? ReceiptText : FileText}
          title={list.isFiltered ? `No matching ${meta.plural.toLowerCase()}` : `No ${meta.plural.toLowerCase()} yet`}
          description={
            list.isFiltered
              ? 'Try another search or status.'
              : kind === 'invoice'
                ? 'Create an invoice, or convert an accepted quotation into one.'
                : 'Send a quotation first, then turn it into an invoice once it is accepted.'
          }
          action={
            list.isFiltered
              ? undefined
              : { label: `New ${meta.singular.toLowerCase()}`, icon: Plus, onClick: () => create(kind) }
          }
        />
      ) : (
        <DocumentList
          items={list.items}
          loading={list.loading}
          total={list.total}
          page={list.page}
          busyId={docActions.busyId}
          onPage={list.setPage}
          actions={docActions.actions}
        />
      )}

      <DeleteDocumentModal
        doc={docActions.pendingDelete}
        deleting={docActions.deleting}
        onCancel={docActions.cancelDelete}
        onConfirm={docActions.confirmDelete}
      />
    </Box>
  );
}
