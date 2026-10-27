import { useRef, useState } from 'react';
import { ActionIcon, Autocomplete, NumberInput, Select, TextInput } from '@mantine/core';
import { X } from 'lucide-react';
import { listItems } from '@/api/catalog';
import { useSearchOptions } from '@/hooks/useSearchOptions';
import { formatMoney } from '@/lib/format';
import { rateLabel } from '@/lib/gst';
import { UNITS } from '@/lib/units';
import type { LineItem } from '@/types/document';
import { PickerOption } from './PickerOption';
import type { ItemActions } from './types';
import classes from './ItemsStep.module.css';

interface Props extends Pick<ItemActions, 'updateItem' | 'fillItem' | 'removeItem'> {
  item: LineItem;
  currency: string;
  rates: number[];
  gst: boolean;
  zeroRated: boolean;
  removable: boolean;
}

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : 0;
}

export function ItemLine({ item, currency, rates, gst, zeroRated, removable, updateItem, fillItem, removeItem }: Props) {
  const [focused, setFocused] = useState(false);
  const pickedName = useRef<string | null>(null);
  const catalog = useSearchOptions(listItems, item.description, focused);
  const rateOptions = [...new Set([...rates, item.taxRate ?? 0])]
    .sort((a, b) => a - b)
    .map((rate) => ({ value: String(rate), label: rate === 0 ? 'No tax' : rateLabel(rate) }));

  const pick = (name: string) => {
    const match = catalog.find((entry) => entry.name === name);
    if (!match) return;
    pickedName.current = name;
    fillItem(item.id, match);
  };

  const type = (value: string) => {
    if (pickedName.current === value) {
      pickedName.current = null;
      return;
    }
    updateItem(item.id, { description: value, itemId: undefined });
  };

  return (
    <div className={classes.line}>
      <div className={classes.row}>
        <Autocomplete
          aria-label="Item"
          placeholder="Website design, 5 pages"
          data={catalog.map((entry) => entry.name)}
          filter={({ options }) => options}
          limit={8}
          value={item.description}
          onChange={type}
          onOptionSubmit={pick}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          renderOption={({ option }) => {
            const match = catalog.find((entry) => entry.name === option.value);
            const detail = match
              ? [formatMoney(match.rate, currency), match.unit && `per ${match.unit}`, match.hsn && `HSN/SAC ${match.hsn}`]
                  .filter(Boolean)
                  .join(' · ')
              : '';
            return <PickerOption title={option.value} detail={detail} />;
          }}
        />
        <NumberInput
          aria-label="Quantity"
          min={0}
          decimalScale={3}
          hideControls
          value={item.quantity}
          onChange={(value) => updateItem(item.id, { quantity: toNumber(value) })}
        />
        <NumberInput
          aria-label="Rate"
          min={0}
          decimalScale={2}
          thousandSeparator=","
          hideControls
          value={item.rate}
          onChange={(value) => updateItem(item.id, { rate: toNumber(value) })}
        />
        <span className={classes.amount}>{formatMoney(item.amount, currency)}</span>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Remove item"
          disabled={!removable}
          onClick={() => removeItem(item.id)}
        >
          <X size={15} />
        </ActionIcon>
      </div>
      <div className={classes.details}>
        {gst && (
          <TextInput
            size="xs"
            aria-label="HSN or SAC code"
            placeholder="HSN/SAC"
            maxLength={8}
            className={classes.hsn}
            value={item.hsn ?? ''}
            onChange={(e) => updateItem(item.id, { hsn: e.currentTarget.value.replace(/\D/g, '') || undefined })}
          />
        )}
        <Autocomplete
          size="xs"
          aria-label="Unit"
          placeholder="Unit"
          data={UNITS}
          className={classes.unit}
          value={item.unit ?? ''}
          onChange={(value) => updateItem(item.id, { unit: value || undefined })}
        />
        <Select
          size="xs"
          aria-label={gst ? 'GST rate' : 'Tax rate'}
          data={rateOptions}
          allowDeselect={false}
          disabled={zeroRated}
          className={classes.tax}
          leftSection={<span className={classes.taxLabel}>{gst ? 'GST' : 'Tax'}</span>}
          leftSectionWidth={40}
          value={String(zeroRated ? 0 : item.taxRate ?? 0)}
          onChange={(value) => value !== null && updateItem(item.id, { taxRate: Number(value) })}
        />
      </div>
    </div>
  );
}
