import { TextInput, Textarea } from '@mantine/core';
import { SettingRow, SettingsGroup } from '@/components/settings/SettingsGroup';
import type { ProfileSectionProps } from './sectionProps';
import classes from './fields.module.css';

export function BusinessSection({ draft, setField }: ProfileSectionProps) {
  return (
    <SettingsGroup title="Your business" hint="Printed at the top of every quotation and invoice you send.">
      <SettingRow label="Business name" required>
        <TextInput
          aria-label="Business name"
          placeholder="Acme Studio"
          className={classes.field}
          value={draft.businessName}
          onChange={(event) => setField('businessName', event.currentTarget.value)}
        />
      </SettingRow>
      <SettingRow label="Billing email" required hint="Clients reply to this address.">
        <TextInput
          aria-label="Billing email"
          type="email"
          placeholder="billing@acme.com"
          className={classes.field}
          value={draft.email}
          onChange={(event) => setField('email', event.currentTarget.value)}
        />
      </SettingRow>
      <SettingRow label="Phone">
        <TextInput
          aria-label="Phone"
          placeholder="+91 98765 43210"
          className={classes.field}
          value={draft.phone}
          onChange={(event) => setField('phone', event.currentTarget.value)}
        />
      </SettingRow>
      <SettingRow label="Address" required alignTop>
        <Textarea
          aria-label="Address"
          placeholder={'Street, city\nState, PIN code'}
          autosize
          minRows={2}
          className={classes.field}
          value={draft.address}
          onChange={(event) => setField('address', event.currentTarget.value)}
        />
      </SettingRow>
      <SettingRow label="GSTIN" hint="Optional. Turns the heading into Tax invoice.">
        <TextInput
          aria-label="GSTIN"
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
          className={classes.short}
          value={draft.gstin}
          onChange={(event) => setField('gstin', event.currentTarget.value.toUpperCase())}
        />
      </SettingRow>
      <SettingRow label="Website">
        <TextInput
          aria-label="Website"
          placeholder="acme.com"
          className={classes.field}
          value={draft.website}
          onChange={(event) => setField('website', event.currentTarget.value)}
        />
      </SettingRow>
    </SettingsGroup>
  );
}
