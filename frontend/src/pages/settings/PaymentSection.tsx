import { TextInput } from '@mantine/core';
import { SettingRow, SettingsGroup } from '@/components/settings/SettingsGroup';
import type { ProfileSectionProps } from './sectionProps';
import classes from './fields.module.css';

export function PaymentSection({ draft, setField }: ProfileSectionProps) {
  return (
    <SettingsGroup title="Payment details" hint="Printed on every invoice so clients know where to pay. All optional.">
      <SettingRow label="Bank name">
        <TextInput
          aria-label="Bank name"
          placeholder="HDFC Bank"
          className={classes.field}
          value={draft.bankName}
          onChange={(event) => setField('bankName', event.currentTarget.value)}
        />
      </SettingRow>
      <SettingRow label="Account name" hint="The name on the bank account.">
        <TextInput
          aria-label="Account name"
          placeholder="Acme Studio LLP"
          className={classes.field}
          value={draft.accountName}
          onChange={(event) => setField('accountName', event.currentTarget.value)}
        />
      </SettingRow>
      <SettingRow label="Account number">
        <TextInput
          aria-label="Account number"
          placeholder="50100123456789"
          maxLength={34}
          className={classes.short}
          value={draft.accountNumber}
          onChange={(event) => setField('accountNumber', event.currentTarget.value.toUpperCase())}
        />
      </SettingRow>
      <SettingRow label="IFSC" hint="11 characters, for transfers within India.">
        <TextInput
          aria-label="IFSC"
          placeholder="HDFC0001234"
          maxLength={11}
          className={classes.short}
          value={draft.ifsc}
          onChange={(event) => setField('ifsc', event.currentTarget.value.toUpperCase())}
        />
      </SettingRow>
      <SettingRow label="UPI ID" hint="Adds a scan-to-pay QR code to rupee invoices.">
        <TextInput
          aria-label="UPI ID"
          placeholder="acme@okhdfcbank"
          className={classes.short}
          value={draft.upiId}
          onChange={(event) => setField('upiId', event.currentTarget.value.trim())}
        />
      </SettingRow>
    </SettingsGroup>
  );
}
