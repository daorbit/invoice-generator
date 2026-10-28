import { useCallback } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@mantine/core';
import { FileText, Plus, ReceiptText } from 'lucide-react';
import { SectionPage } from '@/components/layout/SectionPage';
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
import { DocumentsOverview } from './documents/DocumentsOverview';
import { SetupNotice } from './documents/SetupNotice';
import { DocumentsToolbar } from './documents/DocumentsToolbar';
import { DocumentList } from './documents/DocumentList';
import { DeleteDocumentModal } from './documents/DeleteDocumentModal';

const LEGACY_VIEW_PARAM = 'view';

const DESCRIPTION: Record<DocumentKind, string> = {
  invoice: 'What you have billed, what is paid and what is still due.',
  quotation: 'Prices you have offered, waiting for a yes or ready to become invoices.',
};

export function DocumentsPage({ kind }: { kind: DocumentKind }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const hostPhone = useHostPhone();
  const { complete, loading: profileLoading } = useBusinessProfile();
  const { stats, reload: reloadStats } = useDashboardStats();
  const list = useDocumentList(kind);
  const { reload: reloadList } = list;

  const refresh = useCallback(() => {
    reloadList();
    reloadStats();
  }, [reloadList, reloadStats]);

  const docActions = useDocumentActions(refresh);

  if (kind === 'invoice' && params.get(LEGACY_VIEW_PARAM) === 'quotations') {
    return <Navigate to="/quotations" replace />;
  }

  const create = () => navigate(`${DOCUMENT_PATH[kind]}/new`);
  const meta = KIND_META[kind];
  const isEmpty = !list.loading && list.items.length === 0;

  return (
    <SectionPage>
      <PageHeader
        title={meta.plural}
        description={DESCRIPTION[kind]}
        actions={
          <>
            <Button leftSection={<Plus size={16} />} onClick={create}>
              New {meta.singular.toLowerCase()}
            </Button>
            {!hostPhone && <DocsButton path={DOCS.invoicing} />}
            {IS_EMBEDDED && <HostNotificationsBell />}
          </>
        }
      />

      {!profileLoading && !complete && <SetupNotice />}

      <DocumentsOverview kind={kind} stats={stats} />

      <DocumentsToolbar
        kind={kind}
        status={list.status}
        search={list.search}
        loading={list.loading}
        counts={stats ? ((kind === 'invoice' ? stats.invoices.byStatus : stats.quotations.byStatus) ?? null) : null}
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
          action={list.isFiltered ? undefined : { label: `New ${meta.singular.toLowerCase()}`, icon: Plus, onClick: create }}
        />
      ) : (
        <DocumentList
          kind={kind}
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
    </SectionPage>
  );
}
