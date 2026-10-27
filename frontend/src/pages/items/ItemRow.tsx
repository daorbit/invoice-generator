import { ActionIcon, Menu } from '@mantine/core';
import { MoreHorizontal, Package, PencilLine, Trash2, Wrench } from 'lucide-react';
import { ListRow } from '@/components/list/ListRow';
import { formatMoney } from '@/lib/format';
import { rateLabel } from '@/lib/gst';
import type { CatalogItem } from '@/types/catalog';

interface Props {
  item: CatalogItem;
  currency: string;
  gst: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemRow({ item, currency, gst, onEdit, onDelete }: Props) {
  return (
    <ListRow
      icon={item.kind === 'goods' ? Package : Wrench}
      title={item.name}
      onOpen={onEdit}
      meta={[
        item.kind === 'goods' ? 'Goods' : 'Service',
        item.hsn ? `${item.kind === 'goods' ? 'HSN' : 'SAC'} ${item.hsn}` : null,
        item.taxRate > 0 ? `${gst ? 'GST' : 'Tax'} ${rateLabel(item.taxRate)}` : null,
        item.description,
      ]}
      amount={formatMoney(item.rate, currency)}
      amountHint={item.unit ? `per ${item.unit}` : undefined}
      actions={
        <Menu position="bottom-end" width={180}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" aria-label="More actions">
              <MoreHorizontal size={17} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<PencilLine size={15} />} onClick={onEdit}>
              Edit
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
