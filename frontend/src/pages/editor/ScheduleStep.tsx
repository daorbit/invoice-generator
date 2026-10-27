import { useState } from 'react';
import { Button, Collapse, SimpleGrid, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';
import { KIND_META } from '@/lib/documentMeta';
import { EditorStep } from './EditorStep';
import { QuickPicks } from './QuickPicks';
import type { SectionProps } from './types';

const DATE_FORMAT = 'D MMM YYYY';

const INVOICE_TERMS = [
  { value: 0, label: 'On receipt' },
  { value: 7, label: '7 days' },
  { value: 15, label: '15 days' },
  { value: 30, label: '30 days' },
  { value: 45, label: '45 days' },
  { value: 60, label: '60 days' },
];

const QUOTE_VALIDITY = [
  { value: 7, label: '7 days' },
  { value: 15, label: '15 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

function daysBetween(from: string | null, to: string | null): number | null {
  if (!from || !to) return null;
  return dayjs(to).diff(dayjs(from), 'day');
}

export function ScheduleStep({ draft, setField }: SectionProps) {
  const meta = KIND_META[draft.kind];
  const isInvoice = draft.kind === 'invoice';
  const [moreOpen, setMoreOpen] = useState(Boolean(draft.reference));
  const span = daysBetween(draft.issueDate, draft.dueDate);

  const pickTerm = (days: number) => {
    const start = draft.issueDate ?? dayjs().format('YYYY-MM-DD');
    setField('dueDate', dayjs(start).add(days, 'day').format('YYYY-MM-DD'));
  };

  return (
    <EditorStep
      index={3}
      title={isInvoice ? 'When is it due?' : 'How long does the price stand?'}
      hint={isInvoice ? 'Pick payment terms, or set the dates yourself.' : 'Pick how long the quote is valid.'}
      done={Boolean(draft.issueDate && draft.dueDate)}
    >
      <QuickPicks
        label={meta.dueLabel}
        picks={isInvoice ? INVOICE_TERMS : QUOTE_VALIDITY}
        active={span}
        onPick={pickTerm}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
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
      <div>
        <Button
          variant="subtle"
          size="compact-sm"
          color="gray"
          rightSection={<ChevronDown size={14} />}
          onClick={() => setMoreOpen((open) => !open)}
        >
          {moreOpen ? 'Fewer details' : `${meta.singular} number and ${meta.referenceLabel.toLowerCase()}`}
        </Button>
        <Collapse in={moreOpen}>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="sm">
            <TextInput
              label={`${meta.singular} number`}
              description="Leave blank to use the next in your series."
              placeholder="Assigned when you save"
              maxLength={64}
              value={draft.number}
              onChange={(e) => setField('number', e.currentTarget.value)}
            />
            <TextInput
              label={meta.referenceLabel}
              description={isInvoice ? 'From the client, if they sent one.' : 'Your own reference, if any.'}
              placeholder="Optional"
              maxLength={64}
              value={draft.reference}
              onChange={(e) => setField('reference', e.currentTarget.value)}
            />
          </SimpleGrid>
        </Collapse>
      </div>
    </EditorStep>
  );
}
