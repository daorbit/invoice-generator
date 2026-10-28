import { Select } from '@mantine/core';
import { SettingRow, SettingsGroup } from '@/components/settings/SettingsGroup';
import { AccentPicker } from '@/components/design/AccentPicker';
import { TEMPLATE_SELECT } from '@/lib/businessProfileOptions';
import type { TemplateId } from '@/types/document';
import { LogoField } from './LogoField';
import type { ProfileSectionProps } from './sectionProps';
import classes from './fields.module.css';

export function StyleSection({ draft, setField }: ProfileSectionProps) {
  return (
    <SettingsGroup
      title="Logo and style"
      hint="How new documents look. Each one can still pick its own template and colour."
    >
      <SettingRow label="Logo" hint="PNG, JPG or SVG, up to 300 KB.">
        <LogoField value={draft.logo} onChange={(value) => setField('logo', value)} />
      </SettingRow>
      <SettingRow label="Template" hint="See them all in any document's preview.">
        <Select
          aria-label="Template"
          data={TEMPLATE_SELECT}
          allowDeselect={false}
          className={classes.short}
          value={draft.defaultTemplate}
          onChange={(value) => value && setField('defaultTemplate', value as TemplateId)}
        />
      </SettingRow>
      <SettingRow label="Colour" hint="Used for headings, lines and the total.">
        <AccentPicker value={draft.accentColor} onChange={(value) => setField('accentColor', value)} />
      </SettingRow>
    </SettingsGroup>
  );
}
