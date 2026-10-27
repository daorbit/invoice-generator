import { useState } from 'react';
import { Button } from '@mantine/core';
import { Package, PackagePlus } from 'lucide-react';
import { SectionPage } from '@/components/layout/SectionPage';
import { RowList } from '@/components/list/RowList';
import { PageHeader } from '@/components/ui/PageHeader';
import { DocsButton } from '@/components/ui/DocsButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HostNotificationsBell } from '@/components/ui/HostNotificationsBell';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { deleteItem, listItems } from '@/api/catalog';
import { useHostPhone } from '@/hooks/useHostPhone';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { usePagedList } from '@/hooks/usePagedList';
import { useCatalogDelete } from '@/hooks/useCatalogDelete';
import { IS_EMBEDDED } from '@/lib/bootParams';
import { DOCS } from '@/lib/docs';
import type { CatalogItem } from '@/types/catalog';
import { CatalogToolbar } from './catalog/CatalogToolbar';
import { ItemRow } from './items/ItemRow';
import { ItemFormModal } from './items/ItemFormModal';

const PAGE_SIZE = 20;

export function ItemsPage() {
  const hostPhone = useHostPhone();
  const { profile } = useBusinessProfile();
  const list = usePagedList(listItems, PAGE_SIZE);
  const [editing, setEditing] = useState<CatalogItem | 'new' | null>(null);
  const removal = useCatalogDelete<CatalogItem>(deleteItem, list.reload);
  const currency = profile?.currency || 'INR';
  const gst = currency === 'INR' && Boolean(profile?.gstin);
  const isEmpty = !list.loading && list.rows.length === 0;

  return (
    <SectionPage>
      <PageHeader
        title="Items"
        description="Products and services you sell, ready to pick on any quotation or invoice."
        actions={
          <>
            <Button leftSection={<PackagePlus size={16} />} onClick={() => setEditing('new')}>
              New item
            </Button>
            {!hostPhone && <DocsButton path={DOCS.invoicing} />}
            {IS_EMBEDDED && <HostNotificationsBell />}
          </>
        }
      />
      <CatalogToolbar
        search={list.search}
        onSearch={list.setSearch}
        placeholder="Name, description or HSN/SAC"
        ariaLabel="Search items"
        count={list.total}
        noun="item"
        loading={list.loading}
        onRefresh={list.reload}
      />

      {isEmpty ? (
        <EmptyState
          icon={Package}
          title={list.isFiltered ? 'No matching items' : 'No items yet'}
          description={
            list.isFiltered
              ? 'Try another name or code.'
              : 'Save what you sell with its rate, HSN/SAC code and GST rate. Then pick it on a document in one go.'
          }
          action={list.isFiltered ? undefined : { label: 'New item', icon: PackagePlus, onClick: () => setEditing('new') }}
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
          {list.rows.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              currency={currency}
              gst={gst}
              onEdit={() => setEditing(item)}
              onDelete={() => removal.ask(item)}
            />
          ))}
        </RowList>
      )}

      <ItemFormModal
        key={editing === 'new' ? 'new' : editing?.id ?? 'closed'}
        opened={editing !== null}
        item={editing === 'new' ? null : editing}
        currency={currency}
        gst={gst}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          list.reload();
        }}
      />

      <ConfirmModal
        opened={Boolean(removal.pending)}
        title="Delete this item?"
        body={`${removal.pending?.name ?? ''} is removed from your items. Documents that already use it keep their lines.`}
        confirmLabel="Delete"
        busy={removal.deleting}
        onCancel={removal.cancel}
        onConfirm={() => void removal.confirm()}
      />
    </SectionPage>
  );
}
