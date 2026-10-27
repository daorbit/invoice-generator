import { SimpleGrid, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { CalendarIcon } from 'lucide-react';
import { KIND_META } from '@/lib/documentMeta';
import { EditorSection } from './EditorSection';
import type { SectionProps } from './types';

const DATE_FORMAT = 'D MMM YYYY';

export function DetailsSection({ draft, setField }: SectionProps) {
  const meta = KIND_META[draft.kind];

  return (
    <EditorSection title="Details">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <TextInput
          label={`${meta.singular} number`}
          placeholder="Assigned when you save"
          maxLength={64}
          value={draft.number}
          onChange={(e) => setField('number', e.currentTarget.value)}
        />
        <TextInput
          label={meta.referenceLabel}
          placeholder="Optional"
          maxLength={64}
          value={draft.reference}
          onChange={(e) => setField('reference', e.currentTarget.value)}
        />
        <DateInput
          label="Date"
          leftSection={<CalendarIcon size={15} />}
          valueFormat={DATE_FORMAT}
          value={draft.issueDate}
          onChange={(value) => setField('issueDate', value)}
        />
        <DateInput
          label={meta.dueLabel}
          leftSection={<CalendarIcon size={15} />}
          valueFormat={DATE_FORMAT}
          clearable
          value={draft.dueDate}
          minDate={draft.issueDate ?? undefined}
          onChange={(value) => setField('dueDate', value)}
        />
      </SimpleGrid>
    </EditorSection>
  );
}
