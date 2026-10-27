import { ActionIcon, Menu } from '@mantine/core';
import { Building2, FileText, MoreHorizontal, PencilLine, ReceiptText, Trash2 } from 'lucide-react';
import { ListRow } from '@/components/list/ListRow';
import { formatMoney } from '@/lib/format';
import type { Customer } from '@/types/catalog';
import type { DocumentKind } from '@/types/document';

interface Props {
  customer: Customer;
  currency: string;
  onEdit: () => void;
  onDocument: (kind: DocumentKind) => void;
  onDelete: () => void;
}

export function CustomerRow({ customer, currency, onEdit, onDocument, onDelete }: Props) {
  const owes = customer.outstanding > 0;

  return (
    <ListRow
      icon={Building2}
      title={customer.name}
      to={`/customers/${customer.id}`}
      meta={[
        customer.contactName,
        customer.email,
        customer.phone,
        customer.gstin ? `GSTIN ${customer.gstin}` : null,
      ]}
      amount={owes ? formatMoney(customer.outstanding, currency) : undefined}
      amountHint={owes ? 'Outstanding' : undefined}
      actions={
        <Menu position="bottom-end" width={210}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" aria-label="More actions">
              <MoreHorizontal size={17} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<ReceiptText size={15} />} onClick={() => onDocument('invoice')}>
              New invoice
            </Menu.Item>
            <Menu.Item leftSection={<FileText size={15} />} onClick={() => onDocument('quotation')}>
              New quotation
            </Menu.Item>
            <Menu.Item leftSection={<PencilLine size={15} />} onClick={onEdit}>
              Edit details
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<Trash2 size={15} />} onClick={onDelete}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      }
    />
  );
}
