import { NumberInput, Select, TextInput } from '@mantine/core';
import { SettingRow, SettingsGroup } from '@/components/settings/SettingsGroup';
import { MAX_PAYMENT_TERMS_DAYS, sampleNumber } from '@/lib/businessProfileOptions';
import { CURRENCIES } from '@/lib/documentMeta';
import type { ProfileSectionProps } from './sectionProps';
import classes from './fields.module.css';

export function NumbersSection({ draft, setField }: ProfileSectionProps) {
  return (
    <SettingsGroup title="Numbers and payment terms" hint="How new documents are numbered, priced and dated.">
      <SettingRow label="Currency">
        <Select
          aria-label="Currency"
          data={CURRENCIES}
          allowDeselect={false}
          className={classes.short}
          value={draft.currency}
          onChange={(value) => value && setField('currency', value)}
        />
      </SettingRow>
      <SettingRow label="Payment due" hint="Sets the due date on new invoices.">
        <NumberInput
          aria-label="Payment due after"
          suffix=" days"
          min={0}
          max={MAX_PAYMENT_TERMS_DAYS}
          allowDecimal={false}
          className={classes.prefix}
          value={draft.paymentTermsDays}
          onChange={(value) => setField('paymentTermsDays', typeof value === 'number' ? value : 0)}
        />
      </SettingRow>
      <SettingRow label="Invoice numbers" hint={`Next looks like ${sampleNumber(draft.invoicePrefix, 'INV')}`}>
        <TextInput
          aria-label="Invoice prefix"
          maxLength={10}
          className={classes.prefix}
          value={draft.invoicePrefix}
          onChange={(event) => setField('invoicePrefix', event.currentTarget.value.toUpperCase())}
        />
      </SettingRow>
      <SettingRow label="Quotation numbers" hint={`Next looks like ${sampleNumber(draft.quotationPrefix, 'QUO')}`}>
        <TextInput
          aria-label="Quotation prefix"
          maxLength={10}
          className={classes.prefix}
          value={draft.quotationPrefix}
          onChange={(event) => setField('quotationPrefix', event.currentTarget.value.toUpperCase())}
        />
      </SettingRow>
    </SettingsGroup>
  );
}
