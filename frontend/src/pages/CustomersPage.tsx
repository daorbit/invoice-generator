import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { UserRoundPlus, UsersRound } from 'lucide-react';
import { SectionPage } from '@/components/layout/SectionPage';
import { RowList } from '@/components/list/RowList';
import { PageHeader } from '@/components/ui/PageHeader';
import { DocsButton } from '@/components/ui/DocsButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HostNotificationsBell } from '@/components/ui/HostNotificationsBell';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { deleteCustomer, listCustomers } from '@/api/catalog';
import { useHostPhone } from '@/hooks/useHostPhone';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { usePagedList } from '@/hooks/usePagedList';
import { useCatalogDelete } from '@/hooks/useCatalogDelete';
import { IS_EMBEDDED } from '@/lib/bootParams';
import { DOCS } from '@/lib/docs';
import { DOCUMENT_PATH } from '@/lib/documentMapping';
import type { Customer } from '@/types/catalog';
import type { DocumentKind } from '@/types/document';
import { CatalogToolbar } from './catalog/CatalogToolbar';
import { CustomerRow } from './customers/CustomerRow';
import { CustomerFormModal } from './customers/CustomerFormModal';

const PAGE_SIZE = 20;

export function CustomersPage() {
  const navigate = useNavigate();
  const hostPhone = useHostPhone();
  const { profile } = useBusinessProfile();
  const list = usePagedList(listCustomers, PAGE_SIZE);
  const [editing, setEditing] = useState<Customer | 'new' | null>(null);
  const removal = useCatalogDelete<Customer>(deleteCustomer, list.reload);
  const currency = profile?.currency || 'INR';
  const isEmpty = !list.loading && list.rows.length === 0;

  const startDocument = (kind: DocumentKind, customer: Customer) =>
    navigate(`${DOCUMENT_PATH[kind]}/new?customer=${customer.id}`);

  return (
    <SectionPage>
      <PageHeader
        title="Customers"
        description="Everyone you quote and bill, with what they still owe you."
        actions={
          <>
            <Button leftSection={<UserRoundPlus size={16} />} onClick={() => setEditing('new')}>
              New customer
            </Button>
            {!hostPhone && <DocsButton path={DOCS.invoicing} />}
            {IS_EMBEDDED && <HostNotificationsBell />}
          </>
        }
      />

      <CatalogToolbar
        search={list.search}
        onSearch={list.setSearch}
        placeholder="Name, email, GSTIN or phone"
        ariaLabel="Search customers"
        count={list.total}
        noun="customer"
        loading={list.loading}
        onRefresh={list.reload}
      />

      {isEmpty ? (
        <EmptyState
          icon={UsersRound}
          title={list.isFiltered ? 'No matching customers' : 'No customers yet'}
          description={
            list.isFiltered
              ? 'Try another name, email or GSTIN.'
              : 'Add a customer once and pick them on every quotation and invoice. New clients on a document are added here when you save.'
          }
          action={list.isFiltered ? undefined : { label: 'New customer', icon: UserRoundPlus, onClick: () => setEditing('new') }}
        />
      ) : (
        <RowList
          loading={list.loading}
          empty={list.rows.length === 0}
          total={list.total}
          page={list.page}
          pageSize={PAGE_SIZE}
          onPage={list.setPage}
        >
          {list.rows.map((customer) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              currency={currency}
              onEdit={() => setEditing(customer)}
              onDocument={(kind) => startDocument(kind, customer)}
              onDelete={() => removal.ask(customer)}
            />
          ))}
        </RowList>
      )}

      <CustomerFormModal
        key={editing === 'new' ? 'new' : editing?.id ?? 'closed'}
        opened={editing !== null}
        customer={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          list.reload();
        }}
      />

      <ConfirmModal
        opened={Boolean(removal.pending)}
        title="Delete this customer?"
        body={`${removal.pending?.name ?? ''} is removed from your customer list. Their quotations and invoices stay as they are.`}
        confirmLabel="Delete"
        busy={removal.deleting}
        onCancel={removal.cancel}
        onConfirm={() => void removal.confirm()}
      />
    </SectionPage>
  );
}
