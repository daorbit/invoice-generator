import { Textarea } from '@mantine/core';
import { KIND_META } from '@/lib/documentMeta';
import { EditorSection } from './EditorSection';
import type { SectionProps } from './types';

export function NotesSection({ draft, setField }: SectionProps) {
  return (
    <EditorSection title="Notes and terms">
      <Textarea
        label="Notes"
        placeholder="Thank you for your business."
        autosize
        minRows={2}
        maxLength={5000}
        value={draft.notes}
        onChange={(e) => setField('notes', e.currentTarget.value)}
      />
      <Textarea
        label={KIND_META[draft.kind].termsLabel}
        placeholder={draft.kind === 'invoice' ? 'Payment due within 30 days.' : 'Valid for 30 days.'}
        autosize
        minRows={2}
        maxLength={5000}
        value={draft.terms}
        onChange={(e) => setField('terms', e.currentTarget.value)}
      />
    </EditorSection>
  );
}
