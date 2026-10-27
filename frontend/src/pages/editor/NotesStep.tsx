import { SimpleGrid, Textarea } from '@mantine/core';
import { KIND_META } from '@/lib/documentMeta';
import { EditorStep } from './EditorStep';
import type { SectionProps } from './types';

export function NotesStep({ draft, setField }: SectionProps) {
  return (
    <EditorStep
      index={5}
      title="Notes and terms"
      hint="Optional. Printed at the bottom of the document."
      done={Boolean(draft.notes || draft.terms)}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <Textarea
          label="Notes"
          placeholder="Thank you for your business."
          autosize
          minRows={3}
          maxLength={5000}
          value={draft.notes}
          onChange={(e) => setField('notes', e.currentTarget.value)}
        />
        <Textarea
          label={KIND_META[draft.kind].termsLabel}
          placeholder={draft.kind === 'invoice' ? 'Payment due within 30 days.' : 'Valid for 30 days.'}
          autosize
          minRows={3}
          maxLength={5000}
          value={draft.terms}
          onChange={(e) => setField('terms', e.currentTarget.value)}
        />
      </SimpleGrid>
    </EditorStep>
  );
}
