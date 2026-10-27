import { Select } from '@mantine/core';
import { MapPin } from 'lucide-react';
import { GST_STATES, isInterState, placeOfSupply, stateLabel } from '@/lib/gst';
import type { SectionProps } from './types';

export function SupplyPlace({ draft, setField }: SectionProps) {
  const resolved = placeOfSupply(draft);
  const inter = isInterState(draft);
  const split = draft.exportUnderLut
    ? 'Export, so no GST is charged.'
    : inter
      ? 'Inter-state supply, so IGST applies.'
      : 'Intra-state supply, so CGST and SGST apply.';
  const auto = !draft.placeOfSupply && resolved ? `Worked out as ${stateLabel(resolved)}. ` : '';

  return (
    <Select
      label="Place of supply"
      description={`${auto}${split}`}
      placeholder={resolved ? stateLabel(resolved) : 'Pick a state'}
      leftSection={<MapPin size={15} />}
      data={GST_STATES}
      searchable
      clearable
      disabled={draft.exportUnderLut}
      value={draft.placeOfSupply || null}
      onChange={(value) => setField('placeOfSupply', value ?? '')}
    />
  );
}
