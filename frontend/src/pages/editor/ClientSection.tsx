import { SimpleGrid, TextInput, Textarea } from '@mantine/core';
import { KIND_META } from '@/lib/documentMeta';
import type { DocumentDraft } from '@/types/document';
import { EditorSection } from './EditorSection';
import type { ClientSetter } from './types';

export function ClientSection({ draft, setClient }: { draft: DocumentDraft; setClient: ClientSetter }) {
  const { client } = draft;

  return (
    <EditorSection title={KIND_META[draft.kind].clientLabel}>
      <TextInput
        label="Name or company"
        required
        value={client.name}
        onChange={(e) => setClient('name', e.currentTarget.value)}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <TextInput label="Email" type="email" value={client.email} onChange={(e) => setClient('email', e.currentTarget.value)} />
        <TextInput label="Phone" value={client.phone} onChange={(e) => setClient('phone', e.currentTarget.value)} />
      </SimpleGrid>
      <Textarea
        label="Address"
        autosize
        minRows={2}
        value={client.address}
        onChange={(e) => setClient('address', e.currentTarget.value)}
      />
      <TextInput
        label="GSTIN"
        description="Required on a GST invoice to a registered business."
        placeholder="22AAAAA0000A1Z5"
        maxLength={15}
        value={client.gstin ?? ''}
        onChange={(e) => setClient('gstin', e.currentTarget.value.toUpperCase())}
      />
    </EditorSection>
  );
}
