import { Button } from '@mantine/core';
import { Plus } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { isGstDocument, taxRatesFor } from '@/lib/gst';
import { computeTotals } from '@/lib/totals';
import type { DocumentDraft } from '@/types/document';
import { EditorStep } from './EditorStep';
import { ItemLine } from './ItemLine';
import type { ItemActions } from './types';
import classes from './ItemsStep.module.css';

const MAX_ITEMS = 200;

export function ItemsStep({ draft, updateItem, fillItem, addItem, removeItem }: { draft: DocumentDraft } & ItemActions) {
  const single = draft.items.length === 1;
  const subtotal = computeTotals(draft).subtotal;
  const gst = isGstDocument(draft);
  const rates = taxRatesFor(draft);

  return (
    <EditorStep
      index={2}
      title="What are you billing for?"
      hint={gst ? 'Pick a saved item or type one. Add the HSN/SAC code and GST rate for each line.' : 'Pick a saved item or type one. Amounts work out as you type.'}
      done={subtotal > 0}
    >
      <div className={classes.table}>
        <div className={`${classes.row} ${classes.head}`}>
          <span>Item</span>
          <span className={classes.right}>Qty</span>
          <span className={classes.right}>Rate</span>
          <span className={`${classes.right} ${classes.amountHead}`}>Amount</span>
          <span />
        </div>
        {draft.items.map((item) => (
          <ItemLine
            key={item.id}
            item={item}
            currency={draft.currency}
            rates={rates}
            gst={gst}
            zeroRated={draft.exportUnderLut}
            removable={!single}
            updateItem={updateItem}
            fillItem={fillItem}
            removeItem={removeItem}
          />
        ))}
      </div>
      <div className={classes.footer}>
        <Button
          variant="subtle"
          size="compact-sm"
          leftSection={<Plus size={14} />}
          disabled={draft.items.length >= MAX_ITEMS}
          onClick={addItem}
        >
          Add item
        </Button>
        <span className={classes.subtotal}>
          Subtotal<b>{formatMoney(subtotal, draft.currency)}</b>
        </span>
      </div>
    </EditorStep>
  );
}
