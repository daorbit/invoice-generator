import { Switch } from '@mantine/core';
import type { SectionProps } from './types';
import classes from './TaxOptions.module.css';

type ToggleField = 'pricesIncludeTax' | 'roundOff' | 'reverseCharge' | 'exportUnderLut';

interface Option {
  field: ToggleField;
  label: string;
  hint: string;
  gstOnly?: boolean;
}

const OPTIONS: Option[] = [
  { field: 'pricesIncludeTax', label: 'Prices include tax', hint: 'Rates already have tax in them. Tax is worked out backwards.' },
  { field: 'roundOff', label: 'Round off the total', hint: 'Rounds to the nearest whole amount and shows the difference.' },
  { field: 'reverseCharge', label: 'Reverse charge', hint: 'The buyer pays the GST. Printed on the invoice.', gstOnly: true },
  {
    field: 'exportUnderLut',
    label: 'Export under LUT',
    hint: 'Zero-rated export. No IGST is charged.',
    gstOnly: true,
  },
];

export function TaxOptions({ draft, setField, gst }: SectionProps & { gst: boolean }) {
  const options = OPTIONS.filter((option) => gst || !option.gstOnly);

  return (
    <div className={classes.group}>
      {options.map((option) => (
        <label key={option.field} className={classes.row}>
          <span className={classes.text}>
            <span className={classes.label}>{option.label}</span>
            <span className={classes.hint}>{option.hint}</span>
          </span>
          <Switch
            size="sm"
            checked={draft[option.field]}
            onChange={(event) => setField(option.field, event.currentTarget.checked)}
          />
        </label>
      ))}
    </div>
  );
}
