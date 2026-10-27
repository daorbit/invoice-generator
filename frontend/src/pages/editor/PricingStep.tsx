import { NumberInput, SegmentedControl, Select, SimpleGrid } from '@mantine/core';
import { CURRENCIES } from '@/lib/documentMeta';
import type { DiscountType } from '@/types/document';
import { EditorStep } from './EditorStep';
import { QuickPicks } from './QuickPicks';
import type { SectionProps } from './types';

const GST_RATES = [0, 5, 12, 18, 28];
const COMMON_RATES = [0, 5, 10, 20];

const DISCOUNT_TYPES = [
  { value: 'percentage', label: '%' },
  { value: 'fixed', label: 'Amount' },
];

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : 0;
}

export function PricingStep({ draft, setField }: SectionProps) {
  const rates = draft.currency === 'INR' ? GST_RATES : COMMON_RATES;
  const isInvoice = draft.kind === 'invoice';

  return (
    <EditorStep
      index={4}
      title="Tax and discounts"
      hint={draft.currency === 'INR' ? 'Pick your GST rate. CGST and SGST together, for example 18%.' : 'Add tax, a discount or shipping.'}
      done={draft.tax > 0 || draft.discount > 0}
    >
      <QuickPicks
        label="Tax rate"
        picks={rates.map((rate) => ({ value: rate, label: rate === 0 ? 'No tax' : `${rate}%` }))}
        active={draft.tax}
        onPick={(rate) => setField('tax', rate)}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <NumberInput
          label="Tax"
          suffix="%"
          min={0}
          max={100}
          decimalScale={2}
          value={draft.tax}
          onChange={(value) => setField('tax', toNumber(value))}
        />
        <Select
          label="Currency"
          data={CURRENCIES}
          allowDeselect={false}
          value={draft.currency}
          onChange={(value) => value && setField('currency', value)}
        />
        <NumberInput
          label="Discount"
          min={0}
          decimalScale={2}
          value={draft.discount}
          onChange={(value) => setField('discount', toNumber(value))}
          rightSectionWidth={100}
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
            label="Already paid"
            description="An advance or part payment."
            min={0}
            decimalScale={2}
            value={draft.amountPaid}
            onChange={(value) => setField('amountPaid', toNumber(value))}
          />
        )}
      </SimpleGrid>
    </EditorStep>
  );
}
