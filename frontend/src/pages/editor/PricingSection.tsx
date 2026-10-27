import { NumberInput, SegmentedControl, Select, SimpleGrid } from '@mantine/core';
import { CURRENCIES } from '@/lib/documentMeta';
import { formatMoney } from '@/lib/format';
import { computeTotals } from '@/lib/totals';
import type { DiscountType } from '@/types/document';
import { EditorSection } from './EditorSection';
import type { SectionProps } from './types';
import classes from './PricingSection.module.css';

const DISCOUNT_TYPES = [
  { value: 'percentage', label: '%' },
  { value: 'fixed', label: 'Amount' },
];

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : 0;
}

export function PricingSection({ draft, setField }: SectionProps) {
  const totals = computeTotals(draft);
  const money = (value: number) => formatMoney(value, draft.currency);
  const isInvoice = draft.kind === 'invoice';

  return (
    <EditorSection title="Tax, discount and payment">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <Select
          label="Currency"
          data={CURRENCIES}
          allowDeselect={false}
          value={draft.currency}
          onChange={(value) => value && setField('currency', value)}
        />
        <NumberInput
          label="Tax"
          suffix="%"
          min={0}
          max={100}
          decimalScale={2}
          value={draft.tax}
          onChange={(value) => setField('tax', toNumber(value))}
        />
        <NumberInput
          label="Discount"
          min={0}
          decimalScale={2}
          value={draft.discount}
          onChange={(value) => setField('discount', toNumber(value))}
          rightSectionWidth={96}
          rightSection={
            <SegmentedControl
              size="xs"
              data={DISCOUNT_TYPES}
              value={draft.discountType}
              onChange={(value) => setField('discountType', value as DiscountType)}
            />
          }
        />
        <NumberInput
          label="Shipping"
          min={0}
          decimalScale={2}
          value={draft.shipping}
          onChange={(value) => setField('shipping', toNumber(value))}
        />
        {isInvoice && (
          <NumberInput
            label="Amount paid"
            min={0}
            decimalScale={2}
            value={draft.amountPaid}
            onChange={(value) => setField('amountPaid', toNumber(value))}
          />
        )}
      </SimpleGrid>

      <div className={classes.totals}>
        <div className={classes.line}>
          <span>Subtotal</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        {totals.taxAmount > 0 && (
          <div className={classes.line}>
            <span>Tax ({draft.tax}%)</span>
            <span>{money(totals.taxAmount)}</span>
          </div>
        )}
        {totals.discountAmount > 0 && (
          <div className={classes.line}>
            <span>Discount</span>
            <span>−{money(totals.discountAmount)}</span>
          </div>
        )}
        {draft.shipping > 0 && (
          <div className={classes.line}>
            <span>Shipping</span>
            <span>{money(draft.shipping)}</span>
          </div>
        )}
        <div className={`${classes.line} ${classes.grand}`}>
          <span>Total</span>
          <span className={classes.money}>{money(totals.total)}</span>
        </div>
        {isInvoice && draft.amountPaid > 0 && (
          <div className={classes.line}>
            <span>Balance due</span>
            <span>{money(totals.balanceDue)}</span>
          </div>
        )}
      </div>
    </EditorSection>
  );
}
