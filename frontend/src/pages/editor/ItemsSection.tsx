import { ActionIcon, Button, NumberInput, TextInput } from '@mantine/core';
import { Plus, X } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import type { DocumentDraft } from '@/types/document';
import { EditorSection } from './EditorSection';
import type { ItemActions } from './types';
import classes from './ItemsSection.module.css';

const MAX_ITEMS = 200;

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : 0;
}

export function ItemsSection({ draft, updateItem, addItem, removeItem }: { draft: DocumentDraft } & ItemActions) {
  const single = draft.items.length === 1;

  return (
    <EditorSection title="Items">
      <div className={classes.table}>
        <div className={`${classes.row} ${classes.head}`}>
          <span>Description</span>
          <span className={classes.right}>Qty</span>
          <span className={classes.right}>Rate</span>
          <span className={`${classes.right} ${classes.amountHead}`}>Amount</span>
          <span />
        </div>
        {draft.items.map((item) => (
          <div key={item.id} className={classes.row}>
            <TextInput
              aria-label="Description"
              placeholder="What you are billing for"
              value={item.description}
              onChange={(e) => updateItem(item.id, { description: e.currentTarget.value })}
            />
            <NumberInput
              aria-label="Quantity"
              min={0}
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
            <span className={classes.amount}>{formatMoney(item.amount, draft.currency)}</span>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label="Remove item"
              disabled={single}
              onClick={() => removeItem(item.id)}
            >
              <X size={15} />
            </ActionIcon>
          </div>
        ))}
      </div>
      <Button
        variant="subtle"
        size="compact-sm"
        leftSection={<Plus size={14} />}
        className={classes.add}
        disabled={draft.items.length >= MAX_ITEMS}
        onClick={addItem}
      >
        Add item
      </Button>
    </EditorSection>
  );
}
