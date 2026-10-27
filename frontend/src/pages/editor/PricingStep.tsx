import { NumberInput, SegmentedControl, Select, SimpleGrid } from '@mantine/core';
import { CURRENCIES } from '@/lib/documentMeta';
import { isGstDocument, rateLabel, taxRatesFor } from '@/lib/gst';
import type { DiscountType } from '@/types/document';
import { EditorStep } from './EditorStep';
import { QuickPicks } from './QuickPicks';
import { SupplyPlace } from './SupplyPlace';
import { TaxOptions } from './TaxOptions';
import type { SectionProps, TaxActions } from './types';

const DISCOUNT_TYPES = [
  { value: 'percentage', label: '%' },
  { value: 'fixed', label: 'Amount' },
];

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : 0;
}

function sharedRate(rates: number[]): number | null {
  return rates.every((rate) => rate === rates[0]) ? rates[0] ?? null : null;
}

export function PricingStep({ draft, setField, applyTaxRate }: SectionProps & TaxActions) {
  const gst = isGstDocument(draft);
  const isInvoice = draft.kind === 'invoice';
  const lineRates = draft.items.map((item) => item.taxRate ?? 0);
  const hint = gst
    ? 'GST splits into CGST and SGST, or IGST, from the place of supply.'
    : draft.currency === 'INR'
      ? 'Add your GSTIN in Business details to issue GST tax invoices.'
      : 'Add tax, a discount or shipping.';

  return (
    <EditorStep
      index={4}
      title={gst ? 'GST, discounts and totals' : 'Tax and discounts'}
      hint={hint}
      done={lineRates.some((rate) => rate > 0) || draft.discount > 0}
    >
      {gst && <SupplyPlace draft={draft} setField={setField} />}
      <QuickPicks
        label={gst ? 'GST on every item' : 'Tax on every item'}
        picks={taxRatesFor(draft).map((rate) => ({ value: rate, label: rate === 0 ? 'No tax' : rateLabel(rate) }))}
        active={draft.exportUnderLut ? 0 : sharedRate(lineRates)}
        onPick={applyTaxRate}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
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
      <TaxOptions draft={draft} setField={setField} gst={gst} />
    </EditorStep>
  );
}
