import { useState } from 'react';
import { Autocomplete, Button, Group, Modal, NumberInput, SegmentedControl, Select, SimpleGrid, TextInput, Textarea } from '@mantine/core';
import { saveItem } from '@/api/catalog';
import { COMMON_TAX_RATES, GST_RATES, rateLabel } from '@/lib/gst';
import { UNITS } from '@/lib/units';
import { notify } from '@/lib/notify';
import type { CatalogItem, CatalogItemInput, ItemKind } from '@/types/catalog';
import classes from '../catalog/CatalogForm.module.css';

const EMPTY: CatalogItemInput = {
  name: '',
  description: '',
  kind: 'service',
  unit: '',
  rate: 0,
  hsn: '',
  taxRate: 0,
};

const KINDS = [
  { value: 'service', label: 'Service' },
  { value: 'goods', label: 'Goods' },
];

interface Props {
  opened: boolean;
  item: CatalogItem | null;
  currency: string;
  gst: boolean;
  onClose: () => void;
  onSaved: (item: CatalogItem) => void;
}

function initial(item: CatalogItem | null): CatalogItemInput {
  if (!item) return EMPTY;
  const { id: _id, updatedAt: _updatedAt, ...input } = item;
  return input;
}

export function ItemFormModal({ opened, item, currency, gst, onClose, onSaved }: Props) {
  const [form, setForm] = useState<CatalogItemInput>(() => initial(item));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CatalogItemInput>(field: K, value: CatalogItemInput[K]) =>
    setForm((current) => ({ ...current, [field]: value }));
  const rates = [...new Set([...(gst ? GST_RATES : COMMON_TAX_RATES), form.taxRate])].sort((a, b) => a - b);
  const codeLabel = form.kind === 'goods' ? 'HSN code' : 'SAC code';

  const submit = async () => {
    setSaving(true);
    try {
      const saved = await saveItem(form, item?.id);
      notify.success(item ? 'Item updated' : `${saved.name} added`);
      onSaved(saved);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not save the item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} size={560} title={item ? 'Edit item' : 'New item'}>
      <div className={classes.form}>
        <div className={classes.section}>
          <SegmentedControl
            data={KINDS}
            value={form.kind}
            onChange={(value) => set('kind', value as ItemKind)}
            fullWidth
          />
          <TextInput
            label="Name"
            placeholder={form.kind === 'goods' ? 'Office chair' : 'Website design'}
            required
            data-autofocus
            maxLength={200}
            value={form.name}
            onChange={(e) => set('name', e.currentTarget.value)}
          />
          <Textarea
            label="Description"
            description="Added after the name on documents."
            placeholder="Optional"
            autosize
            minRows={2}
            maxLength={1000}
            value={form.description}
            onChange={(e) => set('description', e.currentTarget.value)}
          />
        </div>

        <div className={classes.section}>
          <div className={classes.sectionTitle}>Price and tax</div>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <NumberInput
              label={`Rate (${currency})`}
              min={0}
              decimalScale={2}
              thousandSeparator=","
              hideControls
              value={form.rate}
              onChange={(value) => set('rate', typeof value === 'number' ? value : 0)}
            />
            <Autocomplete
              label="Unit"
              placeholder="Nos, Hrs, Kg"
              data={UNITS}
              maxLength={16}
              value={form.unit}
              onChange={(value) => set('unit', value)}
            />
            {gst && (
              <TextInput
                label={codeLabel}
                placeholder="Optional"
                maxLength={8}
                value={form.hsn}
                onChange={(e) => set('hsn', e.currentTarget.value.replace(/\D/g, ''))}
              />
            )}
            <Select
              label={gst ? 'GST rate' : 'Tax rate'}
              data={rates.map((rate) => ({ value: String(rate), label: rate === 0 ? 'No tax' : rateLabel(rate) }))}
              allowDeselect={false}
              value={String(form.taxRate)}
              onChange={(value) => value !== null && set('taxRate', Number(value))}
            />
          </SimpleGrid>
        </div>
      </div>

      <Group justify="flex-end" gap="sm" className={classes.footer}>
        <Button variant="default" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button loading={saving} disabled={!form.name.trim()} onClick={() => void submit()}>
          {item ? 'Save changes' : 'Add item'}
        </Button>
      </Group>
    </Modal>
  );
}
