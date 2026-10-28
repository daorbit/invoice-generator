import { Textarea } from '@mantine/core';
import { SettingRow, SettingsGroup } from '@/components/settings/SettingsGroup';
import type { ProfileSectionProps } from './sectionProps';
import classes from './fields.module.css';

export function DefaultsSection({ draft, setField }: ProfileSectionProps) {
  return (
    <SettingsGroup title="Defaults" hint="Filled into every new document. You can change them on each one.">
      <SettingRow label="Notes" alignTop>
        <Textarea
          aria-label="Default notes"
          placeholder="Thank you for your business."
          autosize
          minRows={2}
          className={classes.field}
          value={draft.defaultNotes}
          onChange={(event) => setField('defaultNotes', event.currentTarget.value)}
        />
      </SettingRow>
      <SettingRow label="Terms" alignTop>
        <Textarea
          aria-label="Default terms"
          placeholder="Payment due within 30 days of the invoice date."
          autosize
          minRows={2}
          className={classes.field}
          value={draft.defaultTerms}
          onChange={(event) => setField('defaultTerms', event.currentTarget.value)}
        />
      </SettingRow>
    </SettingsGroup>
  );
}
